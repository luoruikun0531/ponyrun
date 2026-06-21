// Item registry — the whole item system as data (goal.md §5). Adding an item is
// one self-contained entry here: rarity, spawn weight, fly time, icon, target
// rule, and an effect() that calls Race primitives. Rarer ⇒ faster fly ⇒ harder
// to tap ⇒ stronger effect. The render layer reads the metadata; the logic layer
// runs effect(). The two never touch each other directly.

import { TRACK_LEN } from './constants.js';

// Effect magnitudes, all in one place for tuning the 30% item layer.
const M = {
  dashBoost: 1.2,   // ×base added velocity
  dashDur: 1.7,      // seconds
  bananaBack: 0.028 * TRACK_LEN,
  bananaTrip: 1.0,   // seconds stalled
  missileBack: 0.165 * TRACK_LEN,
  rideFwd: 0.14 * TRACK_LEN,
};

export const ITEMS = {
  // ── Common: slow, easy to tap, mild ──────────────────────────────
  dash: {
    rarity: 'common', weight: 26, flyTime: 2.5, icon: 'dash', target: 'lane',
    effect: (race, t) => race.addImpulse(t.pony, M.dashBoost, M.dashDur, 'sprint'),
  },
  banana: {
    rarity: 'common', weight: 24, flyTime: 2.6, icon: 'banana', target: 'lane',
    effect: (race, t) => race.trip(t.pony, M.bananaTrip, M.bananaBack),
  },
  penaltyPlus: {
    rarity: 'common', weight: 23, flyTime: 2.3, icon: 'mug', badge: '+1', target: 'lane',
    effect: (race, t) => race.addPenalty(t.pony, +1),
  },
  penaltyMinus: {
    rarity: 'common', weight: 23, flyTime: 2.3, icon: 'mug', badge: '-1', target: 'lane',
    effect: (race, t) => race.addPenalty(t.pony, -1),
  },

  // ── Rare: fall vertically across all lanes; tap over a lane to target
  //    that lane's pony. Fast & hard to tap = explosive payoff. ──────
  swap: {
    rarity: 'rare', weight: 5, flyTime: 1.7, icon: 'swap', target: 'lane', fly: 'vertical',
    // swap the tapped pony's track position (x) with the current leader's
    effect: (race, t) => race.swapPositions(t.pony, race.leader()),
  },
  missile: {
    rarity: 'rare', weight: 6, flyTime: 1.6, icon: 'missile', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.knockback(t.pony, M.missileBack),
  },
  hitchhike: {
    rarity: 'rare', weight: 6, flyTime: 1.6, icon: 'car', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.rideForward(t.pony, M.rideFwd),
  },
};

export const ITEM_KEYS = Object.keys(ITEMS);

// Weighted random item type. `rareBias` (0..1) nudges toward rare items late
// in the race for a dramatic finish.
export function rollItemType(rng, rareBias = 0) {
  const entries = ITEM_KEYS.map((k) => {
    const it = ITEMS[k];
    const w = it.rarity === 'rare' ? it.weight * (1 + rareBias * 1.5) : it.weight;
    return [k, w];
  });
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

// Resolve which pony/ponies an item acts on, given its target rule.
export function resolveTargets(item, race, rng, laneIndex = null) {
  switch (item.target) {
    case 'leader':
      return { pony: race.leader() };
    case 'last':
      return { pony: race.last() };
    case 'pair': {
      const a = laneIndex != null ? race.ponies[laneIndex] : race.randomPony(rng);
      const b = race.otherThan(a, rng);
      return { a, b };
    }
    case 'lane':
    default: {
      const pony = laneIndex != null ? race.ponies[laneIndex] : race.randomPony(rng);
      return { pony };
    }
  }
}
