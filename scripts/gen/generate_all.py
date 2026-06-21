#!/usr/bin/env python3
"""Dev-time art generation. Generates every pony animation sheet with Gemini
(Nano Banana Pro), using the user's concept art as the style anchor.

This runs at BUILD TIME ONLY. The shipped app never calls any API — it just
plays the packed PNG strips. See goal.md section 3.

Usage:
    python scripts/gen/generate_all.py            # generate all that are missing
    python scripts/gen/generate_all.py run sprint # only these
    python scripts/gen/generate_all.py --force    # regenerate everything

Needs GEMINI_API_KEY or GOOGLE_API_KEY in the environment.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from anims import ANIMS, REFS, build_prompt  # noqa: E402

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-preview")
RAW_DIR = "assets_raw"


def generate(name: str):
    from google import genai
    from google.genai import types
    from PIL import Image

    a = ANIMS[name]
    ref_path = REFS[a["ref"]]
    prompt = build_prompt(name)
    client = genai.Client()
    resp = client.models.generate_content(
        model=MODEL,
        contents=[prompt, Image.open(ref_path)],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=a["aspect"], image_size="2K"),
        ),
    )
    parts = resp.candidates[0].content.parts
    for part in parts:
        if getattr(part, "inline_data", None) and part.inline_data.data:
            out = os.path.join(RAW_DIR, f"{name}.jpg")
            with open(out, "wb") as f:
                f.write(part.inline_data.data)
            return out
    return None


def main():
    os.makedirs(RAW_DIR, exist_ok=True)
    argv = [x for x in sys.argv[1:] if not x.startswith("-")]
    force = "--force" in sys.argv
    names = argv or list(ANIMS.keys())
    for name in names:
        out = os.path.join(RAW_DIR, f"{name}.jpg")
        if os.path.exists(out) and not force:
            print(f"· {name}: exists, skip ({out})")
            continue
        print(f"→ generating {name} ...", flush=True)
        try:
            saved = generate(name)
            print(f"  ✓ {saved}" if saved else f"  ✗ {name}: no image returned")
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ {name}: {e}")


if __name__ == "__main__":
    main()
