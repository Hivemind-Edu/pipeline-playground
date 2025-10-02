import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { YAML } from "bun";
import pRetry from "p-retry";
import { z } from "zod";
import { createSimplePrompt } from "./simplePrompt";

// topic -> blueprint
// blueprint -> evalFormatCorrectness, evalEngaging, evalEducational, evalLanguageVariety, evalNonAI, evalDisplayStyleDistribution

export const PostSchema = z.looseObject({
  posterName: z.string(),
  text: z.string(),
  displayStyle: z.enum([
    "BASIC",
    "AI_IMAGE",
    "COMMENT",
    "MEME",
    "QUIZ",
    "SOURCES",
    "WEB_IMAGE",
    "EXERCISE",
  ]),
  quizQuestions: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        correctIndex: z.number(),
      })
    )
    .optional(),
  exerciseQuestions: z.array(z.string()).optional(),
  aiImagePrompt: z.string().optional(),
  imageSearchQuery: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

export type Post = z.infer<typeof PostSchema>;

const NewSuggestionSchema = z.looseObject({
  nextTopicSuggestions: z.array(z.string()),
});

const DataSchema = z.union([
  PostSchema,
  NewSuggestionSchema,
  z.looseObject({}),
]);
// a list of topics that are representative of the userbase
const topics = [
  "Web Development",
  "Personal Finance & Investing",
  "Health & Fitness",
  "Learning French",
  "World History",
  "Quantum Mechanics Basics",
  "Marketing & Sales",
  "Cooking",
  "Music Theory",
  "Statistics & Data Science",
];

const runForOneTopic = async (topic: string) => {
  const prompt = createSimplePrompt(topic);
  console.log("Generating blueprint for", topic);
  const { text: blueprint } = await generateText({
    model: google("gemini-2.5-pro"),
    prompt,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    temperature: 0.7,
  });

  let evalFormatCorrectness = 1;

  try {
    const data = YAML.parse(blueprint); // throws error if not valid YAML
    if (!Array.isArray(data)) {
      evalFormatCorrectness = 0;
      throw new Error("Blueprint is not a list of YAML documents");
    }

    for (const post of data) {
      if (!DataSchema.safeParse(post).success) {
        evalFormatCorrectness = 0;
        throw new Error("Blueprint is not a list of valid posts");
      }
    }
  } catch (error) {
    evalFormatCorrectness = 0;
    await Bun.write(`optimization/yamls/${topic}-error.yaml`, blueprint);
    console.error("Error parsing YAML:", error);
    throw new Error("Error parsing YAML");
  }

  if (
    !blueprint.trim().startsWith("---") ||
    !blueprint.trim().endsWith("---")
  ) {
    evalFormatCorrectness = 0;
    throw new Error("Blueprint does not start and end with a '---' line");
  }

  const { object: evaluation } = await generateObject({
    model: google("gemini-2.5-pro"),
    prompt: `Please evaluate the following learning feed

    Every evaluation should be a value between 0 and 1.

    Evaluation Criteria:

    - evalEngaging: The content is engaging (not boring)
    - evalEducational: The content is educational (not shallow): After reading the content, the user should have a deep understanding of the topic.
    - evalLanguageVariety: The content uses different language styles (not always the same)
    - evalNonAI: The content doesn't seem AI-generated. Examples of AI-like text:
      - em-dashes
      - overly smooth and generic phrasing like “In today’s fast-paced world, it is crucial to…”
      - overuse of “however,” “on the other hand,” “it is important to note.”
      - precise but non-technical synonyms (e.g., “significant,” “notable,” “crucial”
      - Few “I” statements, anecdotes, or subjective judgments unless prompted.
    - evalDisplayStyleDistribution: The distribution of post display styles is balanced, and the correct display styles are used where it makes sense.

    Learning Feed:
    ${blueprint}`,
    schema: z.object({
      // from 0 to 1
      evalEngaging: z.number().min(0).max(1),
      evalEducational: z.number().min(0).max(1),
      evalLanguageVariety: z.number().min(0).max(1),
      evalNonAI: z.number().min(0).max(1),
      evalDisplayStyleDistribution: z.number().min(0).max(1),
    }),
  });

  await Bun.write(`optimization/yamls/${topic}.yaml`, blueprint);

  return { topic, blueprint, evalFormatCorrectness, ...evaluation };
};

const results = await Promise.all(
  topics.map((topic) =>
    pRetry(
      async () => {
        try {
          return await runForOneTopic(topic);
        } catch (error) {
          // Ensure we always throw an Error object
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
      {
        retries: 5,
        onFailedAttempt: (error) => {
          console.error("Failed to generate examples for", topic, error);
        },
      }
    )
  )
);

await Bun.write("optimization/results.json", JSON.stringify(results, null, 2));
