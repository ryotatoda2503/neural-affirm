"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";

const INPUT =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-gold/50 transition-colors";
const LABEL = "text-xs text-muted block mb-1.5";

const PAGES = [
  { path: "/", label: "トップページ" },
  { path: "/blog", label: "ブログ一覧" },
  { path: "/session", label: "セッション" },
  { path: "/install", label: "Neural Install" },
];

function SaveButton({
  saving,
  saved,
  onClick,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`px-5 py-2.5 rounded-lg text-sm cursor-pointer transition-all disabled:opacity-50 ${
        saved
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
          : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"
      }`}
    >
      {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
    </button>
  );
}

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePageSeo = async () => {
    setSeoSaving(true);
    setSeoSaved(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: selectedPage, pageSeo }),
    });
    setSeoSaving(false);
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 3000);
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide">設定</h1>
        <p className="text-xs text-muted mt-1">
          Googleタグ・SEO設定を管理
        </p>
      </div>

      <div className="space-y-8">
        {/* Google Tags */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-1">Google タグ連携</h2>
          <p className="text-[10px] text-muted mb-5">
            設定するとサイト全体に自動的にタグが挿入されます
          </p>

          <div className="space-y-4">
            <div>
              <label className={LABEL}>Google Analytics 4 (GA4) ID</label>
              <input
                className={INPUT}
                placeholder="G-XXXXXXXXXX"
                value={settings.google_analytics_id || ""}
                onChange={(e) =>
                  updateSetting("google_analytics_id", e.target.value)
                }
              />
              <p className="text-[10px] text-muted/50 mt-1">
                GA4の測定ID。Analytics → 管理 → データストリーム で確認できます
              </p>
            </div>
            <div>
              <label className={LABEL}>Google Tag Manager ID</label>
              <input
                className={INPUT}
                placeholder="GTM-XXXXXXX"
                value={settings.google_tag_manager_id || ""}
                onChange={(e) =>
                  updateSetting("google_tag_manager_id", e.target.value)
                }
              />
            </div>
            <div>
              <label className={LABEL}>
                Google Search Console 認証コード
              </label>
              <input
                className={INPUT}
                placeholder="メタタグの content 値をペースト"
                value={settings.google_search_console_verification || ""}
                onChange={(e) =>
                  updateSetting(
                    "google_search_console_verification",
                    e.target.value
                  )
                }
              />
              <p className="text-[10px] text-muted/50 mt-1">
                Search Console → 設定 → 所有権の確認 → HTMLタグ の content値
              </p>
            </div>
          </div>
        </section>

        {/* Global SEO */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-1">グローバルSEO設定</h2>
          <p className="text-[10px] text-muted mb-5">
            サイト全体のデフォルトSEO設定
          </p>

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
                onChange={(e) =>
                  updateSetting("site_description", e.target.value)
                }
              />
            </div>
            <div>
              <label className={LABEL}>デフォルトOG画像 URL</label>
              <input
                className={INPUT}
                placeholder="https://neural-affirm.com/og-image.png"
                value={settings.default_og_image || ""}
                onChange={(e) =>
                  updateSetting("default_og_image", e.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <SaveButton
              saving={saving}
              saved={saved}
              onClick={handleSaveSettings}
            />
          </div>
        </section>

        {/* Per-page SEO */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-1">ページ別SEO設定</h2>
          <p className="text-[10px] text-muted mb-5">
            各ページのSEOメタデータを個別に上書き
          </p>

          {/* Page selector */}
          <div className="flex gap-2 mb-6">
            {PAGES.map((p) => (
              <button
                key={p.path}
                onClick={() => setSelectedPage(p.path)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedPage === p.path
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "border border-border text-muted hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className={LABEL}>タイトル</label>
              <input
                className={INPUT}
                value={pageSeo.title}
                onChange={(e) =>
                  setPageSeo((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="未設定（デフォルト値を使用）"
              />
            </div>
            <div>
              <label className={LABEL}>説明文</label>
              <textarea
                className={`${INPUT} h-20 resize-y`}
                value={pageSeo.description}
                onChange={(e) =>
                  setPageSeo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="未設定（デフォルト値を使用）"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>OGタイトル</label>
                <input
                  className={INPUT}
                  value={pageSeo.og_title}
                  onChange={(e) =>
                    setPageSeo((prev) => ({
                      ...prev,
                      og_title: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={LABEL}>OG説明文</label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>キーワード</label>
                <input
                  className={INPUT}
                  value={pageSeo.keywords}
                  onChange={(e) =>
                    setPageSeo((prev) => ({
                      ...prev,
                      keywords: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={LABEL}>Canonical URL</label>
                <input
                  className={INPUT}
                  value={pageSeo.canonical_url}
                  onChange={(e) =>
                    setPageSeo((prev) => ({
                      ...prev,
                      canonical_url: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <SaveButton
              saving={seoSaving}
              saved={seoSaved}
              onClick={handleSavePageSeo}
            />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
