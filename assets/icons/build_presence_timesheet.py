#!/usr/bin/env python3
"""Generate Win95/PS1 low-fi icons: Presence (Jimbo Mouse Jiggler) + Timesheet Lock.

Chunky nearest-neighbor RGBA, limited palette. Original designs — not Clippy / MS logos.
Unbranded (no product marks). Uses /workspace/.venv Pillow.

Outputs:
  assets/jimbo/jiggler_{16,32}.png   (also mirrored to assets/presence/)
  assets/icons/timesheet_xls_{16,32,48}.png  (also mirrored to assets/timesheet/)
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/corp-html/assets")
JIMBO = ROOT / "jimbo"
ICONS = ROOT / "icons"
PRESENCE = ROOT / "presence"
TIMESHEET = ROOT / "timesheet"

for d in (JIMBO, ICONS, PRESENCE, TIMESHEET):
    d.mkdir(parents=True, exist_ok=True)

TRANS = (0, 0, 0, 0)

# Jimbo-adjacent purple (matches assets/jimbo blob accents)
PURPLE = (0x78, 0x3C, 0xBC, 255)
PURPLE_HI = (0xA0, 0x64, 0xDC, 255)
PURPLE_DK = (0x50, 0x30, 0x90, 255)
CURSOR_W = (0xFF, 0xFF, 0xFF, 255)
CURSOR_OUT = (0x20, 0x18, 0x40, 255)
ARROW = (0xE8, 0xA0, 0x28, 255)
ARROW_HI = (0xFF, 0xD0, 0x60, 255)

# Generic spreadsheet (beige sheet + green header — not MS trademark)
SHEET = (0xF0, 0xE8, 0xD0, 255)
SHEET_DK = (0xD0, 0xC4, 0xA8, 255)
SHEET_EDGE = (0x80, 0x78, 0x60, 255)
HEADER = (0x30, 0xA0, 0x50, 255)
HEADER_HI = (0x50, 0xC0, 0x70, 255)
HEADER_DK = (0x20, 0x70, 0x38, 255)
GRID = (0xB0, 0xA8, 0x90, 255)
HOUR_GLASS = (0xC0, 0xA0, 0x40, 255)
HOUR_FRAME = (0x40, 0x40, 0x40, 255)
HOUR_GLASS_HI = (0xE8, 0xD0, 0x70, 255)


def sprite_to_image(rows: list[str], char_map: dict[str, tuple], scale: int = 1) -> Image.Image:
    w = max(len(r) for r in rows)
    rows = [row.ljust(w, ".")[:w] for row in rows]
    h = len(rows)
    img = Image.new("RGBA", (w, h), TRANS)
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            px[x, y] = char_map.get(ch, TRANS)
    if scale != 1:
        img = img.resize((w * scale, h * scale), Image.NEAREST)
    return img


JIGGLER_MAP = {
    ".": TRANS,
    "P": PURPLE,
    "H": PURPLE_HI,
    "D": PURPLE_DK,
    "W": CURSOR_W,
    "O": CURSOR_OUT,
    "A": ARROW,
    "a": ARROW_HI,
}

# 16x16 tray/start glyph — arrow cursor + purple core + L/R jiggle ticks
JIGGLER_16 = [
    "O...............",
    "OWO.............",
    "OWWWO...........",
    "OWWWWWO.........",
    "OWWWWWWWO.......",
    "OWWWWHHHWO......",
    "OWWWWHPPPWO.....",
    "OWWWWHPPPWO.....",
    "OWWWO.HPPD......",
    "OWWO..DPPD.Aa...",
    "OWO....DD..aA...",
    "OO..........Aa..",
    "..AaA...........",
    ".AaA.....AaA....",
    "Aa........Aa....",
    "................",
]


def make_jiggler_32() -> Image.Image:
    """32x32: Win95 arrow cursor + purple Jimbo energy blob + amber jiggle sparks."""
    img = Image.new("RGBA", (32, 32), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < 32 and 0 <= y < 32:
            px[x, y] = c

    # Arrow cursor (outline + white fill)
    for y in range(20):
        width = y + 1 if y < 12 else max(1, 20 - y)
        if y >= 12:
            # stem: narrower shaft after tip
            width = 4 if y < 18 else 3
            x0 = 2
        else:
            x0 = 2
        for x in range(width):
            put(x0 + x, 2 + y, CURSOR_OUT)
        for x in range(1, max(1, width - 1)):
            put(x0 + x, 2 + y, CURSOR_W)

    # Rebuild cursor more carefully (classic Win95 shape)
    img = Image.new("RGBA", (32, 32), TRANS)
    px = img.load()

    cursor = [
        "O",
        "OW",
        "OWW",
        "OWWW",
        "OWWWW",
        "OWWWWW",
        "OWWWWWW",
        "OWWWWWWW",
        "OWWWWWWWW",
        "OWWWWWWWWW",
        "OWWWWWWWWWW",
        "OWWWWWWWO",
        "OWWWWO",
        "OWWOWO",
        "OWO.OWO",
        "OO...OWO",
        "......OWO",
        ".......OWO",
        "........O",
    ]
    for y, row in enumerate(cursor):
        for x, ch in enumerate(row):
            if ch == "O":
                put(2 + x, 1 + y, CURSOR_OUT)
            elif ch == "W":
                put(2 + x, 1 + y, CURSOR_W)

    # Purple blob overlapping mid-cursor (Jimbo energy)
    for y in range(10, 18):
        for x in range(10, 18):
            dx, dy = x - 13.5, y - 13.5
            if dx * dx + dy * dy <= 16:
                put(x, y, PURPLE_DK if dx * dx + dy * dy > 12 else PURPLE)
    for y in range(11, 14):
        for x in range(11, 17):
            put(x, y, PURPLE_HI)
    put(12, 12, CURSOR_W)
    put(15, 12, CURSOR_W)
    put(12, 13, CURSOR_OUT)
    put(15, 13, CURSOR_OUT)
    for x in range(12, 16):
        put(x, 15, ARROW)

    # Amber jiggle sparks / arrows bottom
    def spark(cx: int, cy: int) -> None:
        put(cx, cy, ARROW_HI)
        put(cx - 1, cy, ARROW)
        put(cx + 1, cy, ARROW)
        put(cx, cy - 1, ARROW)
        put(cx, cy + 1, ARROW)

    spark(8, 26)
    spark(22, 26)
    # small chevrons suggesting left-right jiggle
    for x, y in [(4, 24), (5, 23), (5, 25), (6, 24), (3, 24)]:
        put(x, y, ARROW if (x + y) % 2 else ARROW_HI)
    for x, y in [(27, 24), (26, 23), (26, 25), (25, 24), (28, 24)]:
        put(x, y, ARROW if (x + y) % 2 else ARROW_HI)

    return img


def make_timesheet(size: int) -> Image.Image:
    """Procedural Win95-ish .xls desktop icon (beige sheet + green bar + hourglass)."""
    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    m = max(1, size // 16)
    x0, y0 = m, m
    x1, y1 = size - m - 1, size - m - 1
    fold = max(3, size // 5)

    for x in range(x0, x1 + 1):
        put(x, y0, SHEET_EDGE)
        put(x, y1, SHEET_EDGE)
    for y in range(y0, y1 + 1):
        put(x0, y, SHEET_EDGE)
        put(x1, y, SHEET_EDGE)

    for y in range(y0 + 1, y1):
        for x in range(x0 + 1, x1):
            if x > x1 - fold and y < y0 + fold:
                continue
            put(x, y, SHEET if ((x + y) // 2) % 2 == 0 else SHEET_DK)

    for i in range(fold):
        for j in range(fold - i):
            edge = j == fold - i - 1 or i == 0
            put(x1 - j, y0 + i, SHEET_EDGE if edge else SHEET_DK)

    hy0 = y0 + 1
    hy1 = y0 + max(2, size // 6)
    for y in range(hy0, hy1 + 1):
        xmax = x1 - (fold if y < y0 + fold else 0)
        for x in range(x0 + 1, xmax):
            if y == hy0:
                put(x, y, HEADER_HI)
            elif y == hy1:
                put(x, y, HEADER_DK)
            else:
                put(x, y, HEADER)

    step = max(2, size // 8)
    for y in range(hy1 + 2, y1 - 1, step):
        for x in range(x0 + 2, x1 - 1):
            if not (x > x1 - fold and y < y0 + fold):
                put(x, y, GRID)
    for x in range(x0 + 2 + step, x1 - 1, step):
        for y in range(hy1 + 1, y1 - 1):
            if not (x > x1 - fold and y < y0 + fold):
                put(x, y, GRID)

    hx = x1 - max(5, size // 4)
    hy = y1 - max(6, size // 3)
    hw = max(4, size // 5)
    hh = max(5, size // 4)
    mid = hy + hh // 2
    for x in range(hx, hx + hw):
        put(x, hy, HOUR_FRAME)
        put(x, hy + hh - 1, HOUR_FRAME)
    for y in range(hy + 1, mid + 1):
        t = (y - hy) / max(1, mid - hy)
        inset = int(t * (hw // 2 - 1))
        put(hx + inset, y, HOUR_FRAME)
        put(hx + hw - 1 - inset, y, HOUR_FRAME)
        for x in range(hx + inset + 1, hx + hw - 1 - inset):
            put(x, y, HOUR_GLASS if y < mid - 1 else HOUR_GLASS_HI)
    for y in range(mid, hy + hh - 1):
        t = (y - mid) / max(1, hy + hh - 1 - mid)
        inset = int((1 - t) * (hw // 2 - 1))
        put(hx + inset, y, HOUR_FRAME)
        put(hx + hw - 1 - inset, y, HOUR_FRAME)
        for x in range(hx + inset + 1, hx + hw - 1 - inset):
            put(x, y, HOUR_GLASS_HI if y > mid + 1 else HOUR_GLASS)

    return img


def save(path: Path, img: Image.Image) -> None:
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path} {img.size}")


def main() -> None:
    img16 = sprite_to_image(JIGGLER_16, JIGGLER_MAP, 1)
    img32 = make_jiggler_32()
    for folder in (JIMBO, PRESENCE):
        save(folder / "jiggler_16.png", img16)
        save(folder / "jiggler_32.png", img32)

    for size in (16, 32, 48):
        im = make_timesheet(size)
        for folder in (ICONS, TIMESHEET):
            save(folder / f"timesheet_xls_{size}.png", im)


if __name__ == "__main__":
    main()
