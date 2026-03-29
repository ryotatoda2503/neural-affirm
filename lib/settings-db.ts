import { getDb } from "./db";
import { initSchema } from "./schema";

try {
  initSchema();
} catch {}

export function getSetting(key: string): string {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM site_settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

export function setSetting(key: string, value: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const db = getDb();
  const rows = db
    .prepare(`SELECT key, value FROM site_settings`)
    .all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

type PageSeoRow = {
  id: number;
  path: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
};

export function getPageSeo(path: string) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM page_seo WHERE path = ?`)
    .get(path) as PageSeoRow | undefined;
}

export function setPageSeo(
  path: string,
  data: {
    title?: string;
    description?: string;
    keywords?: string;
    og_title?: string;
    og_description?: string;
    canonical_url?: string;
  }
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO page_seo (path, title, description, keywords, og_title, og_description, canonical_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       keywords = excluded.keywords,
       og_title = excluded.og_title,
       og_description = excluded.og_description,
       canonical_url = excluded.canonical_url`
  ).run(
    path,
    data.title || null,
    data.description || null,
    data.keywords || null,
    data.og_title || null,
    data.og_description || null,
    data.canonical_url || null
  );
}
