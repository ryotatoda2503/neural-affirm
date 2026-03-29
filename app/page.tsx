import { HomeClient } from "./home-client";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Neural Affirm — 科学的アファメーション辞書",
  url: "https://neural-affirm.com",
  description:
    "量子論・脳科学・心理学に基づく科学的アファメーション辞書。朝と夜の全68項目、ブロック自動クリアリング、脳波誘導セッション機能付き。",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://neural-affirm.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "アファメーションに科学的根拠はありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。神経可塑性（ヘッブの法則）により、繰り返し発話することで脳の神経回路が物理的に再構築されます。また、RAS（網様体賦活系）の再プログラミング、迷走神経刺激によるHRV改善、心臓の電磁場のコヒーレンス向上など、複数の科学的メカニズムが確認されています。",
      },
    },
    {
      "@type": "Question",
      name: "アファメーションは朝と夜どちらが効果的ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "両方効果的ですが、メカニズムが異なります。朝は覚醒直後のシータ波状態で暗示受容性が最も高く、RASの認知フィルターを設定できます。夜は入眠前のシータ波移行期に潜在意識への直接的なプログラミングが可能で、睡眠中の記憶固定化プロセスにポジティブなフレームを付与できます。",
      },
    },
    {
      "@type": "Question",
      name: "アファメーションでブロックを感じたらどうすればいいですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ブロック（抵抗感）はむしろクリアリングのチャンスです。認識（メタ認知）→感謝（IFS療法）→解放（消去学習）→書き換え（記憶再固定化）→定着（深呼吸・迷走神経刺激）の5段階プロセスで科学的にクリアリングできます。ブロックを想起した直後の約5時間が書き換えの最適ウィンドウです。",
      },
    },
    {
      "@type": "Question",
      name: "バイノーラルビートとアファメーションを組み合わせるとどうなりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "バイノーラルビートで脳波をアルファ波（10Hz）やシータ波（4-8Hz）に誘導すると、前頭前皮質の批判的フィルターが緩み、アファメーションが直接潜在意識に書き込まれます。通常の覚醒状態（ベータ波）でのアファメーションと比べ、二重符号化理論により記憶定着率が2〜3倍になります。",
      },
    },
    {
      "@type": "Question",
      name: "アファメーションの効果が出るまでどのくらいかかりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "神経可塑性による回路の再構築には最低21日。ロンドン大学の研究によると平均66日で行動が自動化されます。90日間継続すると人格レベルの変化が定着します。声に出して感情を伴わせることで、黙読の約10倍の神経活性化が起こり、効果が加速します。",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
