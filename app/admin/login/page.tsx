"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch("/api/auth").then((r) => {
      if (r.ok) router.push("/admin");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(data.error);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light tracking-wider mb-1">
            Neural Affirm
          </h1>
          <p className="text-xs text-muted">管理者ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50"
              autoComplete="username"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-xs text-red-400">{error}</p>
              {remaining !== null && remaining > 0 && (
                <p className="text-[10px] text-red-400/60 mt-1">
                  残り{remaining}回の試行が可能です
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm cursor-pointer hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            {loading ? "認証中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted/30">
            セキュリティ: JWT + bcrypt + Rate Limiting + httpOnly Cookie
          </p>
        </div>
      </div>
    </div>
  );
}
