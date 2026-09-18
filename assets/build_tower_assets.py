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

    # Assert ground albedos (refuse ship if avg < 100)
    for key in ("floor", "plaza_concrete", "lobby_wall", "tower_facade"):
        avg = assert_readable_albedo(out[key], min_avg=100.0, label=f"{key}.png")
        print(f"  albedo {key}.png avg={avg:.1f}")

    return out


def build_tower_plaza(tex: dict[str, Path]) -> tuple[int, list[dict]]:
    """Flat plaza + blocky tower mass + doors. Empties: plaza_spawn, tower_entrance."""
    ground = []
    # Plaza slab (~20×20) — floor.png (avg~119) + near-white VC
    ground.append(box_mesh(20.0, 0.12, 20.0, 0.0, -0.06, 0.0, VC_WHITE))
    # Subtle curb strip toward tower
    ground.append(box_mesh(10.0, 0.18, 0.4, 0.0, 0.03, -3.2, VC_WHITE))
    # Low plaza planters
    for x in (-6.0, 6.0):
        ground.append(box_mesh(1.4, 0.5, 1.4, x, 0.25, 2.0, VC_DESK))

    facade = []
    # Tower mass — stepped blocky (base / mid / crown)
    facade.append(box_mesh(9.0, 8.0, 7.0, 0.0, 4.0, -8.5, VC_FACADE))
    facade.append(box_mesh(8.0, 10.0, 6.2, 0.0, 13.0, -8.5, VC_FACADE))
    facade.append(box_mesh(6.5, 6.0, 5.2, 0.0, 21.0, -8.5, VC_FACADE))
    # Entrance recess + door panels (facing +Z toward plaza)
    facade.append(box_mesh(3.2, 2.6, 0.5, 0.0, 1.3, -4.85, VC_FACADE))
    facade.append(box_mesh(1.2, 2.2, 0.12, -0.7, 1.1, -4.55, VC_DOOR))
    facade.append(box_mesh(1.2, 2.2, 0.12, 0.7, 1.1, -4.55, VC_DOOR))
    # Door handles
    facade.append(box_mesh(0.08, 0.25, 0.08, -0.15, 1.1, -4.45, VC_METAL))
    facade.append(box_mesh(0.08, 0.25, 0.08, 0.15, 1.1, -4.45, VC_METAL))

    empties = [
        {"name": "plaza_spawn", "translation": [0.0, 0.0, 7.0]},
        {"name": "tower_entrance", "translation": [0.0, 0.0, -4.4]},
    ]

    g_pos, g_uv, g_col, g_idx = merge_meshes(ground)
    f_pos, f_uv, f_col, f_idx = merge_meshes(facade)
    # Ground: reuse floor.png; facade: dedicated tower_facade
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
    """Box lobby + ceiling fluo strips. Empties for beats + spawn."""
    floors = []
    floors.append(box_mesh(12.0, 0.1, 14.0, 0.0, -0.05, 0.0, VC_WHITE))

    walls = []
    # Ceiling
    walls.append(box_mesh(12.0, 0.1, 14.0, 0.0, 3.55, 0.0, VC_WALL))
    # Walls: -Z (elevator bank), +Z (entrance), ±X
    walls.append(box_mesh(12.0, 3.6, 0.15, 0.0, 1.8, -7.0, VC_WALL))
    walls.append(box_mesh(12.0, 3.6, 0.15, 0.0, 1.8, 7.0, VC_WALL))
    walls.append(box_mesh(0.15, 3.6, 14.0, -6.0, 1.8, 0.0, VC_WALL))
    walls.append(box_mesh(0.15, 3.6, 14.0, 6.0, 1.8, 0.0, VC_WALL))
    # Entrance opening hint (+Z wall recess)
    walls.append(box_mesh(2.4, 2.4, 0.2, 0.0, 1.2, 6.85, VC_FACADE))
    # Elevator bank recess (-Z)
    walls.append(box_mesh(2.0, 2.4, 0.4, 0.0, 1.2, -6.7, VC_FACADE))
    walls.append(box_mesh(1.4, 2.1, 0.08, 0.0, 1.05, -6.45, VC_DOOR))
    # Low reception stub
    walls.append(box_mesh(2.4, 1.0, 0.8, 2.5, 0.5, 1.5, VC_DESK))

    fluo = []
    for z in (-4.0, -1.0, 2.0, 5.0):
        fluo.append(box_mesh(8.0, 0.06, 0.35, 0.0, 3.45, z, FLUO))

    empties = [
        {"name": "lobby_spawn", "translation": [0.0, 0.0, 5.5]},
        {"name": "badge_reader", "translation": [-5.6, 1.25, 4.0]},
        {"name": "coffee_machine", "translation": [-5.2, 0.0, -2.5]},
        {"name": "security_desk", "translation": [2.5, 0.0, 1.5]},
        {"name": "hr_poster", "translation": [-5.7, 1.6, 0.5]},
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
                "texture": tex["floor"],
                "mat": "lobby_floor",
            },
            {
                "pos": w_pos,
                "uv": w_uv,
                "col": w_col,
                "idx": w_idx,
                "texture": tex["lobby_wall"],
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
    # Door jambs (+Z)
    parts.append(box_mesh(0.2, 2.2, 0.08, -0.7, 1.1, 0.9, VC_DOOR))
    parts.append(box_mesh(0.2, 2.2, 0.08, 0.7, 1.1, 0.9, VC_DOOR))
    parts.append(box_mesh(1.6, 0.15, 0.08, 0.0, 2.2, 0.9, VC_DOOR))
    # Closed door slab
    parts.append(box_mesh(1.2, 2.0, 0.06, 0.0, 1.05, 0.88, VC_DOOR))
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
    """Small wall reader box."""
    parts = []
    parts.append(box_mesh(0.22, 0.32, 0.1, 0.0, 0.16, 0.0, VC_PROP))
    parts.append(box_mesh(0.14, 0.1, 0.04, 0.0, 0.2, 0.06, VC_DOOR))
    parts.append(box_mesh(0.06, 0.06, 0.03, 0.0, 0.08, 0.06, SICK))  # LED
    parts.append(box_mesh(0.18, 0.04, 0.02, 0.0, 0.28, 0.05, INK))
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
    """Flat poster on stand."""
    parts = []
    # Stand base + pole
    parts.append(box_mesh(0.4, 0.06, 0.3, 0.0, 0.03, 0.0, VC_DOOR))
    parts.append(box_mesh(0.05, 1.4, 0.05, 0.0, 0.73, 0.0, VC_PROP))
    # Poster board
    parts.append(box_mesh(0.7, 0.95, 0.04, 0.0, 1.5, 0.0, PAPER))
    # Crude header bar + body blocks
    parts.append(box_mesh(0.6, 0.12, 0.03, 0.0, 1.85, 0.03, TEAL))
    parts.append(box_mesh(0.55, 0.5, 0.02, 0.0, 1.4, 0.03, INK))
    pos, uv, col, idx = merge_meshes(parts)
    paper = _tex("paper") or tex["plaza_concrete"]
    return write_glb(
        MOD / "prop_hr_poster.glb",
        pos,
        uv,
        col,
        idx,
        paper,
        "prop_hr_poster",
    )


def build_prop_elevator_panel(tex: dict[str, Path]) -> int:
    """Button panel plate (call / floor)."""
    parts = []
    parts.append(box_mesh(0.18, 0.5, 0.06, 0.0, 0.25, 0.0, VC_PROP))
    parts.append(box_mesh(0.14, 0.44, 0.02, 0.0, 0.25, 0.035, VC_DOOR))
    # Up / down / floor buttons
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.4, 0.05, SICK))
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.28, 0.05, AMBER))
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.16, 0.05, VC_METAL))
    parts.append(box_mesh(0.06, 0.04, 0.02, 0.0, 0.06, 0.05, BLOOD))  # alarm
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
    print("CORP-TOWER-01 kits (readable grim)…")

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
    t_poster = build_prop_hr_poster(tex)
    t_panel = build_prop_elevator_panel(tex)

    counts = {
        "assets/models/tower_plaza.glb": t_plaza,
        "assets/models/tower_lobby.glb": t_lobby,
        "assets/models/elevator_car.glb": t_car,
        "assets/models/prop_badge_reader.glb": t_badge,
        "assets/models/prop_coffee.glb": t_coffee,
        "assets/models/prop_security_desk.glb": t_desk,
        "assets/models/prop_hr_poster.glb": t_poster,
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
        budget = 400 if "tower_" in name or "elevator_car" in name else 80
        if t > budget:
            print(f"WARNING: {name} {t} > {budget} tris")
    print("done")


if __name__ == "__main__":
    main()
