"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    // If already set up, redirect
    fetch("/api/auth").then((r) => {
      if (r.ok) router.push("/admin");
    });
  }, [router]);

  const checkStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setStrength(s);
  };

  const strengthLabel = ["", "弱い", "やや弱い", "普通", "強い", "非常に強い"];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-emerald-400",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }
    if (strength < 3) {
      setError(
        "パスワードをもっと強くしてください（大文字・数字・記号を含める）"
      );
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(data.error);
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
          <p className="text-xs text-muted">管理者アカウントのセットアップ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                checkStrength(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50"
              required
              minLength={8}
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= strength
                          ? strengthColor[strength]
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted">
                  強度: {strengthLabel[strength]}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm cursor-pointer hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            {loading ? "設定中..." : "管理者アカウントを作成"}
          </button>
        </form>

        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-muted leading-relaxed">
            パスワード要件: 8文字以上、大文字・数字・記号を含めると強度が上がります。
            パスワードはbcrypt（12ラウンド）でハッシュ化されます。
          </p>
        </div>
      </div>
    </div>
  );
}
