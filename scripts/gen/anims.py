"""Single source of truth for every pony animation.

Used by BOTH generate_all.py (dev-time Gemini generation) and build_assets.py
(slice raw sheets -> packed strips + runtime manifest). Editing a prompt or a
frame count here propagates to both. This file documents the exact art pipeline
required by goal.md section 3 (assets pre-generated, runtime is pure playback).

`ref`:
  base    -> assets_raw/base_green.jpg   (four-legged cream pony, side, idle)
  upright -> assets_raw/upright_test.jpg (bipedal upright running pose)

Pose rule from goal.md: normal run = cute BIPEDAL (two hind legs); sprint =
real four-legged GALLOP. The contrast is a deliberate signature gag.
"""

STYLE = (
    "Flat SOLID chroma-key green background RGB(0,200,80) filling the whole frame "
    "including the gaps between cells. Keep the exact cute style of the reference: "
    "thick dark-brown outline, soft cream-white flat body, tiny dot eyes, kawaii "
    "Korean hand-drawn look. No grid lines, no numbers, no text, no drop shadows. "
    "The pony must contain no green."
)

GRID = (
    "Make a 2D game SPRITE SHEET: a clean grid of EXACTLY {n} frames, {rows} rows "
    "by {cols} columns, equal cells, even gaps, generous margins so the character "
    "never touches a cell edge, read left-to-right then top-to-bottom. Identical "
    "character, identical scale, identical ground baseline in every frame; only the "
    "pose changes frame to frame. "
)

ANIMS = {
    "idle": {
        "grid": (2, 2), "frames": 4, "fps": 4, "loop": True,
        "ref": "base", "aspect": "1:1",
        "prompt": "the same cream pony standing on FOUR legs facing RIGHT in a calm "
                  "IDLE breathing loop: only tiny motion between frames — a small "
                  "up/down breathing bob, a little ear and tail twitch, an occasional "
                  "blink. Very subtle, gentle, looping.",
    },
    "run": {
        "grid": (2, 3), "frames": 6, "fps": 12, "loop": True,
        "ref": "upright", "aspect": "3:2",
        "prompt": "a BIPEDAL run loop: in EVERY frame the pony stays UPRIGHT on only "
                  "its TWO hind legs like a cartoon mascot, facing RIGHT, tiny front "
                  "hooves swinging like arms, hind legs cycling through a running "
                  "stride with a slight body bob. Never on four legs.",
    },
    "sprint": {
        "grid": (2, 3), "frames": 6, "fps": 18, "loop": True,
        "ref": "base", "aspect": "3:2",
        "prompt": "an INTENSE FOUR-LEGGED GALLOP at full speed: body stretched long, "
                  "low and horizontal, all four legs reaching far front-and-back, "
                  "ears back, leaning hard forward, manga full-speed run cycle. "
                  "A real galloping horse, powerful and fast. Facing RIGHT.",
    },
    "trip": {
        "grid": (2, 3), "frames": 6, "fps": 14, "loop": False,
        "ref": "upright", "aspect": "3:2",
        "prompt": "a one-shot comedic TRIP AND FALL sequence read in order: frame 1 "
                  "running upright, frame 2 stumbling forward off-balance, frame 3 "
                  "tripping with arms flailing, frame 4 tumbling head-over-heels, "
                  "frame 5 crashing onto the ground, frame 6 sprawled flat on its "
                  "back with legs up and dizzy spiral eyes. Exaggerated and funny.",
    },
    "cry": {
        "grid": (2, 2), "frames": 4, "fps": 6, "loop": True,
        "ref": "base", "aspect": "1:1",
        "prompt": "the cream pony sitting down CRYING dramatically in a loop: scrunched "
                  "teary eyes, wide open wailing mouth, two waterfall streams of tears "
                  "shooting out, little body shaking, hooves up. Over-the-top boohoo "
                  "sobbing. Facing the viewer / three-quarter, very expressive.",
    },
    "taunt": {
        "grid": (2, 2), "frames": 4, "fps": 8, "loop": True,
        "ref": "upright", "aspect": "1:1",
        "prompt": "the cream pony UPRIGHT on two legs TAUNTING and showing off in a "
                  "loop: smug grin, sticking its tongue out, a cheeky victory wiggle / "
                  "little dance, hooves gesturing. Cocky and gloating. Facing RIGHT.",
    },
    "hit": {
        "grid": (2, 2), "frames": 4, "fps": 12, "loop": False,
        "ref": "base", "aspect": "1:1",
        "prompt": "a one-shot getting-BLASTED sequence read in order: frame 1 standing "
                  "surprised wide-eyed, frame 2 struck by an impact with a flash, "
                  "frame 3 launched flying backward tumbling with swirly dizzy eyes, "
                  "frame 4 landing comically flattened and dazed. Exaggerated cartoon "
                  "explosion knockback. Facing RIGHT.",
    },
}

REFS = {
    "base": "assets_raw/base_green.jpg",
    "upright": "assets_raw/upright_test.jpg",
}


def build_prompt(name: str) -> str:
    a = ANIMS[name]
    rows, cols = a["grid"]
    grid = GRID.format(n=a["frames"], rows=rows, cols=cols)
    return (
        "Use the reference image as the EXACT character (same cream pony, same face, "
        "same proportions, same style). " + grid + "CONTENT: " + a["prompt"] + " " + STYLE
    )
