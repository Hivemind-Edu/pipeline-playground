import { google } from "@ai-sdk/google";
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
			}),
		)
		.optional(),
	exerciseQuestions: z.array(z.string()).optional(),
	aiImagePrompt: z.string().optional(),
	imageSearchQuery: z.string().optional(),
});

export type Post = z.infer<typeof PostSchema>;

const prompt = createPrompt(TOPIC, PostSchema);

console.log(prompt);

const { textStream } = streamText({
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

const array: Post[] = [];
for await (const item of streamYaml<Post>(textStream, PostSchema)) {
	console.log(item);
	array.push(item);
}

Bun.write("output.json", JSON.stringify(array, null, 2));

await visualize(JSON.stringify(array, null, 2));
