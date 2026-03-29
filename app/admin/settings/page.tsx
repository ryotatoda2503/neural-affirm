"use client";

import { useState, useEffect } from "react";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50";
const LABEL = "text-xs text-muted block mb-1";

const PAGES = ["/", "/blog", "/session", "/install"];

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Page SEO
  const [selectedPage, setSelectedPage] = useState("/");
  const [pageSeo, setPageSeo] = useState({
    title: "",
    description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    canonical_url: "",
  });
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoSaved, setSeoSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  useEffect(() => {
    fetch(`/api/settings?path=${encodeURIComponent(selectedPage)}`)
      .then((r) => r.json())
      .then((data) => {
        setPageSeo({
          title: data.title || "",
          description: data.description || "",
          keywords: data.keywords || "",
          og_title: data.og_title || "",
          og_description: data.og_description || "",
          canonical_url: data.canonical_url || "",
        });
      });
  }, [selectedPage]);

  const updateSetting = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSaveSettings = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSavePageSeo = async () => {
    setSeoSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: selectedPage, pageSeo }),
    });
    setSeoSaving(false);
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 2000);
  };

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-light">設定</h1>

      {/* Google Tags */}
      <section>
        <h2 className="text-sm font-medium mb-4 pb-2 border-b border-border">
          Google タグ
        </h2>
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Google Analytics ID (GA4)</label>
            <input
              className={INPUT}
              placeholder="G-XXXXXXXXXX"
              value={settings.google_analytics_id || ""}
              onChange={(e) => updateSetting("google_analytics_id", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Google Tag Manager ID</label>
            <input
              className={INPUT}
              placeholder="GTM-XXXXXXX"
              value={settings.google_tag_manager_id || ""}
              onChange={(e) => updateSetting("google_tag_manager_id", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Google Search Console 認証コード</label>
            <input
              className={INPUT}
              placeholder="認証メタタグの content 値"
              value={settings.google_search_console_verification || ""}
              onChange={(e) =>
                updateSetting("google_search_console_verification", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* Global SEO */}
      <section>
        <h2 className="text-sm font-medium mb-4 pb-2 border-b border-border">
          グローバルSEO設定
        </h2>
        <div className="space-y-4">
          <div>
            <label className={LABEL}>サイト名</label>
            <input
              className={INPUT}
              placeholder="Neural Affirm"
              value={settings.site_name || ""}
              onChange={(e) => updateSetting("site_name", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>サイト説明文</label>
            <textarea
              className={`${INPUT} h-20 resize-y`}
              value={settings.site_description || ""}
              onChange={(e) => updateSetting("site_description", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>デフォルトOG画像 URL</label>
            <input
              className={INPUT}
              placeholder="https://neural-affirm.com/og-image.png"
              value={settings.default_og_image || ""}
              onChange={(e) => updateSetting("default_og_image", e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="mt-4 px-6 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm cursor-pointer hover:bg-gold/20 transition-all disabled:opacity-50"
        >
          {saving ? "保存中..." : saved ? "✓ 保存しました" : "設定を保存"}
        </button>
      </section>

      {/* Per-page SEO */}
      <section>
        <h2 className="text-sm font-medium mb-4 pb-2 border-b border-border">
          ページ別SEO設定
        </h2>

        <div className="mb-4">
          <label className={LABEL}>ページを選択</label>
          <select
            className={INPUT}
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            {PAGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className={LABEL}>タイトル（上書き）</label>
            <input
              className={INPUT}
              value={pageSeo.title}
              onChange={(e) =>
                setPageSeo((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={LABEL}>説明文（上書き）</label>
            <textarea
              className={`${INPUT} h-20 resize-y`}
              value={pageSeo.description}
              onChange={(e) =>
                setPageSeo((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={LABEL}>キーワード</label>
            <input
              className={INPUT}
              value={pageSeo.keywords}
              onChange={(e) =>
                setPageSeo((prev) => ({ ...prev, keywords: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>OG タイトル</label>
              <input
                className={INPUT}
                value={pageSeo.og_title}
                onChange={(e) =>
                  setPageSeo((prev) => ({ ...prev, og_title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={LABEL}>OG 説明文</label>
              <input
                className={INPUT}
                value={pageSeo.og_description}
                onChange={(e) =>
                  setPageSeo((prev) => ({
                    ...prev,
                    og_description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className={LABEL}>Canonical URL</label>
            <input
              className={INPUT}
              value={pageSeo.canonical_url}
              onChange={(e) =>
                setPageSeo((prev) => ({ ...prev, canonical_url: e.target.value }))
              }
            />
          </div>
        </div>

        <button
          onClick={handleSavePageSeo}
          disabled={seoSaving}
          className="mt-4 px-6 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm cursor-pointer hover:bg-gold/20 transition-all disabled:opacity-50"
        >
          {seoSaving
            ? "保存中..."
            : seoSaved
              ? "✓ 保存しました"
              : "ページSEOを保存"}
        </button>
      </section>
    </div>
  );
}
