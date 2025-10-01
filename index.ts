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

const PostSchema = z.looseObject({
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

const NewSuggestionSchema = z.looseObject({
  nextTopicSuggestions: z.array(z.string()),
});

const DataSchema = z.union([PostSchema, NewSuggestionSchema]);

export type Data = z.infer<typeof DataSchema>;

const prompt = createPrompt(TOPIC);

console.log(prompt);

const { textStream, text, providerMetadata } = streamText({
  model: google("gemini-2.5-flash-preview-09-2025"), // google("gemini-2.5-flash-preview-09-2025"),
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

await visualize(
  JSON.stringify(
    {
      array,
      webSearchQueries,
    },
    null,
    2
  )
);
