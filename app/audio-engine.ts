// Neural Install Audio Engine
// Web Audio API を使用してバイノーラルビート、アイソクロニックトーン、
// ソルフェジオ周波数、シグネチャートーンをリアルタイム生成する

export type AudioPhase =
  | "signature-start"
  | "alpha-induction"
  | "theta-transition"
  | "deep-clearing"
  | "signature-end"
  | "return";

export type SessionType = "morning" | "night";

type PhaseConfig = {
  name: AudioPhase;
  label: string;
  duration: number; // seconds
  binauralBase: number;
  binauralBeat: number;
  solfeggioFreq: number;
  isochronicRate: number;
  volume: number;
};

const MORNING_PHASES: PhaseConfig[] = [
  {
    name: "signature-start",
    label: "シグネチャートーン",
    duration: 4,
    binauralBase: 200,
    binauralBeat: 10,
    solfeggioFreq: 528,
    isochronicRate: 0,
    volume: 0.3,
  },
  {
    name: "alpha-induction",
    label: "アルファ波誘導",
    duration: 60,
    binauralBase: 200,
    binauralBeat: 10,
    solfeggioFreq: 741,
    isochronicRate: 10,
    volume: 0.15,
  },
  {
    name: "theta-transition",
    label: "シータ波移行",
    duration: 90,
    binauralBase: 200,
    binauralBeat: 6,
    solfeggioFreq: 396,
    isochronicRate: 6,
    volume: 0.15,
  },
  {
    name: "deep-clearing",
    label: "ディープクリアリング",
    duration: 120,
    binauralBase: 200,
    binauralBeat: 4.5,
    solfeggioFreq: 528,
    isochronicRate: 4.5,
    volume: 0.15,
  },
  {
    name: "signature-end",
    label: "シグネチャートーン",
    duration: 4,
    binauralBase: 200,
    binauralBeat: 10,
    solfeggioFreq: 528,
    isochronicRate: 0,
    volume: 0.3,
  },
  {
    name: "return",
    label: "アルファ波復帰",
    duration: 30,
    binauralBase: 200,
    binauralBeat: 10,
    solfeggioFreq: 417,
    isochronicRate: 10,
    volume: 0.12,
  },
];

const NIGHT_PHASES: PhaseConfig[] = [
  {
    name: "signature-start",
    label: "シグネチャートーン",
    duration: 4,
    binauralBase: 180,
    binauralBeat: 10,
    solfeggioFreq: 528,
    isochronicRate: 0,
    volume: 0.25,
  },
  {
    name: "alpha-induction",
    label: "アルファ波誘導",
    duration: 60,
    binauralBase: 180,
    binauralBeat: 8,
    solfeggioFreq: 528,
    isochronicRate: 8,
    volume: 0.12,
  },
  {
    name: "theta-transition",
    label: "シータ波移行",
    duration: 120,
    binauralBase: 180,
    binauralBeat: 4,
    solfeggioFreq: 852,
    isochronicRate: 4,
    volume: 0.1,
  },
  {
    name: "deep-clearing",
    label: "ディープクリアリング",
    duration: 180,
    binauralBase: 180,
    binauralBeat: 3,
    solfeggioFreq: 528,
    isochronicRate: 3,
    volume: 0.08,
  },
  {
    name: "signature-end",
    label: "シグネチャートーン",
    duration: 4,
    binauralBase: 180,
    binauralBeat: 4,
    solfeggioFreq: 528,
    isochronicRate: 0,
    volume: 0.15,
  },
  {
    name: "return",
    label: "デルタ波維持",
    duration: 120,
    binauralBase: 180,
    binauralBeat: 2,
    solfeggioFreq: 528,
    isochronicRate: 2,
    volume: 0.06,
  },
];

export class NeuralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private solfeggioOsc: OscillatorNode | null = null;
  private isoGain: GainNode | null = null;
  private isoInterval: ReturnType<typeof setInterval> | null = null;
  private phaseTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentPhaseIndex = 0;
  private phases: PhaseConfig[] = [];
  private _isPlaying = false;
  private onPhaseChange: ((phase: PhaseConfig, index: number, total: number) => void) | null = null;
  private onComplete: (() => void) | null = null;
  private onTick: ((elapsed: number, phaseDuration: number) => void) | null = null;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private phaseStartTime = 0;

  get isPlaying() {
    return this._isPlaying;
  }

  init(
    sessionType: SessionType,
    callbacks: {
      onPhaseChange: (phase: PhaseConfig, index: number, total: number) => void;
      onComplete: () => void;
      onTick: (elapsed: number, phaseDuration: number) => void;
    }
  ) {
    this.phases = sessionType === "morning" ? MORNING_PHASES : NIGHT_PHASES;
    this.onPhaseChange = callbacks.onPhaseChange;
    this.onComplete = callbacks.onComplete;
    this.onTick = callbacks.onTick;
  }

  async start() {
    if (this._isPlaying) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    this._isPlaying = true;
    this.currentPhaseIndex = 0;
    this.playPhase(0);
  }

  stop() {
    this._isPlaying = false;
    this.cleanup();
  }

  private cleanup() {
    if (this.phaseTimeout) clearTimeout(this.phaseTimeout);
    if (this.isoInterval) clearInterval(this.isoInterval);
    if (this.tickInterval) clearInterval(this.tickInterval);

    try {
      this.leftOsc?.stop();
      this.rightOsc?.stop();
      this.solfeggioOsc?.stop();
    } catch {}

    this.leftOsc = null;
    this.rightOsc = null;
    this.solfeggioOsc = null;

    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
  }

  private playPhase(index: number) {
    if (!this.ctx || !this.masterGain || !this._isPlaying) return;

    if (index >= this.phases.length) {
      this._isPlaying = false;
      this.cleanup();
      this.onComplete?.();
      return;
    }

    // Stop previous oscillators
    try {
      this.leftOsc?.stop();
      this.rightOsc?.stop();
      this.solfeggioOsc?.stop();
    } catch {}
    if (this.isoInterval) clearInterval(this.isoInterval);
    if (this.tickInterval) clearInterval(this.tickInterval);

    const phase = this.phases[index];
    this.currentPhaseIndex = index;
    this.onPhaseChange?.(phase, index, this.phases.length);

    // Signature tone uses a special chord
    const isSignature = phase.name === "signature-start" || phase.name === "signature-end";

    // Create binaural beat (left/right stereo panning)
    const merger = this.ctx.createChannelMerger(2);

    // Left channel
    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = "sine";
    this.leftOsc.frequency.value = isSignature
      ? 264 // C4
      : phase.binauralBase;
    const leftGain = this.ctx.createGain();
    leftGain.gain.value = phase.volume;
    this.leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    // Right channel
    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = "sine";
    this.rightOsc.frequency.value = isSignature
      ? 264 + 528 / 264 // Slightly detuned for shimmer
      : phase.binauralBase + phase.binauralBeat;
    const rightGain = this.ctx.createGain();
    rightGain.gain.value = phase.volume;
    this.rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    // Solfeggio frequency layer (centered, quieter)
    this.solfeggioOsc = this.ctx.createOscillator();
    this.solfeggioOsc.type = "sine";
    this.solfeggioOsc.frequency.value = phase.solfeggioFreq;
    const solGain = this.ctx.createGain();
    solGain.gain.value = isSignature ? phase.volume * 0.8 : phase.volume * 0.3;
    this.solfeggioOsc.connect(solGain);
    solGain.connect(this.masterGain);

    // For signature tone, add augmented triad (C-E-G#)
    if (isSignature && this.ctx) {
      const e4 = this.ctx.createOscillator();
      e4.type = "sine";
      e4.frequency.value = 330; // E4
      const e4Gain = this.ctx.createGain();
      e4Gain.gain.value = phase.volume * 0.6;
      e4.connect(e4Gain);
      e4Gain.connect(this.masterGain);
      e4.start();
      e4.stop(this.ctx.currentTime + phase.duration);

      const gs4 = this.ctx.createOscillator();
      gs4.type = "sine";
      gs4.frequency.value = 415.3; // G#4
      const gs4Gain = this.ctx.createGain();
      gs4Gain.gain.value = phase.volume * 0.5;
      gs4.connect(gs4Gain);
      gs4Gain.connect(this.masterGain);
      gs4.start();
      gs4.stop(this.ctx.currentTime + phase.duration);
    }

    // Start oscillators
    this.leftOsc.start();
    this.rightOsc.start();
    this.solfeggioOsc.start();

    // Fade in
    this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2);

    // Isochronic tone (amplitude modulation pulse)
    if (phase.isochronicRate > 0 && this.ctx) {
      const isoOsc = this.ctx.createOscillator();
      isoOsc.type = "sine";
      isoOsc.frequency.value = phase.binauralBase * 1.5;
      this.isoGain = this.ctx.createGain();
      this.isoGain.gain.value = 0;
      isoOsc.connect(this.isoGain);
      this.isoGain.connect(this.masterGain);
      isoOsc.start();

      const pulseMs = 1000 / phase.isochronicRate;
      let isoOn = false;
      this.isoInterval = setInterval(() => {
        if (this.isoGain) {
          isoOn = !isoOn;
          this.isoGain.gain.value = isoOn ? phase.volume * 0.4 : 0;
        }
      }, pulseMs / 2);

      // Stop iso osc when phase ends
      isoOsc.stop(this.ctx.currentTime + phase.duration);
    }

    // Schedule stop and next phase
    const stopTime = this.ctx.currentTime + phase.duration;
    this.leftOsc.stop(stopTime);
    this.rightOsc.stop(stopTime);
    this.solfeggioOsc.stop(stopTime);

    // Tick timer for progress
    this.phaseStartTime = Date.now();
    this.tickInterval = setInterval(() => {
      const elapsed = (Date.now() - this.phaseStartTime) / 1000;
      this.onTick?.(elapsed, phase.duration);
    }, 100);

    // Fade out near end
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1, stopTime - 2);
      this.masterGain.gain.linearRampToValueAtTime(0.01, stopTime - 0.1);
    }

    this.phaseTimeout = setTimeout(() => {
      this.playPhase(index + 1);
    }, phase.duration * 1000);
  }

  getTotalDuration(): number {
    return this.phases.reduce((sum, p) => sum + p.duration, 0);
  }

  getPhases(): PhaseConfig[] {
    return this.phases;
  }
}
