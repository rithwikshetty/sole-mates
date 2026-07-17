// All audio is synthesized with the Web Audio API — no asset files.
// A tiny "toy marimba" voice for effects, plus a gentle generative
// background loop (I–vi–IV–V plucks) that starts on the first user gesture.

const MUTE_KEY = 'sole-mates-muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicTimer: number | undefined;
let musicBar = 0;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  /* storage unavailable — stay unmuted */
}

function ensureCtx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) {
    ctx = new AudioContext();
    // Everything routes through a master gain so muting also silences
    // oscillators that were already scheduled.
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function applyMasterGain(): void {
  if (ctx && master) master.gain.setValueAtTime(muted ? 0 : 1, ctx.currentTime);
}

interface ToneOpts {
  freq: number;
  time?: number; // seconds from now
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
}

function tone({ freq, time = 0, dur = 0.15, type = 'triangle', gain = 0.12, glideTo }: ToneOpts): void {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const t0 = ac.currentTime + time;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(master ?? ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click(): void {
    tone({ freq: 650, glideTo: 900, dur: 0.07, gain: 0.08 });
  },
  select(): void {
    tone({ freq: 380, glideTo: 520, dur: 0.1, gain: 0.1 });
    tone({ freq: 760, time: 0.06, dur: 0.08, gain: 0.07 });
  },
  lockIn(): void {
    tone({ freq: 523, dur: 0.09, gain: 0.1 });
    tone({ freq: 784, time: 0.08, dur: 0.14, gain: 0.1 });
  },
  partnerReady(): void {
    tone({ freq: 659, dur: 0.09, gain: 0.07 });
    tone({ freq: 880, time: 0.09, dur: 0.12, gain: 0.07 });
  },
  tick(): void {
    tone({ freq: 880, dur: 0.07, type: 'sine', gain: 0.1 });
  },
  match(): void {
    // happy little fanfare: C E G C + sparkle
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, time: i * 0.09, dur: 0.22, gain: 0.13 }));
    [1319, 1568].forEach((f, i) => tone({ freq: f, time: 0.4 + i * 0.08, dur: 0.18, type: 'sine', gain: 0.08 }));
  },
  mismatch(): void {
    // a playful "wah-waah"
    tone({ freq: 330, glideTo: 262, dur: 0.28, type: 'sawtooth', gain: 0.05 });
    tone({ freq: 262, glideTo: 196, time: 0.3, dur: 0.45, type: 'sawtooth', gain: 0.05 });
  },
  join(): void {
    tone({ freq: 659, dur: 0.1, gain: 0.1 });
    tone({ freq: 988, time: 0.1, dur: 0.16, gain: 0.1 });
  },
};

// --- background music -------------------------------------------------------

// One bar per chord, eight plucked eighth notes chosen from the chord.
const CHORDS: number[][] = [
  [261.6, 329.6, 392.0, 523.3], // C
  [220.0, 261.6, 329.6, 440.0], // Am
  [174.6, 220.0, 261.6, 349.2], // F
  [196.0, 246.9, 293.7, 392.0], // G
];
const BEAT = 0.32; // seconds per eighth note (~94 bpm)

function playBar(): void {
  if (muted) return;
  const chord = CHORDS[musicBar % CHORDS.length];
  // soft bass root
  tone({ freq: chord[0] / 2, dur: BEAT * 7, type: 'sine', gain: 0.035 });
  for (let i = 0; i < 8; i++) {
    // deterministic-ish sparkle: skip some off-beats, walk the chord
    if (i % 2 === 1 && (musicBar + i) % 3 === 0) continue;
    const note = chord[(i * 2 + musicBar) % chord.length];
    const octave = i % 4 === 2 ? 2 : 1;
    tone({ freq: note * octave, time: i * BEAT, dur: 0.25, gain: 0.028 });
  }
  musicBar += 1;
}

export function startMusic(): void {
  if (musicTimer !== undefined || muted) return;
  if (!ensureCtx()) return;
  playBar();
  musicTimer = window.setInterval(playBar, BEAT * 8 * 1000);
}

export function stopMusic(): void {
  window.clearInterval(musicTimer);
  musicTimer = undefined;
}

export function isMuted(): boolean {
  return muted;
}

/** Re-read the persisted mute flag (used when another tab toggles it). */
export function syncMutedFromStorage(): boolean {
  let stored = muted;
  try {
    stored = localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    /* fine */
  }
  if (stored !== muted) {
    muted = stored;
    applyMasterGain();
    if (muted) stopMusic();
    else startMusic();
  }
  return muted;
}

/** Returns the new muted state. */
export function toggleMuted(): boolean {
  muted = !muted;
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* fine */
  }
  applyMasterGain();
  if (muted) stopMusic();
  else startMusic();
  return muted;
}
