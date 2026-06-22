// Loads every pre-generated art asset and slices each pony's strips into frame
// textures. Runs once at boot; afterwards the app only plays textures — no
// network, no API (goal.md §3).

import { Assets, Texture, Rectangle } from 'pixi.js';

const base = import.meta.env.BASE_URL || '/';
const url = (p) => `${base}${p}`.replace(/([^:])\/\//g, '$1/');

const ITEM_ICONS = ['dash', 'banana', 'swap', 'missile', 'car'];

let cache = null;

export async function loadAssets() {
  if (cache) return cache;

  const manifest = await fetch(url('assets/ponies/manifest.json')).then((r) => r.json());
  const { cellW, cellH, baseline, ponies, anims } = manifest;

  const bundle = { bg: url('assets/bg.jpg') };
  for (const key of ponies) {
    for (const anim of Object.keys(anims)) bundle[`${key}_${anim}`] = url(`assets/ponies/${key}/${anim}.png`);
  }
  for (const icon of ITEM_ICONS) bundle[`item_${icon}`] = url(`assets/items/${icon}.png`);
  const loaded = await Assets.load(Object.values(bundle));

  const sliceStrip = (tex, frameCount) => {
    const src = tex.source;
    const frames = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push(new Texture({ source: src, frame: new Rectangle(i * cellW, 0, cellW, cellH) }));
    }
    return frames;
  };

  const ponyAnims = {};
  for (const key of ponies) {
    ponyAnims[key] = {};
    for (const [anim, meta] of Object.entries(anims)) {
      const tex = loaded[url(`assets/ponies/${key}/${anim}.png`)];
      ponyAnims[key][anim] = { frames: sliceStrip(tex, meta.frames), fps: meta.fps, loop: meta.loop };
    }
  }

  const items = {};
  for (const icon of ITEM_ICONS) items[icon] = loaded[url(`assets/items/${icon}.png`)];

  cache = {
    bg: loaded[url('assets/bg.jpg')],
    items,
    cell: { w: cellW, h: cellH, baseline },
    ponyKeys: ponies,
    ponyAnims, // ponyAnims[key][anim] = { frames, fps, loop }
  };
  return cache;
}
