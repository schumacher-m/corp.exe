#!/usr/bin/env python3
"""Generate Win95-low-fi Tracker desktop icons: clipboard / ticket-board.

Chunky nearest-neighbor RGBA. Muddy amber #a89030 accent, beige paper.
No Jira trademark logo/lettermark. Unbranded ticket board.

Outputs: assets/icons/tracker_{16,32,48}.png
Uses /workspace/.venv Pillow.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ICONS = Path("/workspace/corp-html/assets/icons")
ICONS.mkdir(parents=True, exist_ok=True)

TRANS = (0, 0, 0, 0)

PAPER = (0xF0, 0xE8, 0xD0, 255)
PAPER_DK = (0xD8, 0xCC, 0xB0, 255)
PAPER_HI = (0xF8, 0xF4, 0xE8, 255)
EDGE = (0x60, 0x58, 0x48, 255)

CLIP_BODY = (0xA0, 0xA0, 0x98, 255)
CLIP_HI = (0xC8, 0xC8, 0xC0, 255)
CLIP_DK = (0x70, 0x70, 0x68, 255)

AMBER = (0xA8, 0x90, 0x30, 255)  # #a89030
AMBER_HI = (0xC8, 0xB0, 0x50, 255)
AMBER_DK = (0x78, 0x64, 0x20, 255)

TICKET_LINE = (0xB0, 0xA8, 0x90, 255)
TICKET_FILL = (0xE8, 0xE0, 0xC8, 255)


def make_tracker(size: int) -> Image.Image:
    """Clipboard + ticket board: beige paper, muddy amber clip/status dots."""
    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    m = max(1, size // 16)
    clip_h = max(3, size // 5)
    x0, y0 = m + 1, clip_h - max(1, m)
    x1, y1 = size - m - 2, size - m - 1

    for y in range(y0 + 1, y1):
        for x in range(x0 + 1, x1):
            put(x, y, PAPER if ((x + y) // 2) % 2 == 0 else PAPER_DK)

    for x in range(x0, x1 + 1):
        put(x, y0, EDGE)
        put(x, y1, EDGE)
    for y in range(y0, y1 + 1):
        put(x0, y, EDGE)
        put(x1, y, EDGE)

    for x in range(x0 + 1, x1):
        put(x, y0 + 1, PAPER_HI)
    for y in range(y0 + 1, y1):
        put(x0 + 1, y, PAPER_HI)

    row_top = y0 + max(3, size // 6)
    row_gap = max(3, size // 5)
    row_h = max(2, size // 8)
    n_rows = 3 if size >= 32 else 2
    for i in range(n_rows):
        ry = row_top + i * row_gap
        if ry + row_h >= y1 - 1:
            break
        tx0 = x0 + max(2, m + 1)
        tx1 = x1 - max(2, m + 1)
        for y in range(ry, ry + row_h + 1):
            for x in range(tx0, tx1 + 1):
                put(x, y, TICKET_FILL)
        for x in range(tx0, tx1 + 1):
            put(x, ry, TICKET_LINE)
            put(x, ry + row_h, TICKET_LINE)
        put(tx0, ry, EDGE)
        put(tx1, ry, EDGE)
        cx = tx0 + max(1, m)
        cy0 = ry + max(0, row_h // 2 - 1)
        chip = max(1, size // 16)
        for dy in range(chip + (1 if size >= 32 else 0)):
            for dx in range(chip + (1 if size >= 32 else 0)):
                c = AMBER_HI if dy == 0 else (AMBER_DK if dy == chip else AMBER)
                put(cx + dx, cy0 + dy, c)
        lx0 = cx + chip + max(2, m + 1)
        lx1 = tx1 - max(1, m)
        ly = ry + max(1, row_h // 2)
        for x in range(lx0, min(lx1, lx0 + max(4, size // 3))):
            put(x, ly, TICKET_LINE)
        if size >= 32 and row_h >= 3:
            for x in range(lx0, min(lx1, lx0 + max(3, size // 4))):
                put(x, ly + 1, PAPER_DK)

    cw = max(5, size // 3)
    cx0 = (size - cw) // 2
    cx1 = cx0 + cw - 1
    cy0 = max(0, m - 1)
    cy1 = y0 + max(1, m)

    for y in range(cy0, cy1 + 1):
        for x in range(cx0, cx1 + 1):
            if y == cy0:
                put(x, y, CLIP_HI)
            elif y == cy1:
                put(x, y, CLIP_DK)
            else:
                put(x, y, CLIP_BODY)
    for x in range(cx0, cx1 + 1):
        put(x, cy0, EDGE)
        put(x, cy1, EDGE)
    for y in range(cy0, cy1 + 1):
        put(cx0, y, EDGE)
        put(cx1, y, EDGE)

    midy = (cy0 + cy1) // 2
    for x in range(cx0 + 1, cx1):
        put(x, midy, AMBER)
        if size >= 32:
            put(x, midy - 1, AMBER_HI)
            put(x, midy + 1, AMBER_DK)
    put(cx0 + max(1, cw // 4), midy, AMBER_HI)
    put(cx1 - max(1, cw // 4), midy, AMBER_HI)

    if size >= 32:
        hy = y0 + max(2, m)
        bar_h = max(2, size // 12)
        for y in range(hy, hy + bar_h):
            for x in range(x0 + 2, x1 - 1):
                if y == hy:
                    put(x, y, AMBER_HI)
                elif y == hy + bar_h - 1:
                    put(x, y, AMBER_DK)
                else:
                    put(x, y, AMBER)

    return img


def main() -> None:
    for size in (16, 32, 48):
        im = make_tracker(size)
        path = ICONS / f"tracker_{size}.png"
        im.save(path, "PNG", optimize=True)
        print(f"wrote {path} {im.size}")


if __name__ == "__main__":
    main()
