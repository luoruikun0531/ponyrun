// The racetrack: the pre-generated landscape backdrop plus a code-drawn finish
// line and lane layout. Lanes are computed for any pony count (3–6), so the art
// stays generic and flexible (goal.md: draw lanes in code over an empty field).

import { Container, Sprite, Graphics, TilingSprite } from 'pixi.js';

const DIRT_TOP = 0.44;     // fraction of height where the dirt field starts
const DIRT_BOTTOM = 0.975; // bottom of the usable field
const START_X = 0.085;
const FINISH_X = 0.9;

export class Track {
  constructor(assets) {
    this.assets = assets;
    this.container = new Container();
    this.bg = new Sprite(assets.bg);
    this.container.addChild(this.bg);
    this.lanesGfx = new Graphics();
    this.container.addChild(this.lanesGfx);
    this.finish = new Container();
    this.container.addChild(this.finish);
    this.w = 0; this.h = 0; this.n = 4;
  }

  layout(w, h, n) {
    this.w = w; this.h = h; this.n = n;

    // cover-fit background
    const s = Math.max(w / this.bg.texture.width, h / this.bg.texture.height);
    this.bg.scale.set(s);
    this.bg.x = (w - this.bg.texture.width * s) / 2;
    this.bg.y = (h - this.bg.texture.height * s) / 2;

    this.dirtTop = h * DIRT_TOP;
    this.dirtBottom = h * DIRT_BOTTOM;
    this.startX = w * START_X;
    this.finishX = w * FINISH_X;
    this.laneH = (this.dirtBottom - this.dirtTop) / n;

    this._drawLanes();
    this._drawFinish();
  }

  laneGroundY(i) {
    // feet sit near the lower edge of each lane band
    return this.dirtTop + this.laneH * (i + 0.86);
  }

  ponyHeight() {
    return Math.max(34, Math.min(150, this.laneH * 0.96));
  }

  mapX(x) {
    return this.startX + x * (this.finishX - this.startX);
  }

  _drawLanes() {
    const g = this.lanesGfx;
    g.clear();
    for (let i = 0; i < this.n; i++) {
      const top = this.dirtTop + this.laneH * i;
      // alternating soft bands + dashed dividers for readability
      if (i % 2 === 0) g.rect(0, top, this.w, this.laneH).fill({ color: 0xffffff, alpha: 0.05 });
      const y = top + this.laneH;
      if (i < this.n - 1) {
        for (let x = 0; x < this.w; x += 38) {
          g.rect(x, y - 2, 22, 4).fill({ color: 0xffffff, alpha: 0.22 });
        }
      }
    }
  }

  _drawFinish() {
    this.finish.removeChildren();
    const x = this.finishX;
    const top = this.dirtTop - this.laneH * 0.15;
    const bottom = this.dirtBottom;
    const sq = Math.max(7, this.laneH * 0.16);
    const g = new Graphics();
    // checkered post
    let row = 0;
    for (let yy = top; yy < bottom; yy += sq) {
      const c = (row % 2 === 0) ? 0x2a2a2a : 0xffffff;
      g.rect(x, yy, sq, sq).fill(c);
      g.rect(x + sq, yy, sq, sq).fill(row % 2 === 0 ? 0xffffff : 0x2a2a2a);
      row++;
    }
    // pole
    g.rect(x - 3, top - 10, 6, bottom - top + 10).fill(0xbfae8e);
    this.finish.addChild(g);
  }
}
