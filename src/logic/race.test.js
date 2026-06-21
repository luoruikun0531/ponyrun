import { describe, it, expect } from 'vitest';
import { Race } from './race.js';
import { makeRng, randomSeed } from './rng.js';
import { rollItemType, ITEM_KEYS } from './items.js';
import { TRACK_LEN } from './constants.js';

function mkPonies(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i, colorKey: `c${i}`, name: `P${i}` }));
}

// Run one headless race with a synthetic "typical play" item process.
function simulate(seed, { n = 5, itemRate = 0.5, dt = 1 / 60, maxT = 60 } = {}) {
  const rng = makeRng(seed);
  const race = new Race({ rng, ponies: mkPonies(n) });
  while (!race.finished && race.t < maxT) {
    if (rng.chance(itemRate * dt)) {
      const rareBias = Math.min(1, race.leader().x); // more rares late
      race.applyItem(rollItemType(rng, rareBias), { laneIndex: rng.int(0, n - 1) });
    }
    race.step(dt);
  }
  return race;
}

function variance(xs) {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
}

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = makeRng(42), b = makeRng(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });
});

describe('Race basics', () => {
  it('finishes with a winner and a distinct loser', () => {
    const race = simulate(123, { n: 5 });
    expect(race.finished).toBe(true);
    expect(race.winner).toBeTruthy();
    expect(race.results.order).toHaveLength(5);
    expect(race.results.winner).toBe(race.results.order[0]);
    expect(race.results.loser).toBe(race.results.order[4]);
    // winner is at the finish, loser is behind
    expect(race.results.winner.x).toBeCloseTo(TRACK_LEN, 5);
    expect(race.results.loser.x).toBeLessThanOrEqual(race.results.winner.x);
  });

  it('is reproducible from the same seed', () => {
    const a = simulate(777), b = simulate(777);
    expect(a.results.winner.id).toBe(b.results.winner.id);
    expect(a.ponies.map((p) => p.x)).toEqual(b.ponies.map((p) => p.x));
  });

  it('produces different outcomes across seeds (fair randomness)', () => {
    const winners = new Set();
    for (let s = 0; s < 40; s++) winners.add(simulate(s * 31 + 1).results.winner.id);
    expect(winners.size).toBeGreaterThan(1);
  });
});

describe('item effects', () => {
  it('dash pushes a pony ahead of where base speed alone would', () => {
    const race = new Race({ seed: 5, ponies: mkPonies(3) });
    for (let i = 0; i < 60; i++) race.step(1 / 60);
    const before = race.ponies[0].x;
    race.applyItem('dash', { laneIndex: 0 });
    for (let i = 0; i < 120; i++) race.step(1 / 60);
    const gained = race.ponies[0].x - before;
    // same pony with no dash over the same window
    const ctrl = new Race({ seed: 5, ponies: mkPonies(3) });
    for (let i = 0; i < 180; i++) ctrl.step(1 / 60);
    expect(race.ponies[0].x).toBeGreaterThan(ctrl.ponies[0].x);
    expect(gained).toBeGreaterThan(0);
  });

  it('penalty ± adjusts drink count and never goes negative', () => {
    const race = new Race({ seed: 9, ponies: mkPonies(3) });
    race.applyItem('penaltyPlus', { laneIndex: 1 });
    expect(race.ponies[1].penalty).toBe(2);
    race.applyItem('penaltyMinus', { laneIndex: 1 });
    race.applyItem('penaltyMinus', { laneIndex: 1 });
    expect(race.ponies[1].penalty).toBe(0);
  });

  it('swap exchanges two ponies positions', () => {
    const race = new Race({ seed: 3, ponies: mkPonies(4) });
    for (let i = 0; i < 120; i++) race.step(1 / 60);
    const a = race.ponies[0], b = race.ponies[1];
    const ax = a.x, bx = b.x;
    race.swapPositions(a, b);
    expect(a.x).toBeCloseTo(bx, 6);
    expect(b.x).toBeCloseTo(ax, 6);
  });

  it('missile only knocks back, never past the start', () => {
    const race = new Race({ seed: 2, ponies: mkPonies(3) });
    race.applyItem('missile', { laneIndex: 0 });
    expect(race.ponies.every((p) => p.x >= 0)).toBe(true);
  });
});

describe('rubber-band catch-up (②)', () => {
  it('makes the leader stumble somewhat more than the trailer', () => {
    // Count stumbles by rank across many sims.
    let leaderStumbles = 0, lastStumbles = 0;
    for (let s = 0; s < 60; s++) {
      const rng = makeRng(s * 7 + 3);
      const race = new Race({ rng, ponies: mkPonies(5) });
      race.on('slowdown', ({ pony }) => {
        if (pony.rank === 0) leaderStumbles++;
        if (pony.rank === 4) lastStumbles++;
      });
      while (!race.finished && race.t < 60) race.step(1 / 60);
    }
    expect(leaderStumbles).toBeGreaterThan(lastStumbles);
  });
});

describe('three-layer variance split ≈ 40 / 30 / 30 (goal.md §6)', () => {
  it('each layer contributes roughly its share of outcome spread', () => {
    const SIMS = 1500;
    let vb = 0, vs = 0, vi = 0;
    for (let s = 0; s < SIMS; s++) {
      const race = simulate(s * 131 + 17, { n: 5 });
      vb += variance(race.ponies.map((p) => p.contrib.base));
      vs += variance(race.ponies.map((p) => p.contrib.slow));
      vi += variance(race.ponies.map((p) => p.contrib.item));
    }
    const total = vb + vs + vi;
    const pct = { base: (100 * vb) / total, slow: (100 * vs) / total, item: (100 * vi) / total };
    // eslint-disable-next-line no-console
    console.log('variance split %', pct);
    expect(pct.base).toBeGreaterThan(32);
    expect(pct.base).toBeLessThan(48);
    expect(pct.slow).toBeGreaterThan(20);
    expect(pct.slow).toBeLessThan(40);
    expect(pct.item).toBeGreaterThan(20);
    expect(pct.item).toBeLessThan(40);
  });
});
