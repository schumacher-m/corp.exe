#!/usr/bin/env python3
"""Generate Win95/PS1 low-fi Mail Theater glyphs.

Chunky nearest-neighbor RGBA. Blue/purple accent on classic gray.
Abstract envelope + blue accent — NOT a trademark mail-client logo.
Player-facing name: Mail. Folder stays assets/outlook/ for Dev path stability.
Unbranded anonymous corp. No Helix. Uses /workspace/.venv Pillow.

Outputs (assets/outlook/):
  outlook_{16,32,48}.png   — app / desktop / taskbar icon
  focused.png              — rail glyph (star/pin vibe)
  other.png                — rail glyph (folder/inbox overflow)
  new_mail.png             — ribbon New / compose glyph
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)

TRANS = (0, 0, 0, 0)

# Win95 face + parody Fluent blue/purple strip (sick OK green unused)
FACE = (0xC0, 0xC0, 0xC0, 255)          # #C0C0C0
FACE_HI = (0xF0, 0xF0, 0xF0, 255)       # bevel light
FACE_DK = (0x80, 0x80, 0x80, 255)       # #808080
FACE_EDGE = (0x40, 0x40, 0x40, 255)     # #404040

# Accent blue (Fluent-adjacent parody, muddy/crunchy)
BLUE = (0x28, 0x6C, 0xC8, 255)          # #286CC8
BLUE_HI = (0x58, 0x98, 0xE8, 255)       # #5898E8
BLUE_DK = (0x18, 0x48, 0x90, 255)       # #184890
BLUE_EDGE = (0x10, 0x30, 0x68, 255)     # #103068

# Accent purple strip (parody Fluent purple)
PURPLE = (0x78, 0x3C, 0xBC, 255)        # #783CBC (Jimbo-adj ok as strip)
PURPLE_HI = (0xA0, 0x64, 0xDC, 255)     # #A064DC
PURPLE_DK = (0x50, 0x30, 0x90, 255)     # #503090

WHITE = (0xF8, 0xF8, 0xF8, 255)
OFF_W = (0xE0, 0xE0, 0xE8, 255)
PAPER = (0xF0, 0xF0, 0xF4, 255)
PAPER_DK = (0xB8, 0xB8, 0xC0, 255)
BLACK = (0x18, 0x18, 0x20, 255)
AMBER = (0xE8, 0xA0, 0x28, 255)         # star tip
AMBER_DK = (0xA8, 0x70, 0x18, 255)
FOLDER = (0xD0, 0xB0, 0x48, 255)        # manila folder vibe
FOLDER_DK = (0x98, 0x78, 0x28, 255)
FOLDER_HI = (0xE8, 0xD0, 0x70, 255)


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


def save(name: str, img: Image.Image) -> None:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path} {img.size}")


# --- App icon: abstract envelope on blue/purple tile (NOT Outlook trademark) ---

OUTLOOK_MAP = {
    ".": TRANS,
    "E": BLUE_EDGE,
    "D": BLUE_DK,
    "B": BLUE,
    "H": BLUE_HI,
    "P": PURPLE,
    "p": PURPLE_HI,
    "q": PURPLE_DK,
    "W": WHITE,
    "w": OFF_W,
    "A": PAPER,
    "a": PAPER_DK,
    "K": BLACK,
    "F": FACE,
    "f": FACE_DK,
}

# 16x16 — chunky envelope with blue face + purple accent strip top
OUTLOOK_16 = [
    "EEEEEEEEEEEEEEEE",
    "EDDDDDDDDDDDDDDE",
    "EDBBBBBBBBBBBBDE",
    "EDBHpppppppppBDE",  # purple accent strip (parody Fluent)
    "EDBHAAAAAAAAABDE",
    "EDBHAWAAAAAWABDE",
    "EDBHAWAWAWAWABDE",
    "EDBHAWAAAAAWABDE",
    "EDBHAAAAAAAAABDE",
    "EDBHaaaaaaaaaBDE",
    "EDBHAAAAAAAAABDE",
    "EDBHaaaaaaaaaBDE",
    "EDBBBBBBBBBBBBDE",
    "EDDDDDDDDDDDDDDE",
    "EDDDDDDDDDDDDDDE",
    "EEEEEEEEEEEEEEEE",
]


def make_outlook(size: int) -> Image.Image:
    """Procedural blue tile + abstract envelope (app icon)."""
    if size == 16:
        return sprite_to_image(OUTLOOK_16, OUTLOOK_MAP, 1)

    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    m = 1 if size <= 32 else 2
    # Outer edge + dark inset + blue fill
    for y in range(size):
        for x in range(size):
            if x < m or y < m or x >= size - m or y >= size - m:
                put(x, y, BLUE_EDGE)
            elif x < m + 1 or y < m + 1 or x >= size - m - 1 or y >= size - m - 1:
                put(x, y, BLUE_DK)
            else:
                put(x, y, BLUE_HI if (x + y) % 5 == 0 else BLUE)

    # Purple accent strip near top (parody Fluent, chunky)
    strip_y0 = m + 2
    strip_h = max(2, size // 10)
    for y in range(strip_y0, strip_y0 + strip_h):
        for x in range(m + 2, size - m - 2):
            put(x, y, PURPLE_HI if y == strip_y0 else PURPLE)

    # Abstract envelope body (paper white rectangle)
    ex0 = size // 5
    ex1 = size - size // 5
    ey0 = strip_y0 + strip_h + max(1, size // 16)
    ey1 = size - size // 5
    for y in range(ey0, ey1 + 1):
        for x in range(ex0, ex1 + 1):
            if y == ey0 or x == ex0:
                put(x, y, WHITE)
            elif y == ey1 or x == ex1:
                put(x, y, PAPER_DK)
            else:
                put(x, y, PAPER)

    # Envelope V-flap (two diagonals meeting at center)
    mid = (ex0 + ex1) // 2
    flap_bottom = ey0 + max(4, (ey1 - ey0) // 2)
    for y in range(ey0, flap_bottom + 1):
        t = (y - ey0) / max(1, flap_bottom - ey0)
        left = int(ex0 + t * (mid - ex0))
        right = int(ex1 - t * (ex1 - mid))
        put(left, y, BLUE_DK)
        put(right, y, BLUE_DK)
        if left + 1 < right:
            put(left + 1, y, PAPER_DK)
            put(right - 1, y, PAPER_DK)

    # Tiny purple corner tick (accent cue, still abstract)
    for i in range(max(2, size // 16)):
        put(ex1 - 1 - i, ey1 - 1, PURPLE)
        put(ex1 - 1, ey1 - 1 - i, PURPLE)

    return img


# --- Rail / ribbon glyphs (16x16 chunky) ---

GLYPH_MAP = {
    ".": TRANS,
    "B": BLUE,
    "H": BLUE_HI,
    "D": BLUE_DK,
    "E": BLUE_EDGE,
    "P": PURPLE,
    "p": PURPLE_HI,
    "q": PURPLE_DK,
    "W": WHITE,
    "w": OFF_W,
    "A": PAPER,
    "a": PAPER_DK,
    "K": BLACK,
    "S": AMBER,       # star
    "s": AMBER_DK,
    "F": FOLDER,
    "f": FOLDER_DK,
    "h": FOLDER_HI,
    "G": FACE,
    "g": FACE_DK,
    "L": FACE_HI,
    "N": (0x20, 0x90, 0x40, 255),  # compose "new" green tip optional — prefer blue
}

# Focused: chunky star/pin vibe (16x16)
FOCUSED_16 = [
    "................",
    ".......Ss.......",
    "......SSSS......",
    ".....SSSSSS.....",
    "....sSSSSSSS....",
    ".SSSSSSSSSSSSSS.",
    "..SSSSSSSSSSSS..",
    "...SSSSSSSSSS...",
    "....SSSSSSSS....",
    "....SS.ss.SS....",
    "...SS..ss..SS...",
    "...S...ss...S...",
    "..S....ss....S..",
    ".......ss.......",
    ".......ss.......",
    "................",
]

# Other: manila folder / inbox overflow vibe
OTHER_16 = [
    "................",
    "..hh............",
    ".hFFhhhh........",
    ".FFFFFFFFFFFFF..",
    ".FhFFFFFFFFFFFf.",
    ".FhF........FFf.",
    ".FhF.AAAAAA.FFf.",
    ".FhF.AwwwwA.FFf.",
    ".FhF.AAAAAA.FFf.",
    ".FhF.AaaaaA.FFf.",
    ".FhF.AAAAAA.FFf.",
    ".FhFFFFFFFFFFFf.",
    ".FFFFFFFFFFFFFf.",
    "..ffffffffffff..",
    "................",
    "................",
]

# New mail: compose — blank paper + blue corner fold + purple +
NEW_MAIL_16 = [
    "................",
    "..AAAAAAAAAAA...",
    "..AWWWWWWWWWaD..",
    "..AWWWWWWWWWaBD.",
    "..AWWWWWWWWWaHB.",
    "..AWW..WWWWWaHB.",
    "..AWWWWWWWWWaHB.",
    "..AWW..WWWWWaHB.",
    "..AWWWWWWWWWaHB.",
    "..AWWWWWWWWWaHB.",
    "..AaaaaaaaaaaHB.",
    "...DDDDDDDDDBB..",
    "................",
    ".........pP.....",
    "........pPpP....",
    ".........pP.....",
]


def main() -> None:
    for size in (16, 32, 48):
        save(f"outlook_{size}.png", make_outlook(size))

    save("focused.png", sprite_to_image(FOCUSED_16, GLYPH_MAP, 1))
    save("other.png", sprite_to_image(OTHER_16, GLYPH_MAP, 1))
    save("new_mail.png", sprite_to_image(NEW_MAIL_16, GLYPH_MAP, 1))


if __name__ == "__main__":
    main()
