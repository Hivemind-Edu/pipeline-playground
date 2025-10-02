import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { Post } from "./index";
import { USER_PROFILE } from "./USER_PROFILE";

const ChildPostSchema = z.object({
  text: z.string(),
  posterName: z.string(),
});

export async function generateThread(firstPost: Post, topic: string) {
  const prompt = `You are creating a lively, Reddit-style discussion thread for a learning post. This should feel like a vibrant subreddit where people with different backgrounds jump in, share experiences, debate nuances, drop jokes, and organically help each other understand the concept.

TOPIC: ${topic}

User Profile:
${USER_PROFILE}

MAIN POST:
${JSON.stringify(firstPost, null, 2)}

YOUR MISSION:
Generate 3-5 comments that create a natural, engaging discussion. The thread should INDIRECTLY address questions and misconceptions the learner might have, but wrapped in authentic conversation.

Think r/programming, r/webdev, r/reactjs energy. People are:
- Sharing "aha!" moments
- Comparing to their past experiences
- Debating best practices
- Dropping helpful tips
- Making jokes about common pitfalls
- Sharing war stories
- Building on each other's comments

THREAD DYNAMICS:

1. **Mix of Personas**:
   - Someone who just "got it" sharing their insight
   - A veteran dropping wisdom or a hot take
   - Someone making a connection to another framework/tool
   - Occasional humor about common mistakes
   - Follow-ups that build on previous comments

2. **Natural Flow** (not Q&A format):
   - First comment: Reaction, insight, or connection to their experience
   - Second comment: Builds on or challenges the first, adds nuance
   - Third comment: Different angle, practical tip, or "this saved me" moment
   - Optional fourth: Callback to earlier comment, joke, or edge case
   - Optional fifth: Synthesis or "mind blown" realization

3. **Addressing FAQs INDIRECTLY**:
   Instead of "How does X work?"
   Say: "Took me forever to realize X isn't like Y. Kept trying to [wrong approach] until..."
   
   Instead of "What about Z?"
   Say: "Pro tip: watch out for Z. Burned by that last week. Now I always..."

4. **Personality & Voice**:
   - Conversational, not formal
   - Use Reddit conventions: "TIL", "IMO", "ngl", casual punctuation
   - Occasional humor, self-deprecation, emoji (but not excessive)
   - Real experiences: "I spent 3 hours debugging this before..."
   - Hot takes: "Unpopular opinion: ..."
   - Enthusiasm: "This is wild", "Mind = blown", "Game changer"

5. **Prior Knowledge Integration**:
   If learner knows Vue: "Coming from Vue, this felt weird at first because..."
   If learner is designer: "As someone who lived in Figma, the Git mindset was..."
   If learner is mobile dev: "This is basically like [mobile concept] but for..."

EXAMPLES:

**Example 1 - Git for Designer:**
Post: "Git doesn't overwrite. It takes a photograph of your entire project."

Thread:
1. (DesignerTurnedDev): "Ohhh this finally clicked for me. I kept treating Git like Dropbox—just syncing the 'latest version'. The snapshot thing is more like... every time you commit, you're duplicating your ENTIRE Figma file with a new name. OldProject_v1, OldProject_v2, etc. Except Git doesn't waste space because magic."

2. (DevVeteran): "That Figma analogy is actually solid. And the magic is called 'content-addressable storage' if you ever want to fall down that rabbit hole. But yeah, once you stop thinking 'save' and start thinking 'bookmark this moment in time' everything makes way more sense."

3. (DesignerTurnedDev): "Wait so when I hit Cmd+S in VS Code... that's NOT a commit? 😅 I've been doing this wrong for weeks."

4. (HelpfulRedditor): "Nope! Cmd+S = save to disk (like saving your .fig file). Git commit = archive that saved file. Two separate steps. Save first, THEN commit. Tripped me up too at first."

5. (DesignerTurnedDev): "Mind. Blown. This explains so much about why I kept seeing 'no changes to commit' 🤦"

**Example 2 - React useState for Vue Dev:**
Post: "useState is React's way to add memory to a component."

Thread:
1. (VueMigrator): "Coming from Vue, this felt so manual at first. Like, in Vue I just mutate \`count.value++\` and boom, reactivity. Here I gotta call a setter? Felt like going back to jQuery."

2. (ReactPragmatist): "Haha yeah but that 'manual' thing grows on you. IMO the explicitness is nice—you know EXACTLY when a re-render happens. No mystery Proxy magic tracking random object mutations."

3. (VueMigrator): "Fair point. Debugging Vue reactivity can be... fun 😅 At least with setState I know it's MY fault when things break."

4. (SeniorDev): "Pro tip for Vue folks: don't try to mutate the state directly like \`count++\`. React won't see it. Always use the setter function. I've watched that mistake cost 2 hours of debugging. Multiple times."

5. (VueMigrator): "TIL. Gonna write that on a sticky note and slap it on my monitor."

KEY: Make it FEEL like a real discussion where people are genuinely helping each other, sharing experiences, and having fun. The educational value comes through osmosis, not lecture.

Generate 3-5 comments that create this vibe.`;

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
