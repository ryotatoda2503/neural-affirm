"use client";

import { useState, useEffect, useCallback } from "react";
import type { BlockPattern, TimeOfDay } from "./data";

const STEPS = [
  { id: "recognize", label: "認識", desc: "ブロックを観察する" },
  { id: "appreciate", label: "感謝", desc: "守ってくれたことに感謝する" },
  { id: "release", label: "解放", desc: "もう必要ないと手放す" },
  { id: "rewrite", label: "書き換え", desc: "新しい信念を定着させる" },
  { id: "anchor", label: "定着", desc: "深呼吸で身体に刻む" },
] as const;

function BreathingCircle() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (cycle >= 3) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            setPhase("hold");
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 6;
          } else {
            setPhase("inhale");
            setCycle((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, cycle]);

  const phaseLabel =
    phase === "inhale" ? "吸う" : phase === "hold" ? "止める" : "吐く";

  const circleSize =
    phase === "inhale"
      ? "w-48 h-48 md:w-56 md:h-56"
      : phase === "hold"
        ? "w-48 h-48 md:w-56 md:h-56"
        : "w-28 h-28 md:w-32 md:h-32";

  if (cycle >= 3) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-40 h-40 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-3xl">✓</span>
        </div>
        <p className="text-lg font-light">クリアリング完了</p>
        <p className="text-sm text-muted">
          ブロックは解放されました。新しい信念が定着しています。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted">
        胸に手を当てて、呼吸に集中してください
      </p>
      <div className="relative flex items-center justify-center h-64">
        <div
          className={`${circleSize} rounded-full border-2 border-current opacity-20 transition-all duration-1000 ease-in-out flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="text-2xl font-light">{count}</p>
            <p className="text-sm text-muted mt-1">{phaseLabel}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">{cycle + 1} / 3 サイクル</p>
    </div>
  );
}

export function ClearingModal({
  layerId,
  affirmationText,
  blocks,
  mode,
  onClose,
}: {
  layerId: string;
  affirmationText: string;
  blocks: BlockPattern[];
  mode: TimeOfDay;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<BlockPattern | null>(null);
  const [customBlock, setCustomBlock] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const bgOverlay =
    mode === "morning" ? "bg-white/95" : "bg-[#0f0f2e]/95";
  const accentColor = mode === "morning" ? "text-gold" : "text-indigo-light";
  const accentBg = mode === "morning" ? "bg-gold/10" : "bg-indigo/10";
  const accentBorder =
    mode === "morning" ? "border-gold/30" : "border-indigo-light/30";
  const buttonBg =
    mode === "morning"
      ? "bg-gold/10 hover:bg-gold/20 text-gold"
      : "bg-indigo/10 hover:bg-indigo/20 text-indigo-light";

  const handleSelectBlock = useCallback((block: BlockPattern) => {
    setSelectedBlock(block);
    setStep(1);
  }, []);

  const handleCustomSubmit = useCallback(() => {
    if (customBlock.trim()) {
      setSelectedBlock({
        block: customBlock.trim(),
        release:
          "その信念はあなたの本質ではない。過去の経験が作ったパターンにすぎない。今、あなたはそれを手放す許可を自分に与える",
      });
      setStep(1);
    }
  }, [customBlock]);

  const nextStep = useCallback(() => setStep((s) => s + 1), []);

  return (
    <div
      className={`fixed inset-0 z-50 ${bgOverlay} backdrop-blur-sm flex items-center justify-center p-6`}
    >
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                  i <= step
                    ? `${accentBg} ${accentColor} border ${accentBorder}`
                    : "bg-border/30 text-muted/50"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 md:w-12 h-px mx-1 transition-all duration-300 ${
                    i < step ? `${accentColor} opacity-30` : "bg-border/30"
                  }`}
                  style={
                    i < step
                      ? {
                          background:
                            mode === "morning" ? "#b8860b" : "#6366f1",
                        }
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Recognize - Select Block */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h3 className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}>
              Step 1 — 認識
            </h3>
            <p className="text-lg font-light mb-2">
              どんなブロックが浮かびましたか？
            </p>
            <p className="text-sm text-muted mb-8">
              「{affirmationText}」と言ったとき、心の中に浮かんだ抵抗や反論を選んでください。
              <br />
              <span className="text-xs opacity-60">
                ブロックを「観察」することで、それは「自分」から「ただの思考パターン」に変わります（メタ認知）
              </span>
            </p>
            <div className="space-y-3">
              {blocks.map((b, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectBlock(b)}
                  className={`w-full text-left px-5 py-4 rounded-lg border ${accentBorder} hover:${accentBg} transition-all duration-200 cursor-pointer`}
                >
                  <p className="text-sm">「{b.block}」</p>
                </button>
              ))}
              {!showCustom ? (
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left px-5 py-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 cursor-pointer"
                >
                  <p className="text-sm text-muted">
                    別のブロックを入力する...
                  </p>
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBlock}
                    onChange={(e) => setCustomBlock(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                    placeholder="感じたブロックを入力..."
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:border-current"
                    autoFocus
                  />
                  <button
                    onClick={handleCustomSubmit}
                    className={`px-4 py-3 rounded-lg ${buttonBg} text-sm cursor-pointer`}
                  >
                    決定
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Appreciate */}
        {step === 1 && selectedBlock && (
          <div className="animate-fade-in text-center">
            <h3 className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}>
              Step 2 — 感謝
            </h3>
            <div className={`${accentBg} rounded-lg px-6 py-5 mb-8`}>
              <p className="text-sm text-muted mb-1">あなたのブロック:</p>
              <p className="text-lg font-light">「{selectedBlock.block}」</p>
            </div>
            <div className="space-y-4 text-left">
              <p className="text-sm leading-relaxed">
                このブロックは、<strong>過去のあなたが自分を守るために作った防衛メカニズム</strong>です。
              </p>
              <p className="text-sm leading-relaxed">
                傷つかないように、失敗しないように、恥をかかないように——
                あなたの脳が、あなたを必死に守ろうとした結果です。
              </p>
              <p className="text-sm leading-relaxed text-muted">
                内部家族システム療法（IFS）：ブロックは「敵」ではなく「守護者」。
                感謝することで扁桃体の恐怖反応が鎮静化します。
              </p>
              <div className={`border ${accentBorder} rounded-lg px-5 py-4 mt-6`}>
                <p className="text-sm text-muted mb-2">心の中で伝えてください:</p>
                <p className="text-lg font-light">
                  「守ってくれてありがとう。もう大丈夫だよ」
                </p>
              </div>
            </div>
            <button
              onClick={nextStep}
              className={`mt-8 px-8 py-3 rounded-full ${buttonBg} text-sm cursor-pointer transition-all duration-200`}
            >
              次へ
            </button>
          </div>
        )}

        {/* Step 2: Release */}
        {step === 2 && selectedBlock && (
          <div className="animate-fade-in text-center">
            <h3 className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}>
              Step 3 — 解放
            </h3>
            <p className="text-sm text-muted mb-6">
              声に出して宣言してください。
              <br />
              <span className="text-xs opacity-60">
                消去学習（Extinction Learning）: 明示的な宣言が恐怖条件づけを解除します
              </span>
            </p>
            <div className={`border-2 ${accentBorder} rounded-lg px-8 py-8 mb-6`}>
              <p className="text-sm text-muted mb-4 line-through opacity-50">
                「{selectedBlock.block}」
              </p>
              <p className="text-xl font-light leading-relaxed">
                「{selectedBlock.release}」
              </p>
            </div>
            <p className="text-xs text-muted mb-8">
              記憶再固定化（Nader et al., 2000）: ブロックを想起した直後の約5時間が書き換えの最適ウィンドウです
            </p>
            <button
              onClick={nextStep}
              className={`px-8 py-3 rounded-full ${buttonBg} text-sm cursor-pointer transition-all duration-200`}
            >
              次へ
            </button>
          </div>
        )}

        {/* Step 3: Rewrite */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <h3 className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}>
              Step 4 — 書き換え
            </h3>
            <p className="text-sm text-muted mb-6">
              元のアファメーションを、今度はブロックが外れた状態で声に出してください。
            </p>
            <div className={`${accentBg} rounded-2xl px-8 py-10 mb-6`}>
              <p className="text-2xl font-light leading-relaxed tracking-wide">
                「{affirmationText}」
              </p>
            </div>
            <p className="text-sm text-muted mb-2">
              さっきより軽く感じませんか？
            </p>
            <p className="text-xs text-muted opacity-60">
              再固定化ウィンドウの中で新しい信念を入れることで、古い記憶が書き換わっています
            </p>
            <button
              onClick={nextStep}
              className={`mt-8 px-8 py-3 rounded-full ${buttonBg} text-sm cursor-pointer transition-all duration-200`}
            >
              深呼吸で定着させる
            </button>
          </div>
        )}

        {/* Step 4: Anchor - Breathing */}
        {step === 4 && (
          <div className="animate-fade-in text-center">
            <h3 className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}>
              Step 5 — 定着
            </h3>
            <BreathingCircle />
            <button
              onClick={onClose}
              className={`mt-8 px-8 py-3 rounded-full ${buttonBg} text-sm cursor-pointer transition-all duration-200`}
            >
              アファメーションに戻る
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors cursor-pointer text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
