#!/usr/bin/env python3
"""CORP-TOWER-01 graybox PS1 GLB kits — plaza / lobby / elevator / props."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ps1_assets import (  # noqa: E402
    MOD,
    ROOT,
    TEX,
    box_mesh,
    merge_meshes,
    rgb01,
    write_glb,
)

# Muddy PS1 vertex colors (reuse palette via rgb01)
WALL = rgb01("wall")
WALL_HI = rgb01("wall_hi")
FLOOR = rgb01("floor")
FLOOR_TILE = rgb01("floor_tile")
DESK = rgb01("desk")
PANEL = rgb01("panel")
PLASTIC = rgb01("plastic")
EDGE = rgb01("edge")
FLUO = rgb01("fluorescent")
PAPER = rgb01("paper")
INK = rgb01("ink")
GRAY = rgb01("gray")
GRAY_DK = rgb01("gray_dk")
AMBER = rgb01("amber")
SICK = rgb01("sick")
BLOOD = rgb01("blood")
TEAL = rgb01("teal")


def _tex(name: str) -> Path | None:
    p = TEX / f"{name}.png"
    return p if p.exists() else None


def build_tower_plaza() -> tuple[int, list[dict]]:
    """Flat plaza + blocky tower mass + doors. Empties: plaza_spawn, tower_entrance."""
    parts = []
    # Plaza slab (~20×20)
    parts.append(box_mesh(20.0, 0.12, 20.0, 0.0, -0.06, 0.0, FLOOR))
    # Subtle curb strip toward tower
    parts.append(box_mesh(10.0, 0.18, 0.4, 0.0, 0.03, -3.2, FLOOR_TILE))
    # Tower mass — stepped blocky (base / mid / crown)
    parts.append(box_mesh(9.0, 8.0, 7.0, 0.0, 4.0, -8.5, WALL))
    parts.append(box_mesh(8.0, 10.0, 6.2, 0.0, 13.0, -8.5, WALL_HI))
    parts.append(box_mesh(6.5, 6.0, 5.2, 0.0, 21.0, -8.5, PANEL))
    # Entrance recess + door panels (facing +Z toward plaza)
    parts.append(box_mesh(3.2, 2.6, 0.5, 0.0, 1.3, -4.85, PANEL))
    parts.append(box_mesh(1.2, 2.2, 0.12, -0.7, 1.1, -4.55, EDGE))
    parts.append(box_mesh(1.2, 2.2, 0.12, 0.7, 1.1, -4.55, EDGE))
    # Door handles
    parts.append(box_mesh(0.08, 0.25, 0.08, -0.15, 1.1, -4.45, GRAY))
    parts.append(box_mesh(0.08, 0.25, 0.08, 0.15, 1.1, -4.45, GRAY))
    # Low plaza planters (symmetry)
    for x in (-6.0, 6.0):
        parts.append(box_mesh(1.4, 0.5, 1.4, x, 0.25, 2.0, DESK))

    empties = [
        {"name": "plaza_spawn", "translation": [0.0, 0.0, 7.0]},
        {"name": "tower_entrance", "translation": [0.0, 0.0, -4.4]},
    ]
    pos, uv, col, idx = merge_meshes(parts)
    tris = write_glb(
        MOD / "tower_plaza.glb",
        pos,
        uv,
        col,
        idx,
        _tex("floor"),
        "tower_plaza",
        empty_nodes=empties,
    )
    return tris, empties


def build_tower_lobby() -> tuple[int, list[dict]]:
    """Box lobby + ceiling fluo strips. Empties for beats + spawn."""
    parts = []
    # Floor / ceiling
    parts.append(box_mesh(12.0, 0.1, 14.0, 0.0, -0.05, 0.0, FLOOR))
    parts.append(box_mesh(12.0, 0.1, 14.0, 0.0, 3.55, 0.0, PANEL))
    # Walls: -Z (elevator bank), +Z (entrance), ±X
    parts.append(box_mesh(12.0, 3.6, 0.15, 0.0, 1.8, -7.0, WALL))
    parts.append(box_mesh(12.0, 3.6, 0.15, 0.0, 1.8, 7.0, WALL))
    parts.append(box_mesh(0.15, 3.6, 14.0, -6.0, 1.8, 0.0, WALL))
    parts.append(box_mesh(0.15, 3.6, 14.0, 6.0, 1.8, 0.0, WALL))
    # Entrance opening hint (+Z wall recess)
    parts.append(box_mesh(2.4, 2.4, 0.2, 0.0, 1.2, 6.85, PANEL))
    # Elevator bank recess (-Z)
    parts.append(box_mesh(2.0, 2.4, 0.4, 0.0, 1.2, -6.7, PANEL))
    parts.append(box_mesh(1.4, 2.1, 0.08, 0.0, 1.05, -6.45, EDGE))
    # Ceiling fluorescent strips (cool white)
    for z in (-4.0, -1.0, 2.0, 5.0):
        parts.append(box_mesh(8.0, 0.06, 0.35, 0.0, 3.45, z, FLUO))
    # Low reception stub (visual only; interact via empties / props)
    parts.append(box_mesh(2.4, 1.0, 0.8, 2.5, 0.5, 1.5, DESK))

    empties = [
        {"name": "lobby_spawn", "translation": [0.0, 0.0, 5.5]},
        {"name": "badge_reader", "translation": [-5.6, 1.25, 4.0]},
        {"name": "coffee_machine", "translation": [-5.2, 0.0, -2.5]},
        {"name": "security_desk", "translation": [2.5, 0.0, 1.5]},
        {"name": "hr_poster", "translation": [-5.7, 1.6, 0.5]},
        {"name": "elevator_call", "translation": [1.4, 1.3, -6.4]},
    ]
    pos, uv, col, idx = merge_meshes(parts)
    tris = write_glb(
        MOD / "tower_lobby.glb",
        pos,
        uv,
        col,
        idx,
        _tex("wall"),
        "tower_lobby",
        empty_nodes=empties,
    )
    return tris, empties


def build_elevator_car() -> tuple[int, list[dict]]:
    """Small car interior + button / door empties."""
    parts = []
    # Floor / ceiling
    parts.append(box_mesh(1.6, 0.08, 1.8, 0.0, 0.04, 0.0, FLOOR_TILE))
    parts.append(box_mesh(1.6, 0.08, 1.8, 0.0, 2.36, 0.0, PANEL))
    # Walls (-Z back, ±X); +Z is door opening
    parts.append(box_mesh(1.6, 2.4, 0.08, 0.0, 1.2, -0.9, WALL))
    parts.append(box_mesh(0.08, 2.4, 1.8, -0.8, 1.2, 0.0, WALL))
    parts.append(box_mesh(0.08, 2.4, 1.8, 0.8, 1.2, 0.0, WALL))
    # Door jambs (+Z)
    parts.append(box_mesh(0.2, 2.2, 0.08, -0.7, 1.1, 0.9, EDGE))
    parts.append(box_mesh(0.2, 2.2, 0.08, 0.7, 1.1, 0.9, EDGE))
    parts.append(box_mesh(1.6, 0.15, 0.08, 0.0, 2.2, 0.9, EDGE))
    # Closed door slab (visual; empty elevator_door for cue)
    parts.append(box_mesh(1.2, 2.0, 0.06, 0.0, 1.05, 0.88, GRAY_DK))
    # Handrail
    parts.append(box_mesh(1.4, 0.04, 0.04, 0.0, 0.95, -0.82, GRAY))
    # Button panel plate on +X wall
    parts.append(box_mesh(0.06, 0.55, 0.28, 0.74, 1.25, -0.2, PLASTIC))
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
    tris = write_glb(
        MOD / "elevator_car.glb",
        pos,
        uv,
        col,
        idx,
        _tex("plastic"),
        "elevator_car",
        empty_nodes=empties,
    )
    return tris, empties


def build_prop_badge_reader() -> int:
    """Small wall reader box."""
    parts = []
    parts.append(box_mesh(0.22, 0.32, 0.1, 0.0, 0.16, 0.0, PLASTIC))
    parts.append(box_mesh(0.14, 0.1, 0.04, 0.0, 0.2, 0.06, EDGE))
    parts.append(box_mesh(0.06, 0.06, 0.03, 0.0, 0.08, 0.06, SICK))  # LED
    parts.append(box_mesh(0.18, 0.04, 0.02, 0.0, 0.28, 0.05, INK))
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_badge_reader.glb",
        pos,
        uv,
        col,
        idx,
        _tex("plastic"),
        "prop_badge_reader",
    )


def build_prop_coffee() -> int:
    """Coffee machine block."""
    parts = []
    parts.append(box_mesh(0.45, 1.1, 0.4, 0.0, 0.55, 0.0, GRAY_DK))
    parts.append(box_mesh(0.35, 0.25, 0.15, 0.0, 0.95, 0.12, PLASTIC))
    parts.append(box_mesh(0.2, 0.08, 0.2, 0.0, 0.45, 0.15, EDGE))  # drip tray
    parts.append(box_mesh(0.12, 0.15, 0.12, 0.0, 0.55, 0.18, DESK))  # cup niche
    parts.append(box_mesh(0.08, 0.08, 0.04, 0.12, 0.85, 0.2, AMBER))  # dial
    parts.append(box_mesh(0.06, 0.06, 0.03, -0.12, 0.85, 0.2, BLOOD))  # button
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_coffee.glb",
        pos,
        uv,
        col,
        idx,
        _tex("plastic"),
        "prop_coffee",
    )


def build_prop_security_desk() -> int:
    """L-desk block."""
    parts = []
    # Main desk top + riser
    parts.append(box_mesh(1.8, 0.08, 0.7, 0.0, 1.0, 0.0, DESK))
    parts.append(box_mesh(1.8, 1.0, 0.12, 0.0, 0.5, -0.29, DESK))
    # L return
    parts.append(box_mesh(0.7, 0.08, 1.2, 0.55, 1.0, 0.55, DESK))
    parts.append(box_mesh(0.12, 1.0, 1.2, 0.84, 0.5, 0.55, DESK))
    # Monitor stub + papers
    parts.append(box_mesh(0.35, 0.3, 0.08, -0.3, 1.25, -0.1, PLASTIC))
    parts.append(box_mesh(0.25, 0.02, 0.2, 0.2, 1.05, 0.1, PAPER))
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_security_desk.glb",
        pos,
        uv,
        col,
        idx,
        _tex("desk"),
        "prop_security_desk",
    )


def build_prop_hr_poster() -> int:
    """Flat poster on stand."""
    parts = []
    # Stand base + pole
    parts.append(box_mesh(0.4, 0.06, 0.3, 0.0, 0.03, 0.0, EDGE))
    parts.append(box_mesh(0.05, 1.4, 0.05, 0.0, 0.73, 0.0, PLASTIC))
    # Poster board
    parts.append(box_mesh(0.7, 0.95, 0.04, 0.0, 1.5, 0.0, PAPER))
    # Crude header bar + body blocks
    parts.append(box_mesh(0.6, 0.12, 0.03, 0.0, 1.85, 0.03, TEAL))
    parts.append(box_mesh(0.55, 0.5, 0.02, 0.0, 1.4, 0.03, INK))
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_hr_poster.glb",
        pos,
        uv,
        col,
        idx,
        _tex("paper"),
        "prop_hr_poster",
    )


def build_prop_elevator_panel() -> int:
    """Button panel plate (call / floor)."""
    parts = []
    parts.append(box_mesh(0.18, 0.5, 0.06, 0.0, 0.25, 0.0, PLASTIC))
    parts.append(box_mesh(0.14, 0.44, 0.02, 0.0, 0.25, 0.035, EDGE))
    # Up / down / floor buttons
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.4, 0.05, SICK))
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.28, 0.05, AMBER))
    parts.append(box_mesh(0.08, 0.08, 0.03, 0.0, 0.16, 0.05, GRAY))
    parts.append(box_mesh(0.06, 0.04, 0.02, 0.0, 0.06, 0.05, BLOOD))  # alarm
    pos, uv, col, idx = merge_meshes(parts)
    return write_glb(
        MOD / "prop_elevator_panel.glb",
        pos,
        uv,
        col,
        idx,
        _tex("plastic"),
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
    print("CORP-TOWER-01 kits…")

    t_plaza, e_plaza = build_tower_plaza()
    t_lobby, e_lobby = build_tower_lobby()
    t_car, e_car = build_elevator_car()
    t_badge = build_prop_badge_reader()
    t_coffee = build_prop_coffee()
    t_desk = build_prop_security_desk()
    t_poster = build_prop_hr_poster()
    t_panel = build_prop_elevator_panel()

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
