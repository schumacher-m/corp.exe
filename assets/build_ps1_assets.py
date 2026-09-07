#!/usr/bin/env python3
"""Generate PS1-era low-poly GLB + dithered textures for corp.exe."""
from __future__ import annotations

import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace/corp-html/assets")  # fixed box path
TEX = ROOT / "textures"
MOD = ROOT / "models"
TEX.mkdir(parents=True, exist_ok=True)
MOD.mkdir(parents=True, exist_ok=True)

# Muddy PS1 office + Win95 chrome accents
PALETTE = {
    "fog": (26, 24, 20),
    "wall": (61, 58, 50),       # #3d3a32
    "wall_hi": (80, 76, 66),
    "desk": (42, 40, 32),       # #2a2820
    "desk_hi": (55, 52, 40),
    "panel": (36, 34, 24),
    "ink": (10, 10, 8),
    "edge": (80, 76, 64),
    "sick": (107, 143, 58),
    "sick_hi": (143, 184, 90),
    "amber": (196, 160, 53),
    "blood": (139, 58, 42),
    "jira": (168, 144, 48),
    "slack": (74, 48, 72),
    "plastic": (90, 88, 78),
    "crt_green": (40, 70, 30),
    "crt_glass": (20, 28, 18),
    "plant_dead": (90, 78, 40),
    "plant_pot": (100, 60, 40),
    "paper": (180, 170, 140),
    "sticky": (200, 180, 60),
    "mug": (120, 40, 40),
    "floor": (48, 46, 38),
    "floor_tile": (40, 38, 32),
    "fluorescent": (200, 200, 160),
    "skin": (140, 120, 100),    # #8c7864
    "skin_hi": (120, 100, 85),
    "shirt": (50, 55, 70),
    "hair": (30, 28, 26),
    "teal": (0, 128, 128),      # #008080 Win95 desktop
    "teal_hi": (0, 100, 100),
    "gray": (192, 192, 192),    # #C0C0C0
    "gray_hi": (160, 160, 160),
    "gray_dk": (128, 128, 128),
    "keycap": (180, 180, 180),
}

BAYER4 = np.array(
    [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
    ],
    dtype=np.float32,
) / 16.0


def nearest_palette(rgb: np.ndarray, colors: list[tuple[int, int, int]]) -> np.ndarray:
    c = np.array(colors, dtype=np.float32)
    diff = rgb[..., None, :] - c[None, None, :, :]
    d2 = np.sum(diff * diff, axis=-1)
    idx = np.argmin(d2, axis=-1)
    return c[idx].astype(np.uint8)


def dither_fill(w: int, h: int, base: tuple[int, int, int], alt: tuple[int, int, int] | None = None) -> Image.Image:
    """Fill with Bayer dither between base and slightly darker/alt."""
    if alt is None:
        alt = tuple(max(0, int(c * 0.72)) for c in base)
    yy, xx = np.mgrid[0:h, 0:w]
    thr = BAYER4[yy % 4, xx % 4]
    mix = thr > 0.45
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    arr[:, :] = base
    arr[mix] = alt
    return Image.fromarray(arr, "RGB")


def checker(w: int, h: int, a: tuple[int, int, int], b: tuple[int, int, int], cell: int = 4) -> Image.Image:
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            arr[y, x] = a if ((x // cell) + (y // cell)) % 2 == 0 else b
    return Image.fromarray(arr, "RGB")


def save_tex(name: str, img: Image.Image) -> Path:
    path = TEX / f"{name}.png"
    img = img.resize(img.size, Image.NEAREST)
    img.save(path, optimize=True)
    return path


def write_textures() -> dict[str, Path]:
    out = {}
    out["wall"] = save_tex("wall", dither_fill(64, 64, PALETTE["wall"], PALETTE["wall_hi"]))
    out["floor"] = save_tex("floor", checker(64, 64, PALETTE["floor"], PALETTE["floor_tile"], 8))
    out["desk"] = save_tex("desk", dither_fill(32, 32, PALETTE["desk"], PALETTE["desk_hi"]))
    out["plastic"] = save_tex("plastic", dither_fill(32, 32, PALETTE["plastic"], PALETTE["edge"]))
    out["crt"] = save_tex("crt", dither_fill(32, 32, PALETTE["crt_glass"], PALETTE["crt_green"]))
    out["paper"] = save_tex("paper", dither_fill(32, 32, PALETTE["paper"], (160, 150, 120)))
    out["sticky"] = save_tex("sticky", dither_fill(16, 16, PALETTE["sticky"], PALETTE["jira"]))
    out["mug"] = save_tex("mug", dither_fill(16, 16, PALETTE["mug"], (90, 30, 30)))
    out["plant"] = save_tex("plant", dither_fill(16, 16, PALETTE["plant_dead"], (70, 60, 30)))
    out["pot"] = save_tex("pot", dither_fill(16, 16, PALETTE["plant_pot"], (80, 45, 30)))
    out["slack"] = save_tex("slack", dither_fill(32, 32, PALETTE["slack"], (90, 55, 88)))
    out["kyle"] = save_tex("kyle", dither_fill(32, 32, PALETTE["skin"], PALETTE["skin_hi"]))
    out["shirt"] = save_tex("shirt", dither_fill(16, 16, PALETTE["shirt"], (40, 44, 58)))
    out["hair"] = save_tex("hair", dither_fill(16, 16, PALETTE["hair"], (20, 18, 16)))
    out["fluorescent"] = save_tex("fluorescent", dither_fill(32, 8, PALETTE["fluorescent"], (180, 180, 140)))
    out["sick"] = save_tex("sick", dither_fill(16, 16, PALETTE["sick"], PALETTE["sick_hi"]))
    out["teal"] = save_tex("teal", dither_fill(32, 32, PALETTE["teal"], PALETTE["teal_hi"]))
    out["gray"] = save_tex("gray", dither_fill(32, 32, PALETTE["gray"], PALETTE["gray_hi"]))
    out["skin"] = save_tex("skin", dither_fill(32, 32, PALETTE["skin"], PALETTE["skin_hi"]))
    out["keyboard"] = save_tex("keyboard", dither_fill(32, 16, PALETTE["gray"], PALETTE["keycap"]))
    out["mouse"] = save_tex("mouse", dither_fill(16, 16, PALETTE["gray"], PALETTE["gray_dk"]))
    # ticket sticker with crude "JIRA" block
    t = dither_fill(32, 32, PALETTE["sticky"], PALETTE["jira"])
    arr = np.array(t)
    arr[10:22, 6:26] = PALETTE["ink"]
    arr[12:20, 8:24] = PALETTE["jira"]
    out["ticket"] = save_tex("ticket", Image.fromarray(arr, "RGB"))
    return out


# ---------- minimal GLB writer ----------

def _pack_f32(arr: list[float]) -> bytes:
    return struct.pack(f"<{len(arr)}f", *arr)


def _pack_u16(arr: list[int]) -> bytes:
    return struct.pack(f"<{len(arr)}H", *arr)


def _align4(b: bytes) -> bytes:
    pad = (4 - (len(b) % 4)) % 4
    return b + (b"\x00" * pad)


def box_mesh(
    sx: float,
    sy: float,
    sz: float,
    cx: float = 0.0,
    cy: float = 0.0,
    cz: float = 0.0,
    color: tuple[float, float, float] | None = None,
) -> tuple[list[float], list[float], list[float], list[int]]:
    """Axis-aligned box centered at cx,cy,cz with size sx,sy,sz. Y-up."""
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    corners = [
        (cx - hx, cy - hy, cz - hz),
        (cx + hx, cy - hy, cz - hz),
        (cx + hx, cy + hy, cz - hz),
        (cx - hx, cy + hy, cz - hz),
        (cx - hx, cy - hy, cz + hz),
        (cx + hx, cy - hy, cz + hz),
        (cx + hx, cy + hy, cz + hz),
        (cx - hx, cy + hy, cz + hz),
    ]
    faces = [
        (0, 1, 2, 3),  # -Z
        (5, 4, 7, 6),  # +Z
        (4, 0, 3, 7),  # -X
        (1, 5, 6, 2),  # +X
        (3, 2, 6, 7),  # +Y
        (4, 5, 1, 0),  # -Y
    ]
    uvs_face = [(0, 0), (1, 0), (1, 1), (0, 1)]
    pos: list[float] = []
    uv: list[float] = []
    col: list[float] = []
    idx: list[int] = []
    r, g, b = color if color else (0.7, 0.7, 0.65)
    for face in faces:
        base = len(pos) // 3
        for i, ci in enumerate(face):
            x, y, z = corners[ci]
            pos.extend([x, y, z])
            u, v = uvs_face[i]
            uv.extend([u, v])
            col.extend([r, g, b])
        idx.extend([base, base + 1, base + 2, base, base + 2, base + 3])
    return pos, uv, col, idx


def merge_meshes(parts: list[tuple[list[float], list[float], list[float], list[int]]]):
    pos: list[float] = []
    uv: list[float] = []
    col: list[float] = []
    idx: list[int] = []
    for p, u, c, i in parts:
        base = len(pos) // 3
        pos.extend(p)
        uv.extend(u)
        col.extend(c)
        idx.extend([v + base for v in i])
    return pos, uv, col, idx


def write_glb(
    path: Path,
    pos: list[float],
    uv: list[float],
    col: list[float],
    idx: list[int],
    texture_path: Path | None = None,
    name: str = "mesh",
    empty_nodes: list[dict] | None = None,
) -> int:
    """Write GLB. empty_nodes: list of {name, translation:[x,y,z]} as children of root.
    Returns triangle count."""
    pos_b = _pack_f32(pos)
    uv_b = _pack_f32(uv)
    col_b = _pack_f32(col)
    idx_b = _pack_u16(idx)

    img_b = b""
    if texture_path and texture_path.exists():
        img_b = texture_path.read_bytes()

    chunks = [idx_b, pos_b, uv_b, col_b]
    if img_b:
        chunks.append(img_b)

    padded = []
    offsets = []
    cursor = 0
    for ch in chunks:
        offsets.append(cursor)
        p = _align4(ch)
        padded.append(p)
        cursor += len(p)
    blob = b"".join(padded)

    nvert = len(pos) // 3
    nidx = len(idx)

    xs = pos[0::3]
    ys = pos[1::3]
    zs = pos[2::3]
    amin = [min(xs), min(ys), min(zs)]
    amax = [max(xs), max(ys), max(zs)]

    accessors = [
        {
            "bufferView": 0,
            "componentType": 5123,
            "count": nidx,
            "type": "SCALAR",
            "max": [max(idx) if idx else 0],
            "min": [0],
        },
        {
            "bufferView": 1,
            "componentType": 5126,
            "count": nvert,
            "type": "VEC3",
            "max": amax,
            "min": amin,
        },
        {
            "bufferView": 2,
            "componentType": 5126,
            "count": nvert,
            "type": "VEC2",
        },
        {
            "bufferView": 3,
            "componentType": 5126,
            "count": nvert,
            "type": "VEC3",
            "max": [1, 1, 1],
            "min": [0, 0, 0],
        },
    ]

    buffer_views = [
        {"buffer": 0, "byteOffset": offsets[0], "byteLength": len(idx_b), "target": 34963},
        {"buffer": 0, "byteOffset": offsets[1], "byteLength": len(pos_b), "target": 34962},
        {"buffer": 0, "byteOffset": offsets[2], "byteLength": len(uv_b), "target": 34962},
        {"buffer": 0, "byteOffset": offsets[3], "byteLength": len(col_b), "target": 34962},
    ]

    materials = [
        {
            "name": f"{name}_mat",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1, 1, 1, 1],
                "metallicFactor": 0,
                "roughnessFactor": 1,
            },
            "doubleSided": True,
        }
    ]

    images = []
    textures = []
    if img_b:
        buffer_views.append(
            {"buffer": 0, "byteOffset": offsets[4], "byteLength": len(img_b)}
        )
        images.append({"bufferView": 4, "mimeType": "image/png", "name": texture_path.stem})
        textures.append({"source": 0, "sampler": 0})
        materials[0]["pbrMetallicRoughness"]["baseColorTexture"] = {"index": 0}

    # nodes: root mesh + optional empty children
    root_node: dict = {"mesh": 0, "name": name}
    nodes: list[dict] = [root_node]
    if empty_nodes:
        children = []
        for en in empty_nodes:
            children.append(len(nodes))
            nodes.append(
                {
                    "name": en["name"],
                    "translation": list(en["translation"]),
                }
            )
        root_node["children"] = children

    gltf = {
        "asset": {"version": "2.0", "generator": "corp.exe-ps1-builder"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": nodes,
        "meshes": [
            {
                "name": name,
                "primitives": [
                    {
                        "attributes": {"POSITION": 1, "TEXCOORD_0": 2, "COLOR_0": 3},
                        "indices": 0,
                        "material": 0,
                        "mode": 4,
                    }
                ],
            }
        ],
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(blob)}],
        "samplers": [
            {
                "magFilter": 9728,  # NEAREST
                "minFilter": 9728,  # NEAREST
                "wrapS": 10497,
                "wrapT": 10497,
            }
        ],
    }
    if images:
        gltf["images"] = images
        gltf["textures"] = textures

    json_b = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    while len(json_b) % 4:
        json_b += b" "

    total = 12 + 8 + len(json_b) + 8 + len(blob)
    header = struct.pack("<4sII", b"glTF", 2, total)
    json_chunk = struct.pack("<I4s", len(json_b), b"JSON") + json_b
    bin_chunk = struct.pack("<I4s", len(blob), b"BIN\x00") + blob
    path.write_bytes(header + json_chunk + bin_chunk)
    tris = nidx // 3
    anchors = [en["name"] for en in (empty_nodes or [])]
    anc = f", anchors={anchors}" if anchors else ""
    print(f"  wrote {path.name}: {nvert} verts, {tris} tris, tex={texture_path.name if texture_path else 'none'}{anc}")
    return tris


def rgb01(name: str) -> tuple[float, float, float]:
    r, g, b = PALETTE[name]
    return (r / 255.0, g / 255.0, b / 255.0)


def hex01(hexstr: str) -> tuple[float, float, float]:
    h = hexstr.lstrip("#")
    return (int(h[0:2], 16) / 255.0, int(h[2:4], 16) / 255.0, int(h[4:6], 16) / 255.0)


# ---------- builders ----------

TRIANGLE_COUNTS: dict[str, int] = {}


def build_cubicle(tex: dict[str, Path]) -> None:
    parts = []
    parts.append(box_mesh(6.0, 0.08, 6.0, 0, 0, 0, rgb01("floor")))
    parts.append(box_mesh(6.0, 2.4, 0.1, 0, 1.2, -3.0, rgb01("wall")))
    parts.append(box_mesh(0.1, 1.4, 4.0, -3.0, 0.7, -1.0, rgb01("wall")))
    parts.append(box_mesh(0.1, 1.4, 4.0, 3.0, 0.7, -1.0, rgb01("wall")))
    parts.append(box_mesh(6.0, 0.9, 0.08, 0, 0.45, 2.0, rgb01("wall")))
    for x in (-1.5, 1.5):
        parts.append(box_mesh(2.2, 0.06, 0.35, x, 2.35, -1.0, rgb01("fluorescent")))
    parts.append(box_mesh(6.0, 0.08, 6.0, 0, 2.42, 0, rgb01("panel")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["cubicle.glb"] = write_glb(
        MOD / "cubicle.glb", pos, uv, col, idx, tex["wall"], "cubicle"
    )


def build_desk_set(tex: dict[str, Path]) -> None:
    parts = []
    parts.append(box_mesh(1.6, 0.06, 0.8, 0, 0.74, 0, rgb01("desk")))
    for x, z in [(-0.7, -0.3), (0.7, -0.3), (-0.7, 0.3), (0.7, 0.3)]:
        parts.append(box_mesh(0.06, 0.74, 0.06, x, 0.37, z, rgb01("plastic")))
    parts.append(box_mesh(0.5, 0.06, 0.5, 0, 0.45, 0.7, rgb01("plastic")))
    parts.append(box_mesh(0.5, 0.55, 0.06, 0, 0.75, 0.95, rgb01("plastic")))
    parts.append(box_mesh(0.08, 0.45, 0.08, 0, 0.22, 0.7, rgb01("edge")))
    # CRT body (screen face is decorative; real blit goes on screen_anchor / screen_quad)
    parts.append(box_mesh(0.55, 0.45, 0.45, 0, 1.0, -0.15, rgb01("plastic")))
    parts.append(box_mesh(0.42, 0.32, 0.04, 0, 1.02, 0.08, rgb01("crt_green")))
    parts.append(box_mesh(0.35, 0.08, 0.3, 0, 0.81, -0.1, rgb01("edge")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["desk_set.glb"] = write_glb(
        MOD / "desk_set.glb",
        pos,
        uv,
        col,
        idx,
        tex["desk"],
        "desk_set",
        empty_nodes=[
            {"name": "screen_anchor", "translation": [0.0, 1.02, 0.10]},
            {"name": "keyboard_anchor", "translation": [0.0, 0.77, 0.25]},
            {"name": "mouse_anchor", "translation": [0.45, 0.77, 0.20]},
        ],
    )


def build_slack_panel(tex: dict[str, Path]) -> None:
    parts = []
    parts.append(box_mesh(0.9, 1.1, 0.06, 0, 0, 0, rgb01("slack")))
    parts.append(box_mesh(0.78, 0.95, 0.03, 0, 0, 0.04, rgb01("panel")))
    parts.append(box_mesh(0.78, 0.12, 0.035, 0, 0.42, 0.05, rgb01("slack")))
    parts.append(box_mesh(0.1, 0.08, 0.04, 0.3, 0.42, 0.06, rgb01("blood")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["slack_panel.glb"] = write_glb(
        MOD / "slack_panel.glb", pos, uv, col, idx, tex["slack"], "slack_panel"
    )


def build_kyle(tex: dict[str, Path]) -> None:
    """Abstract blocky bust — not a likeness."""
    parts = []
    parts.append(box_mesh(0.55, 0.55, 0.3, 0, 0.1, 0, rgb01("shirt")))
    parts.append(box_mesh(0.14, 0.12, 0.14, 0, 0.42, 0, rgb01("skin")))
    parts.append(box_mesh(0.36, 0.4, 0.32, 0, 0.68, 0, rgb01("skin")))
    parts.append(box_mesh(0.38, 0.12, 0.34, 0, 0.9, -0.02, rgb01("hair")))
    parts.append(box_mesh(0.34, 0.04, 0.04, 0, 0.72, 0.16, rgb01("ink")))
    parts.append(box_mesh(0.06, 0.08, 0.08, 0, 0.64, 0.16, rgb01("skin")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["kyle_bust.glb"] = write_glb(
        MOD / "kyle_bust.glb", pos, uv, col, idx, tex["kyle"], "kyle_bust"
    )


def build_props(tex: dict[str, Path]) -> None:
    parts = []
    parts.append(box_mesh(0.12, 0.14, 0.12, 0, 0.07, 0, rgb01("mug")))
    parts.append(box_mesh(0.08, 0.02, 0.08, 0, 0.15, 0, rgb01("ink")))
    parts.append(box_mesh(0.03, 0.08, 0.06, 0.08, 0.07, 0, rgb01("mug")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["prop_mug.glb"] = write_glb(
        MOD / "prop_mug.glb", pos, uv, col, idx, tex["mug"], "prop_mug"
    )

    parts = []
    for i, y in enumerate((0.005, 0.012, 0.019)):
        parts.append(box_mesh(0.14, 0.008, 0.14, 0.01 * i, y, 0.01 * i, rgb01("sticky")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["prop_stickies.glb"] = write_glb(
        MOD / "prop_stickies.glb", pos, uv, col, idx, tex["sticky"], "prop_stickies"
    )

    parts = []
    parts.append(box_mesh(0.16, 0.14, 0.16, 0, 0.07, 0, rgb01("plant_pot")))
    parts.append(box_mesh(0.04, 0.35, 0.04, 0, 0.3, 0, rgb01("plant_dead")))
    parts.append(box_mesh(0.2, 0.04, 0.04, 0, 0.4, 0, rgb01("plant_dead")))
    parts.append(box_mesh(0.04, 0.04, 0.18, 0.05, 0.35, 0, rgb01("plant_dead")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["prop_dead_plant.glb"] = write_glb(
        MOD / "prop_dead_plant.glb", pos, uv, col, idx, tex["plant"], "prop_dead_plant"
    )

    parts = []
    parts.append(box_mesh(0.22, 0.01, 0.18, 0, 0.005, 0, rgb01("sticky")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["prop_ticket.glb"] = write_glb(
        MOD / "prop_ticket.glb", pos, uv, col, idx, tex["ticket"], "prop_ticket"
    )


def build_keyboard(tex: dict[str, Path]) -> None:
    """Blocky PS1 keyboard — gray body + keycap grid."""
    parts = []
    # base
    parts.append(box_mesh(0.46, 0.03, 0.16, 0, 0.015, 0, rgb01("gray_dk")))
    # keycap rows (low poly slabs)
    for row, z in enumerate((-0.05, -0.015, 0.02, 0.055)):
        w = 0.42 - row * 0.02
        parts.append(box_mesh(w, 0.02, 0.028, 0, 0.035, z, rgb01("gray")))
    # space bar
    parts.append(box_mesh(0.22, 0.018, 0.025, 0, 0.034, 0.055, rgb01("keycap")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["keyboard.glb"] = write_glb(
        MOD / "keyboard.glb", pos, uv, col, idx, tex["keyboard"], "keyboard"
    )


def build_mouse(tex: dict[str, Path]) -> None:
    """Blocky PS1 ball mouse."""
    parts = []
    parts.append(box_mesh(0.07, 0.035, 0.11, 0, 0.02, 0, rgb01("gray")))
    # buttons (left/right split)
    parts.append(box_mesh(0.03, 0.012, 0.04, -0.018, 0.04, -0.03, rgb01("keycap")))
    parts.append(box_mesh(0.03, 0.012, 0.04, 0.018, 0.04, -0.03, rgb01("keycap")))
    # scroll ditch / seam
    parts.append(box_mesh(0.008, 0.008, 0.035, 0, 0.04, -0.03, rgb01("gray_dk")))
    # cord stub
    parts.append(box_mesh(0.015, 0.015, 0.04, 0, 0.015, -0.07, rgb01("ink")))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["mouse.glb"] = write_glb(
        MOD / "mouse.glb", pos, uv, col, idx, tex["mouse"], "mouse"
    )


def _hand_parts(side: float, skin: tuple[float, float, float]) -> list:
    """Blocky FP hand. side=-1 left, +1 right. Origin near wrist."""
    parts = []
    sx = side
    # palm
    parts.append(box_mesh(0.07, 0.025, 0.09, sx * 0.02, 0.0, -0.06, skin))
    # thumb
    parts.append(box_mesh(0.025, 0.022, 0.045, sx * 0.065, -0.005, -0.04, skin))
    # four fingers (chunky)
    for i, ox in enumerate((-0.025, -0.008, 0.009, 0.026)):
        parts.append(box_mesh(0.018, 0.02, 0.05, sx * (0.02 + ox), 0.0, -0.12, skin))
    return parts


def build_hands(tex: dict[str, Path]) -> None:
    """Blocky first-person left + right hands with wrist empty nodes."""
    skin = rgb01("skin")
    parts = []
    parts.extend(_hand_parts(-1.0, skin))
    parts.extend(_hand_parts(1.0, skin))
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["hands.glb"] = write_glb(
        MOD / "hands.glb",
        pos,
        uv,
        col,
        idx,
        tex["skin"],
        "hands",
        empty_nodes=[
            {"name": "left_wrist", "translation": [-0.18, 0.0, 0.0]},
            {"name": "right_wrist", "translation": [0.18, 0.0, 0.0]},
        ],
    )


def build_screen_quad(tex: dict[str, Path]) -> None:
    """0.42 x 0.32 Win95 teal quad for CRT blit surface."""
    # thin box matching CRT screen face size
    parts = [box_mesh(0.42, 0.32, 0.01, 0, 0, 0, rgb01("teal"))]
    pos, uv, col, idx = merge_meshes(parts)
    TRIANGLE_COUNTS["screen_quad.glb"] = write_glb(
        MOD / "screen_quad.glb", pos, uv, col, idx, tex["teal"], "screen_quad"
    )


ANCHORS = {
    "desk_set.glb": {
        "screen_anchor": [0.0, 1.02, 0.10],
        "keyboard_anchor": [0.0, 0.77, 0.25],
        "mouse_anchor": [0.45, 0.77, 0.20],
    },
    "hands.glb": {
        "left_wrist": [-0.18, 0.0, 0.0],
        "right_wrist": [0.18, 0.0, 0.0],
    },
}


def write_manifest(tex: dict[str, Path]) -> None:
    models = sorted(p.name for p in MOD.glob("*.glb"))
    textures = sorted(p.name for p in TEX.glob("*.png"))
    man = {
        "pipeline": "three.js + PS1 post (vertex snap, nearest, 320x240, Bayer) + Win95-on-CRT",
        "units": "meters-ish; cubicle ~6x6, desk height ~0.74",
        "up": "Y",
        "filter": "NEAREST (embedded sampler mag/min 9728)",
        "models": [f"assets/models/{m}" for m in models],
        "textures": [f"assets/textures/{t}" for t in textures],
        "anchors": {
            f"assets/models/{k}": v for k, v in ANCHORS.items()
        },
        "triangleCounts": {f"assets/models/{k}": v for k, v in sorted(TRIANGLE_COUNTS.items())},
        "loadHint": "THREE.GLTFLoader; traverse and force material.map.magFilter/minFilter = NearestFilter; generateMipmaps=false; bind Win95 canvas to screen_anchor / screen_quad",
    }
    (ROOT / "manifest.json").write_text(json.dumps(man, indent=2) + "\n")
    print("manifest.json written")


def main() -> None:
    print("textures…")
    tex = write_textures()
    print("models…")
    build_cubicle(tex)
    build_desk_set(tex)
    build_slack_panel(tex)
    build_kyle(tex)
    build_props(tex)
    build_keyboard(tex)
    build_mouse(tex)
    build_hands(tex)
    build_screen_quad(tex)
    write_manifest(tex)
    print("done")
    print("triangle counts:", json.dumps(TRIANGLE_COUNTS, indent=2))


if __name__ == "__main__":
    main()
