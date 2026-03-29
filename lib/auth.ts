import { SignJWT, jwtVerify } from "jose";
import { hashSync, compareSync } from "bcryptjs";
import { getDb } from "./db";
import { initSchema } from "./schema";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "neural-affirm-admin-secret-key-change-in-production-2026"
);
const TOKEN_NAME = "na_session";
const TOKEN_EXPIRY = "24h";
const BCRYPT_ROUNDS = 12;

// ─── Schema ───

export function initAuthSchema() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      attempted_at TEXT DEFAULT (datetime('now')),
      success INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// ─── User Management ───

export function createAdminUser(username: string, password: string) {
  initAuthSchema();
  const db = getDb();
  const hash = hashSync(password, BCRYPT_ROUNDS);
  db.prepare(
    `INSERT OR REPLACE INTO admin_users (username, password_hash) VALUES (?, ?)`
  ).run(username, hash);
}

export function verifyCredentials(username: string, password: string): boolean {
  initAuthSchema();
  const db = getDb();
  const row = db
    .prepare(`SELECT password_hash FROM admin_users WHERE username = ?`)
    .get(username) as { password_hash: string } | undefined;
  if (!row) return false;
  return compareSync(password, row.password_hash);
}

export function adminUserExists(): boolean {
  initAuthSchema();
  const db = getDb();
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM admin_users`)
    .get() as { c: number };
  return row.c > 0;
}

export function updateLastLogin(username: string) {
  const db = getDb();
  db.prepare(
    `UPDATE admin_users SET last_login = datetime('now') WHERE username = ?`
  ).run(username);
}

// ─── Rate Limiting ───

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  initAuthSchema();
  const db = getDb();
  // Clean old attempts (older than 15 minutes)
  db.prepare(
    `DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-15 minutes')`
  ).run();

  const row = db
    .prepare(
      `SELECT COUNT(*) as c FROM login_attempts WHERE ip = ? AND success = 0 AND attempted_at > datetime('now', '-15 minutes')`
    )
    .get(ip) as { c: number };

  const MAX_ATTEMPTS = 5;
  return {
    allowed: row.c < MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - row.c),
  };
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const db = getDb();
  db.prepare(
    `INSERT INTO login_attempts (ip, success) VALUES (?, ?)`
  ).run(ip, success ? 1 : 0);

  // If success, clear failed attempts for this IP
  if (success) {
    db.prepare(
      `DELETE FROM login_attempts WHERE ip = ? AND success = 0`
    ).run(ip);
  }
}

// ─── JWT Token ───

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { username: payload.sub as string };
  } catch {
    return null;
  }
}

// ─── Session Helpers ───

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { TOKEN_NAME };
