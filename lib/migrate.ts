import { initSchema } from "./schema";
import { getDb } from "./db";

// Existing posts data (inline to avoid import issues with tsx runner)
const existingSlugs = [
  "what-is-affirmation",
  "morning-affirmation-guide",
  "money-affirmation",
  "binaural-beats-affirmation",
  "night-affirmation-sleep",
];

initSchema();
const db = getDb();

// Check if posts already migrated
const count = (
  db.prepare(`SELECT COUNT(*) as c FROM blog_posts`).get() as { c: number }
).c;

if (count > 0) {
  console.log(`Database already has ${count} posts. Skipping seed.`);
} else {
  console.log("Seeding posts from posts.ts...");
  // Import dynamically
  import("../app/blog/posts").then(({ posts }) => {
    const insert = db.prepare(
      `INSERT OR IGNORE INTO blog_posts (slug, title, description, date, category, keywords, reading_time, sections, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    );

    for (const post of posts) {
      insert.run(
        post.slug,
        post.title,
        post.description,
        post.date,
        post.category,
        JSON.stringify(post.keywords),
        post.readingTime,
        JSON.stringify(post.sections)
      );
      console.log(`  ✓ ${post.slug}`);
    }
    console.log(`Done. ${posts.length} posts migrated.`);
  });
}
