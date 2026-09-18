#!/usr/bin/env python3
"""CORP-TOWER-01 graybox PS1 GLB kits — plaza / lobby / elevator / props.

Readable grim: bright vertex colors (~0.85–1.0) × olive/concrete textures
(avg RGB ~100–140) so Lambert multiply does not crush to near-black.
Multi-write when ground vs facade/wall need different albedos.
Empty node names/positions locked for Dev hooks (TOWER_HOOKS.md).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ps1_assets import (  # noqa: E402
    MOD,
    PALETTE,
    ROOT,
    TEX,
    assert_readable_albedo,
    box_mesh,
    checker,
    dither_fill,
    merge_meshes,
    rgb01,
    save_tex,
    write_glb,
    write_glb_multi,
)

# Bright VCs on textured surfaces (multiply stays readable)
VC_WHITE = (0.96, 0.94, 0.88)  # ground / slabs
VC_FACADE = (0.90, 0.88, 0.82)  # tower mass / door surround
VC_WALL = (0.88, 0.86, 0.80)  # lobby walls / ceiling
VC_PROP = (0.92, 0.90, 0.84)  # props on plastic/gray mats
VC_DESK = (0.85, 0.82, 0.74)  # reception / desk tops
VC_DOOR = (0.78, 0.76, 0.70)  # door panels (slightly darker accent)
VC_METAL = (0.88, 0.88, 0.86)  # handles / rails

# Accents stay saturated (small LEDs / buttons / fluo)
FLUO = rgb01("fluorescent")
PAPER = rgb01("paper")
AMBER = rgb01("amber")
SICK = rgb01("sick")
BLOOD = rgb01("blood")
TEAL = rgb01("teal")
INK = (0.55, 0.52, 0.45)  # lifted ink blocks (was near-black crush)


def _tex(name: str) -> Path | None:
    p = TEX / f"{name}.png"
    return p if p.exists() else None


def write_tower_textures() -> dict[str, Path]:
    """64×64 Bayer/checker olive-gray/concrete grim — NOT washed white, NOT near-black."""
    import numpy as np
    from PIL import Image, ImageDraw
    out: dict[str, Path] = {}

    # Plaza concrete — checker similar to floor (avg ~100–140)
    out["plaza_concrete"] = save_tex(
        "plaza_concrete",
        checker(64, 64, (132, 126, 108), (112, 108, 92), 8),
    )

    # Tower facade — Bayer dither cooler concrete
    out["tower_facade"] = save_tex(
        "tower_facade",
        dither_fill(64, 64, (122, 118, 102), (104, 100, 86)),
    )

    # Lobby wall — Bayer olive-gray plaster
    out["lobby_wall"] = save_tex(
        "lobby_wall",
        dither_fill(64, 64, (120, 114, 100), (106, 102, 88)),
    )

    # Ensure farm floor exists / readable (reuse for plaza/lobby slabs)
    floor = TEX / "floor.png"
    if not floor.exists():
        save_tex(
            "floor",
            checker(64, 64, PALETTE["floor"], PALETTE["floor_tile"], 8),
        )
    out["floor"] = floor

    # Lobby variants — seams/scuffs + cooler wall (TOWER-03)
    out["lobby_floor_b"] = save_tex(
        "lobby_floor_b",
        checker(64, 64, (128, 122, 104), (108, 100, 86), 4),  # finer seams
    )
    # scuff overlay
    sc = np.array(Image.open(out["lobby_floor_b"]).convert("RGB"), dtype=np.uint8, copy=True)
    rng = np.random.default_rng(42)
    for _ in range(80):
        x, y = int(rng.integers(0, 64)), int(rng.integers(0, 64))
        sc[y, x] = np.clip(sc[y, x].astype(int) - rng.integers(15, 35), 40, 255)
    Image.fromarray(sc).save(out["lobby_floor_b"])

    out["lobby_wall_b"] = save_tex(
        "lobby_wall_b",
        dither_fill(64, 64, (112, 118, 120), (98, 104, 108)),  # cooler fluo tint
    )

    # HR poster readable plate
    poster = Image.new("RGB", (64, 64), (150, 145, 125))
    d = ImageDraw.Draw(poster)
    d.rectangle([2, 2, 61, 14], fill=(40, 110, 120))  # teal header
    for i, y in enumerate((20, 28, 36, 44, 52)):
        d.rectangle([6, y, 58, y + 4], fill=(70, 68, 60) if i % 2 == 0 else (90, 88, 78))
    out["hr_poster"] = save_tex("hr_poster", poster)

    # Wet floor yellow + puddle
    yel = checker(32, 32, (220, 190, 40), (200, 160, 30), 4)
    out["wet_cone"] = save_tex("wet_cone", yel)
    pud = Image.new("RGB", (32, 32), (90, 110, 130))
    pd = ImageDraw.Draw(pud)
    pd.ellipse([4, 6, 28, 26], fill=(120, 150, 170), outline=(160, 190, 210))
    pd.ellipse([10, 10, 18, 16], fill=(180, 200, 220))  # highlight
    out["wet_puddle"] = save_tex("wet_puddle", pud)

    # Assert ground albedos (refuse ship if avg < 100)
    for key in ("floor", "plaza_concrete", "lobby_wall", "tower_facade", "lobby_floor_b", "lobby_wall_b", "hr_poster"):
        avg = assert_readable_albedo(out[key], min_avg=100.0, label=f"{key}.png")
        print(f"  albedo {key}.png avg={avg:.1f}")

    return out


def build_tower_plaza(tex: dict[str, Path]) -> tuple[int, list[dict]]:
    """Brutalist Silent Hill office mass — heavy slabs, slot windows, obvious door.
    Empties: plaza_spawn, tower_entrance (floor Y locked).
    """
    ground = []
    # Wide plaza slab with seam strips
    ground.append(box_mesh(22.0, 0.14, 22.0, 0.0, -0.07, 0.0, VC_WHITE))
    # Approach seams / curbs toward entrance
    ground.append(box_mesh(4.0, 0.08, 10.0, 0.0, 0.02, 1.5, VC_WHITE))
    ground.append(box_mesh(12.0, 0.2, 0.35, 0.0, 0.05, -3.0, VC_FACADE))
    ground.append(box_mesh(0.35, 0.2, 8.0, -3.0, 0.05, 1.0, VC_FACADE))
    ground.append(box_mesh(0.35, 0.2, 8.0, 3.0, 0.05, 1.0, VC_FACADE))
    # Concrete planters (blocks, not greenery)
    for x in (-7.5, 7.5):
        ground.append(box_mesh(1.8, 0.7, 1.8, x, 0.35, 3.5, VC_DESK))
        ground.append(box_mesh(1.4, 0.15, 1.4, x, 0.75, 3.5, VC_DOOR))

    facade = []
    # Monolithic base (wide, tall, oppressive) — sits at -Z
    facade.append(box_mesh(14.0, 12.0, 10.0, 0.0, 6.0, -9.5, VC_FACADE))
    # Mid slab setback
    facade.append(box_mesh(12.5, 10.0, 9.0, 0.0, 17.0, -9.5, VC_FACADE))
    # Crown slab (heavy, not glass)
    facade.append(box_mesh(11.0, 8.0, 8.0, 0.0, 26.0, -9.5, VC_FACADE))
    # Top lip / parapet
    facade.append(box_mesh(12.0, 1.2, 8.5, 0.0, 30.6, -9.5, VC_DOOR))
    # Side buttresses
    facade.append(box_mesh(1.5, 14.0, 2.0, -7.5, 7.0, -6.5, VC_FACADE))
    facade.append(box_mesh(1.5, 14.0, 2.0, 7.5, 7.0, -6.5, VC_FACADE))

    # Recessed horizontal slot windows on +Z face (rows)
    for yi, y in enumerate((3.5, 5.5, 7.5, 9.5, 14.5, 16.5, 18.5, 23.5, 25.5)):
        for x in (-4.0, -1.3, 1.3, 4.0):
            facade.append(box_mesh(1.0, 0.55, 0.35, x, y, -4.45, VC_DOOR))

    # Deep entrance portal (obvious from spawn) — facing +Z
    # Outer portal frame
    facade.append(box_mesh(5.5, 0.8, 1.2, 0.0, 3.5, -4.2, VC_FACADE))  # lintel
    facade.append(box_mesh(0.9, 3.4, 1.2, -2.6, 1.7, -4.2, VC_FACADE))  # L jamb
    facade.append(box_mesh(0.9, 3.4, 1.2, 2.6, 1.7, -4.2, VC_FACADE))  # R jamb
    # Inner recess walls
    facade.append(box_mesh(4.2, 3.2, 1.5, 0.0, 1.6, -5.3, VC_FACADE))
    # Double doors
    facade.append(box_mesh(1.5, 2.6, 0.18, -0.85, 1.3, -4.35, VC_DOOR))
    facade.append(box_mesh(1.5, 2.6, 0.18, 0.85, 1.3, -4.35, VC_DOOR))
    # Handles
    facade.append(box_mesh(0.1, 0.35, 0.1, -0.15, 1.25, -4.2, VC_METAL))
    facade.append(box_mesh(0.1, 0.35, 0.1, 0.15, 1.25, -4.2, VC_METAL))
    # HelixStack plaque stub above door
    facade.append(box_mesh(2.2, 0.45, 0.12, 0.0, 3.0, -4.05, VC_METAL))

    empties = [
        {"name": "plaza_spawn", "translation": [0.0, 0.0, 7.0]},
        {"name": "tower_entrance", "translation": [0.0, 0.0, -4.4]},
    ]

    g_pos, g_uv, g_col, g_idx = merge_meshes(ground)
    f_pos, f_uv, f_col, f_idx = merge_meshes(facade)
    tris = write_glb_multi(
        MOD / "tower_plaza.glb",
        [
            {
                "pos": g_pos,
                "uv": g_uv,
                "col": g_col,
                "idx": g_idx,
                "texture": tex["floor"],
                "mat": "plaza_ground",
            },
            {
                "pos": f_pos,
                "uv": f_uv,
                "col": f_col,
                "idx": f_idx,
                "texture": tex["tower_facade"],
                "mat": "tower_facade",
            },
        ],
        "tower_plaza",
        empty_nodes=empties,
    )
    return tris, empties


def build_tower_lobby(tex: dict[str, Path]) -> tuple[int, list[dict]]:
    """Low oppressive brutalist atrium. Empties floor-Y locked for floor props."""
    floors = []
    floors.append(box_mesh(12.0, 0.12, 14.0, 0.0, -0.06, 0.0, VC_WHITE))
    # Center aisle seam toward elevator
    floors.append(box_mesh(2.4, 0.04, 12.0, 0.0, 0.02, 0.0, VC_FACADE))

    walls = []
    # Low oppressive ceiling (~2.7m)
    walls.append(box_mesh(12.0, 0.18, 14.0, 0.0, 2.75, 0.0, VC_WALL))
    # Thick outer walls
    walls.append(box_mesh(12.0, 2.9, 0.35, 0.0, 1.4, -7.0, VC_WALL))
    walls.append(box_mesh(12.0, 2.9, 0.35, 0.0, 1.4, 7.0, VC_WALL))
    walls.append(box_mesh(0.35, 2.9, 14.0, -6.0, 1.4, 0.0, VC_WALL))
    walls.append(box_mesh(0.35, 2.9, 14.0, 6.0, 1.4, 0.0, VC_WALL))
    # Corner pilasters
    for x, z in ((-5.5, -6.5), (5.5, -6.5), (-5.5, 6.5), (5.5, 6.5)):
        walls.append(box_mesh(0.55, 2.7, 0.55, x, 1.35, z, VC_FACADE))
    # Entrance recess (+Z)
    walls.append(box_mesh(3.2, 2.5, 0.5, 0.0, 1.25, 6.7, VC_FACADE))
    walls.append(box_mesh(0.4, 2.5, 0.8, -1.8, 1.25, 6.5, VC_FACADE))
    walls.append(box_mesh(0.4, 2.5, 0.8, 1.8, 1.25, 6.5, VC_FACADE))
    # Elevator bank recess (-Z) — heavy lintel
    walls.append(box_mesh(3.0, 0.5, 0.6, 0.0, 2.3, -6.55, VC_FACADE))
    walls.append(box_mesh(2.4, 2.4, 0.5, 0.0, 1.2, -6.65, VC_FACADE))
    walls.append(box_mesh(1.5, 2.1, 0.12, 0.0, 1.05, -6.35, VC_DOOR))
    # Security desk landmark (near empty) — heavy concrete
    walls.append(box_mesh(2.8, 1.15, 0.9, 2.5, 0.55, 1.5, VC_DESK))
    walls.append(box_mesh(2.8, 0.12, 1.0, 2.5, 1.15, 1.5, VC_DESK))
    # Side benches (clear of center aisle)
    walls.append(box_mesh(0.5, 0.45, 2.5, -5.2, 0.22, -0.5, VC_DESK))
    walls.append(box_mesh(0.5, 0.45, 2.5, 5.2, 0.22, -3.0, VC_DESK))

    fluo = []
    for z in (-4.5, -1.0, 2.5, 5.5):
        fluo.append(box_mesh(7.0, 0.05, 0.28, 0.0, 2.65, z, FLUO))

    empties = [
        {"name": "lobby_spawn", "translation": [0.0, 0.0, 5.5]},
        {"name": "badge_reader", "translation": [0.0, 0.0, -3.8], "rotation": [0.0, 0.0, 0.0, 1.0]},
        {"name": "turnstile", "translation": [0.0, 0.0, -3.8], "rotation": [0.0, 0.0, 0.0, 1.0]},
        {"name": "coffee_machine", "translation": [-5.2, 0.0, -2.5]},
        {"name": "security_desk", "translation": [2.5, 0.0, 1.5]},
        {"name": "security_guard", "translation": [3.55, 0.0, 1.5], "rotation": [0.0, -0.7071067811865475, 0.0, 0.7071067811865476]},
        {"name": "hr_poster", "translation": [-5.7, 1.6, 0.5], "rotation": [0.0, 0.7071067811865475, 0.0, 0.7071067811865476]},
        {"name": "wet_floor", "translation": [-2.0, 0.0, 2.5]},
        {"name": "elevator_call", "translation": [1.4, 1.3, -6.4]},
    ]

    fl_pos, fl_uv, fl_col, fl_idx = merge_meshes(floors)
    w_pos, w_uv, w_col, w_idx = merge_meshes(walls)
    fu_pos, fu_uv, fu_col, fu_idx = merge_meshes(fluo)

    fluo_tex = _tex("fluorescent") or tex["lobby_wall"]
    tris = write_glb_multi(
        MOD / "tower_lobby.glb",
        [
            {
                "pos": fl_pos,
                "uv": fl_uv,
                "col": fl_col,
                "idx": fl_idx,
                "texture": tex.get("lobby_floor_b") or tex["floor"],
                "mat": "lobby_floor",
            },
            {
                "pos": w_pos,
                "uv": w_uv,
                "col": w_col,
                "idx": w_idx,
                "texture": tex.get("lobby_wall_b") or tex["lobby_wall"],
                "mat": "lobby_wall",
            },
            {
                "pos": fu_pos,
                "uv": fu_uv,
                "col": fu_col,
                "idx": fu_idx,
                "texture": fluo_tex,
                "mat": "lobby_fluo",
            },
        ],
        "tower_lobby",
        empty_nodes=empties,
    )
    return tris, empties


def build_elevator_car(tex: dict[str, Path]) -> tuple[int, list[dict]]:
    """Small car interior + button / door empties."""
    parts = []
    # Floor / ceiling
    parts.append(box_mesh(1.6, 0.08, 1.8, 0.0, 0.04, 0.0, VC_WHITE))
    parts.append(box_mesh(1.6, 0.08, 1.8, 0.0, 2.36, 0.0, VC_WALL))
    # Walls (-Z back, ±X); +Z is door opening
    parts.append(box_mesh(1.6, 2.4, 0.08, 0.0, 1.2, -0.9, VC_WALL))
    parts.append(box_mesh(0.08, 2.4, 1.8, -0.8, 1.2, 0.0, VC_WALL))
    parts.append(box_mesh(0.08, 2.4, 1.8, 0.8, 1.2, 0.0, VC_WALL))
    # Door jambs (+Z) — heavier brutalist frame
    parts.append(box_mesh(0.28, 2.3, 0.12, -0.72, 1.15, 0.9, VC_DOOR))
    parts.append(box_mesh(0.28, 2.3, 0.12, 0.72, 1.15, 0.9, VC_DOOR))
    parts.append(box_mesh(1.6, 0.22, 0.12, 0.0, 2.25, 0.9, VC_DOOR))
    # Closed door slab
    parts.append(box_mesh(1.15, 2.0, 0.08, 0.0, 1.05, 0.88, VC_DOOR))
    # Concrete bumper rail
    parts.append(box_mesh(1.5, 0.12, 0.08, 0.0, 0.35, -0.82, VC_FACADE))
    # Handrail
    parts.append(box_mesh(1.4, 0.04, 0.04, 0.0, 0.95, -0.82, VC_METAL))
    # Button panel plate on +X wall
    parts.append(box_mesh(0.06, 0.55, 0.28, 0.74, 1.25, -0.2, VC_PROP))
    for y, c in ((1.45, BLOOD), (1.25, SICK), (1.05, AMBER)):
        parts.append(box_mesh(0.04, 0.08, 0.08, 0.72, y, -0.2, c))

    empties = [
        {"name": "elevator_interior", "translation": [0.0, 0.0, 0.0]},
        {"name": "btn_floor_player", "translation": [0.7, 1.25, -0.2]},
        {"name": "btn_floor_wrong_1", "translation": [0.7, 1.45, -0.2]},
        {"name": "btn_floor_wrong_2", "translation": [0.7, 1.05, -0.2]},
        {"name": "elevator_door", "translation": [0.0, 1.05, 0.9]},
        {"name": "elevator_panel", "translation": [0.78, 1.25, -0.2], "rotation": [0.0, -0.7071067811865475, 0.0, 0.7071067811865476]},
    ]
    pos, uv, col, idx = merge_meshes(parts)
    # Use lobby_wall / plaza_concrete — plastic.png avg~79 is too dark for car shell
    car_tex = tex.get("lobby_wall") or tex["plaza_concrete"]
    tris = write_glb(
        MOD / "elevator_car.glb",
        pos,
        uv,
        col,
        idx,
        car_tex,
        "elevator_car",
        empty_nodes=empties,
    )
    return tris, empties


def build_prop_badge_reader(tex: dict[str, Path]) -> int:
    """DEPRECATED visual — use prop_turnstile @ badge_reader. Tiny stub kept for fallback."""
    parts = [box_mesh(0.05, 0.05, 0.05, 0.0, 0.02, 0.0, (0.5, 0.5, 0.5))]
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_badge_reader.glb",
        pos,
        uv,
        col,
        idx,
        tex["tower_facade"],
        "prop_badge_reader",
    )


def build_prop_coffee(tex: dict[str, Path]) -> int:
    """Coffee machine block."""
    parts = []
    parts.append(box_mesh(0.45, 1.1, 0.4, 0.0, 0.55, 0.0, VC_PROP))
    parts.append(box_mesh(0.35, 0.25, 0.15, 0.0, 0.95, 0.12, VC_FACADE))
    parts.append(box_mesh(0.2, 0.08, 0.2, 0.0, 0.45, 0.15, VC_DOOR))  # drip tray
    parts.append(box_mesh(0.12, 0.15, 0.12, 0.0, 0.55, 0.18, VC_DESK))  # cup niche
    parts.append(box_mesh(0.08, 0.08, 0.04, 0.12, 0.85, 0.2, AMBER))  # dial
    parts.append(box_mesh(0.06, 0.06, 0.03, -0.12, 0.85, 0.2, BLOOD))  # button
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_coffee.glb",
        pos,
        uv,
        col,
        idx,
        tex["tower_facade"],
        "prop_coffee",
    )


def build_prop_security_desk(tex: dict[str, Path]) -> int:
    """L-desk block."""
    parts = []
    # Main desk top + riser
    parts.append(box_mesh(1.8, 0.08, 0.7, 0.0, 1.0, 0.0, VC_DESK))
    parts.append(box_mesh(1.8, 1.0, 0.12, 0.0, 0.5, -0.29, VC_DESK))
    # L return
    parts.append(box_mesh(0.7, 0.08, 1.2, 0.55, 1.0, 0.55, VC_DESK))
    parts.append(box_mesh(0.12, 1.0, 1.2, 0.84, 0.5, 0.55, VC_DESK))
    # Monitor stub + papers
    parts.append(box_mesh(0.35, 0.3, 0.08, -0.3, 1.25, -0.1, VC_PROP))
    parts.append(box_mesh(0.25, 0.02, 0.2, 0.2, 1.05, 0.1, PAPER))
    pos, uv, col, idx = merge_meshes(parts)
    # desk.png avg~43 is too dark — use plaza_concrete
    return write_glb(
        MOD / "prop_security_desk.glb",
        pos,
        uv,
        col,
        idx,
        tex["plaza_concrete"],
        "prop_security_desk",
    )


def build_prop_hr_poster(tex: dict[str, Path]) -> int:
    """Large wall HR poster. Local +Z = into room (readable face).
    Mount with empty yaw so +Z = wall normal into lobby.
    """
    parts = []
    # Board in XY, thin +Z face
    parts.append(box_mesh(1.4, 1.8, 0.06, 0.0, 0.0, 0.0, PAPER))
    parts.append(box_mesh(1.5, 0.08, 0.08, 0.0, 0.9, 0.02, VC_METAL))
    parts.append(box_mesh(1.5, 0.08, 0.08, 0.0, -0.9, 0.02, VC_METAL))
    parts.append(box_mesh(0.08, 1.8, 0.08, -0.72, 0.0, 0.02, VC_METAL))
    parts.append(box_mesh(0.08, 1.8, 0.08, 0.72, 0.0, 0.02, VC_METAL))
    parts.append(box_mesh(1.2, 0.28, 0.04, 0.0, 0.65, 0.05, TEAL))
    parts.append(box_mesh(1.15, 0.12, 0.03, 0.0, 0.3, 0.05, INK))
    parts.append(box_mesh(1.15, 0.12, 0.03, 0.0, 0.05, 0.05, INK))
    parts.append(box_mesh(1.15, 0.12, 0.03, 0.0, -0.2, 0.05, INK))
    parts.append(box_mesh(1.15, 0.12, 0.03, 0.0, -0.45, 0.05, INK))
    pos, uv, col, idx = merge_meshes(parts)
    tex_path = tex.get("hr_poster") or _tex("paper") or tex["plaza_concrete"]
    return write_glb(
        MOD / "prop_hr_poster.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "prop_hr_poster",
    )


def build_prop_elevator_panel(tex: dict[str, Path]) -> int:
    """Flat panel; local +Z = into car (readable buttons). Flush on wall."""
    parts = []
    # Plate in XY, thin Z — sits flush when +Z faces into car
    parts.append(box_mesh(0.22, 0.55, 0.04, 0.0, 0.0, 0.0, VC_PROP))
    parts.append(box_mesh(0.18, 0.5, 0.02, 0.0, 0.0, 0.025, VC_DOOR))
    parts.append(box_mesh(0.1, 0.1, 0.04, 0.0, 0.15, 0.04, SICK))
    parts.append(box_mesh(0.1, 0.1, 0.04, 0.0, 0.0, 0.04, AMBER))
    parts.append(box_mesh(0.1, 0.1, 0.04, 0.0, -0.15, 0.04, VC_METAL))
    parts.append(box_mesh(0.08, 0.05, 0.03, 0.0, -0.22, 0.04, BLOOD))
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_elevator_panel.glb",
        pos,
        uv,
        col,
        idx,
        tex["tower_facade"],
        "prop_elevator_panel",
    )


def build_prop_security_guard(tex: dict[str, Path]) -> int:
    """Tall Guard — origin at feet. Place via security_guard empty (behind desk).
    Local +Z = facing direction (empty yaw aims +Z at aisle / player).
    No baked desk offset — empty pose owns placement.
    """
    GUARD = (0.42, 0.45, 0.52)
    SKIN = (0.78, 0.65, 0.54)
    parts = []
    # Legs (feet at y=0)
    parts.append(box_mesh(0.14, 0.7, 0.14, -0.1, 0.35, 0.05, GUARD))
    parts.append(box_mesh(0.14, 0.7, 0.14, 0.1, 0.35, 0.05, GUARD))
    # Torso (above desk height ~1.15)
    parts.append(box_mesh(0.42, 0.65, 0.28, 0.0, 1.05, 0.05, GUARD))
    # Head
    parts.append(box_mesh(0.28, 0.3, 0.28, 0.0, 1.55, 0.05, SKIN))
    # Cap + brim toward +Z (face)
    parts.append(box_mesh(0.32, 0.1, 0.32, 0.0, 1.75, 0.05, GUARD))
    parts.append(box_mesh(0.34, 0.06, 0.14, 0.0, 1.7, 0.2, VC_METAL))
    # Arms
    parts.append(box_mesh(0.55, 0.12, 0.12, 0.0, 1.15, 0.08, GUARD))
    # Eyes on +Z face
    parts.append(box_mesh(0.05, 0.05, 0.04, -0.07, 1.58, 0.2, (0.95, 0.92, 0.7)))
    parts.append(box_mesh(0.05, 0.05, 0.04, 0.07, 1.58, 0.2, (0.95, 0.92, 0.7)))
    parts.append(box_mesh(0.08, 0.12, 0.08, 0.22, 1.3, 0.05, VC_METAL))
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_security_guard.glb",
        pos,
        uv,
        col,
        idx,
        tex["tower_facade"],
        "prop_security_guard",
    )


def build_prop_wet_floor(tex: dict[str, Path]) -> int:
    """Yellow A-frame wet-floor cone + shiny puddle (floor Y)."""
    YEL = (0.95, 0.82, 0.25)
    YEL_DK = (0.75, 0.6, 0.15)
    PUD = (0.55, 0.7, 0.8)
    PUD_HI = (0.75, 0.88, 0.95)
    parts = []
    # A-frame: two panels leaning
    parts.append(box_mesh(0.55, 0.7, 0.06, 0.0, 0.4, -0.12, YEL))
    parts.append(box_mesh(0.55, 0.7, 0.06, 0.0, 0.4, 0.12, YEL))
    # Top hinge bar
    parts.append(box_mesh(0.5, 0.06, 0.2, 0.0, 0.75, 0.0, YEL_DK))
    # Caution stripe blocks
    parts.append(box_mesh(0.4, 0.12, 0.04, 0.0, 0.5, -0.16, YEL_DK))
    parts.append(box_mesh(0.4, 0.12, 0.04, 0.0, 0.5, 0.16, YEL_DK))
    # Feet
    parts.append(box_mesh(0.5, 0.04, 0.08, 0.0, 0.02, -0.28, YEL_DK))
    parts.append(box_mesh(0.5, 0.04, 0.08, 0.0, 0.02, 0.28, YEL_DK))
    # Shiny puddle (flat ellipse approx via thin boxes)
    parts.append(box_mesh(1.2, 0.02, 0.9, 0.15, 0.01, 0.0, PUD))
    parts.append(box_mesh(0.7, 0.025, 0.5, 0.25, 0.015, 0.05, PUD_HI))
    parts.append(box_mesh(0.25, 0.03, 0.15, 0.35, 0.02, -0.1, (0.9, 0.95, 1.0)))
    pos, uv, col, idx = merge_meshes(parts)
    # Prefer wet_cone; puddle tint via VC
    tex_path = tex.get("wet_cone") or tex["plaza_concrete"]
    return write_glb(
        MOD / "prop_wet_floor.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "prop_wet_floor",
    )



def build_prop_turnstile(tex: dict[str, Path]) -> int:
    """Waist-high corporate turnstile + card nub. Local +Z = approach direction.
    Arms span ±X blocking aisle until badge.
    """
    METAL = (0.55, 0.55, 0.58)
    METAL_DK = (0.35, 0.35, 0.38)
    YEL = (0.9, 0.75, 0.2)
    parts = []
    # Side posts
    parts.append(box_mesh(0.12, 1.05, 0.12, -0.55, 0.52, 0.0, METAL))
    parts.append(box_mesh(0.12, 1.05, 0.12, 0.55, 0.52, 0.0, METAL))
    # Top bar
    parts.append(box_mesh(1.2, 0.08, 0.1, 0.0, 1.05, 0.0, METAL_DK))
    # Tripod / barrier arms (horizontal, block +Z approach)
    parts.append(box_mesh(0.9, 0.06, 0.06, 0.0, 0.75, 0.0, METAL))
    parts.append(box_mesh(0.06, 0.06, 0.45, 0.0, 0.75, 0.2, METAL))  # arm toward approach
    parts.append(box_mesh(0.06, 0.06, 0.35, 0.0, 0.75, -0.15, METAL))
    # Base plates
    parts.append(box_mesh(0.28, 0.04, 0.28, -0.55, 0.02, 0.0, METAL_DK))
    parts.append(box_mesh(0.28, 0.04, 0.28, 0.55, 0.02, 0.0, METAL_DK))
    # Card reader nub on right post (approach side)
    parts.append(box_mesh(0.14, 0.22, 0.1, 0.55, 0.85, 0.12, METAL_DK))
    parts.append(box_mesh(0.08, 0.1, 0.04, 0.55, 0.88, 0.18, YEL))  # LED / slot
    parts.append(box_mesh(0.06, 0.04, 0.03, 0.55, 0.78, 0.18, (0.3, 0.85, 0.4)))  # green ready
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_turnstile.glb",
        pos,
        uv,
        col,
        idx,
        tex["tower_facade"],
        "prop_turnstile",
    )



def update_manifest(
    counts: dict[str, int],
    anchors: dict[str, dict[str, list[float]]],
) -> None:
    man_path = ROOT / "manifest.json"
    man = json.loads(man_path.read_text()) if man_path.exists() else {}

    models = set(man.get("models", []))
    for key in counts:
        models.add(key)
    man["models"] = sorted(models)

    tri = man.get("triangleCounts", {})
    for k, v in counts.items():
        tri[k] = v
    man["triangleCounts"] = dict(sorted(tri.items()))

    anc = man.setdefault("anchors", {})
    for k, v in anchors.items():
        anc[k] = v
    man["anchors"] = dict(sorted(anc.items()))

    man_path.write_text(json.dumps(man, indent=2) + "\n")
    print("manifest.json updated")


def main() -> None:
    MOD.mkdir(parents=True, exist_ok=True)
    TEX.mkdir(parents=True, exist_ok=True)
    print("CORP-TOWER-03.2 turnstile + Guard kits…")

    tex = write_tower_textures()

    # Extra ground assert (plaza/lobby slabs use floor.png)
    assert_readable_albedo(tex["floor"], min_avg=100.0, label="plaza/lobby ground floor.png")
    assert_readable_albedo(
        tex["plaza_concrete"], min_avg=100.0, label="plaza_concrete.png"
    )

    t_plaza, e_plaza = build_tower_plaza(tex)
    t_lobby, e_lobby = build_tower_lobby(tex)
    t_car, e_car = build_elevator_car(tex)
    t_badge = build_prop_badge_reader(tex)
    t_coffee = build_prop_coffee(tex)
    t_desk = build_prop_security_desk(tex)
    t_guard = build_prop_security_guard(tex)
    t_poster = build_prop_hr_poster(tex)
    t_wet = build_prop_wet_floor(tex)
    t_turn = build_prop_turnstile(tex)
    t_panel = build_prop_elevator_panel(tex)

    counts = {
        "assets/models/tower_plaza.glb": t_plaza,
        "assets/models/tower_lobby.glb": t_lobby,
        "assets/models/elevator_car.glb": t_car,
        "assets/models/prop_badge_reader.glb": t_badge,
        "assets/models/prop_coffee.glb": t_coffee,
        "assets/models/prop_security_desk.glb": t_desk,
        "assets/models/prop_security_guard.glb": t_guard,
        "assets/models/prop_hr_poster.glb": t_poster,
        "assets/models/prop_wet_floor.glb": t_wet,
        "assets/models/prop_turnstile.glb": t_turn,
        "assets/models/prop_elevator_panel.glb": t_panel,
    }
    anchors = {
        "assets/models/tower_plaza.glb": {
            n["name"]: list(n["translation"]) for n in e_plaza
        },
        "assets/models/tower_lobby.glb": {
            n["name"]: list(n["translation"]) for n in e_lobby
        },
        "assets/models/elevator_car.glb": {
            n["name"]: list(n["translation"]) for n in e_car
        },
    }
    update_manifest(counts, anchors)

    print("triangle counts:", json.dumps(counts, indent=2))
    for name, t in counts.items():
        budget = 900 if "tower_plaza" in name else (500 if "tower_" in name or "elevator_car" in name else (200 if "prop_" in name else 80))
        if t > budget:
            print(f"WARNING: {name} {t} > {budget} tris")
    print("done")


if __name__ == "__main__":
    main()
