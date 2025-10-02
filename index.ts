import {
  google,
  type GoogleGenerativeAIProviderMetadata,
} from "@ai-sdk/google";
import { streamObject, generateText, streamText } from "ai";
import { parseArgs } from "node:util";

import { z } from "zod";

import "./setupTracing"; // langfuse tracing

import { visualize } from "./visualize";
import { streamYaml } from "./streamYaml";
import { createPrompt } from "./prompt";
import { getPriorKnowledge, listProfiles } from "./priorKnowledge";

/* const { values } = parseArgs({
	args: Bun.argv,
	options: {
		topic: {
			type: "string",
		},
	},
	strict: true,
	allowPositionals: true,
});
 */
const TOPIC = "AI SDK 5 changes vs 4";

// Select a learner profile: "beginner", "frontend", "fullstack", "mobile", or "senior"
// Set to undefined to create content without a specific learner profile
const LEARNER_PROFILE = "frontend"; // Change this to match your target audience

const DataSchema = z.union([
  z.object({
    learningGoal: z.string(),
  }),
  z.object({
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
  }),
  z.object({
    nextTopicSuggestions: z.array(z.string()).min(3).max(3),
  }),
]);

export type Data = z.infer<typeof DataSchema>;

// Keep Post type for backwards compatibility
const PostSchema = z.object({
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

const priorKnowledge = LEARNER_PROFILE
  ? getPriorKnowledge(LEARNER_PROFILE as any)
  : undefined;

if (priorKnowledge) {
  console.log(
    `\n📚 Creating content for: ${priorKnowledge.name} (${priorKnowledge.role})\n`
  );
}

const prompt = createPrompt(TOPIC);

console.log(prompt);

await Bun.write("prompt.txt", prompt);

const { textStream, text, providerMetadata } = streamText({
  model: google("gemini-2.5-pro"), // google("gemini-2.5-flash-preview-09-2025"),
  prompt,
  tools: {
    google_search: google.tools.googleSearch({}),
  },
  temperature: 0.7,
  providerOptions: {
    google: {
      thinkingConfig: {
        thinkingBudget: 128,
      },
    },
  },
  experimental_telemetry: {
    isEnabled: true,
    functionId: "PLAYGROUND-FEED",
  },
});

const array: Data[] = [];
let learningGoal: string | undefined;

for await (const item of streamYaml<Data>(textStream, DataSchema)) {
  console.log(item);

  // Capture learning goal separately (not shown to user in feed)
  if ("learningGoal" in item) {
    learningGoal = item.learningGoal;
    console.log(`\n🎯 Learning Goal: ${learningGoal}\n`);
    continue; // Don't add to array
  }

  array.push(item);
}

const metadata = (await providerMetadata)?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
const webSearchQueries = metadata?.groundingMetadata?.webSearchQueries;

Bun.write(
  "output.yaml",
  JSON.stringify(
    (await text).replace(/^```yaml\n/, "").replace(/\n```$/, ""),
    null,
    2
  )
);
Bun.write(
  "output.json",
  JSON.stringify(
    {
      learningGoal,
      posts: array,
      webSearchQueries,
    },
    null,
    2
  )
);

await visualize(
  JSON.stringify(
    {
      learningGoal,
      posts: array,
      webSearchQueries,
    },
    null,
    2
  )
);
