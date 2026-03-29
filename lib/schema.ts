import { getDb } from "./db";

export function initSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      updated TEXT,
      category TEXT NOT NULL,
      keywords TEXT NOT NULL DEFAULT '[]',
      reading_time INTEGER NOT NULL DEFAULT 5,
      sections TEXT NOT NULL DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS page_seo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      keywords TEXT,
      og_title TEXT,
      og_description TEXT,
      canonical_url TEXT
    );
  `);

  // Seed default settings if not exist
  const upsert = db.prepare(
    `INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, '')`
  );
  const defaults = [
    "google_analytics_id",
    "google_search_console_verification",
    "google_tag_manager_id",
    "default_og_image",
    "site_name",
    "site_description",
  ];
  for (const key of defaults) {
    upsert.run(key);
  }
}
