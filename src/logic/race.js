// The race engine — pure logic, no rendering (goal.md §6). Real-time stepping
// (items are caught live, so it can't be fully pre-simulated). Deterministic
// given the same seed and the same sequence of caught items.
//
// Effective per-tick velocity is the weighted blend the spec demands:
//   v = base(①40%) − slowdown(②30%) + items(③30%)
// Position jumps (banana/missile/ride/swap) are discrete item effects. Per-layer
// contributions are accumulated so the Monte-Carlo test can verify the split.

import { makeRng } from './rng.js';
import { ITEMS, resolveTargets } from './items.js';
import { TRACK_LEN, V_MEAN, BASE_SPREAD, BASE_MIN, BASE_MAX, SLOW } from './constants.js';

export class Race {
  constructor({ seed = 1, ponies = [], rng = null, trackMul = 1 } = {}) {
    this.rng = rng || makeRng(seed);
    this.trackMul = trackMul; // >1 = longer track ⇒ slower ⇒ longer race
    this.t = 0;
    this.finished = false;
    this.winner = null;
    this.results = null;
    this._handlers = {};

    this.ponies = ponies.map((p, i) => {
      const z = clamp(this.rng.normal(0, 1), -2.4, 2.4);
      const base = (V_MEAN * clamp(1 + BASE_SPREAD * z, BASE_MIN, BASE_MAX)) / trackMul;
      return {
        id: p.id ?? i,
        index: i,
        colorKey: p.colorKey || null,
        name: p.name || '',
        base,
        x: 0,
        vEff: base,
        rank: i,
        penalty: 1,            // drinks owed; items nudge ±
        anim: 'run',
        impulses: [],          // {mult, until, tag}
        stumbleUntil: 0,
        finishedAt: null,
        contrib: { base: 0, slow: 0, item: 0 }, // variance attribution only
      };
    });
    this._updateRanks();
  }

  on(evt, cb) {
    (this._handlers[evt] ||= []).push(cb);
    return this;
  }

  emit(evt, payload) {
    (this._handlers[evt] || []).forEach((cb) => cb(payload));
  }

  // ── stepping ───────────────────────────────────────────────────────
  step(dt) {
    if (this.finished) return;
    this.t += dt;

    for (const p of this.ponies) {
      if (p.finishedAt != null) continue;

      // ② slowdown: maybe start a rubber-band stumble (leader slightly likelier)
      if (this.t >= p.stumbleUntil) {
        const mult = rubberFactor(p, this.ponies.length);
        if (this.rng.chance(SLOW.baseProbPerSec * dt * mult)) {
          p.stumbleUntil = this.t + this.rng.range(SLOW.durMin, SLOW.durMax);
          this.emit('slowdown', { pony: p, dur: p.stumbleUntil - this.t });
        }
      }
      const stumbling = this.t < p.stumbleUntil;

      // ③ item impulses (continuous, e.g. dash)
      p.impulses = p.impulses.filter((im) => im.until > this.t);
      let impulseMult = 0;
      let sprinting = false;
      for (const im of p.impulses) {
        impulseMult += im.mult;
        if (im.tag === 'sprint') sprinting = true;
      }

      const vItem = p.base * impulseMult;
      const vSlow = stumbling ? p.base * SLOW.intensity : 0;
      const desired = p.base + vItem - vSlow;
      const v = Math.max(0, desired);
      p.vEff = v;

      // attribute this tick to layers (sum ≈ actual advance, modulo clamp)
      p.contrib.base += p.base * dt;
      p.contrib.item += vItem * dt;
      p.contrib.slow += -vSlow * dt;

      p.x += v * dt;

      // animation hint for the render layer
      p.anim = sprinting ? 'sprint' : stumbling ? 'idle' : 'run';

      if (p.x >= TRACK_LEN) {
        p.x = TRACK_LEN;
        p.finishedAt = this.t;
        if (!this.finished) this._finish(p);
      }
    }

    this._updateRanks();
  }

  _finish(winner) {
    this.finished = true;
    this.winner = winner;
    winner.anim = 'taunt';
    const order = [...this.ponies].sort((a, b) => b.x - a.x);
    order.forEach((p, i) => { p.rank = i; });
    const loser = order[order.length - 1];
    loser.anim = 'cry';
    this.results = { order, winner, loser };
    this.emit('finish', this.results);
  }

  _updateRanks() {
    if (this.finished) return;
    const order = [...this.ponies].sort((a, b) => b.x - a.x);
    order.forEach((p, i) => {
      if (p.rank !== i) this.emit('overtake', { pony: p, from: p.rank, to: i });
      p.rank = i;
    });
  }

  // ── item primitives (called by items.js effects) ────────────────────
  addImpulse(pony, mult, dur, tag = null) {
    pony.impulses.push({ mult, until: this.t + dur, tag });
    if (tag === 'sprint') this.emit('boost', { pony });
  }

  trip(pony, dur, back) {
    pony.stumbleUntil = Math.max(pony.stumbleUntil, this.t + dur);
    const d = Math.min(back, pony.x);
    pony.x -= d;
    pony.contrib.item -= d;
    this.emit('trip', { pony, dur });
  }

  addPenalty(pony, delta) {
    // floor at 1: everyone owes at least one cup, so −1 on a 1 does nothing
    pony.penalty = Math.max(1, pony.penalty + delta);
    this.emit('penalty', { pony, delta });
  }

  knockback(pony, dist) {
    const d = Math.min(dist, pony.x);
    pony.x -= d;
    pony.contrib.item -= d;
    pony.stumbleUntil = Math.max(pony.stumbleUntil, this.t + 0.5);
    this.emit('hit', { pony });
    this._updateRanks();
  }

  rideForward(pony, dist) {
    const d = Math.min(dist, TRACK_LEN - pony.x);
    pony.x += d;
    pony.contrib.item += d;
    this.emit('ride', { pony });
    this._updateRanks();
  }

  swapPositions(a, b) {
    if (!a || !b || a === b) return;
    const dx = b.x - a.x;
    a.x += dx; b.x -= dx;
    a.contrib.item += dx; b.contrib.item -= dx;
    this.emit('swap', { a, b });
    this._updateRanks();
  }

  // ── queries ─────────────────────────────────────────────────────────
  leader() { return this.ponies.reduce((m, p) => (p.x > m.x ? p : m), this.ponies[0]); }
  last() { return this.ponies.reduce((m, p) => (p.x < m.x ? p : m), this.ponies[0]); }
  randomPony(rng = this.rng) { return this.ponies[rng.int(0, this.ponies.length - 1)]; }
  otherThan(pony, rng = this.rng) {
    if (this.ponies.length < 2) return pony;
    let q = pony;
    while (q === pony) q = this.randomPony(rng);
    return q;
  }

  // Apply a caught item by type. `laneIndex` is which lane it flew through.
  applyItem(type, { laneIndex = null } = {}) {
    const item = ITEMS[type];
    if (!item || this.finished) return null;
    const targets = resolveTargets(item, this, this.rng, laneIndex);
    item.effect(this, targets);
    this.emit('item', { type, item, targets });
    return targets;
  }

  getState() {
    return {
      t: this.t,
      finished: this.finished,
      ponies: this.ponies.map((p) => ({
        id: p.id, index: p.index, colorKey: p.colorKey, name: p.name,
        x: p.x, vEff: p.vEff, rank: p.rank, penalty: p.penalty, anim: p.anim,
      })),
      results: this.results,
    };
  }
}

function rubberFactor(pony, n) {
  if (n < 2) return 1;
  const rankFrac = pony.rank / (n - 1); // leader 0 → last 1
  return Math.max(0.1, 1 + SLOW.rubber * (1 - 2 * rankFrac));
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
