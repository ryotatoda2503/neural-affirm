import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createToken,
  checkRateLimit,
  recordLoginAttempt,
  createAdminUser,
  adminUserExists,
  updateLastLogin,
  getSession,
  TOKEN_NAME,
} from "../../../lib/auth";

// POST /api/auth — Login or Setup
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const data = await request.json();
  const { action, username, password } = data;

  // ─── Setup (first-time only) ───
  if (action === "setup") {
    if (adminUserExists()) {
      return NextResponse.json(
        { error: "管理者は既に設定されています" },
        { status: 403 }
      );
    }
    if (!username || !password || password.length < 8) {
      return NextResponse.json(
        { error: "ユーザー名とパスワード（8文字以上）が必要です" },
        { status: 400 }
      );
    }
    createAdminUser(username, password);
    const token = await createToken(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });
    return response;
  }

  // ─── Login ───
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "ログイン試行回数の上限に達しました。15分後に再試行してください。" },
      { status: 429 }
    );
  }

  if (!username || !password) {
    return NextResponse.json(
      { error: "ユーザー名とパスワードが必要です" },
      { status: 400 }
    );
  }

  const valid = verifyCredentials(username, password);
  recordLoginAttempt(ip, valid);

  if (!valid) {
    return NextResponse.json(
      {
        error: "ユーザー名またはパスワードが正しくありません",
        remaining: rateLimit.remaining - 1,
      },
      { status: 401 }
    );
  }

  updateLastLogin(username);
  const token = await createToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });
  return response;
}

// GET /api/auth — Check session
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}

// DELETE /api/auth — Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
