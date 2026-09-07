#!/usr/bin/env python3
"""Generate Win95 Jimbo AI-assistant chrome icons (original purple blob mascot).

Not Clippy — chunky nearest-neighbor pixel blob with antenna bobble.
Uses /workspace/.venv Pillow.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT = Path("/workspace/corp-html/assets/jimbo")
OUT.mkdir(parents=True, exist_ok=True)

BODY = (0x78, 0x3C, 0xBC, 255)       # #783CBC
BODY_HI = (0xA0, 0x64, 0xDC, 255)    # #A064DC
BODY_DK = (0x50, 0x30, 0x90, 255)    # #503090
EYE = (0xFF, 0xFF, 0xFF, 255)
PUPIL = (0x20, 0x18, 0x40, 255)
SMILE = (0xE8, 0xA0, 0x28, 255)
ANTENNA = (0x50, 0x30, 0x90, 255)
BOBBLE = (0xF0, 0x80, 0xB0, 255)
BOBBLE_HI = (0xFF, 0xC0, 0xD8, 255)
TRANS = (0, 0, 0, 0)

# 16x16 — 2x2 white eyes with pupils, amber U-smile, pink bobble antenna
SPRITE_16 = [
    "......oO......",
    "......OA......",
    "......A.......",
    "....HHHH......",
    "...HBBBBH.....",
    "..HBBBBBBH....",
    "..HBEEBEEBH...",
    ".HBBEPBEPBBH..",
    ".HBBBBBBBBBH..",
    ".HBBSBBSBBH..",
    "..HBBSSSSBH...",
    "..HBBBBBBBH...",
    "...HBBBBBH....",
    "....HDDDH.....",
    ".....DDD......",
    "..............",
]

SPRITE_16 = [row.ljust(16, ".")[:16] for row in SPRITE_16][:16]

CHAR_MAP = {
    ".": TRANS,
    "B": BODY,
    "H": BODY_HI,
    "D": BODY_DK,
    "E": EYE,
    "P": PUPIL,
    "S": SMILE,
    "A": ANTENNA,
    "O": BOBBLE,
    "o": BOBBLE_HI,
}


def sprite_to_image(rows: list[str], scale: int = 1) -> Image.Image:
    h, w = len(rows), len(rows[0])
    img = Image.new("RGBA", (w, h), TRANS)
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            px[x, y] = CHAR_MAP.get(ch, TRANS)
    if scale != 1:
        img = img.resize((w * scale, h * scale), Image.NEAREST)
    return img


def make_toolbar_20() -> Image.Image:
    base = sprite_to_image(SPRITE_16, 1)
    canvas = Image.new("RGBA", (20, 20), TRANS)
    canvas.paste(base, (2, 2), base)
    return canvas


def make_banner_96x64() -> Image.Image:
    w, h = 96, 64
    img = Image.new("RGBA", (w, h), TRANS)
    px = img.load()
    top, mid, bot = (0x50, 0x30, 0x90), (0x78, 0x3C, 0xBC), (0xA0, 0x64, 0xDC)
    edge = (0x40, 0x28, 0x70)
    for y in range(h):
        t = y / (h - 1)
        if t < 0.5:
            u = t * 2
            r = int(top[0] + (mid[0] - top[0]) * u)
            g = int(top[1] + (mid[1] - top[1]) * u)
            b = int(top[2] + (mid[2] - top[2]) * u)
        else:
            u = (t - 0.5) * 2
            r = int(mid[0] + (bot[0] - mid[0]) * u)
            g = int(mid[1] + (bot[1] - mid[1]) * u)
            b = int(mid[2] + (bot[2] - mid[2]) * u)
        if (y // 4) % 2:
            r, g, b = max(0, r - 12), max(0, g - 8), max(0, b - 6)
        for x in range(w):
            if x in (0, w - 1) or y in (0, h - 1):
                px[x, y] = (*edge, 255)
            elif ((x // 2) + (y // 2)) % 2 == 0:
                px[x, y] = (min(255, r + 8), min(255, g + 6), min(255, b + 10), 255)
            else:
                px[x, y] = (r, g, b, 255)
    mascot = sprite_to_image(SPRITE_16, 3)
    img.paste(mascot, ((w - 48) // 2, (h - 48) // 2 + 2), mascot)
    for sx, sy in [(8, 10), (10, 8), (86, 12), (88, 10), (12, 52), (84, 50)]:
        px[sx, sy] = SMILE
        if sx + 1 < w:
            px[sx + 1, sy] = SMILE
    return img


def save(name: str, img: Image.Image) -> None:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path} {img.size}")


def main() -> None:
    save("jimbo_16.png", sprite_to_image(SPRITE_16, 1))
    save("jimbo_32.png", sprite_to_image(SPRITE_16, 2))
    save("jimbo_48.png", sprite_to_image(SPRITE_16, 3))
    save("jimbo_toolbar.png", make_toolbar_20())
    save("jimbo_banner.png", make_banner_96x64())


if __name__ == "__main__":
    main()
