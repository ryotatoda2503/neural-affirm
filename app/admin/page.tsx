"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Post = { id: number; title: string; date: string; published: boolean; slug: string };

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-light mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="border border-border rounded-lg p-5">
          <p className="text-3xl font-light">{posts.length}</p>
          <p className="text-xs text-muted mt-1">記事数</p>
        </div>
        <div className="border border-border rounded-lg p-5">
          <p className="text-3xl font-light">
            {posts.filter((p) => p.published).length}
          </p>
          <p className="text-xs text-muted mt-1">公開中</p>
        </div>
        <div className="border border-border rounded-lg p-5">
          <p className="text-3xl font-light">
            {settings.google_analytics_id ? "✓" : "—"}
          </p>
          <p className="text-xs text-muted mt-1">Google Analytics</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
        >
          新規記事を作成
        </Link>
        <Link
          href="/admin/settings"
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-all"
        >
          設定を編集
        </Link>
      </div>

      {posts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm text-muted mb-3">最新の記事</h2>
          <div className="space-y-2">
            {posts.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/admin/posts/${p.id}/edit`}
                className="block border border-border rounded-lg px-4 py-3 hover:border-gold/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{p.title}</span>
                  <span className="text-[10px] text-muted">{p.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
