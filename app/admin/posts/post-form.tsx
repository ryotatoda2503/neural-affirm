"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Section = { heading: string; content: string };

type PostFormData = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  keywords: string[];
  readingTime: number;
  sections: Section[];
  published: boolean;
};

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50";
const LABEL = "text-xs text-muted block mb-1";

export function PostForm({
  initial,
  mode,
}: {
  initial?: PostFormData;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PostFormData>(
    initial || {
      slug: "",
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      category: "",
      keywords: [],
      readingTime: 5,
      sections: [{ heading: "", content: "" }],
      published: true,
    }
  );

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateSection = (i: number, field: keyof Section, value: string) => {
    const sections = [...form.sections];
    sections[i] = { ...sections[i], [field]: value };
    update("sections", sections);
  };

  const addSection = () =>
    update("sections", [...form.sections, { heading: "", content: "" }]);

  const removeSection = (i: number) =>
    update("sections", form.sections.filter((_, idx) => idx !== i));

  const autoSlug = (title: string) => {
    if (mode === "edit") return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
    update("slug", slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url =
      mode === "create" ? "/api/posts" : `/api/posts/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const body = {
      ...form,
      updated: mode === "edit" ? new Date().toISOString().slice(0, 10) : undefined,
    };

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>タイトル</label>
          <input
            className={INPUT}
            value={form.title}
            onChange={(e) => {
              update("title", e.target.value);
              autoSlug(e.target.value);
            }}
            required
          />
        </div>
        <div>
          <label className={LABEL}>スラッグ (URL)</label>
          <input
            className={INPUT}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>説明文 (SEO description)</label>
        <textarea
          className={`${INPUT} h-20 resize-y`}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={LABEL}>カテゴリ</label>
          <input
            className={INPUT}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={LABEL}>日付</label>
          <input
            type="date"
            className={INPUT}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL}>読了時間 (分)</label>
          <input
            type="number"
            className={INPUT}
            value={form.readingTime}
            onChange={(e) => update("readingTime", Number(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <label className={LABEL}>状態</label>
          <select
            className={INPUT}
            value={form.published ? "1" : "0"}
            onChange={(e) => update("published", e.target.value === "1")}
          >
            <option value="1">公開</option>
            <option value="0">下書き</option>
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>キーワード（カンマ区切り）</label>
        <input
          className={INPUT}
          value={form.keywords.join(", ")}
          onChange={(e) =>
            update(
              "keywords",
              e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
            )
          }
        />
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">セクション</label>
          <button
            type="button"
            onClick={addSection}
            className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 cursor-pointer hover:bg-gold/20 transition-all"
          >
            + セクション追加
          </button>
        </div>

        <div className="space-y-4">
          {form.sections.map((section, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">
                  セクション {i + 1}
                </span>
                {form.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                  >
                    削除
                  </button>
                )}
              </div>
              <input
                className={`${INPUT} mb-2`}
                placeholder="見出し"
                value={section.heading}
                onChange={(e) => updateSection(i, "heading", e.target.value)}
                required
              />
              <textarea
                className={`${INPUT} h-40 resize-y font-mono text-xs`}
                placeholder="本文（**太字** 対応）"
                value={section.content}
                onChange={(e) => updateSection(i, "content", e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm cursor-pointer hover:bg-gold/20 transition-all disabled:opacity-50"
        >
          {saving ? "保存中..." : mode === "create" ? "記事を作成" : "更新する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="px-6 py-2.5 rounded-lg border border-border text-sm text-muted cursor-pointer hover:text-foreground transition-all"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
