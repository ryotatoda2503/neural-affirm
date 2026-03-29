"use client";

import { PostForm } from "../post-form";

export default function NewPost() {
  return (
    <div>
      <h1 className="text-2xl font-light mb-8">新規記事作成</h1>
      <PostForm mode="create" />
    </div>
  );
}
