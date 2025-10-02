
import { YAML } from "bun";
import type { z } from "zod";

export async function* streamYaml<T>(
  rawStream: AsyncIterable<string>,
  schema: z.ZodSchema<T>
) {
  let fullText = "";
  let numItems = 0;

  for await (const chunk of rawStream) {
    fullText += chunk;

    // Remove code fence markers
    const cleanText = fullText
      .replace(/^```yaml\n?/, "")
      .replace(/\n?```\n?$/, "");

    // Split at the last --- separator
    const lastSeparatorIndex = cleanText.lastIndexOf("---");

    if (lastSeparatorIndex === -1) continue; // No complete documents yet, keep accumulating

    // Everything before the last separator is complete
    const completeText = cleanText.slice(0, lastSeparatorIndex);

    const rawDocs = YAML.parse(completeText);
    const docsArray = Array.isArray(rawDocs) ? rawDocs : [rawDocs];

    for (let i = numItems; i < docsArray.length; i++) {
      const doc = docsArray[i];
      const result = Array.isArray(doc)
        ? schema.safeParse(doc[0])
        : schema.safeParse(doc);
      if (result.success) {
        numItems++;
        yield result.data;
      }
    }
  }

  console.log(fullText);
}
