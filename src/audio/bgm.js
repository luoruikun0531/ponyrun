// A short, looping, upbeat chiptune — the "洗脑赛跑 BGM". Synthesised, no files.
// A lookahead scheduler queues a bouncy bass + lead pattern; tempo nudges up
// near the finish for tension. Shares the SFX AudioContext.

import { audioCtx, audioMaster, isMuted } from './sfx.js';

const BPM = 150;
const STEP = 60 / BPM / 2; // eighth notes
const N = (n) => 440 * 2 ** ((n - 69) / 12);

// scale notes (MIDI) for a cheerful loop in C major-ish
const BASS = [48, 48, 55, 48, 53, 53, 50, 55];
const LEAD = [72, 76, 79, 76, 77, 81, 79, 76, 72, 74, 76, 74, 71, 74, 79, 83];

let timer = null;
let step = 0;
let nextTime = 0;
let bus = null;
let tempoScale = 1;

function voice(ctx, freq, t, dur, type, peak) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(bus);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function scheduleStep(ctx, t) {
  const sd = STEP / tempoScale;
  if (step % 2 === 0) voice(ctx, N(BASS[(step / 2) % BASS.length]), t, sd * 1.6, 'triangle', 0.22);
  voice(ctx, N(LEAD[step % LEAD.length]), t, sd * 0.9, 'square', 0.10);
  if (step % 4 === 0) voice(ctx, 90, t, 0.06, 'sine', 0.25); // kick-ish
}

function loop() {
  const ctx = audioCtx();
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.12) {
    scheduleStep(ctx, nextTime);
    nextTime += STEP / tempoScale;
    step = (step + 1) % LEAD.length;
  }
}

export function startBgm() {
  const ctx = audioCtx();
  if (!ctx || timer) return;
  bus = ctx.createGain();
  bus.gain.value = isMuted() ? 0 : 0.34;
  bus.connect(audioMaster());
  step = 0; tempoScale = 1;
  nextTime = ctx.currentTime + 0.05;
  timer = setInterval(loop, 40);
}

export function setBgmTempo(scale) { tempoScale = scale; }

export function setBgmVolume(v) { if (bus) bus.gain.value = v; }

export function stopBgm() {
  if (timer) { clearInterval(timer); timer = null; }
  if (bus) {
    const ctx = audioCtx();
    try { bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1); } catch { /* ignore */ }
    const b = bus; setTimeout(() => { try { b.disconnect(); } catch { /* ignore */ } }, 400);
    bus = null;
  }
}
