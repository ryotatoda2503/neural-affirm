import type { Metadata } from "next";
import { InstallClient } from "./install-client";

export const metadata: Metadata = {
  title: "Neural Install — 聴くだけで自動クリアリングを脳にインストール",
  description:
    "バイノーラルビート・ソルフェジオ周波数・古典的条件づけを組み合わせ、聴くだけでブロックが自動解放される神経回路を脳にインストールするシステム。科学的根拠に基づく90日間プログラム。",
  keywords: [
    "バイノーラルビート",
    "ニューラルインストール",
    "ソルフェジオ周波数",
    "脳波誘導",
    "自動クリアリング",
    "潜在意識 書き換え",
    "シータ波 瞑想",
    "アファメーション 自動",
  ],
  openGraph: {
    title: "Neural Install — 聴くだけで自動クリアリングを脳にインストール",
    description:
      "バイノーラルビート × 条件づけで、聴くだけでブロックが自動解放される神経回路をインストール。",
    url: "https://neural-affirm.com/install",
  },
  alternates: {
    canonical: "https://neural-affirm.com/install",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Neural Install — 聴くだけで自動クリアリングを脳にインストール",
  url: "https://neural-affirm.com/install",
  description:
    "バイノーラルビート・ソルフェジオ周波数・古典的条件づけを組み合わせた科学的ニューラルインストールシステム。",
  isPartOf: {
    "@type": "WebSite",
    name: "Neural Affirm",
    url: "https://neural-affirm.com",
  },
};

export default function InstallPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InstallClient />
    </>
  );
}
