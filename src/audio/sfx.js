// Procedural sound effects via the Web Audio API. No audio files to ship — the
// "零成本维护 / pure static" spirit of goal.md. Synthesised on the fly: whooshes,
// the rare-catch sparkle, the missile boom, the loser's sad trombone, crowd
// cheers. Must be unlocked by a user gesture (browsers block autoplay).

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
}

// Shared context/bus for the BGM module.
export function audioCtx() { return ensure(); }
export function audioMaster() { ensure(); return master; }

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.9;
}

export function isMuted() { return muted; }

function now() { return ctx.currentTime; }

function env(node, t, { a = 0.005, d = 0.12, peak = 0.5, sustain = 0 } = {}) {
  const g = node.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + a);
  g.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + d);
}

function tone({ freq = 440, type = 'sine', dur = 0.2, peak = 0.4, a = 0.005, d, slideTo = null, slideTime = null, when = 0, dest = null } = {}) {
  if (!ensure() || muted) return;
  const t = now() + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + (slideTime || dur));
  env(g, t, { a, d: d ?? dur, peak });
  osc.connect(g); g.connect(dest || master);
  osc.start(t); osc.stop(t + dur + 0.05);
}

function noise({ dur = 0.3, peak = 0.4, type = 'highpass', freq = 1000, when = 0, q = 0.7 } = {}) {
  if (!ensure() || muted) return;
  const t = now() + when;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = freq; filt.Q.value = q;
  const g = ctx.createGain(); env(g, t, { a: 0.005, d: dur, peak });
  src.connect(filt); filt.connect(g); g.connect(master);
  src.start(t); src.stop(t + dur + 0.02);
}

function chord(freqs, opts) { freqs.forEach((f, i) => tone({ ...opts, freq: f, when: (opts.when || 0) + i * (opts.strum || 0) })); }

export const sfx = {
  tapUI() { tone({ freq: 520, type: 'triangle', dur: 0.08, peak: 0.25 }); },

  countdown() { tone({ freq: 440, type: 'square', dur: 0.16, peak: 0.3 }); },
  go() { tone({ freq: 660, type: 'square', dur: 0.1, peak: 0.4 }); tone({ freq: 990, type: 'square', dur: 0.3, peak: 0.4, when: 0.08 }); this.cheer(0.5); },

  catchCommon() { tone({ freq: 700, type: 'triangle', dur: 0.12, peak: 0.35, slideTo: 1100 }); },
  catchRare() { chord([880, 1320, 1760], { type: 'triangle', dur: 0.5, peak: 0.3, strum: 0.05 }); tone({ freq: 2200, type: 'sine', dur: 0.5, peak: 0.2, slideTo: 3000, when: 0.1 }); },
  miss() { tone({ freq: 300, type: 'sine', dur: 0.18, peak: 0.18, slideTo: 160 }); },

  dash() { tone({ freq: 400, type: 'sawtooth', dur: 0.35, peak: 0.3, slideTo: 1400 }); noise({ dur: 0.3, peak: 0.18, type: 'bandpass', freq: 1800 }); },
  banana() { tone({ freq: 900, type: 'sine', dur: 0.5, peak: 0.3, slideTo: 180 }); }, // slide-whistle down
  penaltyUp() { tone({ freq: 500, type: 'square', dur: 0.1, peak: 0.3 }); tone({ freq: 760, type: 'square', dur: 0.14, peak: 0.3, when: 0.09 }); },
  penaltyDown() { tone({ freq: 600, type: 'square', dur: 0.1, peak: 0.3 }); tone({ freq: 360, type: 'square', dur: 0.16, peak: 0.3, when: 0.09 }); },
  swap() { tone({ freq: 500, type: 'sine', dur: 0.3, peak: 0.3, slideTo: 1500 }); tone({ freq: 1500, type: 'sine', dur: 0.3, peak: 0.25, slideTo: 500, when: 0.05 }); },
  missile() { noise({ dur: 0.6, peak: 0.6, type: 'lowpass', freq: 500, q: 1.2 }); tone({ freq: 120, type: 'sawtooth', dur: 0.5, peak: 0.5, slideTo: 40 }); },
  ride() { tone({ freq: 200, type: 'sawtooth', dur: 0.5, peak: 0.3, slideTo: 500 }); tone({ freq: 660, type: 'square', dur: 0.2, peak: 0.2, when: 0.3 }); },

  win() { chord([523, 659, 784, 1047], { type: 'triangle', dur: 0.6, peak: 0.4, strum: 0.09 }); this.cheer(1.2); },
  lose() { // sad trombone
    const seq = [311, 294, 277, 233];
    seq.forEach((f, i) => tone({ freq: f, type: 'sawtooth', dur: 0.45, peak: 0.35, when: i * 0.28, slideTo: f * 0.96 }));
  },

  cheer(amount = 0.8) { noise({ dur: 0.9 * amount + 0.3, peak: 0.12 + 0.12 * amount, type: 'bandpass', freq: 1200, q: 0.4 }); },
};
