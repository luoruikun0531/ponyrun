#!/usr/bin/env python3
"""Generate the 7 animation sheets for each of the 4 reference ponies.

Strategy: img2img RESTYLE. Take the already-validated cream animation sheet
(fixed poses + 2x3 / 2x2 grid + green bg) and redraw every frame as pony X,
keeping pose/layout identical and only changing the character's colour, mane and
scarf/bow. This keeps all 4 ponies' frames pixel-aligned with the same slicer
and stylistically consistent. Dev-time only; runtime ships the PNGs.

Usage:
    python scripts/gen/restyle_ponies.py            # all missing
    python scripts/gen/restyle_ponies.py white run  # one pony / anim
    python scripts/gen/restyle_ponies.py --force
"""
import os
import sys

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-preview")
RAW = "assets_raw"
ANIMS = ["idle", "run", "sprint", "trip", "cry", "taunt", "hit"]

PONIES = {
    "white":  "a CREAM-WHITE pony with a soft LIGHT-BLUE scarf and light-brown mane and tail",
    "brown":  "a warm TAN-BROWN pony with a RUST-ORANGE scarf and dark-brown mane and tail",
    "gray":   "a soft GRAY pony with a GREEN bandana scarf and dark-gray mane and tail",
    "yellow": "a pale BUTTER-YELLOW pony with a small PURPLE BOW on its head (no scarf) and light-brown mane and tail",
}

ASPECT = {  # must match the cream sheet that we are restyling
    "idle": "1:1", "run": "3:2", "sprint": "3:2", "trip": "3:2",
    "cry": "1:1", "taunt": "1:1", "hit": "1:1",
}


def restyle(pony_key, anim):
    from google import genai
    from google.genai import types
    from PIL import Image

    desc = PONIES[pony_key]
    prompt = (
        "The FIRST image is a sprite sheet (a grid of animation frames of a pony on a flat "
        "green background). The SECOND image shows the target pony. Redraw the FIRST sheet so "
        f"every frame depicts {desc}. KEEP EVERYTHING ELSE IDENTICAL to the first sheet: the exact "
        "same poses, the same number of frames, the same grid layout and frame positions, the same "
        "scale, the same thick dark-brown outline cute kawaii style, and the same flat solid "
        "chroma-key green RGB(0,200,80) background filling the frame including between cells. Only "
        "the pony's body colour, mane/tail colour and its scarf/bow change to match the target. "
        "Keep the scarf/bow consistent in every frame. No text, no grid lines, no shadows. The pony contains no green."
    )
    client = genai.Client()
    resp = client.models.generate_content(
        model=MODEL,
        contents=[prompt, Image.open(f"{RAW}/{anim}.jpg"), Image.open(f"{RAW}/base_{pony_key}.jpg")],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=ASPECT[anim], image_size="2K"),
        ),
    )
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) and part.inline_data.data:
            out = f"{RAW}/{pony_key}_{anim}.jpg"
            with open(out, "wb") as f:
                f.write(part.inline_data.data)
            return out
    return None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    force = "--force" in sys.argv
    keys = [a for a in args if a in PONIES] or list(PONIES.keys())
    anims = [a for a in args if a in ANIMS] or ANIMS
    for key in keys:
        for anim in anims:
            out = f"{RAW}/{key}_{anim}.jpg"
            if os.path.exists(out) and not force:
                print(f"· {key}/{anim} exists"); continue
            print(f"→ {key}/{anim}", flush=True)
            try:
                saved = restyle(key, anim)
                print(f"  ✓ {saved}" if saved else f"  ✗ {key}/{anim}: no image")
            except Exception as e:  # noqa: BLE001
                print(f"  ✗ {key}/{anim}: {e}")


if __name__ == "__main__":
    main()
