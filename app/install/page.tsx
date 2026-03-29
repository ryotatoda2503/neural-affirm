"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NeuralAudioEngine } from "../audio-engine";
import type { SessionType } from "../audio-engine";
import Link from "next/link";

const PHASE_GUIDE: Record<string, { instruction: string; breathing: string }> = {
  "signature-start": {
    instruction: "シグネチャートーンを聴いてください。この音があなたのクリアリングのアンカーになります。",
    breathing: "目を閉じて、この音を身体全体で受け取ってください",
  },
  "alpha-induction": {
    instruction: "アルファ波が誘導されています。リラックスした受容状態に入ります。",
    breathing: "ゆっくりと深い呼吸を続けてください。吸う…吐く…",
  },
  "theta-transition": {
    instruction: "シータ波に移行中。潜在意識へのアクセスが開きます。",
    breathing: "身体の力を抜いて、意識を内側に向けてください",
  },
  "deep-clearing": {
    instruction: "ディープクリアリング中。古いブロックが自動的に解放されています。",
    breathing: "何も考えなくて大丈夫です。音が自動的にクリアリングしています",
  },
  "signature-end": {
    instruction: "完了のシグネチャートーン。クリアリング状態がアンカリングされています。",
    breathing: "この音を記憶してください。次回からはこの音だけで起動します",
  },
  return: {
    instruction: "通常の意識状態に戻ります。",
    breathing: "ゆっくりと覚醒してください。指先、足先を動かしましょう",
  },
};

const CONDITIONING_INFO = [
  {
    phase: "Phase 1（1〜7日目）",
    title: "連合学習の確立",
    desc: "シグネチャートーンとクリアリング状態の結びつきを脳に刻む段階。フルセッションを毎日聴いてください。",
    science: "古典的条件づけの獲得段階。US（クリアリング体験）とCS（シグネチャートーン）が神経レベルで結合される",
  },
  {
    phase: "Phase 2（8〜21日目）",
    title: "神経回路の強化",
    desc: "条件づけが強化され、音を聴くだけで自動的にリラックス状態に入り始めます。",
    science: "長期増強（LTP）によりシナプス結合が恒久化。手続き記憶として小脳・基底核に移行開始",
  },
  {
    phase: "Phase 3（22〜66日目）",
    title: "自動化",
    desc: "シグネチャートーンを聴くだけで、意識的な努力なしにクリアリング状態が発動します。",
    science: "ロンドン大学の研究：平均66日で新しい行動が自動化。条件反応が無意識レベルで確立",
  },
  {
    phase: "Phase 4（67〜90日目）",
    title: "人格レベルの統合",
    desc: "クリアリングが人格の一部に。ブロックが浮上した瞬間に、無意識に解放プロセスが走る状態。",
    science: "ジョー・ディスペンザ博士の研究：90日間の瞑想実践で遺伝子発現パターンが変化。エピジェネティックな変容",
  },
];

function BreathingVisual({
  phase,
  elapsed,
  duration,
}: {
  phase: string;
  elapsed: number;
  duration: number;
}) {
  // Breathing circle that pulses with the binaural beat frequency
  const breathCycle = phase === "deep-clearing" ? 8 : phase === "theta-transition" ? 6 : 4;
  const progress = (elapsed % breathCycle) / breathCycle;
  const isInhale = progress < 0.4;
  const isHold = progress >= 0.4 && progress < 0.55;
  const scale = isInhale
    ? 0.6 + progress * 1.0
    : isHold
      ? 1.0
      : 1.0 - (progress - 0.55) * 1.2;

  const phaseProgress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  const phaseLabel = isInhale ? "吸う" : isHold ? "止める" : "吐く";

  return (
    <div className="flex flex-col items-center">
      {/* Main breathing circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer ring - phase progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.1}
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity={0.3}
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - phaseProgress)}`}
            className="transition-all duration-100"
          />
        </svg>

        {/* Breathing circle */}
        <div
          className="rounded-full border border-current/20 flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{
            width: `${Math.max(scale * 160, 80)}px`,
            height: `${Math.max(scale * 160, 80)}px`,
            background:
              phase === "signature-start" || phase === "signature-end"
                ? "radial-gradient(circle, rgba(210, 168, 67, 0.15), transparent)"
                : "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent)",
          }}
        >
          <span className="text-sm text-muted/60">{phaseLabel}</span>
        </div>
      </div>
    </div>
  );
}

function WaveformVisual({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 1;

      const time = Date.now() / 1000;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const freq = 0.02 + wave * 0.01;
          const amp = 8 - wave * 2;
          const y =
            height / 2 +
            Math.sin(x * freq + time * (1 + wave * 0.5)) * amp +
            Math.sin(x * freq * 2.3 + time * 0.7) * (amp * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={40}
      className="w-full max-w-md h-10 opacity-60"
    />
  );
}

export default function InstallPage() {
  const [mode, setMode] = useState<SessionType>("morning");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [phaseLabel, setPhaseLabel] = useState("");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [totalPhases, setTotalPhases] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const engineRef = useRef<NeuralAudioEngine | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setMode(hour >= 17 || hour < 5 ? "night" : "morning");
  }, []);

  const handleStart = useCallback(() => {
    const engine = new NeuralAudioEngine();
    engineRef.current = engine;

    engine.init(mode, {
      onPhaseChange: (phase, index, total) => {
        setCurrentPhase(phase.name);
        setPhaseLabel(phase.label);
        setPhaseIndex(index);
        setTotalPhases(total);
        setPhaseDuration(phase.duration);
        setElapsed(0);
      },
      onComplete: () => {
        setIsPlaying(false);
        setCompleted(true);
      },
      onTick: (el, dur) => {
        setElapsed(el);
        setPhaseDuration(dur);
      },
    });

    engine.start();
    setIsPlaying(true);
    setCompleted(false);
  }, [mode]);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const guide = PHASE_GUIDE[currentPhase] || PHASE_GUIDE["alpha-induction"];
  const accentColor = mode === "morning" ? "text-gold" : "text-indigo-light";
  const accentBg = mode === "morning" ? "bg-gold/10" : "bg-indigo/10";
  const buttonBg =
    mode === "morning"
      ? "bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
      : "bg-indigo/10 hover:bg-indigo/20 text-indigo-light border-indigo-light/30";

  const totalDuration = engineRef.current?.getTotalDuration() ?? (mode === "morning" ? 308 : 488);
  const totalMin = Math.floor(totalDuration / 60);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 md:py-24 min-h-screen">
      {/* Header */}
      <header className="mb-16 animate-fade-in">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← アファメーション辞書
        </Link>

        <h1 className="text-3xl md:text-4xl font-light tracking-wider mt-6 mb-3">
          Neural
          <br />
          <span className="text-muted text-2xl md:text-3xl">Install</span>
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          特定の音を聴くだけで自動クリアリングが発動する
          <br />
          神経回路を脳にインストールする
        </p>

        {/* Mode Toggle */}
        <div className="mt-8 flex items-center gap-1 bg-card border border-border rounded-full p-1 w-fit">
          <button
            onClick={() => !isPlaying && setMode("morning")}
            className={`px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer ${
              mode === "morning"
                ? "bg-gold/10 text-gold"
                : "text-muted hover:text-foreground"
            } ${isPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            朝（{Math.floor(308 / 60)}分）
          </button>
          <button
            onClick={() => !isPlaying && setMode("night")}
            className={`px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer ${
              mode === "night"
                ? "bg-indigo/10 text-indigo-light"
                : "text-muted hover:text-foreground"
            } ${isPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            夜（{Math.floor(488 / 60)}分）
          </button>
        </div>
      </header>

      {/* Player */}
      <section className="mb-16">
        {!isPlaying && !completed && (
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted mb-8">
              ヘッドフォンを装着してください
              <br />
              <span className="text-xs opacity-60">
                バイノーラルビートはステレオヘッドフォンが必須です
              </span>
            </p>

            <button
              onClick={handleStart}
              className={`px-10 py-4 rounded-full border ${buttonBg} text-lg font-light cursor-pointer transition-all duration-300 hover:scale-105`}
            >
              インストール開始
            </button>

            <div className="mt-6 text-xs text-muted/50">
              所要時間: 約{totalMin}分 · 静かな環境で行ってください
            </div>
          </div>
        )}

        {isPlaying && (
          <div className="text-center animate-fade-in">
            {/* Phase progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {Array.from({ length: totalPhases }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < phaseIndex
                      ? `${accentColor} opacity-100`
                      : i === phaseIndex
                        ? `${accentColor} opacity-100 scale-150`
                        : "bg-border"
                  }`}
                  style={
                    i <= phaseIndex
                      ? {
                          background:
                            mode === "morning" ? "#b8860b" : "#6366f1",
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Current phase label */}
            <p
              className={`text-xs tracking-widest uppercase ${accentColor} mb-2`}
            >
              {phaseLabel}
            </p>

            {/* Breathing visual */}
            <div className="my-8">
              <BreathingVisual
                phase={currentPhase}
                elapsed={elapsed}
                duration={phaseDuration}
              />
            </div>

            {/* Waveform */}
            <div className="flex justify-center mb-8">
              <WaveformVisual isPlaying={isPlaying} />
            </div>

            {/* Guide text */}
            <div className="max-w-sm mx-auto mb-8">
              <p className="text-sm leading-relaxed mb-2">
                {guide.instruction}
              </p>
              <p className="text-sm text-muted italic">{guide.breathing}</p>
            </div>

            {/* Phase timer */}
            <p className="text-xs text-muted/50 mb-6">
              {Math.floor(elapsed)}s / {phaseDuration}s
            </p>

            <button
              onClick={handleStop}
              className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              停止
            </button>
          </div>
        )}

        {completed && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-light mb-2">
              インストール完了
            </h3>
            <p className="text-sm text-muted mb-8">
              今日のセッションが完了しました。
              <br />
              シグネチャートーンとクリアリング状態の結合が強化されています。
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCompleted(false);
                }}
                className={`px-6 py-3 rounded-full border ${buttonBg} text-sm cursor-pointer`}
              >
                もう一度
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-full border border-border text-sm text-muted hover:text-foreground transition-colors"
              >
                辞書に戻る
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Conditioning Info */}
      <section className="border-t border-border pt-12">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 mb-6"
        >
          <span
            className="inline-block transition-transform duration-200"
            style={{
              transform: showInfo ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▸
          </span>
          なぜ聴くだけでブロックが解除されるのか？
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ${
            showInfo ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Mechanism */}
          <div className="mb-10">
            <h3 className="text-sm font-medium mb-4">メカニズム</h3>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-1">
                  1. 神経振動同調（Neural Entrainment）
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  バイノーラルビートにより脳波がシータ波（4-8Hz）に同調。
                  潜在意識にアクセス可能な状態を音だけで作り出す。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-1">
                  2. 古典的条件づけ（パブロフ）
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  シグネチャートーン（固有の和音）とクリアリング状態を繰り返しペアリング。
                  やがて音だけで脳が自動的にクリアリングモードに入る。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-1">
                  3. 状態依存記憶
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  シータ波状態で行ったクリアリングの記憶は、
                  同じシータ波状態で自動的に想起される（Godden & Baddeley, 1975）。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-1">
                  4. ソルフェジオ周波数
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  396Hz（恐怖の解放）、528Hz（変容・DNAリペア）、
                  852Hz（霊的秩序）をレイヤーして多重にクリアリングを促進。
                </p>
              </div>
            </div>
          </div>

          {/* Conditioning phases */}
          <div>
            <h3 className="text-sm font-medium mb-4">
              インストールのロードマップ
            </h3>
            <div className="space-y-4">
              {CONDITIONING_INFO.map((info, i) => (
                <div
                  key={i}
                  className={`border-l-2 pl-5 py-3 ${
                    i === 0 ? `${accentColor} border-current` : "border-border"
                  }`}
                  style={
                    i === 0
                      ? {
                          borderColor:
                            mode === "morning" ? "#b8860b" : "#6366f1",
                        }
                      : undefined
                  }
                >
                  <p
                    className={`text-xs tracking-widest uppercase ${
                      i === 0 ? accentColor : "text-muted"
                    } mb-1`}
                  >
                    {info.phase}
                  </p>
                  <h4 className="text-sm font-medium mb-1">{info.title}</h4>
                  <p className="text-sm text-muted leading-relaxed mb-1">
                    {info.desc}
                  </p>
                  <p className="text-xs text-muted/60">{info.science}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audio specs */}
          <div className="mt-10 bg-card border border-border rounded-lg p-5">
            <h3 className="text-xs tracking-widest uppercase text-muted mb-3">
              オーディオスペック
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted">
              <div>
                <p className="font-medium text-foreground mb-1">
                  バイノーラルビート
                </p>
                <p>ベース: {mode === "morning" ? "200" : "180"}Hz</p>
                <p>
                  差分: {mode === "morning" ? "10→6→4.5" : "8→4→3"}Hz
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  ソルフェジオ
                </p>
                <p>
                  {mode === "morning"
                    ? "741→396→528→417 Hz"
                    : "528→852→528 Hz"}
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  アイソクロニック
                </p>
                <p>
                  {mode === "morning"
                    ? "10→6→4.5 Hz"
                    : "8→4→3 Hz"}
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  シグネチャートーン
                </p>
                <p>C-E-G# 増三和音 + 528Hz</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted/40 tracking-wider">
          Powered by Neuroscience · Quantum Field Theory · Classical
          Conditioning
        </p>
      </footer>
    </main>
  );
}
