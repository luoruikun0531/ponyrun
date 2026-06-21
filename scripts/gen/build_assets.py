#!/usr/bin/env python3
"""Slice the 4 ponies × 7 animation sheets into clean packed strips + manifest.

Output: public/assets/ponies/<key>/<anim>.png and manifest.json. Every pony is
normalised to the same visual size (across all ponies AND all states) so nobody
grows or shrinks when switching pony or animation. Dev-time only.

Usage: python scripts/gen/build_assets.py
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from anims import ANIMS  # noqa: E402
from imgproc import load_rgb, key_green, grid_slice, autocrop, place_on_cell, hstrip  # noqa: E402

RAW = "assets_raw"
OUT = "public/assets/ponies"
PONIES = ["white", "brown", "gray", "yellow"]
TARGET_CELL_H = 256
NORM_REF = "run"
PAD_BOTTOM = 8


def alpha_mass(img):
    return math.sqrt(int((np.array(img.split()[-1]) > 8).sum()))


def process(key, anim):
    a = ANIMS[anim]
    rows, cols = a["grid"]
    rgba = key_green(load_rgb(f"{RAW}/{key}_{anim}.jpg"))
    frames = [autocrop(c) for c in grid_slice(rgba, rows, cols)[: a["frames"]]]
    mass = float(np.median([alpha_mass(f) for f in frames]))
    return frames, mass


def main():
    data = {}
    for key in PONIES:
        for anim in ANIMS:
            src = f"{RAW}/{key}_{anim}.jpg"
            if not os.path.exists(src):
                print(f"  ! missing {src}, skipping"); continue
            data[(key, anim)] = process(key, anim)

    # Normalise every (pony, anim) to the size of the average run cycle.
    run_masses = [m for (k, an), (_, m) in data.items() if an == NORM_REF]
    target = float(np.median(run_masses)) if run_masses else 1.0
    scales = {ka: max(0.6, min(1.6, target / m)) for ka, (_, m) in data.items()}

    scaled = {}
    max_w = max_h = 0
    for ka, (frames, _) in data.items():
        s = scales[ka]
        fs = []
        for f in frames:
            if s != 1.0:
                f = f.resize((max(1, round(f.width * s)), max(1, round(f.height * s))), Image.LANCZOS)
            fs.append(f)
            max_w = max(max_w, f.width); max_h = max(max_h, f.height)
        scaled[ka] = fs

    cell_w, cell_h = max_w + 24, max_h + 24
    final_scale = TARGET_CELL_H / cell_h
    out_cw, out_ch = round(cell_w * final_scale), TARGET_CELL_H

    manifest = {
        "cellW": out_cw, "cellH": out_ch,
        "baseline": out_ch - round(PAD_BOTTOM * final_scale),
        "ponies": PONIES,
        "anims": {n: {"frames": ANIMS[n]["frames"], "fps": ANIMS[n]["fps"], "loop": ANIMS[n]["loop"]} for n in ANIMS},
    }

    for key in PONIES:
        os.makedirs(f"{OUT}/{key}", exist_ok=True)
        for anim in ANIMS:
            if (key, anim) not in scaled:
                continue
            placed = [place_on_cell(f, cell_w, cell_h, anchor="bottom", pad_bottom=PAD_BOTTOM) for f in scaled[(key, anim)]]
            strip = hstrip(placed, cell_w, cell_h).resize((out_cw * len(placed), out_ch), Image.LANCZOS)
            # palette-quantize: this flat art shrinks ~6× with no visible loss
            strip.quantize(colors=96, method=Image.FASTOCTREE, dither=Image.NONE).save(f"{OUT}/{key}/{anim}.png", optimize=True)
        print(f"  ✓ {key}: {sum(1 for a in ANIMS if (key,a) in scaled)} anims")

    with open(f"{OUT}/manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"cell {out_cw}x{out_ch} baseline {manifest['baseline']} -> {OUT}/manifest.json")


if __name__ == "__main__":
    main()
