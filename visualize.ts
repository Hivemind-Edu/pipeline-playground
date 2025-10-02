import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const daisyUILLMsTxt = await fetch("https://daisyui.com/llms.txt").then((res) =>
  res.text()
);

const templateHTML = await Bun.file("template.html").text();

export async function visualize(data: string, htmlFilePath?: string) {
  console.log("Visualizing...");
  const { text: html } = await generateText({
    model: google("gemini-2.5-flash-preview-09-2025"),
    prompt: `Please convert this data into a HTML page.
	It should display all the data directly.
	Important: Do NOT include any additional text or images that do not come out of the JSON data!! The html should be a direct representation of the JSON data!
    The site should be for debugging purposes so I can see the data i generate via AI.
	No interactivity is needed.

	Use TailwindCSS 4 from this exact cdn link:
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

    JSON data:
	<JSON_DATA>
    ${data}
	</JSON_DATA>
    
    Return ONLY the complete HTML document, no other text.
    The UI should look like this template html. Don't use the data from the provided example HTML, use the data from the JSON above instead.

	<TEMPLATE_HTML>
	${templateHTML}
	</TEMPLATE_HTML>

	<DAISYUI DOCUMENTATION>
	${daisyUILLMsTxt}
	</DAISYUI DOCUMENTATION>
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
  const array = await Bun.file("outputWithChildren.json").text();
  await visualize(array, "visualization.html");
}
