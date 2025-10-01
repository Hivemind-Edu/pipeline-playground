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
import { generateThread } from "./generateThread";
import { startActiveObservation } from "@langfuse/tracing";

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
const TOPIC = "React";

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
});

export type Post = z.infer<typeof PostSchema>;

const NewSuggestionSchema = z.looseObject({
  nextTopicSuggestions: z.array(z.string()),
});

const DataSchema = z.union([PostSchema, NewSuggestionSchema]);

export type Data = z.infer<typeof DataSchema>;

const prompt = createPrompt(TOPIC);

console.log(prompt);

await startActiveObservation("debug-generateFeed", async (span) => {
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
  for await (const item of streamYaml<Data>(textStream, DataSchema)) {
    console.log(item);
    array.push(item);
  }

  const metadata = (await providerMetadata)?.google as
    | GoogleGenerativeAIProviderMetadata
    | undefined;
  const webSearchQueries = metadata?.groundingMetadata?.webSearchQueries;

  Bun.write(
    "output.yaml",
    (await text).replace(/^```yaml\n/, "").replace(/\n```$/, "")
  );
  Bun.write("output.json", JSON.stringify(array, null, 2));

  const visual1Promise = visualize(
    JSON.stringify(
      {
        array,
        webSearchQueries,
      },
      null,
      2
    )
  );

  const postsWithChildren = await Promise.all(
    array.map(async (post) => {
      if (PostSchema.safeParse(post).success) {
        return {
          ...post,
          children: await generateThread(post as Post, metadata),
        };
      }
      return post;
    })
  );

  await visual1Promise;

  await Bun.write(
    "outputWithChildren.json",
    JSON.stringify(postsWithChildren, null, 2)
  );
  console.log(postsWithChildren);
  await visualize(JSON.stringify({ postsWithChildren }, null, 2));
});
