import { expect, test } from "bun:test";
import { z } from "zod";
import { streamYaml } from "./streamYaml";

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
      })
    )
    .optional(),
  exerciseQuestions: z.array(z.string()).optional(),
  aiImagePrompt: z.string().optional(),
  imageSearchQuery: z.string().optional(),
});

type Post = z.infer<typeof PostSchema>;

// Helper to create a mock stream
async function* createMockStream(chunks: string[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

test("streamYaml parses valid posts", async () => {
  const yamlChunks = [
    "---\n",
    "posterName: Test User\n",
    "text: This is a test post\n",
    "displayStyle: BASIC\n",
    "---\n",
    "posterName: Quiz Master\n",
    "text: ''\n",
    "displayStyle: QUIZ\n",
    "quizQuestions:\n",
    "  - question: What is 2+2?\n",
    "    answers: ['3', '4', '5']\n",
    "    correctIndex: 1\n",
    "---\n", // Add final separator to signal end of last document
  ];

  const stream = createMockStream(yamlChunks);
  const results: Post[] = [];

  for await (const post of streamYaml<Post>(stream, PostSchema)) {
    results.push(post);
  }
  expect(results).toHaveLength(2);
  expect(results[0]?.posterName).toBe("Test User");
  expect(results[0]?.displayStyle).toBe("BASIC");
  expect(results[1]?.posterName).toBe("Quiz Master");
  expect(results[1]?.quizQuestions).toHaveLength(1);
});
