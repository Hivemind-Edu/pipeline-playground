import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const daisyUICollapseDocs = await fetch(
  "https://raw.githubusercontent.com/saadeghi/daisyui/refs/heads/master/packages/docs/src/routes/(routes)/components/collapse/+page.md"
);

const daisyUICollapseDocsText = await daisyUICollapseDocs.text();

export async function visualize(data: string, htmlFilePath?: string) {
  let oldVisualizationHTML: string | undefined;
  if (htmlFilePath) {
    try {
      oldVisualizationHTML = await Bun.file(htmlFilePath).text();
    } catch (error) {
      console.error(
        `Error loading old visualization HTML from ${htmlFilePath}: ${error}`
      );
    }
  }

  console.log("Visualizing...");
  const { text: html } = await generateText({
    model: google("gemini-2.5-flash-lite-preview-09-2025"),
    prompt: `Please convert this data into a HTML page. It should be functional and simple and display all the data directly.
    The site should be for debugging purposes so I can see the data i generate via AI.
	No interactivity is needed, just build a beautiful HTML page that is inspired by a Twitter feed.

	Define the JSON inside a <script> tag

	Use TailwindCSS 4 from this exact cdn link:
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

    Use dark mode for the UI.

    JSON data:
    ${data}
    
    Return ONLY the complete HTML document, no other text.
	
	${
    oldVisualizationHTML
      ? `The UI should look similar to this: ${oldVisualizationHTML}. Don't use the data from the provided example HTML, use the data from the JSON above instead.`
      : ""
  }
	`,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
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

  await Bun.write(htmlFilePath ?? "visualization.html", htmlCleaned);
  console.log("✅ HTML saved");

  Bun.spawn(["open", htmlFilePath ?? "visualization.html"]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const array = await Bun.file("output.json").text();
  await visualize(array, "visualization.html");
}
