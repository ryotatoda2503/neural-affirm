"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
  published: boolean;
};

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light">記事管理</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
        >
          新規作成
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left px-4 py-3 text-xs text-muted font-normal">タイトル</th>
              <th className="text-left px-4 py-3 text-xs text-muted font-normal w-24">カテゴリ</th>
              <th className="text-left px-4 py-3 text-xs text-muted font-normal w-24">日付</th>
              <th className="text-left px-4 py-3 text-xs text-muted font-normal w-16">状態</th>
              <th className="text-right px-4 py-3 text-xs text-muted font-normal w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-card/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-gold transition-colors">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{post.category}</td>
                <td className="px-4 py-3 text-xs text-muted">{post.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    post.published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/10 text-muted"
                  }`}>
                    {post.published ? "公開" : "下書き"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
