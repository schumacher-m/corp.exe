#!/usr/bin/env python3
"""Dense-farm neighbor bay + chunky CRT + seated workers for corp.exe."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Reuse GLB writer + box helpers from existing pipeline
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ps1_assets import (  # noqa: E402
    BAYER4,
    MOD,
    ROOT,
    TEX,
    box_mesh,
    merge_meshes,
    write_glb,
)

CRT_GREEN = (0x5E, 0xCF, 0x4A)  # #5ecf4a
CRT_TEAL = (0x3E, 0xC8, 0xB0)  # #3ec8b0
CRT_DIM = (0x2A, 0x60, 0x30)  # #2a6030

# Vertex color ~0.37, 0.81, 0.29
SCREEN_VC = (0.37, 0.81, 0.29)
FLOOR_VC = (0.19, 0.18, 0.15)  # muddy floor
WALL_VC = (0.24, 0.23, 0.20)  # #3d3a32-ish
DESK_VC = (0.16, 0.16, 0.125)  # #2a2820-ish
PLASTIC_VC = (0.35, 0.345, 0.306)  # CRT body plastic
BEZEL_VC = (0.08, 0.08, 0.07)  # dark inset bezel
BASE_VC = (0.28, 0.275, 0.24)  # slightly darker base/neck

# Worker palette (exact hex → 0..1)
SHIRT_A = (0x32 / 255.0, 0x37 / 255.0, 0x46 / 255.0)  # #323746
SHIRT_B = (0x3A / 255.0, 0x42 / 255.0, 0x3C / 255.0)  # olive-grey variant
SKIN_VC = (0x8C / 255.0, 0x78 / 255.0, 0x64 / 255.0)  # #8c7864
HAIR_A = (0x1E / 255.0, 0x1C / 255.0, 0x1A / 255.0)  # #1e1c1a
HAIR_B = (0x3A / 255.0, 0x2C / 255.0, 0x1E / 255.0)  # brownish


def hex01(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255.0, int(h[2:4], 16) / 255.0, int(h[4:6], 16) / 255.0)


def quad_mesh(
    sx: float,
    sy: float,
    cx: float = 0.0,
    cy: float = 0.0,
    cz: float = 0.0,
    color: tuple[float, float, float] = (1.0, 1.0, 1.0),
    facing: str = "+z",
) -> tuple[list[float], list[float], list[float], list[int]]:
    """Single-face quad (2 tris). Default faces +Z."""
    hx, hy = sx / 2, sy / 2
    r, g, b = color
    if facing == "+z":
        corners = [
            (cx - hx, cy - hy, cz),
            (cx + hx, cy - hy, cz),
            (cx + hx, cy + hy, cz),
            (cx - hx, cy + hy, cz),
        ]
    elif facing == "-z":
        corners = [
            (cx + hx, cy - hy, cz),
            (cx - hx, cy - hy, cz),
            (cx - hx, cy + hy, cz),
            (cx + hx, cy + hy, cz),
        ]
    else:
        raise ValueError(facing)
    uvs = [(0, 0), (1, 0), (1, 1), (0, 1)]
    pos: list[float] = []
    uv: list[float] = []
    col: list[float] = []
    for (x, y, z), (u, v) in zip(corners, uvs):
        pos.extend([x, y, z])
        uv.extend([u, v])
        col.extend([r, g, b])
    idx = [0, 1, 2, 0, 2, 3]
    return pos, uv, col, idx


def make_crt_glow_png() -> Path:
    """32x24 Bayer dither between #5ecf4a / #3ec8b0 / darker #2a6030."""
    w, h = 32, 24
    yy, xx = np.mgrid[0:h, 0:w]
    thr = BAYER4[yy % 4, xx % 4]
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    arr[:, :] = CRT_GREEN
    arr[thr > 0.35] = CRT_TEAL
    arr[thr > 0.70] = CRT_DIM
    for y in range(0, h, 3):
        arr[y] = (arr[y].astype(np.int16) * 0.82).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    path = TEX / "crt_glow.png"
    img.save(path, optimize=True)
    print(f"  wrote {path.name}: {w}x{h}")
    return path


def crt_parts(ox: float = 0.0, oy: float = 0.0, oz: float = 0.0) -> list:
    """Chunky PS1 CRT mesh parts. Origin = base center on desk surface.
    Screen faces +Z. Target ≤40–60 tris (4 boxes + 1 screen quad = 50).
    """
    parts = []
    # Thicker foot / base
    parts.append(box_mesh(0.44, 0.07, 0.36, ox + 0.0, oy + 0.035, oz + 0.0, BASE_VC))
    # Thick neck
    parts.append(box_mesh(0.30, 0.10, 0.26, ox + 0.0, oy + 0.12, oz - 0.02, BASE_VC))
    # Bevelled plastic body (main chunk) — front face toward +Z
    parts.append(box_mesh(0.50, 0.42, 0.40, ox + 0.0, oy + 0.38, oz - 0.02, PLASTIC_VC))
    # Inset dark bezel (recessed screen frame)
    parts.append(box_mesh(0.42, 0.32, 0.05, ox + 0.0, oy + 0.39, oz + 0.17, BEZEL_VC))
    # Bright lit screen face (2 tris quad) flush with bezel front
    parts.append(
        quad_mesh(0.36, 0.26, ox + 0.0, oy + 0.39, oz + 0.20, SCREEN_VC, facing="+z")
    )
    return parts


def screen_face_translation(ox: float = 0.0, oy: float = 0.0, oz: float = 0.0) -> list[float]:
    """Center of CRT screen face — Dev emissive swap anchor."""
    return [ox + 0.0, oy + 0.39, oz + 0.20]


def build_neighbor_crt(tex_path: Path) -> tuple[int, list[float]]:
    """Standalone chunky neighbor CRT. Origin on desk surface."""
    parts = crt_parts(0.0, 0.0, 0.0)
    pos, uv, col, idx = merge_meshes(parts)
    sf = screen_face_translation(0.0, 0.0, 0.0)
    tris = write_glb(
        MOD / "neighbor_crt.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "neighbor_crt",
        empty_nodes=[{"name": "screen_face", "translation": sf}],
    )
    return tris, sf


def build_neighbor_bay(tex_path: Path) -> tuple[int, list[float]]:
    """LOW-tri PS1 bay ~2.1m wide × 2.4m deep with chunky CRT. Whole bay ≤120 tris."""
    parts = []
    # Floor slab 2.1 × 2.4
    parts.append(box_mesh(2.1, 0.06, 2.4, 0.0, 0.03, 0.0, FLOOR_VC))
    # Back wall
    parts.append(box_mesh(2.1, 1.8, 0.06, 0.0, 0.9, -1.17, WALL_VC))
    # Left + right half-height partitions
    parts.append(box_mesh(0.05, 1.0, 1.9, -1.025, 0.5, -0.15, WALL_VC))
    parts.append(box_mesh(0.05, 1.0, 1.9, 1.025, 0.5, -0.15, WALL_VC))
    # Thin desk top
    parts.append(box_mesh(1.5, 0.04, 0.65, 0.0, 0.74, -0.35, DESK_VC))
    # Chunky CRT sitting on desk (desk y=0.74, CRT toward back z≈-0.55)
    crt_ox, crt_oy, crt_oz = 0.0, 0.74, -0.55
    parts.extend(crt_parts(crt_ox, crt_oy, crt_oz))
    pos, uv, col, idx = merge_meshes(parts)
    sf = screen_face_translation(crt_ox, crt_oy, crt_oz)
    tris = write_glb(
        MOD / "neighbor_bay.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "neighbor_bay",
        empty_nodes=[{"name": "screen_face", "translation": sf}],
    )
    return tris, sf


def build_crt_glow(tex_path: Path) -> int:
    """0.36×0.26 bright quad matching CRT screen (InstancedMesh option)."""
    parts = [quad_mesh(0.36, 0.26, 0.0, 0.0, 0.0, SCREEN_VC, facing="+z")]
    pos, uv, col, idx = merge_meshes(parts)
    tris = write_glb(
        MOD / "crt_glow.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "crt_glow",
    )
    return tris


def worker_parts(
    shirt: tuple[float, float, float],
    hair: tuple[float, float, float],
) -> list:
    """Blocky PS1 seated office worker. Origin = seat/pelvis on chair (~desk seat).
    Facing −Z toward desk/keyboard. Sit pose: torso upright, arms toward keyboard.
    Aim ≤80–100 tris (8 boxes = 96).
    """
    parts = []
    # Lap / pelvis (seated)
    parts.append(box_mesh(0.36, 0.14, 0.32, 0.0, 0.08, 0.02, shirt))
    # Torso
    parts.append(box_mesh(0.34, 0.42, 0.22, 0.0, 0.36, -0.02, shirt))
    # Head
    parts.append(box_mesh(0.20, 0.22, 0.20, 0.0, 0.68, -0.02, SKIN_VC))
    # Hair cap
    parts.append(box_mesh(0.22, 0.08, 0.22, 0.0, 0.82, -0.03, hair))
    # Upper arms (slightly forward)
    parts.append(box_mesh(0.10, 0.22, 0.10, -0.24, 0.42, 0.02, shirt))
    parts.append(box_mesh(0.10, 0.22, 0.10, 0.24, 0.42, 0.02, shirt))
    # Forearms toward keyboard (−Z, slightly down)
    parts.append(box_mesh(0.09, 0.09, 0.26, -0.22, 0.30, -0.18, SKIN_VC))
    parts.append(box_mesh(0.09, 0.09, 0.26, 0.22, 0.30, -0.18, SKIN_VC))
    return parts


def worker_empty_nodes() -> list[dict]:
    """Fidget anchors — exact names for Dev: head, torso, arm_L, arm_R."""
    return [
        {"name": "torso", "translation": [0.0, 0.36, -0.02]},
        {"name": "head", "translation": [0.0, 0.68, -0.02]},
        {"name": "arm_L", "translation": [-0.24, 0.42, 0.02]},
        {"name": "arm_R", "translation": [0.24, 0.42, 0.02]},
    ]


def build_worker(
    out_name: str,
    tex_path: Path,
    shirt: tuple[float, float, float],
    hair: tuple[float, float, float],
) -> tuple[int, list[dict]]:
    parts = worker_parts(shirt, hair)
    pos, uv, col, idx = merge_meshes(parts)
    nodes = worker_empty_nodes()
    tris = write_glb(
        MOD / out_name,
        pos,
        uv,
        col,
        idx,
        tex_path,
        out_name.replace(".glb", ""),
        empty_nodes=nodes,
    )
    return tris, nodes


def update_manifest(
    counts: dict[str, int],
    anchors: dict[str, dict[str, list[float]]],
) -> None:
    man_path = ROOT / "manifest.json"
    man = json.loads(man_path.read_text())

    def add_unique(lst: list, item: str) -> None:
        if item not in lst:
            lst.append(item)

    for rel in (
        "assets/models/neighbor_bay.glb",
        "assets/models/neighbor_crt.glb",
        "assets/models/crt_glow.glb",
        "assets/models/worker_seated.glb",
        "assets/models/worker_seated_b.glb",
    ):
        add_unique(man["models"], rel)
    man["models"] = sorted(man["models"])

    add_unique(man["textures"], "assets/textures/crt_glow.png")
    man["textures"] = sorted(man["textures"])

    tri = man.setdefault("triangleCounts", {})
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
    TEX.mkdir(parents=True, exist_ok=True)
    MOD.mkdir(parents=True, exist_ok=True)
    print("crt_glow texture…")
    tex = make_crt_glow_png()
    plastic = TEX / "plastic.png"
    shirt_tex = TEX / "shirt.png"
    if not plastic.exists():
        plastic = tex
    if not shirt_tex.exists():
        shirt_tex = tex

    print("models…")
    t_bay, sf_bay = build_neighbor_bay(tex)
    t_crt, sf_crt = build_neighbor_crt(tex)
    t_glow = build_crt_glow(tex)
    t_w, nodes_w = build_worker("worker_seated.glb", shirt_tex, SHIRT_A, HAIR_A)
    t_wb, nodes_wb = build_worker("worker_seated_b.glb", shirt_tex, SHIRT_B, HAIR_B)

    counts = {
        "assets/models/neighbor_bay.glb": t_bay,
        "assets/models/neighbor_crt.glb": t_crt,
        "assets/models/crt_glow.glb": t_glow,
        "assets/models/worker_seated.glb": t_w,
        "assets/models/worker_seated_b.glb": t_wb,
    }
    anchors = {
        "assets/models/neighbor_bay.glb": {"screen_face": sf_bay},
        "assets/models/neighbor_crt.glb": {"screen_face": sf_crt},
        "assets/models/worker_seated.glb": {
            n["name"]: list(n["translation"]) for n in nodes_w
        },
        "assets/models/worker_seated_b.glb": {
            n["name"]: list(n["translation"]) for n in nodes_wb
        },
    }
    update_manifest(counts, anchors)
    print(
        f"done — neighbor_bay={t_bay} tris, neighbor_crt={t_crt} tris, "
        f"crt_glow={t_glow} tris, worker_seated={t_w} tris, "
        f"worker_seated_b={t_wb} tris"
    )
    if t_crt > 60:
        print(f"WARNING: neighbor_crt {t_crt} > 60 tris budget")
    if t_bay > 120:
        print(f"WARNING: neighbor_bay {t_bay} > 120 tris budget")
    if t_w > 100 or t_wb > 100:
        print(f"WARNING: worker tris over 100 ({t_w}/{t_wb})")


if __name__ == "__main__":
    main()
