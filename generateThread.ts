import { type Post } from "./index";
import {
  google,
  type GoogleGenerativeAIProviderMetadata,
} from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const ChildPostSchema = z.object({
  text: z.string(),
  posterName: z.string(),
});

export async function generateThread(
  firstPost: Post,
  topic: string,
  groundingMetadata?: GoogleGenerativeAIProviderMetadata
) {
  const prompt = `This post is from a Twitter learning feed about ${topic}. Generate a thread of replies that engage with and discuss the post.
    
Post: ${JSON.stringify(firstPost)}

Generate thoughtful replies that continue the conversation, ask questions, or add insights related to the topic.`;

  const { object } = await generateObject({
    model: google("gemini-2.5-flash-lite-preview-09-2025"),
    output: "array",
    schema: z.array(ChildPostSchema),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    },
    prompt,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "PLAYGROUND-THREAD",
    },
  });

  return object;
}
