import { type Post } from "./index";
import {
  google,
  type GoogleGenerativeAIProviderMetadata,
} from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const ChildPostSchema = z.object({
  posterName: z.string(),
  text: z.string(),
});

export async function generateThread(
  firstPost: Post,
  groundingMetadata?: GoogleGenerativeAIProviderMetadata
) {
  const prompt = `Given a post, generate a thread of posts that are answers to the post.
    Post: ${JSON.stringify(firstPost)}

    ${
      groundingMetadata
        ? `There is some additional context that you can use to generate the thread.
    Grounding Metadata: ${JSON.stringify(groundingMetadata)}`
        : ""
    }`;

  const { object } = await generateObject({
    model: google("gemini-2.5-flash-lite-preview-09-2025"),
    output: "array",
    schema: z.array(ChildPostSchema),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
      },
    },
    prompt,
  });

  return object;
}
