import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const daisyUICollapseDocs = await fetch(
  "https://raw.githubusercontent.com/saadeghi/daisyui/refs/heads/master/packages/docs/src/routes/(routes)/components/collapse/+page.md"
);

const daisyUICollapseDocsText = await daisyUICollapseDocs.text();

export async function visualize(data: string) {
  console.log("Visualizing...");
  const { text: html } = await generateText({
    model: google("gemini-2.5-flash-lite-preview-09-2025"),
    prompt: `Please convert this data into a HTML page. It should be functional and simple and display all the data directly, preferrably in a UI that looks like a simplified Twitter
    The site should be for debugging purposes so I can see the data i generate via AI.

	Use DaisyUI and TailwindCSS:
	<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/4.1.13/lib.min.js"></script>

    Don't invent anything, just display the data from the json in a functional way.
    
    JSON data:
    ${data}
    
    Return ONLY the complete HTML document, no other text.`,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
      },
    },
    temperature: 0,
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
  const array = await Bun.file("output.json").text();
  await visualize(array);
}
