// Item registry — the whole item system as data (goal.md §5). Adding an item is
// one self-contained entry here: rarity, spawn weight, fly time, icon, target
// rule, and an effect() that calls Race primitives. All items cross the screen
// vertically at the same speed; spawn weights keep common items more frequent
// than missile/car. The render layer reads the metadata; the logic layer runs
// effect(). The two never touch each other directly.

import { TRACK_LEN } from './constants.js';

const ITEM_FLY_TIME = 1.6;

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
  // ── Common: more frequent, mild ──────────────────────────────────
  dash: {
    rarity: 'common', weight: 26, flyTime: ITEM_FLY_TIME, icon: 'dash', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.addImpulse(t.pony, M.dashBoost, M.dashDur, 'sprint'),
  },
  banana: {
    rarity: 'common', weight: 24, flyTime: ITEM_FLY_TIME, icon: 'banana', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.trip(t.pony, M.bananaTrip, M.bananaBack),
  },
  penaltyPlus: {
    rarity: 'common', weight: 23, flyTime: ITEM_FLY_TIME, emoji: '🤡', badge: '+1', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.addPenalty(t.pony, +1),
  },
  penaltyMinus: {
    rarity: 'common', weight: 23, flyTime: ITEM_FLY_TIME, emoji: '🤡', badge: '-1', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.addPenalty(t.pony, -1),
  },

  // ── Rare: less frequent, stronger payoff ─────────────────────────
  swap: {
    // TEMPORARILY DISABLED (weight 0 → never spawns): swapping with the leader
    // was too swingy. Restore a weight to bring it back.
    rarity: 'rare', weight: 0, flyTime: ITEM_FLY_TIME, icon: 'swap', target: 'lane', fly: 'vertical',
    // swap the tapped pony's track position (x) with the current leader's
    effect: (race, t) => race.swapPositions(t.pony, race.leader()),
  },
  missile: {
    rarity: 'rare', weight: 6, flyTime: ITEM_FLY_TIME, icon: 'missile', target: 'lane', fly: 'vertical',
    effect: (race, t) => race.knockback(t.pony, M.missileBack),
  },
  hitchhike: {
    rarity: 'rare', weight: 6, flyTime: ITEM_FLY_TIME, icon: 'car', target: 'lane', fly: 'vertical',
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
