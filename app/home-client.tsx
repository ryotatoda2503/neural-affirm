"use client";

import { useState, useEffect } from "react";
import { morningLayers, nightLayers, scienceBasis, blockPatterns } from "./data";
import type { Layer, TimeOfDay } from "./data";
import { ClearingModal } from "./clearing";
import Link from "next/link";

function AffirmationCard({
  text,
  science,
  index,
  mode,
  layerId,
  onClear,
}: {
  text: string;
  science: string;
  index: number;
  mode: TimeOfDay;
  layerId: string;
  onClear: (layerId: string, text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const accentColor = mode === "morning" ? "text-gold" : "text-indigo-light";
  const borderColor =
    mode === "morning"
      ? "border-l-gold/40 hover:border-l-gold"
      : "border-l-indigo-light/40 hover:border-l-indigo-light";
  const clearBtnColor =
    mode === "morning"
      ? "text-gold/60 hover:text-gold hover:bg-gold/10"
      : "text-indigo-light/60 hover:text-indigo-light hover:bg-indigo/10";

  return (
    <div
      className="animate-fade-in-delay"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`border-l-2 ${borderColor} pl-6 py-4 transition-all duration-300 group`}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left cursor-pointer"
        >
          <p className="text-lg md:text-xl font-light leading-relaxed tracking-wide">
            <span className={`${accentColor} mr-2 text-sm opacity-50`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            「{text}」
          </p>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open ? "max-h-40 mt-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm text-muted leading-relaxed pl-7">{science}</p>
          </div>
          <p className="text-xs text-muted/50 mt-1 pl-7 group-hover:text-muted/80 transition-colors">
            {open ? "閉じる" : "科学的根拠を見る"}
          </p>
        </button>
        {/* Block Clearing Button */}
        <div className="pl-7 mt-2">
          <button
            onClick={() => onClear(layerId, text)}
            className={`text-xs px-3 py-1.5 rounded-full border border-current/20 ${clearBtnColor} transition-all duration-200 cursor-pointer`}
          >
            ブロックを感じた
          </button>
        </div>
      </div>
    </div>
  );
}

function LayerSection({
  layer,
  mode,
  onClear,
}: {
  layer: Layer;
  mode: TimeOfDay;
  onClear: (layerId: string, text: string) => void;
}) {
  const bgAccent = mode === "morning" ? "bg-gold/5" : "bg-indigo/5";
  const textAccent = mode === "morning" ? "text-gold" : "text-indigo-light";

  return (
    <section className="mb-16">
      <div className={`${bgAccent} rounded-lg px-6 py-4 mb-8`}>
        <div className="flex items-baseline gap-3 mb-1">
          <span
            className={`text-xs font-sans tracking-widest uppercase ${textAccent}`}
          >
            {layer.title}
          </span>
          <h3 className="text-lg font-medium">{layer.subtitle}</h3>
        </div>
        <p className="text-sm text-muted">{layer.purpose}</p>
      </div>
      <div className="space-y-1">
        {layer.affirmations.map((a, i) => (
          <AffirmationCard
            key={i}
            text={a.text}
            science={a.science}
            index={i}
            mode={mode}
            layerId={layer.id}
            onClear={onClear}
          />
        ))}
      </div>
    </section>
  );
}

function ScienceSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-16">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-2"
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
        なぜ「言葉を発する」ことが効くのか？
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          open ? "max-h-[800px] mt-6 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scienceBasis.map((s, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-4"
            >
              <h4 className="text-sm font-medium mb-2">{s.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuideSection({ mode }: { mode: TimeOfDay }) {
  const isMorning = mode === "morning";
  return (
    <div className="border-t border-border pt-12 mt-16">
      <h3 className="text-sm font-sans tracking-widest uppercase text-muted mb-6">
        {isMorning ? "朝のルーティン" : "夜のルーティン"}
      </h3>
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        {isMorning ? (
          <>
            <p>1. 目覚めたら目を閉じたまま深呼吸を3回</p>
            <p>
              2. 第1層から順に、
              <strong className="text-foreground">声に出して</strong>読み上げる
            </p>
            <p>
              3. 各言葉を言う時、その意味を
              <strong className="text-foreground">感じる</strong>
            </p>
            <p>4. 特に響いた言葉は2〜3回繰り返す</p>
            <p>
              5. 抵抗を感じたら
              <strong className="text-foreground">「ブロックを感じた」</strong>
              ボタンでクリアリング
            </p>
            <p>6. 全部言う必要はない。その日の直感で選んでもよい</p>
          </>
        ) : (
          <>
            <p>1. ベッドに入り、目を閉じて深呼吸を3回</p>
            <p>
              2. 第1層から順に、
              <strong className="text-foreground">囁くように</strong>声に出す
            </p>
            <p>3. 身体の力が抜けていくのを感じながら</p>
            <p>
              4. 抵抗を感じたら
              <strong className="text-foreground">「ブロックを感じた」</strong>
              ボタンでクリアリング
            </p>
            <p>5. 最後の「感謝。感謝。感謝」は必ず行う</p>
            <p>6. そのまま眠りに落ちる</p>
          </>
        )}
      </div>
      <div className="mt-8 bg-card border border-border rounded-lg p-5">
        <h4 className="text-xs font-sans tracking-widest uppercase text-muted mb-3">
          重要な原則
        </h4>
        <div className="space-y-2 text-sm text-muted">
          <p>
            <strong className="text-foreground">感情を伴わせる</strong> —
            感情を同時に感じることで、効果が指数関数的に増大する
          </p>
          <p>
            <strong className="text-foreground">ブロックは宝</strong> —
            抵抗を感じたアファメーションこそ、最も成長できるポイント
          </p>
          <p>
            <strong className="text-foreground">継続が鍵</strong> —
            21日で回路再構築、66日で自動化、90日で人格レベルの変化
          </p>
          <p>
            <strong className="text-foreground">声に出す</strong> —
            黙読の約10倍の神経活性化が起こる
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomeClient() {
  const [mode, setMode] = useState<TimeOfDay>("morning");
  const [mounted, setMounted] = useState(false);
  const [clearing, setClearing] = useState<{
    layerId: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setMode(hour >= 17 || hour < 5 ? "night" : "morning");
    setMounted(true);
  }, []);

  const layers = mode === "morning" ? morningLayers : nightLayers;
  const totalCount = layers.reduce(
    (sum, l) => sum + l.affirmations.length,
    0
  );

  const handleClear = (layerId: string, text: string) => {
    setClearing({ layerId, text });
  };

  if (!mounted) return null;

  return (
    <>
      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-20 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-light tracking-wider mb-3">
            Affirmation
            <br />
            <span className="text-muted text-2xl md:text-3xl">Dictionary</span>
          </h1>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            量子論・脳科学・心理学に基づく
            <br />
            科学的アファメーション辞書
          </p>

          {/* Mode Toggle */}
          <div className="mt-10 flex items-center gap-1 bg-card border border-border rounded-full p-1 w-fit">
            <button
              onClick={() => setMode("morning")}
              className={`px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer ${
                mode === "morning"
                  ? "bg-gold/10 text-gold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              朝
            </button>
            <button
              onClick={() => setMode("night")}
              className={`px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer ${
                mode === "night"
                  ? "bg-indigo/10 text-indigo-light"
                  : "text-muted hover:text-foreground"
              }`}
            >
              夜
            </button>
          </div>

          <p className="text-xs text-muted/60 mt-4">
            {mode === "morning" ? "☀" : "☽"} {layers.length}つの層 ·{" "}
            {totalCount}のアファメーション
          </p>
        </header>

        {/* Science basis */}
        <ScienceSection />

        {/* Layers */}
        <div key={mode}>
          {layers.map((layer) => (
            <LayerSection
              key={layer.id}
              layer={layer}
              mode={mode}
              onClear={handleClear}
            />
          ))}
        </div>

        {/* Guide */}
        <GuideSection mode={mode} />

        {/* Session & Install CTAs */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-6 text-center">
            <h3 className="text-lg font-light mb-2">Affirmation Session</h3>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              脳波誘導オーディオを聴きながらアファメーションを声に出す
            </p>
            <Link
              href="/session"
              className={`inline-block px-6 py-3 rounded-full border text-sm transition-all duration-300 hover:scale-105 ${
                mode === "morning"
                  ? "bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
                  : "bg-indigo/10 hover:bg-indigo/20 text-indigo-light border-indigo-light/30"
              }`}
            >
              セッション開始 →
            </Link>
          </div>
          <div className="border border-border rounded-lg p-6 text-center">
            <h3 className="text-lg font-light mb-2">Neural Install</h3>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              聴くだけで自動クリアリングが発動する神経回路をインストール
            </p>
            <Link
              href="/install"
              className={`inline-block px-6 py-3 rounded-full border text-sm transition-all duration-300 hover:scale-105 ${
                mode === "morning"
                  ? "bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
                  : "bg-indigo/10 hover:bg-indigo/20 text-indigo-light border-indigo-light/30"
              }`}
            >
              インストール →
            </Link>
          </div>
        </div>

        {/* Blog CTA */}
        <div className="mt-12 border border-border rounded-lg p-6 text-center">
          <h3 className="text-lg font-light mb-2">Blog</h3>
          <p className="text-sm text-muted mb-4">
            アファメーションの科学的知識・実践ガイド
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 rounded-full border border-border text-sm text-muted hover:text-foreground transition-all duration-300 hover:scale-105"
          >
            ブログを読む →
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted/40 tracking-wider">
            Powered by Science · Built with Intention
          </p>
        </footer>
      </main>

      {/* Block Clearing Modal */}
      {clearing && (
        <ClearingModal
          layerId={clearing.layerId}
          affirmationText={clearing.text}
          blocks={blockPatterns[clearing.layerId] || []}
          mode={mode}
          onClose={() => setClearing(null)}
        />
      )}
    </>
  );
}
