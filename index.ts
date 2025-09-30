import { google } from "@ai-sdk/google";
import { streamObject, generateText, streamText } from "ai";
import { parseArgs } from "node:util";

import { z } from "zod";

import "./setupTracing"; // langfuse tracing

import { visualize } from "./visualize";
import { streamYaml } from "./streamYaml";

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

const prompt = `Create a learning feed for the topic "${topic}".
Output AT LEAST 15 posts!
    
Display styles:

BASIC - Minimalist standalone posts; when the text is powerful enough alone
QUIZ - A quiz with multiple choice questions. Add 3-5 quizQuestions with 3 answers each. Every 5th post should be a quiz. QuizPost username always "Quiz" and empty text.
EXERCISE - An exercise is an oral examination in the "Feynman" style. Add 3 questions that the user will need to explain.
AI_IMAGE - Visual concepts that need illustration; simplifying complex ideas. It is like BASIC but with an image attached. Add the aiImagePrompt to specify how the image should look.
WEB_IMAGE - An image from the web. Add the imageSearchQuery to specify what image should be used.
COMMENT - When immediate clarification, counterpoint, or dialogue adds value
MEME - It is like BASIC but with a meme attached.
SOURCES - When external learning resources would help users dive deeper.

The output should be YAML Documents, each one representing a post.
Post schema:

${JSON.stringify(z.toJSONSchema(PostSchema), null, 2)}`;

const { textStream } = streamText({
	model: google("gemini-2.5-flash-preview-09-2025"),
	prompt,
	/* 	tools: {
		google_search: google.tools.googleSearch({}),
	}, */
	temperature: 0.7,
	providerOptions: {
		google: {
			thinkingConfig: {
				thinkingBudget: 0,
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
	console.clear();
	console.log(item);
	array.push(item);
}

await visualize(JSON.stringify(array, null, 2));
