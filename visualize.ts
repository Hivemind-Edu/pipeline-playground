import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { Post } from "./index";

export async function visualize(array: Post[]) {
	console.log("Visualizing...");
	const { text: html } = await generateText({
		model: google("gemini-2.5-flash-lite-preview-09-2025"),
		prompt: `Please convert this JSON array into a HTML page. It should be functional and simple and display all the data directly, preferrably in a UI that looks like a simplified Twitter
    The site should be for debugging purposes so I can see the data i generate via AI.

    Don't invent anything, just display the data from the json in a functional way.
    
    JSON data:
    ${JSON.stringify(array, null, 2)}
    
    Return only the complete HTML document.`,
		providerOptions: {
			google: {
				thinkingConfig: {
					thinkingBudget: 0,
				},
			},
		},
		experimental_telemetry: {
			isEnabled: true,
			functionId: "PLAYGROUND-VISUALIZE",
		},
	});

	const htmlCleaned = html.replace(/^```html\n/, "").replace(/\n```$/, "");

	await Bun.write("visualization.html", htmlCleaned);
	console.log("✅ HTML saved to visualization.html");

	Bun.spawn(["open", "visualization.html"]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const array = await Bun.file("output.json").json();
	await visualize(array as Post[]);
}
