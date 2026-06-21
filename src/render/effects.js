// Lightweight transient effects: particle bursts, rings, floating text, speed
// lines, explosions, sparkles, confetti. Each effect is a tiny updater that
// self-removes when done. These sell the two highlight moments goal.md cares
// about: grabbing an item and the loser reveal.

import { Container, Graphics, Text } from 'pixi.js';

export class Effects {
  constructor(app, layer) {
    this.app = app;
    this.layer = layer;
    this.active = new Set();
    this._tick = (ticker) => {
      const dt = Math.min(0.05, ticker.deltaMS / 1000);
      for (const e of this.active) if (!e.update(dt)) { e.dispose(); this.active.delete(e); }
    };
    app.ticker.add(this._tick);
  }

  _add(obj, update) {
    this.layer.addChild(obj);
    const e = { update, dispose: () => obj.destroy() };
    this.active.add(e);
    return e;
  }

  // Attach an externally-built display object with a per-frame updater
  // (dt) => alive. Used for the homing missile. Self-removes when it returns false.
  attach(displayObject, updateFn) { return this._add(displayObject, updateFn); }

  burst(x, y, { color = 0xffd34d, count = 14, speed = 320, size = 6, gravity = 700 } = {}) {
    const g = new Graphics();
    const parts = Array.from({ length: count }, (_, i) => {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const sp = speed * (0.5 + Math.random());
      return { x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, r: size * (0.6 + Math.random() * 0.8), life: 0.5 + Math.random() * 0.4, t: 0 };
    });
    g.x = x; g.y = y;
    return this._add(g, (dt) => {
      g.clear();
      let alive = false;
      for (const p of parts) {
        p.t += dt; if (p.t >= p.life) continue;
        alive = true;
        p.vy += gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        g.circle(p.x, p.y, p.r * (1 - p.t / p.life)).fill({ color, alpha: 1 - p.t / p.life });
      }
      return alive;
    });
  }

  ring(x, y, { color = 0xffffff, max = 120, width = 8, dur = 0.45 } = {}) {
    const g = new Graphics(); g.x = x; g.y = y; let t = 0;
    return this._add(g, (dt) => {
      t += dt; const k = t / dur; if (k >= 1) return false;
      g.clear().circle(0, 0, max * k).stroke({ color, width: width * (1 - k), alpha: 1 - k });
      return true;
    });
  }

  flash(x, y, { color = 0xffffff, max = 90, dur = 0.22 } = {}) {
    const g = new Graphics(); g.x = x; g.y = y; let t = 0;
    return this._add(g, (dt) => {
      t += dt; const k = t / dur; if (k >= 1) return false;
      g.clear().star(0, 0, 8, max * (0.5 + k), max * 0.4).fill({ color, alpha: (1 - k) * 0.9 });
      return true;
    });
  }

  popup(x, y, text, { color = 0xffffff, size = 34, dur = 1.1, rise = 70 } = {}) {
    const label = new Text({ text, style: { fontFamily: 'system-ui, sans-serif', fontSize: size, fontWeight: '900', fill: color, stroke: { color: 0x3a2a20, width: 6 }, align: 'center' } });
    label.anchor.set(0.5); label.x = x; label.y = y; let t = 0;
    return this._add(label, (dt) => {
      t += dt; const k = t / dur; if (k >= 1) return false;
      label.y = y - rise * k;
      label.scale.set(k < 0.25 ? 0.5 + (k / 0.25) * 0.7 : 1.2 - Math.min(0.2, (k - 0.25) * 0.3));
      label.alpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      return true;
    });
  }

  explosion(x, y) {
    this.flash(x, y, { color: 0xfff2a8, max: 110, dur: 0.25 });
    this.ring(x, y, { color: 0xff7a3c, max: 150, width: 12, dur: 0.5 });
    this.burst(x, y, { color: 0xff8a3d, count: 20, speed: 420, size: 8 });
    this.burst(x, y, { color: 0x5a4636, count: 12, speed: 260, size: 6 });
  }

  sparkle(x, y, color = 0xfff0a0) {
    this.flash(x, y, { color, max: 70, dur: 0.3 });
    this.burst(x, y, { color, count: 16, speed: 300, size: 5, gravity: 200 });
  }

  // Speed lines that follow a moving target until stopped.
  speedLines(target, color = 0xffffff) {
    const g = new Graphics();
    const lines = Array.from({ length: 6 }, () => ({ y: (Math.random() - 0.5) * 50, len: 30 + Math.random() * 40, off: Math.random() * 60 }));
    let t = 0; let alive = true;
    const e = this._add(g, (dt) => {
      t += dt * 60; g.clear();
      g.x = target.x; g.y = target.y - 30;
      for (const l of lines) {
        const x = -((t * 3 + l.off) % 90) - 10;
        g.rect(x, l.y, l.len, 3).fill({ color, alpha: 0.5 });
      }
      return alive;
    });
    return () => { alive = false; };
  }

  confetti(w, h) {
    const cont = new Container();
    const colors = [0xff7a3c, 0x5aa0e6, 0x76c46a, 0xf0c95a, 0xf09bbe, 0xffffff];
    const parts = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: -Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 120, vy: 120 + Math.random() * 220,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10,
      s: 6 + Math.random() * 8, c: colors[(Math.random() * colors.length) | 0], g: new Graphics(),
    }));
    parts.forEach((p) => { p.g.rect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6).fill(p.c); cont.addChild(p.g); });
    let t = 0;
    return this._add(cont, (dt) => {
      t += dt; if (t > 3.2) return false;
      for (const p of parts) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        p.g.x = p.x; p.g.y = p.y; p.g.rotation = p.rot;
      }
      cont.alpha = t > 2.4 ? 1 - (t - 2.4) / 0.8 : 1;
      return true;
    });
  }

  destroy() { this.app.ticker.remove(this._tick); for (const e of this.active) e.dispose(); this.active.clear(); }
}
