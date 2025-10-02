import {
  AxAI,
  AxAIGoogleGeminiModel,
  AxGEPA,
  type AxMultiMetricFn,
  ai,
  ax,
  f,
} from "@ax-llm/ax";

import annotatedDataset from "./annotated-results-2025-10-02.json";

/* 
   - evalEngaging: The content is engaging (not boring)
    - evalEducational: The content is educational (not shallow): After reading the content, the user should have a deep understanding of the topic.
    - evalLanguageVariety: The content uses different language styles (not always the same)
    - evalNonAI: The content doesn't seem AI-generated. Examples of AI-like text:
      - em-dashes
      - overly smooth and generic phrasing like “In today’s fast-paced world, it is crucial to…”
      - overuse of “however,” “on the other hand,” “it is important to note.”
      - precise but non-technical synonyms (e.g., “significant,” “notable,” “crucial”
      - Few “I” statements, anecdotes, or subjective judgments unless prompted.
    - evalDisplayStyleDistribution: The distribution of post display styles is balanced, and the correct display styles are used where it makes sense.

    Learning Feed: */
/* const evaluator = ax(
  `blueprint:string "Blueprint to evaluate"
  -> evalFormatCorrectness:number "0-1, format correctness (0 if the blueprint is not a valid YAML document or does not start and end with a '---' line)",
  evalEngaging:number "0-1, The content is engaging (not boring)",
  evalEducational:number "0-1, The content is educational (not shallow): After reading the content, the user should have a deep understanding of the topic.",
  evalLanguageVariety:number "0-1, The content uses different language styles (not always the same)",
  evalNonAI:number "0-1, The content doesn't seem AI-generated. Examples of AI-like text:
      - em-dashes
      - overly smooth and generic phrasing like “In today’s fast-paced world, it is crucial to…”
      - overuse of “however,” “on the other hand,” “it is important to note.”
      - precise but non-technical synonyms (e.g., “significant,” “notable,” “crucial”
      - Few “I” statements, anecdotes, or subjective judgments unless prompted.",
  evalDisplayStyleDistribution:number "0-1, The distribution of post display styles is balanced"
`
);
 */

type AnnotatedResult = (typeof annotatedDataset)[number];

const signature = f()
  .input("feed", f.string("Feed to evaluate"))
  .output(
    "evalFormatCorrectness",
    f.number(
      "0-1, format correctness (0 if the feed is not a valid YAML document or does not start and end with a '---' line)"
    )
  )
  .output("evalEngaging", f.number("0-1, The content is engaging (not boring)"))
  .output(
    "evalEducational",
    f.number(
      "0-1, The content is educational (not shallow): After reading the content, the user should have a deep understanding of the topic."
    )
  )
  .output(
    "evalLanguageVariety",
    f.number(
      "0-1, The content uses different language styles (not always the same)"
    )
  )
  .output(
    "evalNonAI",
    f.number(`0-1, The content doesn't seem AI-generated. Examples of AI-like text:
      - em-dashes
      - overly smooth and generic phrasing like “In today’s fast-paced world, it is crucial to…”
      - overuse of “however,” “on the other hand,” “it is important to note.”
      - precise but non-technical synonyms (e.g., “significant,” “notable,” “crucial”
      - Few “I” statements, anecdotes, or subjective judgments unless prompted.")).output("evalDisplayStyleDistribution", f.number("0-1, The distribution of post display styles is balanced`)
  )
  .output(
    "evalDisplayStyleDistribution",
    f.number("0-1, The distribution of post display styles is balanced")
  )
  .build();

const studentAI = ai({
  name: "google-gemini",
  apiKey: Bun.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
  config: {
    model: AxAIGoogleGeminiModel.Gemini25Pro,
  },
});

const teacherAI = ai({
  name: "google-gemini",
  apiKey: Bun.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
  config: {
    model: AxAIGoogleGeminiModel.Gemini25Pro,
  },
});

const evaluator = ax(signature);

const res = await evaluator.forward(studentAI, {
  feed: annotatedDataset[0]?.feed as string,
});

// Measures closeness for 0-1 values: 1 = identical, 0 = max difference
const closeness = (a: number, b: number) => 1 - Math.abs(a - b);

// Multi-objective metric
const multiMetric: AxMultiMetricFn = ({ prediction, example }) => {
  const pred = prediction as AnnotatedResult;
  const ex = example as AnnotatedResult;

  return {
    evalFormatCorrectness: closeness(
      pred.evalFormatCorrectness,
      ex.userEvalFormatCorrectness
    ),
    evalEngaging: closeness(pred.evalEngaging, ex.userEvalEngaging),
    evalEducational: closeness(pred.evalEducational, ex.userEvalEducational),
    evalLanguageVariety: closeness(
      pred.evalLanguageVariety,
      ex.userEvalLanguageVariety
    ),
    evalNonAI: closeness(pred.evalNonAI, ex.userEvalNonAI),
    evalDisplayStyleDistribution: closeness(
      pred.evalDisplayStyleDistribution,
      ex.userEvalDisplayStyleDistribution
    ),
  };
};

const feedbackFn = (prediction: AnnotatedResult, example: AnnotatedResult) => {
  return `Example Feedback: ${example.userFeedback}`;
};

// Configure GEPA optimizer
const optimizer = new AxGEPA({
  studentAI,
  teacherAI,
});

const result = await optimizer.compile(
  evaluator,
  annotatedDataset,
  multiMetric as any,
  {
    auto: "medium",
    verbose: true,
    maxMetricCalls: 150,
    feedbackFn: feedbackFn,
  } as any
);

await Bun.write(
  "optimization/OptimizationResults.json",
  JSON.stringify(result, null, 2)
);
