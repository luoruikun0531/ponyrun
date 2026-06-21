// The PixiJS scene that "performs" a Race: track + pony actors + flying items +
// effects + the finish camera. It reads the logic layer every frame and
// subscribes to race events; the logic never knows about rendering (goal.md §6).
// Effects/audio fire on events so adding an item needs no changes here.

import { Container, Sprite } from 'pixi.js';
import { Track } from './Track.js';
import { PonyActor } from './PonyActor.js';
import { ItemMeteor } from './ItemMeteor.js';
import { Effects } from './effects.js';
import { Race } from '../logic/race.js';
import { makeRng, randomSeed } from '../logic/rng.js';
import { rollItemType, ITEMS } from '../logic/items.js';
import { FINISH_SUSPENSE_X } from '../logic/constants.js';
import { sfx } from '../audio/sfx.js';
import { setBgmTempo } from '../audio/bgm.js';
import { t } from '../i18n/index.js';

export class RaceView {
  constructor(app, assets) {
    this.app = app;
    this.assets = assets;
    this.world = new Container();
    this.track = new Track(assets);
    this.actorLayer = new Container();
    this.actorLayer.sortableChildren = true;
    this.itemLayer = new Container();
    this.fxLayer = new Container();
    this.world.addChild(this.track.container, this.actorLayer, this.itemLayer, this.fxLayer);
    this.effects = new Effects(app, this.fxLayer);
    this.actors = [];
    this.meteors = [];
    this.speedStops = {};
    this.race = null;
    this.running = false;
    this.timescale = 1;
    this._tick = (ticker) => this.update(ticker);
  }

  mount() {
    this.app.stage.eventMode = 'static';
    this.app.stage.addChild(this.world);
    this.app.ticker.add(this._tick);
  }

  setup(config) {
    this.config = config;
    const rng = makeRng(config.seed ?? randomSeed());
    this.race = new Race({ rng, ponies: config.ponies });
    this._wireEvents();

    this.actorLayer.removeChildren();
    this.itemLayer.removeChildren();
    this.meteors.forEach((m) => m.destroy());
    this.meteors = [];
    this.speedStops = {};

    this.actors = config.ponies.map((p, i) => {
      const anims = this.assets.ponyAnims[p.colorKey] || Object.values(this.assets.ponyAnims)[0];
      const actor = new PonyActor(anims, this.assets.cell, { name: p.name });
      actor.renderX = 0;
      actor.container.zIndex = i;
      this.actorLayer.addChild(actor.container);
      actor.setBaseAnim('idle');
      return actor;
    });
    this.relayout();
    this.finishHandled = false;
    this.timescale = 1;
    this._resetCamera();
    this.nextItemAt = 2.4;
  }

  relayout() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    this.track.layout(w, h, this.actors.length);
    const ph = this.track.ponyHeight();
    this.actors.forEach((actor, i) => {
      actor.setHeight(ph);
      const targetX = this.track.mapX(this.race ? this.race.ponies[i].x : 0);
      if (!this.running) actor.renderX = targetX;
      actor.container.x = actor.renderX;
      actor.container.y = this.track.laneGroundY(i);
    });
    if (!this.running) this._resetCamera();
  }

  start(onFinish) {
    this.onFinish = onFinish;
    this.running = true;
    this.actors.forEach((a) => a.setBaseAnim('run'));
  }

  // ── per-frame ────────────────────────────────────────────────────────
  update(ticker) {
    const dtReal = Math.min(0.05, ticker.deltaMS / 1000);
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.update(dtReal); // items run in real time even during slow-mo
      if (m.dead) { m.destroy(); this.meteors.splice(i, 1); }
    }
    if (!this.running || !this.race) return;

    const dt = dtReal * this.timescale;
    this.race.step(dt);
    this._syncActors();
    this._spawnItems(dtReal);
    this._finishCamera();
    if (this.race.finished && !this.finishHandled) this._handleFinish();
  }

  _syncActors() {
    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      const p = this.race.ponies[i];
      actor.renderX += (this.track.mapX(p.x) - actor.renderX) * 0.35;
      actor.container.x = actor.renderX;
      actor.container.y = this.track.laneGroundY(i);
      if (!actor.oneShot && (p.anim === 'run' || p.anim === 'sprint' || p.anim === 'idle')) actor.setBaseAnim(p.anim);
      // speed lines while sprinting
      if (p.anim === 'sprint' && !this.speedStops[i]) this.speedStops[i] = this.effects.speedLines(actor.container, 0xffffff);
      if (p.anim !== 'sprint' && this.speedStops[i]) { this.speedStops[i](); this.speedStops[i] = null; }
    }
  }

  // ── items ────────────────────────────────────────────────────────────
  _spawnItems(dt) {
    this.nextItemAt -= dt;
    if (this.nextItemAt > 0 || this.meteors.length >= 2) return;
    const progress = this.race.leader().x;
    this.nextItemAt = Math.max(1.0, 2.4 - progress * 1.3) + Math.random() * 1.1;
    this._spawn();
  }

  _spawn() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const type = rollItemType(this.race.rng, this.race.leader().x);
    const def = ITEMS[type];
    const n = this.actors.length;
    const ph = this.track.ponyHeight();
    const iconSize = ph * (def.rarity === 'rare' ? 0.92 : 0.78);

    let lane = (Math.random() * n) | 0;
    let from; let to; let vertical = false;
    if (def.fly === 'vertical') {
      // falls across every lane; the target is whichever lane it's tapped over
      vertical = true;
      const x = w * (0.2 + Math.random() * 0.62);
      const topDown = Math.random() < 0.5;
      from = { x, y: topDown ? -60 : h + 60 };
      to = { x, y: topDown ? h + 60 : -60 };
    } else {
      // common items streak horizontally along a random lane
      const y = this.track.laneGroundY(lane) - ph * 0.7;
      const ltr = Math.random() < 0.5;
      from = { x: ltr ? -70 : w + 70, y }; to = { x: ltr ? w + 70 : -70, y };
    }

    const meteor = new ItemMeteor(this.app, this.assets, type, {
      from, to, flyTime: def.flyTime, laneIndex: lane, iconSize, vertical,
      onCatch: (m) => this._onCatch(m),
      onMiss: () => {},
    });
    this.itemLayer.addChild(meteor.container);
    this.meteors.push(meteor);
  }

  _onCatch(meteor) {
    const { x, y } = meteor.container;
    const rare = meteor.def.rarity === 'rare';
    if (rare) { sfx.catchRare(); this.effects.sparkle(x, y); }
    else { sfx.catchCommon(); this.effects.burst(x, y, { color: 0xfff0b0, count: 12, speed: 260 }); }
    const laneIndex = meteor.vertical ? this.track.laneAtY(y) : meteor.laneIndex;
    if (meteor.type === 'missile') {
      meteor.dead = true; // remove the pickup; a homing rocket flies to the target
      this._launchMissile(x, y, laneIndex);
    } else if (meteor.type === 'hitchhike') {
      meteor.dead = true; // a car drives over to pick up that lane's pony
      this._launchCar(x, y, laneIndex);
    } else {
      this.race.applyItem(meteor.type, { laneIndex });
    }
  }

  // Caught hitchhike: a car drives to the targeted pony, boosts it forward, drives off.
  _launchCar(fromX, fromY, laneIndex) {
    const target = this.actors[laneIndex];
    const ph = this.track.ponyHeight();
    const spr = new Sprite(this.assets.items.car);
    spr.anchor.set(0.5);
    spr.scale.set((ph * 0.85) / Math.max(spr.texture.width, spr.texture.height));
    spr.x = fromX; spr.y = fromY;
    sfx.ride();
    let phase = 0; let t = 0; let applied = false;
    this.effects.attach(spr, (dt) => {
      t += dt;
      if (phase === 0) { // drive over to just behind the pony
        const tx = target.container.x - ph * 0.45;
        const ty = target.container.y - ph * 0.2;
        const dx = tx - spr.x; const dy = ty - spr.y; const dist = Math.hypot(dx, dy) || 1;
        if (dist < ph * 0.3 || t > 1.2) {
          if (!applied) { this.race.applyItem('hitchhike', { laneIndex }); applied = true; }
          phase = 1; t = 0; return true;
        }
        const step = Math.min(dist, 1000 * dt);
        spr.x += (dx / dist) * step; spr.y += (dy / dist) * step;
        return true;
      }
      // carry forward alongside the pony, then fade out
      spr.x += 460 * dt;
      spr.y = target.container.y - ph * 0.2;
      spr.alpha -= dt * 1.3;
      return spr.alpha > 0;
    });
  }

  // Caught missile: a rocket streaks to the targeted pony, then detonates.
  _launchMissile(fromX, fromY, laneIndex) {
    const target = this.actors[laneIndex];
    const ph = this.track.ponyHeight();
    const spr = new Sprite(this.assets.items.missile);
    spr.anchor.set(0.5);
    spr.scale.set((ph * 0.66) / Math.max(spr.texture.width, spr.texture.height));
    spr.x = fromX; spr.y = fromY;
    sfx.dash(); // launch whoosh
    let hit = false; let t = 0;
    this.effects.attach(spr, (dt) => {
      if (hit) return false;
      t += dt;
      const tx = target.container.x;
      const ty = target.container.y - ph * 0.5;
      const dx = tx - spr.x; const dy = ty - spr.y;
      const dist = Math.hypot(dx, dy) || 1;
      spr.rotation = Math.atan2(dy, dx) + Math.PI / 4;
      if (dist < ph * 0.34 || t > 1.3) {
        hit = true;
        this.race.applyItem('missile', { laneIndex }); // knockback + 'hit' → boom/sfx/anim
        return false;
      }
      const step = Math.min(dist, 1100 * dt);
      spr.x += (dx / dist) * step; spr.y += (dy / dist) * step;
      return true;
    });
  }

  // ── race events → show + sound ───────────────────────────────────────
  _wireEvents() {
    const r = this.race;
    const at = (pony) => {
      const a = this.actors[pony.index];
      return { x: a.container.x, y: a.container.y - this.track.ponyHeight() * 0.55, a };
    };
    r.on('trip', ({ pony }) => { const { x, y, a } = at(pony); a.playOnce('trip'); sfx.banana(); this.effects.burst(x, y, { color: 0xf4d44a, count: 14 }); this.effects.popup(x, y - 20, t('items.banana'), { color: 0xffe14d }); });
    r.on('boost', ({ pony }) => { const { x, y } = at(pony); sfx.dash(); this.effects.popup(x, y - 20, t('items.dash'), { color: 0xffd24a }); });
    r.on('hit', ({ pony }) => { const { x, y, a } = at(pony); a.playOnce('hit'); sfx.missile(); this.effects.explosion(x, y); this.effects.popup(x, y - 30, t('items.missile'), { color: 0xff7a3c }); });
    r.on('ride', ({ pony }) => { const { x, y } = at(pony); sfx.ride(); this.effects.popup(x, y - 20, t('items.hitchhike'), { color: 0x76c46a }); this.effects.burst(x, y, { color: 0x9ad0ff, count: 10, speed: 200 }); });
    r.on('swap', ({ a, b }) => { [a, b].forEach((p) => { const q = at(p); sfx.swap(); this.effects.ring(q.x, q.y, { color: 0xc59bff, max: 90 }); this.effects.popup(q.x, q.y - 20, t('items.swap'), { color: 0xc59bff }); }); });
    r.on('penalty', ({ pony, delta }) => { const { x, y } = at(pony); if (delta > 0) sfx.penaltyUp(); else sfx.penaltyDown(); this.effects.popup(x, y - 20, delta > 0 ? t('items.penaltyPlus') : t('items.penaltyMinus'), { color: delta > 0 ? 0xff6a6a : 0x6ab0ff }); });
    r.on('slowdown', ({ pony }) => { const { x, y } = at(pony); this.effects.burst(x, y + 10, { color: 0xccb089, count: 5, speed: 120, size: 4, gravity: 200 }); });
  }

  // ── finish camera + reveal ───────────────────────────────────────────
  _resetCamera() { this.world.scale.set(1); this.world.position.set(0, 0); }

  _finishCamera() {
    const lead = this.race.leader();
    if (lead.x > FINISH_SUSPENSE_X && !this.race.finished) {
      this.timescale += (0.5 - this.timescale) * 0.04;
      setBgmTempo(1.18);
      const s = 1 + (this.world.scale.x < 1.16 ? 0.01 : 0);
      const focusX = this.track.finishX * 0.96;
      const focusY = (this.track.dirtTop + this.track.dirtBottom) / 2;
      const ns = this.world.scale.x + (1.16 - this.world.scale.x) * 0.04;
      this.world.scale.set(ns);
      this.world.position.set(this.app.screen.width / 2 - focusX * ns, this.app.screen.height / 2 - focusY * ns);
    }
  }

  _handleFinish() {
    this.finishHandled = true;
    this.timescale = 1;
    setBgmTempo(1);
    const { winner, loser } = this.race.results;
    this.actors.forEach((a, i) => {
      const p = this.race.ponies[i];
      a.renderX = this.track.mapX(p.x); a.container.x = a.renderX;
      if (this.speedStops[i]) { this.speedStops[i](); this.speedStops[i] = null; }
      if (p === winner) a.hold('taunt');
      else if (p === loser) a.hold('cry');
      else a.setBaseAnim('idle');
    });
    const wa = this.actors[winner.index];
    const la = this.actors[loser.index];
    const ph = this.track.ponyHeight();
    sfx.win();
    this.effects.confetti(this.app.screen.width, this.app.screen.height);
    this.effects.popup(wa.container.x, wa.container.y - ph * 1.2, '👑 ' + t('result.winner'), { color: 0xffd24a, size: 30 });
    setTimeout(() => { sfx.lose(); this.effects.popup(la.container.x, la.container.y - ph * 1.2, '🍺 ' + t('result.loser'), { color: 0xff7a6a, size: 30 }); }, 600);

    this.running = false;
    if (this.onFinish) setTimeout(() => this.onFinish(this.race.results), 1700);
  }

  destroy() {
    this.app.ticker.remove(this._tick);
    this.effects.destroy();
    this.world.destroy({ children: true });
  }
}
