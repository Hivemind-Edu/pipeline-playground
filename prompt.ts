import { EXAMPLE_BLUEPRINT } from "./EXAMPLE_BLUEPRINT";

export const createPrompt = (
  topic: string
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
SOURCES - It is like BASIC but you can add sources from the grounding metadata here. Use this display style if it makes sense to let the user dive deeper using the web. ONLY use data from the grounding metadata here, don't invent any additional sources.


The output should be YAML Documents, each one representing a post.
Every YAML Document should be separated by a "---" line.

Every Post should strictly adhere to the following type:

{
    posterName: string; // always provide posterName!
    text: string; // always provide text!
    displayStyle: "BASIC" | "AI_IMAGE" | "COMMENT" | "MEME" | "QUIZ" | "SOURCES" | "WEB_IMAGE" | "EXERCISE";
    quizQuestions?: {
        question: string;
        answers: string[];
        correctIndex: number;
    }[] // only add quizQuestions if displayStyle is QUIZ
    exerciseQuestions?: string[]; // only add exerciseQuestions if displayStyle is EXERCISE
    aiImagePrompt?: string; // only add aiImagePrompt if displayStyle is AI_IMAGE
    imageSearchQuery?: string; // only add imageSearchQuery if displayStyle is WEB_IMAGE
    sources?: string[]; // only add sources if displayStyle is SOURCES
}

After the posts, the very last element should contain suggestions on what to learn next.
The suggestions should always be exactly in the following type:
{
    nextTopicSuggestions: string[]; // should always be 3 suggestions
}



The output should always start and end with a "---" line.
`;
