# corp.exe — Visual Bible (Designer → Developer)

**Mandate:** PS1-era 3D office world **plus** a Windows 95 virtual desktop rendered **on the in-world CRT**. Silent Hill 1 / LSD Dream Emulator cubicle farm outside; chunky Win95 chrome on the monitor face. Not Blender Cycles, not slick SaaS, not full-screen CRT-terminal 2D.

Player loop (look): **first-person walk** into the cubicle → sit at desk (**desk POV**) → **hands** on keyboard/mouse; work happens on the CRT (Win95 desktop).

Win95 chrome specs: **`WIN95.md`**. Anchors: `assets/manifest.json` → `anchors`.

## Engine (recommendation)

**Three.js** + PS1 post pipeline. Lightest fit for a static HTML meme game.

Required post / render rules:
1. Internal render target **320×240** (or 512×240), then nearest-neighbor upscale to window.
2. **Vertex snap** in the vertex shader (quantize to low grid in clip/NDC space).
3. Prefer **affine-style UVs** (no perspective-correct polish) if you use a custom shader; otherwise accept Three defaults but keep textures nearest.
4. Textures: `magFilter = minFilter = THREE.NearestFilter`, `generateMipmaps = false`.
5. Bayer / ordered **dither** in fragment post (4×4). Limited palette multiply optional.
6. Fog: muddy brown-grey (`#1a1814` → `#3d3a32`), short distance — SH1 hallway soup.
7. No bloom, no SSAO, no soft shadows. Hard or vertex-color only lighting.

Reference search terms for Dev: `three.js PS1 shader vertex snapping`, `affine texture mapping three.js`, `retro 320x240 render target`.

Babylon / PlayCanvas only if you need an editor — not required for v1.

## Palette (match textures + CSS leftovers)

| Token | Hex | Use |
|-------|-----|-----|
| fog | `#1a1814` | clear / fog color |
| wall | `#3d3a32` | partitions |
| desk | `#2a2820` | furniture |
| skin | `#8c7864` | FP hands / Kyle skin |
| teal | `#008080` | Win95 desktop / screen_quad |
| gray | `#C0C0C0` | Win95 face / keyboard / mouse |
| sick | `#6b8f3a` | HelixStack / OK |
| amber | `#c4a035` | sprint / warnings |
| blood | `#8b3a2a` | unread / danger |
| slack | `#4a3048` | IM chrome |
| jira | `#a89030` | ticket sticker |

## Assets (v1) — load from box paths

All under `/workspace/corp-html/assets/`. Regenerator: `assets/build_ps1_assets.py`.

| File | Tris (approx) | Role |
|------|----------------|------|
| `models/cubicle.glb` | 96 | Floor, walls, ceiling, fluorescent strips |
| `models/desk_set.glb` | 132 | Desk + chair + CRT; empty nodes `screen_anchor`, `keyboard_anchor`, `mouse_anchor` |
| `models/keyboard.glb` | 72 | Blocky keyboard → parent to `keyboard_anchor` |
| `models/mouse.glb` | 60 | Blocky mouse → parent to `mouse_anchor` |
| `models/hands.glb` | 144 | Blocky FP L+R hands; empty `left_wrist`, `right_wrist` |
| `models/screen_quad.glb` | 12 | 0.42×0.32 Win95 teal quad → parent to `screen_anchor`; blit target |
| `models/slack_panel.glb` | 48 | Floating / second-screen IM bezel |
| `models/kyle_bust.glb` | 72 | Abstract blocky reviewer bust (PR fight) |
| `models/prop_mug.glb` | 36 | Coffee mug |
| `models/prop_stickies.glb` | 36 | Sticky stack |
| `models/prop_dead_plant.glb` | 48 | Dead plant |
| `models/prop_ticket.glb` | 12 | Yellow ticket sticker |

Textures: `assets/textures/*.png` (16–64px, Bayer-dithered, embedded in GLBs too). Samplers already **NEAREST**.

`assets/manifest.json` — machine-readable load list, **anchors map**, filter hint.

### Anchors (glTF empty child nodes)

**`desk_set.glb`**
- `screen_anchor` translation `[0, 1.02, 0.10]` — mount `screen_quad` / Win95 blit
- `keyboard_anchor` `[0, 0.77, 0.25]` — mount `keyboard.glb`
- `mouse_anchor` `[0.45, 0.77, 0.20]` — mount `mouse.glb`

**`hands.glb`**
- `left_wrist` `[-0.18, 0, 0]`
- `right_wrist` `[0.18, 0, 0]`

### Suggested scene graph

```
OfficeRoot
  Cubicle          (cubicle.glb)
  DeskSet          (desk_set.glb) @ ~(0, 0, -0.8)
    screen_anchor      ← screen_quad.glb + Win95 canvas texture (see WIN95.md)
    keyboard_anchor    ← keyboard.glb
    mouse_anchor       ← mouse.glb
  Hands            (hands.glb) camera-relative FP
    left_wrist / right_wrist
  SlackPanel       (slack_panel.glb) floating left of CRT
  Props            mug / stickies / plant / ticket on desk top (y≈0.78)
  KyleBust         only during PR fight, near camera or in panel
```

Units: Y-up, meters-ish. Desk top ≈ **y=0.74**. Cubicle footprint ≈ **6×6**.

### CRT → Win95 → 2D game UI

Render the Win95 desktop (tickets / Slack / IDE / PR fight + Sanity/Sprint/Unread meters) into a **low-res canvas/DOM**, blit as texture on `screen_quad` at `screen_anchor`. Nearest upscale only. Full chrome rules in **`WIN95.md`**.

## 2D CSS note

`style.css` is a leftover PS1-flat HUD pass (palette aligned). Prefer 3D world + Win95-on-CRT; scrap full-screen CRT scanline habits if they sneak back. Optional DOM chrome classes: `.w95-desktop` `.w95-window` `.w95-titlebar` `.w95-btn` `.w95-taskbar` `.w95-start` (see WIN95.md).

## Anti-patterns

Photoreal materials, mipmapped textures, orbit-smooth cinematic camera, rounded SaaS panels, neon glow, caricature likeness for Kyle, Win95 full-screen instead of on the CRT face.

## Preview

Open `assets/preview/index.html` (Three.js CDN + GLTFLoader) to eyeball models. Not the game — Dev owns `index.html` game loop.
