# pipeline-playground

AI-powered learning feed generator that creates personalized educational content with automatic HTML visualization.

## Installation

```bash
bun install
```

## Usage

### Generate Learning Feed

```bash
bun run index.ts
```

The script will:
1. Generate a learning feed about the specified topic
2. Create output files (`output.json`, `output.yaml`)
3. Generate an HTML visualization (`visualization.html`)
4. Automatically open the visualization in your browser

### Add Discussion Threads to Posts

After generating the feed, add lively Reddit-style discussion threads:

```bash
bun run addThreads.ts
```

This will:
1. Read the generated posts from `output.json`
2. For each post, generate 3-5 discussion comments that:
   - Create authentic, engaging conversations
   - Share "aha!" moments and experiences
   - Make connections to the learner's prior knowledge
   - Drop helpful tips and war stories
   - Include humor and personality
   - **Indirectly** address misconceptions through natural discussion
3. Save posts with threads to `outputWithChildren.json`
4. Generate a visualization with threads at `visualizationWithChildren.html`

The threads feel like r/programming or r/webdev discussions where people organically help each other understand concepts.

## Configuration

Edit `index.ts` to customize:

### Topic
```typescript
const TOPIC = "AI SDK 5 changes vs 4"; // Change to any topic
```

### Learner Profile
Personalize content based on prior knowledge:

```typescript
const LEARNER_PROFILE = "frontend"; // Options: "beginner", "frontend", "fullstack", "mobile", "senior", or undefined
```

Available profiles in `priorKnowledge.ts`:
- **beginner**: Computer Science Student with basic programming knowledge
- **frontend**: Frontend Developer with 2 years experience in web development
- **fullstack**: Full-Stack Engineer with 5 years experience across the stack
- **mobile**: Mobile Developer with 3 years in iOS and React Native
- **senior**: Senior Software Architect with 10+ years of experience

Set to `undefined` to generate content without targeting a specific learner profile.

**Note**: Also update the same settings in `addThreads.ts` to ensure thread generation uses matching configuration.

## How It Works

1. **Content Generation** (`index.ts`): Uses Google Gemini to generate structured educational posts
2. **Prior Knowledge Integration** (`priorKnowledge.ts`): Tailors content based on learner expertise
3. **Prompt Engineering** (`prompt.ts`): Defines the structure and requirements for AI-generated content
4. **Thread Generation** (`generateThread.ts`): Creates lively Reddit-style discussion threads for each post
5. **Thread Integration** (`addThreads.ts`): Adds threads to all posts in the feed
6. **Visualization** (`visualize.ts`): Converts JSON data into a beautiful HTML interface using AI

## Features

- **Threshold Concept-Based Learning**: Content is designed around transformative core concepts
- **Pedagogically Sound**: Uses Cognitive Load Theory, Dual Coding Theory, and strategic assessment
- **Personalized Content**: Tailored based on learner profiles and prior knowledge
- **Multiple Post Types**: BASIC, QUIZ, EXERCISE, AI_IMAGE, MEME, SOURCES, WEB_IMAGE, COMMENT
- **Learning Goals**: Each feed has a clear, measurable learning objective
- **Automatic HTML Generation**: Beautiful visualization with DaisyUI styling
- **Reddit-Style Discussions**: Lively, authentic comment threads that indirectly address misconceptions through natural conversation
- **Google Search Integration**: Grounded information from web sources

## Pedagogical Approach

The prompt uses a sophisticated learning design methodology:

1. **Threshold Concepts**: Identifies transformative core ideas that change how learners see the entire subject
2. **Scaffolded Learning**: Breaks complex concepts into logical chunks that build on each other
3. **Dual Coding**: Uses visual metaphors to create multiple memory pathways
4. **Strategic Assessment**: Deploys quizzes and exercises at optimal moments for retention
5. **Real-World Examples**: Avoids toy examples in favor of messy, practical scenarios

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
