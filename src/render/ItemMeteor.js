// A single item streaking across the track like a meteor (goal.md §5). Tap to
// catch. Rarity (set in items.js) drives fly speed, size and how forgiving the
// tap target is: rarer ⇒ faster ⇒ smaller hit area ⇒ harder ⇒ stronger payoff.

import { Container, Sprite, Graphics, Text, Circle } from 'pixi.js';
import { ITEMS } from '../logic/items.js';

const RARE_GLOW = 0xffe66a;
const COMMON_GLOW = 0xfff6d8;

export class ItemMeteor {
  constructor(app, assets, type, { from, to, flyTime, laneIndex, iconSize, vertical = false, onCatch, onMiss }) {
    this.app = app;
    this.type = type;
    this.def = ITEMS[type];
    this.laneIndex = laneIndex;
    this.vertical = vertical; // lane resolved from tap-y at catch time
    this.onCatch = onCatch;
    this.onMiss = onMiss;
    this.from = from; this.to = to;
    this.flyTime = flyTime;
    this.t = 0;
    this.caught = false;
    this.dead = false;
    const rare = this.def.rarity === 'rare';

    this.container = new Container();
    this.container.x = from.x; this.container.y = from.y;

    this.glow = new Graphics()
      .circle(0, 0, iconSize * (rare ? 0.95 : 0.8))
      .fill({ color: rare ? RARE_GLOW : COMMON_GLOW, alpha: rare ? 0.55 : 0.35 });
    this.container.addChild(this.glow);

    this.icon = new Sprite(assets.items[this.def.icon]);
    this.icon.anchor.set(0.5);
    const s = iconSize / Math.max(this.icon.texture.width, this.icon.texture.height);
    this.icon.scale.set(s);
    this.container.addChild(this.icon);

    if (this.def.badge) {
      const badge = new Text({ text: this.def.badge, style: { fontFamily: 'system-ui, sans-serif', fontSize: iconSize * 0.46, fontWeight: '900', fill: this.def.badge[0] === '+' ? 0xff5a5a : 0x5ab0ff, stroke: { color: 0xffffff, width: 5 } } });
      badge.anchor.set(0.5); badge.x = iconSize * 0.32; badge.y = -iconSize * 0.32;
      this.container.addChild(badge);
    }

    // generous, finger-friendly hit target (smaller for rare = harder)
    const hitR = iconSize * (rare ? 0.85 : 1.15);
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.hitArea = new Circle(0, 0, hitR);
    this.container.on('pointerdown', () => this._catch());

    this.rare = rare;
    this.iconSize = iconSize;
    this._wobble = Math.random() * Math.PI * 2;
  }

  _catch() {
    if (this.caught || this.dead) return;
    this.caught = true;
    this.container.eventMode = 'none';
    if (this.onCatch) this.onCatch(this);
  }

  update(dt) {
    if (this.dead) return;
    if (this.caught) { // brief pop then vanish (effect played by RaceView)
      this.icon.scale.x *= 1 + dt * 6;
      this.icon.scale.y *= 1 + dt * 6;
      this.container.alpha -= dt * 5;
      if (this.container.alpha <= 0) this.dead = true;
      return;
    }
    this.t += dt;
    const k = this.t / this.flyTime;
    if (k >= 1) { this.dead = true; if (this.onMiss) this.onMiss(this); return; }
    this.container.x = this.from.x + (this.to.x - this.from.x) * k;
    this.container.y = this.from.y + (this.to.y - this.from.y) * k;
    this._wobble += dt * 10;
    this.icon.rotation = Math.sin(this._wobble) * 0.18;
    this.glow.alpha = (this.rare ? 0.55 : 0.35) * (0.7 + 0.3 * Math.sin(this._wobble * 1.5));
    this.container.scale.set(0.6 + Math.min(0.4, k * 2)); // grow as it enters
  }

  destroy() { this.container.destroy({ children: true }); }
}
