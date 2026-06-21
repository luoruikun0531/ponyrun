// One pony on screen: a tinted AnimatedSprite that swaps between looping states
// (run / sprint / idle) and plays one-shot actions (trip / hit / taunt / cry)
// over the top, then returns to its looping state. Position is tweened by the
// RaceView (goal.md: "挪位置用 tween，做动作用序列帧").

import { AnimatedSprite, Container, Graphics, Text } from 'pixi.js';

export class PonyActor {
  constructor(anims, cell, { tint = 0xffffff, name = '', label = '' } = {}) {
    this.anims = anims;
    this.cell = cell;
    this.container = new Container();

    this.shadow = new Graphics().ellipse(0, 0, cell.w * 0.16, cell.w * 0.05).fill({ color: 0x2a1c14, alpha: 0.18 });
    this.container.addChild(this.shadow);

    const first = anims.run || Object.values(anims)[0];
    this.sprite = new AnimatedSprite(first.frames);
    this.sprite.anchor.set(0.5, cell.baseline / cell.h);
    this.sprite.tint = tint;
    this.sprite.play();
    this.container.addChild(this.sprite);

    this.tag = new Text({
      text: name,
      style: { fontFamily: 'system-ui, sans-serif', fontSize: 22, fontWeight: '800', fill: 0xffffff, stroke: { color: 0x3a2a20, width: 5 }, align: 'center' },
    });
    this.tag.anchor.set(0.5, 1);
    this.container.addChild(this.tag);

    this.baseAnim = 'run';
    this.current = 'run';
    this.oneShot = null;
    this._applyAnim('run');
  }

  _applyAnim(name) {
    const a = this.anims[name];
    if (!a) return;
    this.sprite.textures = a.frames;
    this.sprite.loop = a.loop;
    this.sprite.animationSpeed = a.fps / 60;
    this.sprite.onComplete = a.loop ? null : () => this._onOneShotDone();
    this.sprite.gotoAndPlay(0);
    this.current = name;
  }

  _onOneShotDone() {
    this.oneShot = null;
    this._applyAnim(this.baseAnim);
  }

  // Looping state coming from the logic layer each frame (run / sprint / idle).
  setBaseAnim(name) {
    if (this.baseAnim === name) return;
    this.baseAnim = name;
    if (!this.oneShot && this.current !== name) this._applyAnim(name);
  }

  // One-shot action played once over the looping state (trip / hit).
  playOnce(name) {
    if (!this.anims[name]) return;
    this.oneShot = name;
    this._applyAnim(name);
  }

  // Holds a looping state regardless of logic (taunt for winner, cry for loser).
  hold(name) {
    this.oneShot = name; // block base swaps
    this.baseAnim = name;
    this._applyAnim(name);
    this.sprite.loop = true;
    this.sprite.onComplete = null;
  }

  setHeight(px) {
    const s = px / this.cell.h;
    this.sprite.scale.set(s);
    this.shadow.scale.set(s);
    this.tag.y = -px * (1 - this.cell.baseline / this.cell.h) - px * 0.62;
    this.tag.scale.set(Math.min(1, px / 150));
  }

  setName(name) { this.tag.text = name; }

  set tint(v) { this.sprite.tint = v; }
}
