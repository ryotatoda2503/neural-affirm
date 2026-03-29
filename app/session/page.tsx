"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { morningLayers, nightLayers } from "../data";
import type { TimeOfDay, Affirmation } from "../data";
import Link from "next/link";

// ─── Audio Engine (Loopable) ───

type BrainwavePreset = {
  label: string;
  binauralBeat: number;
  solfeggioFreq: number;
  desc: string;
};

const PRESETS: Record<string, BrainwavePreset> = {
  alpha: {
    label: "アルファ波（10Hz）",
    binauralBeat: 10,
    solfeggioFreq: 528,
    desc: "リラックスした集中。アファメーションの受容性が高い状態",
  },
  theta: {
    label: "シータ波（6Hz）",
    binauralBeat: 6,
    solfeggioFreq: 396,
    desc: "潜在意識アクセス。深いレベルでの書き換えに最適",
  },
  deepTheta: {
    label: "ディープシータ（4Hz）",
    binauralBeat: 4,
    solfeggioFreq: 852,
    desc: "瞑想状態。最も深い潜在意識プログラミング",
  },
  gamma: {
    label: "ガンマ波（40Hz）",
    binauralBeat: 40,
    solfeggioFreq: 741,
    desc: "超集中・洞察。アファメーションの意味を深く理解する",
  },
};

class LoopAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private solfeggioOsc: OscillatorNode | null = null;
  private isoOsc: OscillatorNode | null = null;
  private isoGain: GainNode | null = null;
  private isoInterval: ReturnType<typeof setInterval> | null = null;
  private _isPlaying = false;
  private _volume = 0.15;

  get isPlaying() {
    return this._isPlaying;
  }

  async start(preset: BrainwavePreset, baseFreq: number) {
    if (this._isPlaying) this.stop();

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    const merger = this.ctx.createChannelMerger(2);

    // Left ear
    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = "sine";
    this.leftOsc.frequency.value = baseFreq;
    const leftGain = this.ctx.createGain();
    leftGain.gain.value = this._volume;
    this.leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    // Right ear (base + binaural beat diff)
    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = "sine";
    this.rightOsc.frequency.value = baseFreq + preset.binauralBeat;
    const rightGain = this.ctx.createGain();
    rightGain.gain.value = this._volume;
    this.rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    // Solfeggio
    this.solfeggioOsc = this.ctx.createOscillator();
    this.solfeggioOsc.type = "sine";
    this.solfeggioOsc.frequency.value = preset.solfeggioFreq;
    const solGain = this.ctx.createGain();
    solGain.gain.value = this._volume * 0.3;
    this.solfeggioOsc.connect(solGain);
    solGain.connect(this.masterGain);

    // Isochronic
    if (preset.binauralBeat <= 12) {
      this.isoOsc = this.ctx.createOscillator();
      this.isoOsc.type = "sine";
      this.isoOsc.frequency.value = baseFreq * 1.5;
      this.isoGain = this.ctx.createGain();
      this.isoGain.gain.value = 0;
      this.isoOsc.connect(this.isoGain);
      this.isoGain.connect(this.masterGain);
      this.isoOsc.start();

      const pulseMs = 1000 / preset.binauralBeat;
      let on = false;
      this.isoInterval = setInterval(() => {
        if (this.isoGain) {
          on = !on;
          this.isoGain.gain.value = on ? this._volume * 0.3 : 0;
        }
      }, pulseMs / 2);
    }

    this.leftOsc.start();
    this.rightOsc.start();
    this.solfeggioOsc.start();

    // Fade in
    this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 3);
    this._isPlaying = true;
  }

  stop() {
    this._isPlaying = false;
    if (this.isoInterval) clearInterval(this.isoInterval);
    try {
      this.leftOsc?.stop();
      this.rightOsc?.stop();
      this.solfeggioOsc?.stop();
      this.isoOsc?.stop();
    } catch {}
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        v > 0 ? 1 : 0,
        this.ctx.currentTime + 0.3
      );
    }
  }
}

// ─── Components ───

function AffirmationDisplay({
  affirmation,
  index,
  total,
  mode,
  onPrev,
  onNext,
  autoPlay,
}: {
  affirmation: Affirmation;
  index: number;
  total: number;
  mode: TimeOfDay;
  onPrev: () => void;
  onNext: () => void;
  autoPlay: boolean;
}) {
  const accentColor = mode === "morning" ? "text-gold" : "text-indigo-light";
  const accentBg = mode === "morning" ? "bg-gold/5" : "bg-indigo/5";

  return (
    <div className="text-center animate-fade-in" key={index}>
      {/* Counter */}
      <p className={`text-xs tracking-widest ${accentColor} mb-8`}>
        {index + 1} / {total}
      </p>

      {/* Main affirmation */}
      <div className={`${accentBg} rounded-2xl px-8 py-12 mb-6`}>
        <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-wide">
          「{affirmation.text}」
        </p>
      </div>

      {/* Science */}
      <p className="text-xs text-muted leading-relaxed mb-8 max-w-md mx-auto">
        {affirmation.science}
      </p>

      {/* Instruction */}
      <p className="text-sm text-muted mb-8 italic">
        声に出して読み上げてください
        {autoPlay && " — 自動で次に進みます"}
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={onPrev}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
        >
          ‹
        </button>
        <button
          onClick={onNext}
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            mode === "morning"
              ? "border-gold/30 text-gold hover:bg-gold/10"
              : "border-indigo-light/30 text-indigo-light hover:bg-indigo/10"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function SessionPage() {
  const [mode, setMode] = useState<TimeOfDay>("morning");
  const [presetKey, setPresetKey] = useState("alpha");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoInterval, setAutoInterval] = useState(15);
  const [loop, setLoop] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const engineRef = useRef<LoopAudioEngine | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const hour = new Date().getHours();
    setMode(hour >= 17 || hour < 5 ? "night" : "morning");
    engineRef.current = new LoopAudioEngine();
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const layers = mode === "morning" ? morningLayers : nightLayers;
  const allAffirmations = layers.flatMap((l) =>
    l.affirmations.map((a) => ({ ...a, layerTitle: l.subtitle }))
  );
  const total = allAffirmations.length;
  const current = allAffirmations[currentIndex];

  // Find which layer the current affirmation belongs to
  let layerLabel = "";
  let count = 0;
  for (const l of layers) {
    if (currentIndex < count + l.affirmations.length) {
      layerLabel = `${l.title} — ${l.subtitle}`;
      break;
    }
    count += l.affirmations.length;
  }

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= total) {
        if (loop) return 0;
        // Stop if not looping
        return prev;
      }
      return next;
    });
  }, [total, loop]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return loop ? total - 1 : 0;
      return prev - 1;
    });
  }, [total, loop]);

  // Auto-play timer
  useEffect(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    if (autoPlay && isPlaying) {
      autoTimerRef.current = setInterval(() => {
        goNext();
      }, autoInterval * 1000);
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoPlay, isPlaying, autoInterval, goNext]);

  // Elapsed timer
  useEffect(() => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (isPlaying) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      elapsedRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const handleStart = useCallback(() => {
    const preset = PRESETS[presetKey];
    const baseFreq = mode === "morning" ? 200 : 180;
    engineRef.current?.start(preset, baseFreq);
    setIsPlaying(true);
  }, [presetKey, mode]);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setElapsed(0);
    setCurrentIndex(0);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const preset = PRESETS[presetKey];
  const accentColor = mode === "morning" ? "text-gold" : "text-indigo-light";
  const buttonBg =
    mode === "morning"
      ? "bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
      : "bg-indigo/10 hover:bg-indigo/20 text-indigo-light border-indigo-light/30";
  const activeBg =
    mode === "morning" ? "bg-gold/10 text-gold" : "bg-indigo/10 text-indigo-light";

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 md:py-24 min-h-screen">
      {/* Header */}
      <header className="mb-12 animate-fade-in">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← アファメーション辞書
        </Link>

        <h1 className="text-3xl md:text-4xl font-light tracking-wider mt-6 mb-3">
          Affirmation
          <br />
          <span className="text-muted text-2xl md:text-3xl">Session</span>
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          脳波誘導オーディオを聴きながら
          <br />
          アファメーションを声に出す
        </p>
      </header>

      {/* Controls Bar */}
      <section className="mb-12 space-y-4">
        {/* Mode + Preset Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Morning/Night */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
            <button
              onClick={() => {
                if (!isPlaying) setMode("morning");
              }}
              className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                mode === "morning" ? activeBg : "text-muted"
              } ${isPlaying ? "opacity-50" : ""}`}
            >
              朝
            </button>
            <button
              onClick={() => {
                if (!isPlaying) setMode("night");
              }}
              className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                mode === "night" ? activeBg : "text-muted"
              } ${isPlaying ? "opacity-50" : ""}`}
            >
              夜
            </button>
          </div>

          {/* Loop */}
          <button
            onClick={() => setLoop(!loop)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
              loop ? `${activeBg} border-current/20` : "border-border text-muted"
            }`}
          >
            {loop ? "∞ ループON" : "∞ ループOFF"}
          </button>

          {/* Auto-play */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
              autoPlay
                ? `${activeBg} border-current/20`
                : "border-border text-muted"
            }`}
          >
            {autoPlay ? `▶ 自動（${autoInterval}秒）` : "▶ 自動OFF"}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-1.5 rounded-full text-xs border border-border text-muted hover:text-foreground transition-all cursor-pointer"
          >
            設定
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-in space-y-5">
            {/* Brainwave Preset */}
            <div>
              <label className="text-xs text-muted block mb-2">
                脳波プリセット
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPresetKey(key);
                      if (isPlaying) {
                        engineRef.current?.stop();
                        const baseFreq = mode === "morning" ? 200 : 180;
                        engineRef.current?.start(p, baseFreq);
                      }
                    }}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      presetKey === key
                        ? `${activeBg} border-current/20`
                        : "border-border text-muted hover:border-foreground/20"
                    }`}
                  >
                    <p className="font-medium">{p.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-play interval */}
            <div>
              <label className="text-xs text-muted block mb-2">
                自動送り間隔: {autoInterval}秒
              </label>
              <input
                type="range"
                min={5}
                max={30}
                value={autoInterval}
                onChange={(e) => setAutoInterval(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted/50">
                <span>5秒</span>
                <span>30秒</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Player */}
      <section className="mb-12">
        {!isPlaying ? (
          <div className="text-center animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-5 mb-8 text-left">
              <p className="text-xs text-muted mb-1">選択中のプリセット</p>
              <p className="text-sm font-medium">{preset.label}</p>
              <p className="text-xs text-muted mt-1">{preset.desc}</p>
              <div className="flex gap-4 mt-3 text-[10px] text-muted/60">
                <span>
                  バイノーラル: {preset.binauralBeat}Hz
                </span>
                <span>
                  ソルフェジオ: {preset.solfeggioFreq}Hz
                </span>
                <span>{total}アファメーション</span>
              </div>
            </div>

            <p className="text-sm text-muted mb-6">
              ヘッドフォンを装着してください
            </p>

            <button
              onClick={handleStart}
              className={`px-10 py-4 rounded-full border ${buttonBg} text-lg font-light cursor-pointer transition-all duration-300 hover:scale-105`}
            >
              セッション開始
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {/* Playing indicator */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse-soft ${
                      mode === "morning" ? "bg-gold" : "bg-indigo-light"
                    }`}
                  />
                  <span className="text-xs text-muted">{preset.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted/50">
                  {formatTime(elapsed)}
                </span>
                <button
                  onClick={handleStop}
                  className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  ■ 停止
                </button>
              </div>
            </div>

            {/* Layer indicator */}
            <p className={`text-xs tracking-widest uppercase ${accentColor} mb-6 text-center`}>
              {layerLabel}
            </p>

            {/* Affirmation display */}
            <AffirmationDisplay
              affirmation={current}
              index={currentIndex}
              total={total}
              mode={mode}
              onPrev={goPrev}
              onNext={goNext}
              autoPlay={autoPlay}
            />

            {/* Quick layer jump */}
            <div className="mt-10 flex justify-center gap-2 flex-wrap">
              {layers.map((l, li) => {
                const startIdx = layers
                  .slice(0, li)
                  .reduce((s, x) => s + x.affirmations.length, 0);
                const endIdx = startIdx + l.affirmations.length;
                const isCurrent =
                  currentIndex >= startIdx && currentIndex < endIdx;
                return (
                  <button
                    key={l.id}
                    onClick={() => setCurrentIndex(startIdx)}
                    className={`px-3 py-1 rounded-full text-[10px] border transition-all cursor-pointer ${
                      isCurrent
                        ? `${activeBg} border-current/20`
                        : "border-border text-muted hover:border-foreground/20"
                    }`}
                  >
                    {l.subtitle}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Guide */}
      <section className="border-t border-border pt-10">
        <h3 className="text-xs tracking-widest uppercase text-muted mb-4">
          セッションガイド
        </h3>
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            1. <strong className="text-foreground">ヘッドフォン装着</strong> —
            バイノーラルビートはステレオ必須
          </p>
          <p>
            2. <strong className="text-foreground">セッション開始</strong> —
            脳波誘導オーディオが流れ始めます
          </p>
          <p>
            3.{" "}
            <strong className="text-foreground">
              表示されるアファメーションを声に出す
            </strong>{" "}
            — 音が最適な脳波状態を維持している間に
          </p>
          <p>
            4. <strong className="text-foreground">自動送り or 手動</strong> —
            自分のペースで進めるか、自動で流すか選べます
          </p>
          <p>
            5. <strong className="text-foreground">ループ</strong> —
            全アファメーションを何周でも繰り返せます
          </p>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <h4 className="text-xs tracking-widest uppercase text-muted mb-2">
            おすすめの使い方
          </h4>
          <div className="space-y-2 text-xs text-muted">
            <p>
              <strong className="text-foreground">朝の5分</strong> —
              アルファ波プリセットで全層を1周。一日の脳をセットアップ
            </p>
            <p>
              <strong className="text-foreground">集中したいとき</strong> —
              ガンマ波プリセットで特定の層だけを繰り返す
            </p>
            <p>
              <strong className="text-foreground">夜の入眠前</strong> —
              ディープシータで自動送り。そのまま眠りに落ちる
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted/40 tracking-wider">
          Powered by Neural Entrainment · Built with Intention
        </p>
      </footer>
    </main>
  );
}
