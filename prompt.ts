import { z } from "zod";

export const createPrompt = (
	topic: string,
	PostSchema: z.ZodSchema,
) => `Create a learning feed for the topic "${topic}".
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
