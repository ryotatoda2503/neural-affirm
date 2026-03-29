import type { Metadata } from "next";
import { SessionClient } from "./session-client";

export const metadata: Metadata = {
  title: "Affirmation Session — 脳波誘導オーディオ付きアファメーション",
  description:
    "バイノーラルビートで脳波をアルファ波・シータ波に誘導しながらアファメーションを声に出す統合セッション。ループ再生、自動送り、4つの脳波プリセット搭載。",
  keywords: [
    "アファメーション セッション",
    "バイノーラルビート アファメーション",
    "脳波誘導 瞑想",
    "アルファ波 アファメーション",
    "シータ波 潜在意識",
    "アファメーション 音楽",
    "朝のアファメーション ルーティン",
    "寝る前 アファメーション",
  ],
  openGraph: {
    title: "Affirmation Session — 脳波誘導オーディオ付きアファメーション",
    description:
      "バイノーラルビートで最適な脳波状態を作りながら、アファメーションを声に出す統合セッション。",
    url: "https://neural-affirm.com/session",
  },
  alternates: {
    canonical: "https://neural-affirm.com/session",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Affirmation Session — 脳波誘導オーディオ付きアファメーション",
  url: "https://neural-affirm.com/session",
  description:
    "バイノーラルビートで脳波を誘導しながらアファメーションを声に出す統合セッションシステム。",
  isPartOf: {
    "@type": "WebSite",
    name: "Neural Affirm",
    url: "https://neural-affirm.com",
  },
};

export default function SessionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SessionClient />
    </>
  );
}
