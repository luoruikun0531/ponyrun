// All race-feel tuning lives here. The three-layer win model (goal.md §6) is
// driven by these knobs; the Monte-Carlo test (race.test.js) verifies the
// 40 / 30 / 30 variance split so you can retune without guessing.

export const TRACK_LEN = 1.0;          // finish line position
export const NOMINAL_TIME = 20;        // seconds, target mean finish time
export const V_MEAN = TRACK_LEN / NOMINAL_TIME;

// ── Layer ① Base speed — 40%, pure luck, fixed at the start ──────────────
export const BASE_SPREAD = 0.118;       // per-pony base-speed std, as fraction of V_MEAN
export const BASE_MIN = 0.55;          // clamp base to [min,max] × V_MEAN so nobody is hopeless
export const BASE_MAX = 1.5;

// ── Layer ② Slowdown events — 30%, non-item, rubber-band catch-up ────────
export const SLOW = {
  baseProbPerSec: 0.80,   // baseline stumble starts per second per pony
  rubber: 0.55,           // leader's prob ×(1+rubber), trailer's ×(1−rubber)
  durMin: 0.45,
  durMax: 1.05,
  intensity: 0.92,        // fraction of base speed removed while stumbling (≈ pause)
};

// ── Layer ③ Items — 30%, user driven. Magnitudes live in items.js ────────
// (kept there so adding an item is one self-contained entry)

// Cosmetic / gameplay knobs the render layer also reads.
export const FINISH_SUSPENSE_X = 0.9;  // beyond this, slow-mo + zoom kicks in

// The four reference ponies (each its own character + scarf/bow). `accent` is
// only used for UI chips/labels — the sprites carry their own colours.
export const PONIES = [
  { key: 'white',  accent: 0xe9e0cf, nameKey: 'colors.white' },
  { key: 'brown',  accent: 0xc89a6a, nameKey: 'colors.brown' },
  { key: 'gray',   accent: 0x9aa6ad, nameKey: 'colors.gray' },
  { key: 'yellow', accent: 0xf0d986, nameKey: 'colors.yellow' },
];

export const MIN_PONIES = 2;
export const MAX_PONIES = 4;
