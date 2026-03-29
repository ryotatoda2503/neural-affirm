import { getDb } from "./db";
import { initSchema } from "./schema";
import type { BlogPost } from "../app/blog/posts";

// Ensure schema exists
try {
  initSchema();
} catch {}

type PostRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string | null;
  category: string;
  keywords: string;
  reading_time: number;
  sections: string;
  published: number;
  created_at: string;
};

function rowToPost(row: PostRow): BlogPost & { id: number; published: boolean } {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    updated: row.updated || undefined,
    category: row.category,
    keywords: JSON.parse(row.keywords),
    readingTime: row.reading_time,
    sections: JSON.parse(row.sections),
    published: row.published === 1,
  };
}

export function getAllPosts(includeUnpublished = false) {
  const db = getDb();
  const query = includeUnpublished
    ? `SELECT * FROM blog_posts ORDER BY date DESC`
    : `SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC`;
  const rows = db.prepare(query).all() as PostRow[];
  return rows.map(rowToPost);
}

export function getPostBySlug(slug: string) {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM blog_posts WHERE slug = ? AND published = 1`)
    .get(slug) as PostRow | undefined;
  return row ? rowToPost(row) : undefined;
}

export function getPostById(id: number) {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM blog_posts WHERE id = ?`)
    .get(id) as PostRow | undefined;
  return row ? rowToPost(row) : undefined;
}

export function getAllSlugs() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT slug FROM blog_posts WHERE published = 1`)
    .all() as { slug: string }[];
  return rows.map((r) => r.slug);
}

export function createPost(data: {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  keywords: string[];
  readingTime: number;
  sections: { heading: string; content: string }[];
  published?: boolean;
}) {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO blog_posts (slug, title, description, date, category, keywords, reading_time, sections, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.slug,
      data.title,
      data.description,
      data.date,
      data.category,
      JSON.stringify(data.keywords),
      data.readingTime,
      JSON.stringify(data.sections),
      data.published !== false ? 1 : 0
    );
  return getPostById(Number(result.lastInsertRowid));
}

export function updatePost(
  id: number,
  data: Partial<{
    slug: string;
    title: string;
    description: string;
    date: string;
    updated: string;
    category: string;
    keywords: string[];
    readingTime: number;
    sections: { heading: string; content: string }[];
    published: boolean;
  }>
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.slug !== undefined) { fields.push("slug = ?"); values.push(data.slug); }
  if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.date !== undefined) { fields.push("date = ?"); values.push(data.date); }
  if (data.updated !== undefined) { fields.push("updated = ?"); values.push(data.updated); }
  if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
  if (data.keywords !== undefined) { fields.push("keywords = ?"); values.push(JSON.stringify(data.keywords)); }
  if (data.readingTime !== undefined) { fields.push("reading_time = ?"); values.push(data.readingTime); }
  if (data.sections !== undefined) { fields.push("sections = ?"); values.push(JSON.stringify(data.sections)); }
  if (data.published !== undefined) { fields.push("published = ?"); values.push(data.published ? 1 : 0); }

  if (fields.length === 0) return getPostById(id);

  values.push(id);
  db.prepare(`UPDATE blog_posts SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );
  return getPostById(id);
}

export function deletePost(id: number) {
  const db = getDb();
  db.prepare(`DELETE FROM blog_posts WHERE id = ?`).run(id);
}
