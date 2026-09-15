#!/usr/bin/env python3
"""Generate Win95/PS1 low-fi Sync (Call Theater) glyphs.

Chunky nearest-neighbor RGBA, muddy purple palette (#6264A7-adjacent).
Abstract purple chat-bubble + small phone/handset hybrid — NO letter "T",
NOT Microsoft Fluent/Teams trademark. Unbranded anonymous corp.
Player-facing name: Sync. Folder stays assets/teams/ for Dev path stability.
Uses /workspace/.venv Pillow.

Outputs (assets/teams/):
  teams_{16,32,48}.png
  call_accept.png, call_decline.png
  call_mute.png, call_mute_off.png
  call_cam.png, call_cam_off.png
  call_share.png, call_hangup.png
  avatar_blank.png, avatar_caller.png
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)

TRANS = (0, 0, 0, 0)

# Muddy PS1 purple (Teams-adjacent but crunchy, not Fluent clean)
PURPLE = (0x5A, 0x58, 0x8E, 255)       # muddy #6264A7-adj
PURPLE_HI = (0x7A, 0x76, 0xB0, 255)
PURPLE_DK = (0x3A, 0x38, 0x68, 255)
PURPLE_EDGE = (0x28, 0x26, 0x48, 255)
WHITE = (0xF0, 0xF0, 0xF0, 255)
OFF_W = (0xC8, 0xC8, 0xD0, 255)
BLACK = (0x18, 0x18, 0x20, 255)
GREEN = (0x28, 0xA0, 0x38, 255)
GREEN_HI = (0x50, 0xC8, 0x58, 255)
GREEN_DK = (0x18, 0x68, 0x28, 255)
RED = (0xC0, 0x28, 0x28, 255)
RED_HI = (0xE0, 0x50, 0x50, 255)
RED_DK = (0x80, 0x18, 0x18, 255)
MIC = (0xE8, 0xE8, 0xF0, 255)
MIC_DK = (0x90, 0x90, 0xA0, 255)
CAM = (0xE0, 0xE0, 0xE8, 255)
CAM_DK = (0x70, 0x70, 0x80, 255)
CROSS = (0xE0, 0x30, 0x30, 255)
AVATAR_FACE = (0x6A, 0x68, 0x78, 255)
AVATAR_SIL = (0x40, 0x3E, 0x50, 255)
AVATAR_HI = (0x88, 0x86, 0x98, 255)
CALLER_BG = (0x4A, 0x6A, 0x8A, 255)   # flat initials-friendly
CALLER_HI = (0x6A, 0x8A, 0xAA, 255)
CALLER_DK = (0x2A, 0x4A, 0x6A, 255)
SHARE = (0xE8, 0xE8, 0xF0, 255)
SHARE_DK = (0x60, 0x60, 0x70, 255)


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


# --- Sync app icon: abstract purple chat-bubble + phone/handset (NO letter T) ---

TEAMS_MAP = {
    ".": TRANS,
    "E": PURPLE_EDGE,
    "D": PURPLE_DK,
    "P": PURPLE,
    "H": PURPLE_HI,
    "W": WHITE,
    "w": OFF_W,
    "B": BLACK,
}

# 16x16 — chat bubble + tiny handset cue; no lettermark
TEAMS_16 = [
    "EEEEEEEEEEEEEEEE",
    "EDDDDDDDDDDDDDDE",
    "EDPPHHHHHHHHPPDE",
    "EDPHWWWWWWWWWPDE",
    "EDPHW......WWPDE",
    "EDPHW......WwPDE",
    "EDPHWWWWWWWWwPDE",
    "EDPHWWWWWWW..PDE",
    "EDPPDWWW......DE",
    "EDPPPDW.......DE",
    "EDPPP.........DE",
    "EDPPP.W...W...DE",
    "EDPPP.WWWWW...DE",
    "EDPPP.W...W...DE",
    "EDDDDDDDDDDDDDDE",
    "EEEEEEEEEEEEEEEE",
]


def make_teams(size: int) -> Image.Image:
    """Procedural muddy purple tile with chat-bubble + handset (app icon)."""
    if size == 16:
        return sprite_to_image(TEAMS_16, TEAMS_MAP, 1)

    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    m = 1 if size <= 32 else 2
    # Outer edge + dark inset + purple fill
    for y in range(size):
        for x in range(size):
            if x < m or y < m or x >= size - m or y >= size - m:
                put(x, y, PURPLE_EDGE)
            elif x < m + 1 or y < m + 1 or x >= size - m - 1 or y >= size - m - 1:
                put(x, y, PURPLE_DK)
            else:
                put(x, y, PURPLE_HI if (x + y) % 5 == 0 else PURPLE)

    # Highlight strip top
    for x in range(m + 2, size - m - 2):
        put(x, m + 2, PURPLE_HI)

    # Chat bubble body (rounded rect, left-biased)
    bx0 = size // 6
    bx1 = size - size // 5
    by0 = size // 5
    by1 = size - size // 3
    rad = max(2, size // 10)
    for y in range(by0, by1 + 1):
        for x in range(bx0, bx1 + 1):
            # soft corner cuts
            if (x < bx0 + rad and y < by0 + rad and
                    (x - (bx0 + rad)) ** 2 + (y - (by0 + rad)) ** 2 > rad * rad):
                continue
            if (x > bx1 - rad and y < by0 + rad and
                    (x - (bx1 - rad)) ** 2 + (y - (by0 + rad)) ** 2 > rad * rad):
                continue
            if (x > bx1 - rad and y > by1 - rad and
                    (x - (bx1 - rad)) ** 2 + (y - (by1 - rad)) ** 2 > rad * rad):
                continue
            edge = (x == bx0 or y == by0 or x == bx1 or y == by1 or
                    (x <= bx0 + 1 and y <= by0 + rad) or
                    (x >= bx1 - 1 and y <= by0 + rad))
            put(x, y, OFF_W if edge else WHITE)

    # Speech-bubble tail (bottom-left notch)
    tail_x = bx0 + max(2, size // 12)
    for i in range(max(3, size // 8)):
        put(tail_x + i // 2, by1 + 1 + i, WHITE if i < 2 else OFF_W)
        put(tail_x - 1, by1 + 1 + i // 2, PURPLE_DK)

    # Small phone/handset hybrid (bottom-right, classic receiver silhouette)
    hx0 = size // 2 + size // 10
    hx1 = size - size // 6
    hy0 = size - size // 4
    hy1 = size - size // 6
    # curved handset: two earpieces + bridge
    for y in range(hy0, hy1 + 1):
        for x in range(hx0, hx1 + 1):
            put(x, y, WHITE if y > hy0 and y < hy1 else OFF_W)
    # earpiece bulbs
    for dy in range(-1, 2):
        for dx in range(-1, 2):
            put(hx0 + dx, hy0 + dy, WHITE)
            put(hx1 + dx, hy1 + dy, WHITE)
            put(hx0 + dx, hy1 + dy, OFF_W)
            put(hx1 + dx, hy0 + dy, OFF_W)
    # bridge dip (handset curve cue)
    mid = (hx0 + hx1) // 2
    for x in range(hx0 + 2, hx1 - 1):
        put(x, hy0 - 1, OFF_W)
        put(x, hy1 + 1, PURPLE_DK if abs(x - mid) < 2 else OFF_W)

    return img


# --- Call control glyphs (16x16 chunky) ---

CTRL_MAP = {
    ".": TRANS,
    "G": GREEN,
    "g": GREEN_HI,
    "d": GREEN_DK,
    "R": RED,
    "r": RED_HI,
    "e": RED_DK,
    "W": WHITE,
    "w": OFF_W,
    "M": MIC,
    "m": MIC_DK,
    "C": CAM,
    "c": CAM_DK,
    "X": CROSS,
    "B": BLACK,
    "S": SHARE,
    "s": SHARE_DK,
    "P": PURPLE,
    "D": PURPLE_DK,
}

ACCEPT_16 = [
    "................",
    "..............g.",
    ".............gG.",
    "............gGd.",
    "...........gGd..",
    ".g........gGd...",
    ".Gg......gGd....",
    ".dGg....gGd.....",
    "..dGg..gGd......",
    "...dGggGd.......",
    "....dGGd........",
    ".....dGd........",
    "......d.........",
    "................",
    "................",
    "................",
]

DECLINE_16 = [
    "................",
    ".rR..........Rr.",
    ".RrR........RrR.",
    "..RrR......RrR..",
    "...RrR....RrR...",
    "....RrR..RrR....",
    ".....RrRRrR.....",
    "......RRre......",
    "......eRRr......",
    ".....Rr..Rr.....",
    "....RrR..RrR....",
    "...RrR....RrR...",
    "..RrR......RrR..",
    ".RrR........RrR.",
    ".r............r.",
    "................",
]

MUTE_16 = [  # mic ON (unmuted glyph — open mic)
    "................",
    "......mmmm......",
    ".....mMMMMm.....",
    ".....mMMMMm.....",
    ".....mMMMMm.....",
    ".....mMMMMm.....",
    ".....mMMMMm.....",
    "....mmMMMMmm....",
    "...m..MMMM..m...",
    "...m........m...",
    "....mmmmmmmm....",
    "......mmmm......",
    "......mmmm......",
    ".....mmMMMMmm...",
    "....mmmmmmmmmm..",
    "................",
]

MUTE_OFF_16 = [  # muted = crossed
    "................",
    "......mmmm...X..",
    ".....mMMMMm.X...",
    ".....mMMMMmX....",
    ".....mMMMXm.....",
    ".....mMXmMm.....",
    ".....mXmMMm.....",
    "....mXmMMMmm....",
    "...mX.MMMM..m...",
    "...X........m...",
    "..X.mmmmmmmm....",
    ".X....mmmm......",
    "X.....mmmm......",
    ".....mmMMMMmm...",
    "....mmmmmmmmmm..",
    "................",
]

CAM_16 = [
    "................",
    "................",
    "..ccccccccccc...",
    "..cCCCCCCCCCc...",
    "..cC......CCc.c.",
    "..cC.CCCC.CCcCC.",
    "..cC.CCCC.CCcCc.",
    "..cC.CCCC.CCcc..",
    "..cC......CCc...",
    "..cCCCCCCCCCc...",
    "..ccccccccccc...",
    "................",
    "................",
    "................",
    "................",
    "................",
]

CAM_OFF_16 = [
    "................",
    ".............X..",
    "..ccccccccccX...",
    "..cCCCCCCCCX....",
    "..cC......Xc.c..",
    "..cC.CCCXcCCcCC.",
    "..cC.CCXc.CCcCc.",
    "..cC.CXc..CCcc..",
    "..cC.X....CCc...",
    "..cCXCCCCCCCc...",
    "..cXccccccccc...",
    ".X..............",
    "X...............",
    "................",
    "................",
    "................",
]

SHARE_16 = [
    "................",
    "......SS........",
    ".....SSSS.......",
    "....SSSSSS......",
    "...sSSSSSSs.....",
    "......ss........",
    "......ss...sss..",
    "..ssssssssssSs..",
    "..sSSSSSSSSSSs..",
    "..sS........Ss..",
    "..sS.ssssss.Ss..",
    "..sS.s....s.Ss..",
    "..sS.ssssss.Ss..",
    "..sSSSSSSSSSSs..",
    "..ssssssssssss..",
    "................",
]

HANGUP_16 = [
    "................",
    "................",
    "................",
    "..rr........rr..",
    ".rRRr......rRRr.",
    ".RrRRr....rRrRR.",
    "..RrRRrrrrRrRR..",
    "...RrRRRRRRRr...",
    "....RrRRRRRr....",
    ".....reeeer.....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
]


def make_avatar_blank(size: int = 32) -> Image.Image:
    """32x32 low-fi square silhouette for camera-off self."""
    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    for y in range(size):
        for x in range(size):
            if x == 0 or y == 0 or x == size - 1 or y == size - 1:
                put(x, y, PURPLE_EDGE)
            else:
                put(x, y, AVATAR_FACE if (x + y) % 3 else AVATAR_HI)

    # Head circle-ish
    cx, cy, r = size // 2, size // 3 + 1, size // 6
    for y in range(size):
        for x in range(size):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(x, y, AVATAR_SIL)
            elif (x - cx) ** 2 + (y - cy) ** 2 <= (r + 1) ** 2:
                put(x, y, BLACK)

    # Shoulders / torso trapezoid
    for y in range(size // 2 + 2, size - 2):
        t = (y - (size // 2 + 2)) / max(1, size - 4 - (size // 2 + 2))
        half = int(size // 5 + t * (size // 2 - 4))
        for x in range(cx - half, cx + half + 1):
            put(x, y, AVATAR_SIL)

    return img


def make_avatar_caller(size: int = 32) -> Image.Image:
    """32x32 generic caller square — flat color, initials-friendly."""
    img = Image.new("RGBA", (size, size), TRANS)
    px = img.load()

    def put(x: int, y: int, c: tuple) -> None:
        if 0 <= x < size and 0 <= y < size:
            px[x, y] = c

    for y in range(size):
        for x in range(size):
            if x == 0 or y == 0 or x == size - 1 or y == size - 1:
                put(x, y, CALLER_DK)
            elif y == 1 or x == 1:
                put(x, y, CALLER_HI)
            else:
                put(x, y, CALLER_BG)

    # Subtle head hint (still flat — room for initials overlay)
    cx, cy, r = size // 2, size // 2 - 2, size // 7
    for y in range(size):
        for x in range(size):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(x, y, CALLER_HI)

    return img


def main() -> None:
    for size in (16, 32, 48):
        save(f"teams_{size}.png", make_teams(size))

    save("call_accept.png", sprite_to_image(ACCEPT_16, CTRL_MAP, 1))
    save("call_decline.png", sprite_to_image(DECLINE_16, CTRL_MAP, 1))
    save("call_mute.png", sprite_to_image(MUTE_16, CTRL_MAP, 1))
    save("call_mute_off.png", sprite_to_image(MUTE_OFF_16, CTRL_MAP, 1))
    save("call_cam.png", sprite_to_image(CAM_16, CTRL_MAP, 1))
    save("call_cam_off.png", sprite_to_image(CAM_OFF_16, CTRL_MAP, 1))
    save("call_share.png", sprite_to_image(SHARE_16, CTRL_MAP, 1))
    save("call_hangup.png", sprite_to_image(HANGUP_16, CTRL_MAP, 1))
    save("avatar_blank.png", make_avatar_blank(32))
    save("avatar_caller.png", make_avatar_caller(32))


if __name__ == "__main__":
    main()
