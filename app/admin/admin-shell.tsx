"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "ダッシュボード", icon: "◫" },
  { href: "/admin/posts", label: "記事管理", icon: "◱" },
  { href: "/admin/settings", label: "設定", icon: "◉" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUser(data.username);
        setReady(true);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col bg-card/50">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="block">
            <p className="text-sm font-medium tracking-wider">Neural Affirm</p>
            <p className="text-[10px] text-muted mt-0.5">Admin Panel</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const active =
              n.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <span className="text-xs opacity-60">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* User & logout */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-xs font-medium">{user}</p>
              <p className="text-[10px] text-muted">管理者</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] text-muted hover:text-red-400 transition-colors cursor-pointer"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Site link */}
        <div className="px-3 pb-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted hover:text-foreground transition-all"
          >
            サイトを表示 ↗
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
