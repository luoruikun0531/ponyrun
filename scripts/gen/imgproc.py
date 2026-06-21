"""Dev-time image processing for Line Pony sprite assets.

Takes raw Gemini output (cream pony on a flat chroma-green background) and turns
it into clean, alpha-cut, evenly-framed sprite-sheet strips ready for PixiJS.

Pipeline per image:
  green-key (border-connected flood) -> despill -> alpha -> [slice columns]
  -> autocrop each frame -> paste onto a fixed cell (translate only, no rescale)
  -> horizontal strip PNG + frame metadata.

Pure Pillow + numpy + scipy. Runs only at build time; the app ships the PNGs.
"""
from __future__ import annotations
import numpy as np
from PIL import Image
from scipy import ndimage


def load_rgb(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")


def key_green(img: Image.Image, grow: int = 1) -> Image.Image:
    """Remove a flat chroma-green background, returning RGBA.

    Uses green-dominance to find background pixels, keeps only the
    border-connected region (so any non-green interior stays opaque), despills
    green fringe, and grows the cut by `grow` px to eat the anti-aliased halo.
    """
    arr = np.array(img).astype(np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    # Green-dominant background mask. Cream body (r≈g≈b high) and dark outline
    # (all low) are NOT green-dominant, so they survive.
    green = (g > r + 25) & (g > b + 25) & (g > 80)

    # Keep only background connected to the image border.
    labels, n = ndimage.label(green)
    if n:
        border_ids = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
        border_ids.discard(0)
        bg = np.isin(labels, list(border_ids)) if border_ids else np.zeros_like(green)
    else:
        bg = np.zeros_like(green)

    if grow > 0:
        bg = ndimage.binary_dilation(bg, iterations=grow)

    # Despill: wherever green channel exceeds the other two, clamp it down.
    maxrb = np.maximum(r, b)
    spill = g > maxrb
    g = np.where(spill, maxrb, g)
    arr[..., 1] = g

    rgba = np.dstack([arr.astype(np.uint8), np.full(r.shape, 255, np.uint8)])
    rgba[bg, 3] = 0
    return Image.fromarray(rgba, "RGBA")


def alpha_bbox(img: Image.Image, thresh: int = 8):
    a = np.array(img.split()[-1])
    ys, xs = np.where(a > thresh)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def autocrop(img: Image.Image) -> Image.Image:
    bb = alpha_bbox(img)
    return img.crop(bb) if bb else img


def slice_columns(img: Image.Image, n: int):
    """Split an N-frame horizontal sheet into N equal-width columns."""
    w, h = img.size
    cw = w / n
    return [img.crop((round(i * cw), 0, round((i + 1) * cw), h)) for i in range(n)]


def grid_slice(img: Image.Image, rows: int, cols: int):
    """Split a sheet into rows*cols equal cells, returned row-major."""
    w, h = img.size
    cw, ch = w / cols, h / rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cells.append(img.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch))))
    return cells


def place_on_cell(frame: Image.Image, cell_w: int, cell_h: int,
                  scale: float = 1.0, anchor: str = "bottom", pad_bottom: int = 0) -> Image.Image:
    """Paste an autocropped frame onto a fixed transparent cell.

    Translate-only by default (scale=1.0) so motion/scale set by the model is
    preserved. `anchor='bottom'` keeps feet on a common ground line; horizontal
    centering keeps the body steady.
    """
    f = autocrop(frame)
    if scale != 1.0:
        f = f.resize((max(1, round(f.width * scale)), max(1, round(f.height * scale))), Image.LANCZOS)
    cell = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
    x = (cell_w - f.width) // 2
    if anchor == "bottom":
        y = cell_h - f.height - pad_bottom
    elif anchor == "center":
        y = (cell_h - f.height) // 2
    else:
        y = 0
    cell.alpha_composite(f, (x, max(0, y)))
    return cell


def hstrip(frames, cell_w: int, cell_h: int) -> Image.Image:
    """Pack equal-size cell frames into one horizontal strip."""
    strip = Image.new("RGBA", (cell_w * len(frames), cell_h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        strip.alpha_composite(f, (i * cell_w, 0))
    return strip
