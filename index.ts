import { google } from "@ai-sdk/google";
import { streamObject, generateText } from "ai";
import { parseArgs } from "node:util";

import { z } from "zod";

import "./setupTracing"; // langfuse tracing

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
		"EXERCISE",
		"SOURCES",
		"WEB_IMAGE",
		"IMAGE_FROM_PDF",
	]),
});

type Post = z.infer<typeof PostSchema>;

const { elementStream } = streamObject({
	model: google("gemini-2.5-flash-preview-09-2025"),
	prompt: `Create a learning feed for the topic "${topic}".`,
	output: "array",
	schema: PostSchema,
	temperature: 0.7,
	providerOptions: {
		google: {
			thinkingConfig: {
				thinkingBudget: 0,
			},
		},
	},
});

const array: Post[] = [];
for await (const partialObject of elementStream) {
	console.clear();

	array.push(partialObject);
	console.log(array);
	await Bun.write("output.json", JSON.stringify(array, null, 2));
}

const { text: html } = await generateText({
	model: google("gemini-2.5-flash-lite-preview-09-2025"),
	prompt: `Please convert this JSON array into a HTML page. It should be functional and simple and display all the data directly, preferrably in a UI that looks like a simplified Twitter
The site should be for debugging purposes so I can see the data i generate via AI.

JSON data:
${JSON.stringify(array, null, 2)}

Return only the complete HTML document.`,
});

const htmlCleaned = html.replace(/^```html\n/, "").replace(/\n```$/, "");

await Bun.write("visualization.html", htmlCleaned);
console.log("✅ HTML saved to visualization.html");

Bun.spawn(["open", "visualization.html"]);
