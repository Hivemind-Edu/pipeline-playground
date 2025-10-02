# Prompt Design Philosophy

This document explains the pedagogical approach behind the learning feed generation prompt.

## The Core Premise

The prompt frames content creation as a high-stakes human endeavor rather than a routine AI task. This framing gives the AI explicit permission to break out of bland, corporate patterns and create genuinely insightful content.

## Key Pedagogical Principles

### 1. Threshold Concepts

A threshold concept is a transformative idea that, once understood, fundamentally changes how someone sees a subject. These concepts are:

- **Transformative**: They change perspective
- **Irreversible**: You can't "un-see" them
- **Integrative**: They connect other ideas together
- **Troublesome**: They're often counterintuitive

**Example**: In Git, the threshold concept isn't learning commands—it's understanding that version control is about creating immutable snapshots rather than overwriting files.

### 2. Learning Science Integration

The prompt explicitly instructs the AI to use:

- **Cognitive Load Theory**: Break concepts into small, manageable chunks
- **Dual Coding Theory**: Use visual metaphors to create multiple memory pathways
- **Elaboration**: Connect new concepts to existing knowledge
- **Strategic Assessment**: Use quizzes and exercises at optimal moments

### 3. Prior Knowledge Analysis

Before generating content, the AI must:
1. Analyze the learner's current mental model
2. Identify potential misconceptions
3. Start from where the learner actually is
4. Build on existing expertise rather than rehashing basics

### 4. Voice and Style

**The Witty Subreddit Veteran**: Opinionated, concise, with dry humor. The person who drops the perfect analogy that makes everything click.

Key principles:
- No direct address (avoid constant "you")
- Concise and potent (every sentence has purpose)
- Avoid AI hallmarks (no repetitive structures or fluff)
- Use markdown for clarity
- Irreverence must serve understanding

## Output Structure

### Learning Goal (Internal)
First YAML element captures the measurable skill the learner will gain. This guides content creation but isn't prominently shown to the user.

### Posts (15+)
Each post type serves a specific pedagogical purpose:
- **BASIC**: Core concepts in minimal form
- **AI_IMAGE**: Abstract ideas need visual metaphors
- **QUIZ**: Test recall immediately after introduction
- **EXERCISE**: Prove you can assemble concepts into working mental models
- **SOURCES**: Dive deeper with grounded research
- **COMMENT**: Clarify, add counterpoint, or create dialogue
- **MEME**: Humor that reinforces understanding
- **WEB_IMAGE**: Visual from web to illustrate

### Next Topic Suggestions
Frame as compelling choices representing:
1. Next logical threshold concept
2. Practical adjacent skill
3. More theoretical/advanced direction

## Why This Works

1. **Explicit Pedagogy**: The AI knows *why* it's making each choice, not just *what* to create
2. **Mental Model Focus**: Content addresses how learners think, not just what they should know
3. **Strategic Variety**: Different post types serve different cognitive purposes
4. **Personality Permission**: The framing lets the AI be genuinely insightful rather than bland

## Example: Git for a Designer

**Threshold Concept**: Immutable snapshot history vs. mutable file history

**Mental Model Shift**: From "saving overwrites a file" to "committing creates a permanent time capsule"

**Learning Goal**: "Can explain the difference between 'save' and 'commit' and can create their first repository and commit"

**First Post**: Meets them where they are (Dropbox user) and introduces the transformative idea (time machine vs. safety net)

This approach creates content that feels like it's reading the learner's mind because it's built on understanding their current thinking, not just their knowledge gaps.

