"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "../admin-shell";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
  published: boolean;
  readingTime: number;
};

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
  }, []);

  const filtered =
    filter === "all"
      ? posts
      : filter === "published"
        ? posts.filter((p) => p.published)
        : posts.filter((p) => !p.published);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">記事管理</h1>
          <p className="text-xs text-muted mt-1">
            {posts.length}件の記事
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
        >
          + 新規作成
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-card border border-border rounded-lg p-1 w-fit">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              filter === f
                ? "bg-gold/10 text-gold"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? `すべて (${posts.length})` : f === "published" ? `公開 (${posts.filter((p) => p.published).length})` : `下書き (${posts.filter((p) => !p.published).length})`}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted">記事がありません</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[10px] text-muted font-normal tracking-wider uppercase">
                  タイトル
                </th>
                <th className="text-left px-5 py-3 text-[10px] text-muted font-normal tracking-wider uppercase w-28">
                  カテゴリ
                </th>
                <th className="text-left px-5 py-3 text-[10px] text-muted font-normal tracking-wider uppercase w-24">
                  日付
                </th>
                <th className="text-left px-5 py-3 text-[10px] text-muted font-normal tracking-wider uppercase w-16">
                  状態
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-muted font-normal tracking-wider uppercase w-28">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border last:border-0 hover:bg-gold/3 transition-all"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="hover:text-gold transition-colors font-medium"
                    >
                      {post.title}
                    </Link>
                    <p className="text-[10px] text-muted mt-0.5">
                      /blog/{post.slug}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">{post.date}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] ${
                        post.published ? "text-emerald-500" : "text-muted/50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          post.published ? "bg-emerald-500" : "bg-muted/30"
                        }`}
                      />
                      {post.published ? "公開" : "下書き"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-muted hover:text-gold transition-colors"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
