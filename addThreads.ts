import { generateThread } from "./generateThread";
import { getPriorKnowledge } from "./priorKnowledge";
import type { Post } from "./index";

// This script adds lively, Reddit-style discussion threads to existing posts

interface PostWithChildren extends Post {
  children?: Array<{ text: string; posterName: string }>[];
}

async function addThreadsToPosts(
  posts: Post[],
  topic: string,
  learnerProfile?: string
) {
  const priorKnowledge = learnerProfile
    ? getPriorKnowledge(learnerProfile as any)
    : undefined;

  if (priorKnowledge) {
    console.log(
      `\n💬 Generating threads for: ${priorKnowledge.name} (${priorKnowledge.role})\n`
    );
  }

  const postsWithThreads: PostWithChildren[] = [];

  for (const [index, post] of posts.entries()) {
    // Skip non-post items (like nextTopicSuggestions)
    if (!("posterName" in post)) {
      continue;
    }

    console.log(`Generating thread for post ${index + 1}/${posts.length}: ${post.posterName}...`);

    try {
      const thread = await generateThread(
        post,
        topic,
        priorKnowledge
      );

      postsWithThreads.push({
        ...post,
        children: [thread], // Wrap in array to match existing structure
      });

      console.log(`✅ Generated ${thread.length} replies`);
    } catch (error) {
      console.error(`❌ Error generating thread for post ${index}:`, error);
      postsWithThreads.push(post); // Add post without thread
    }

    // Add a small delay to avoid rate limiting
    await Bun.sleep(500);
  }

  return postsWithThreads;
}

// Main execution
async function main() {
  // Read the configuration from index.ts (or pass as arguments)
  const TOPIC = "React"; // Change this to match your topic
  const LEARNER_PROFILE = "frontend"; // Change this to match your learner profile

  // Read the output.json file
  const outputFile = await Bun.file("output.json").json();
  
  // Handle both formats: direct array or object with posts property
  const posts = Array.isArray(outputFile) ? outputFile : outputFile.posts;

  if (!posts || posts.length === 0) {
    console.error("No posts found in output.json");
    process.exit(1);
  }

  console.log(`\n📚 Found ${posts.length} posts\n`);

  const postsWithThreads = await addThreadsToPosts(
    posts,
    TOPIC,
    LEARNER_PROFILE
  );

  // Save to outputWithChildren.json
  await Bun.write(
    "outputWithChildren.json",
    JSON.stringify(postsWithThreads, null, 2)
  );

  console.log("\n✅ Saved to outputWithChildren.json");
  console.log(`Generated threads for ${postsWithThreads.length} posts`);

  // Optionally visualize
  const { visualize } = await import("./visualize");
  await visualize(
    JSON.stringify(
      {
        posts: postsWithThreads,
        learningGoal: outputFile.learningGoal,
        webSearchQueries: outputFile.webSearchQueries,
      },
      null,
      2
    ),
    "visualizationWithChildren.html"
  );
}

main().catch(console.error);

