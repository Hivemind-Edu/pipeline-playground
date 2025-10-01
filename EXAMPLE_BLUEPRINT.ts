export const EXAMPLE_BLUEPRINT=`---
type: Post
posterName: "The Upgrader"
text: "Thinking of moving from a previous version? Vercel provides codemods to help automate the upgrade process to AI SDK 5, making the transition smoother."
displayStyle: "BASIC"
---
type: Post
posterName: "Generative UI"
text: "Go beyond simple text responses. With AI SDK 5, you can create dynamic, AI-powered user interfaces that can amaze your users."
displayStyle: "AI_IMAGE"
aiImagePrompt: "An animated user interface that is actively being constructed and modified by an AI, with elements appearing and rearranging in a fluid, intelligent manner."
---
type: Post
posterName: "The Pragmatist"
text: "AI SDK 5 introduces a clearer distinction between UI messages and model messages. This separation helps in cleaning up front-end code and makes it more readable."
displayStyle: "BASIC"
---
type: Post
posterName: "Quiz"
text: ""
displayStyle: "QUIZ"
quizQuestions:
  - question: "What is the purpose of the UI component in AI SDK 5?"
    answers:
      - "To manage server-side logic."
      - "To provide hooks for building chat interfaces."
      - "To handle database migrations."
    correctIndex: 1
  - question: "What does 'streaming AI responses' mean in the context of AI SDK 5?"
    answers:
      - "Watching videos about AI."
      - "Sending the complete AI response at once."
      - "Sending the AI response token by token as it's generated."
    correctIndex: 2
  - question: "Which of these frameworks is NOT explicitly mentioned as being supported by AI SDK 5's chat integration?"
    answers:
      - "React"
      - "Angular"
      - "jQuery"
    correctIndex: 2
---`