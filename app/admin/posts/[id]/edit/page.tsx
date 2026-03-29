"use client";

import { useState, useEffect, use } from "react";
import { PostForm } from "../../post-form";

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

  if (!post) {
    return <p className="text-sm text-muted">読み込み中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-light mb-8">記事を編集</h1>
      <PostForm mode="edit" initial={post} />
    </div>
  );
}
