"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "./admin-shell";

type Post = {
  id: number;
  title: string;
  slug: string;
  date: string;
  category: string;
  published: boolean;
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const published = posts.filter((p) => p.published).length;
  const drafts = posts.length - published;

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide">ダッシュボード</h1>
        <p className="text-xs text-muted mt-1">サイトの状態を確認</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "総記事数", value: posts.length, color: "text-foreground" },
          { label: "公開中", value: published, color: "text-emerald-500" },
          { label: "下書き", value: drafts, color: "text-muted" },
          {
            label: "Analytics",
            value: settings.google_analytics_id ? "連携済" : "未設定",
            color: settings.google_analytics_id
              ? "text-emerald-500"
              : "text-orange-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl px-5 py-4"
          >
            <p className={`text-2xl font-light ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted mt-1 tracking-wider uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-10">
        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
        >
          + 新規記事を作成
        </Link>
        <Link
          href="/admin/settings"
          className="px-5 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-all"
        >
          設定を編集
        </Link>
      </div>

      {/* Recent posts */}
      {posts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">最新の記事</h2>
            <Link
              href="/admin/posts"
              className="text-xs text-muted hover:text-gold transition-colors"
            >
              すべて見る →
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {posts.slice(0, 5).map((post, i) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-gold/5 transition-all ${
                  i < Math.min(posts.length, 5) - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      post.published ? "bg-emerald-500" : "bg-muted/30"
                    }`}
                  />
                  <span className="text-sm">{post.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted">{post.category}</span>
                  <span className="text-[10px] text-muted/50">{post.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Google Tags Status */}
      <div className="mt-10">
        <h2 className="text-sm font-medium mb-4">連携状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: "Google Analytics",
              key: "google_analytics_id",
              placeholder: "G-XXXXXXXXXX",
            },
            {
              label: "Tag Manager",
              key: "google_tag_manager_id",
              placeholder: "GTM-XXXXXXX",
            },
            {
              label: "Search Console",
              key: "google_search_console_verification",
              placeholder: "認証コード",
            },
          ].map((tag) => (
            <div
              key={tag.key}
              className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium">{tag.label}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {settings[tag.key] || "未設定"}
                </p>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  settings[tag.key] ? "bg-emerald-500" : "bg-muted/30"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
