#!/usr/bin/env python3
"""Dense-farm neighbor bay + CRT glow assets for corp.exe."""
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
    # Three-level ordered dither: green / teal / dim
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    # Bright green base
    arr[:, :] = CRT_GREEN
    # Mid band → teal
    arr[thr > 0.35] = CRT_TEAL
    # Dark band → dim green
    arr[thr > 0.70] = CRT_DIM
    # Subtle scanline darken every 3rd row (PS1 CRT feel)
    for y in range(0, h, 3):
        arr[y] = (arr[y].astype(np.int16) * 0.82).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    path = TEX / "crt_glow.png"
    img.save(path, optimize=True)
    print(f"  wrote {path.name}: {w}x{h}")
    return path


def build_neighbor_bay(tex_path: Path) -> int:
    """LOW-tri PS1 bay ~2.1m wide × 2.4m deep. Target <~80 tris."""
    parts = []
    # Floor slab 2.1 × 2.4
    parts.append(box_mesh(2.1, 0.06, 2.4, 0.0, 0.03, 0.0, FLOOR_VC))
    # Back wall full height-ish
    parts.append(box_mesh(2.1, 1.8, 0.06, 0.0, 0.9, -1.17, WALL_VC))
    # Left + right half-height partitions (along Z toward aisle)
    parts.append(box_mesh(0.05, 1.0, 1.9, -1.025, 0.5, -0.15, WALL_VC))
    parts.append(box_mesh(0.05, 1.0, 1.9, 1.025, 0.5, -0.15, WALL_VC))
    # Thin desk top
    parts.append(box_mesh(1.5, 0.04, 0.65, 0.0, 0.74, -0.35, DESK_VC))
    # CRT body (plastic)
    parts.append(box_mesh(0.48, 0.40, 0.38, 0.0, 0.98, -0.45, PLASTIC_VC))
    # Bright front screen face — single quad (2 tris) facing +Z / aisle
    parts.append(
        quad_mesh(0.42, 0.32, 0.0, 1.00, -0.25, SCREEN_VC, facing="+z")
    )
    pos, uv, col, idx = merge_meshes(parts)
    tris = write_glb(
        MOD / "neighbor_bay.glb",
        pos,
        uv,
        col,
        idx,
        tex_path,
        "neighbor_bay",
    )
    return tris


def build_crt_glow(tex_path: Path) -> int:
    """0.42×0.32 bright quad for InstancedMesh neighbor screens."""
    parts = [quad_mesh(0.42, 0.32, 0.0, 0.0, 0.0, SCREEN_VC, facing="+z")]
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


def update_manifest(tri_neighbor: int, tri_glow: int) -> None:
    man_path = ROOT / "manifest.json"
    man = json.loads(man_path.read_text())

    def add_unique(lst: list, item: str) -> None:
        if item not in lst:
            lst.append(item)

    add_unique(man["models"], "assets/models/neighbor_bay.glb")
    add_unique(man["models"], "assets/models/crt_glow.glb")
    man["models"] = sorted(man["models"])

    add_unique(man["textures"], "assets/textures/crt_glow.png")
    man["textures"] = sorted(man["textures"])

    counts = man.setdefault("triangleCounts", {})
    counts["assets/models/neighbor_bay.glb"] = tri_neighbor
    counts["assets/models/crt_glow.glb"] = tri_glow
    man["triangleCounts"] = dict(sorted(counts.items()))

    man_path.write_text(json.dumps(man, indent=2) + "\n")
    print("manifest.json updated")


def main() -> None:
    TEX.mkdir(parents=True, exist_ok=True)
    MOD.mkdir(parents=True, exist_ok=True)
    print("crt_glow texture…")
    tex = make_crt_glow_png()
    print("models…")
    t1 = build_neighbor_bay(tex)
    t2 = build_crt_glow(tex)
    update_manifest(t1, t2)
    print(f"done — neighbor_bay={t1} tris, crt_glow={t2} tris")


if __name__ == "__main__":
    main()
