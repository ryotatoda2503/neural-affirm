"use client";

import { AdminShell } from "../../admin-shell";
import { PostForm } from "../post-form";

export default function NewPost() {
  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide">新規記事作成</h1>
        <p className="text-xs text-muted mt-1">新しいブログ記事を作成します</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <PostForm mode="create" />
      </div>
    </AdminShell>
  );
}
