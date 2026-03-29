"use client";

import { useState, useEffect, use } from "react";
import { AdminShell } from "../../../admin-shell";
import { PostForm } from "../../post-form";
import Link from "next/link";

type PostData = {
  id: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  keywords: string[];
  readingTime: number;
  sections: { heading: string; content: string }[];
  published: boolean;
};

export default function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(setPost);
  }, [id]);

  return (
    <AdminShell>
      {!post ? (
        <p className="text-sm text-muted">読み込み中...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-light tracking-wide">記事を編集</h1>
              <p className="text-xs text-muted mt-1">/blog/{post.slug}</p>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="text-xs text-muted hover:text-gold transition-colors"
            >
              プレビュー ↗
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <PostForm mode="edit" initial={post} />
          </div>
        </>
      )}
    </AdminShell>
  );
}
