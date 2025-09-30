import { google } from "@ai-sdk/google";
import { streamObject, generateText } from "ai";
import { parseArgs } from "node:util";

import { z } from "zod";

import "./setupTracing"; // langfuse tracing

import { visualize } from "./visualize";

const {
	values: { topic },
} = parseArgs({
	args: Bun.argv,
	options: {
		topic: {
			type: "string",
		},
	},
	strict: true,
	allowPositionals: true,
});

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
	aiImagePrompt: z.string().optional(),
	imageSearchQuery: z.string().optional(),
	likes: z.number().int().min(0),
});

export type Post = z.infer<typeof PostSchema>;

const { elementStream } = streamObject({
	model: google("gemini-2.5-flash-preview-09-2025"),
	prompt: `Create a learning feed for the topic "${topic}".
Output at least 15 posts
    
Display styles:

BASIC - Minimalist standalone posts; when the text is powerful enough alone
QUIZ - A quiz with multiple choice questions. Add 3-5 quizQuestions with 3 answers each. Every 5th post should be a quiz. QuizPost username always "Quiz" and empty text.
AI_IMAGE - Visual concepts that need illustration; simplifying complex ideas. It is like BASIC but with an image attached. Add the aiImagePrompt to specify how the image should look.
WEB_IMAGE - An image from the web. Add the imageSearchQuery to specify what image should be used.
COMMENT - When immediate clarification, counterpoint, or dialogue adds value
MEME - Making lessons memorable through humor; debunking misconceptions; failure scenarios
SOURCES - When external learning resources would help users dive deeper.

Add the number of likes for each post.
`,

	output: "array",
	schema: PostSchema,
	temperature: 0.7,
	providerOptions: {
		/* 		google: {
			thinkingConfig: {
				thinkingBudget: 0,
			},
		}, */
	},
	experimental_telemetry: {
		isEnabled: true,
		functionId: "PLAYGROUND-FEED",
	},
});

const array: Post[] = [];
for await (const partialObject of elementStream) {
	console.clear();

	array.push(partialObject);
	console.log(array);
	await Bun.write("output.json", JSON.stringify(array, null, 2));
}

await visualize(array);
