# corp.exe — Cubicle Farm Hellscape (Designer → Developer)

Michael env pass: **brighter** + **dense** + **every neighbor CRT lit**. You’re one of hundreds.

Do **not** keep the old 3-bay layout (`±6.2m`). That reads as an empty warehouse.

## Grid (ship this)

| Param | Value | Notes |
|-------|--------|------|
| Cell pitch X | **2.2 m** | Shoulder-to-shoulder partitions |
| Cell pitch Z | **2.6 m** | Row depth (desk faces −Z toward aisle or +Z toward player aisle — pick one and stick) |
| Columns | **−10 … +10** (21) | Skip player cell `(0,0)` for neighbor instances |
| Rows | **−8 … +4** (13) | ≈ **270** neighbor bays before skip; aim **≥200** on screen/fog |
| Player cell | `(0, 0)` | Full `cubicle.glb` + `desk_set` + Win95 CRT (unchanged) |
| Neighbor asset | `assets/models/neighbor_bay.glb` | Cheap bay: walls + desk slab + **bright CRT quad** |
| Optional glow quad | `assets/models/crt_glow.glb` / `textures/crt_glow.png` | If you instance screens alone |

Player collision / sit stay local to the home bay. Neighbors are visual only (no colliders).

**Spawn visibility:** skip neighbor at `(0, +1)` as well as `(0, 0)` — that aisle cell sits between walk-start (`z≈3.2`) and the player CRT and otherwise eclipses it with a green screen.

### Pseudocode

```js
const PITCH_X = 2.2, PITCH_Z = 2.6;
for (let ix = -10; ix <= 10; ix++) {
  for (let iz = -8; iz <= 4; iz++) {
    if (ix === 0 && iz === 0) continue; // player
    const bay = neighborBay.clone(); // or InstancedMesh
    bay.position.set(ix * PITCH_X, 0, iz * PITCH_Z);
    // slight Yaw jitter optional: (ix+iz)%2 ? Math.PI : 0  — keep identical for dread
    farm.add(bay);
  }
}
```

Prefer **`InstancedMesh`** for neighbor bays / CRT quads if clone cost hurts. Cap draw with fog; don’t frustum-cull so hard the farm feels empty.

## Lighting (brighter farm, still PS1)

| Light | Suggestion |
|-------|------------|
| Ambient | `#8a8680` intensity **≥ 1.0** (was muddy) |
| Key directional | `#d0c8b0` ~0.8 from above-front |
| Fluorescent fills | Point/spot every **2–3 cells** along Z, color `#e8e4c8`, intensity 0.45, distance ~5 |
| Fog | `THREE.Fog(0x3a3830, 8, 22)` — lifted near, still eats the horizon |
| Clear / bg | `#2a2820` not pure black |

No bloom. Brightness = more lights + emissive CRTs, not post glow.

## CRT glow (every neighbor)

Neighbor screen faces must read as **on** from the aisle:

| Token | Hex | Use |
|-------|-----|-----|
| crt_green | `#5ecf4a` | Classic terminal glow |
| crt_teal | `#3ec8b0` | Win95-ish teal wash (mix per column) |
| crt_dim | `#2a6030` | Far fog row variant |

Material: `MeshBasicMaterial` or `MeshStandardMaterial` with **`emissive: crt_green`, `emissiveIntensity: 0.85–1.2`**, `toneMapped: false`. Nearest filter on any texture (`assets/textures/crt_glow.png`).

Player CRT stays the Win95 blit target (`screen_quad` / Basic + canvas map) — already “bright.”

Vertex color on `neighbor_bay` CRT face is already lit green; still set emissive in code so fog doesn’t kill it.

## Scale note on `cubicle.glb`

Legacy footprint ~**6×6**. For dense packing either:
1. **Preferred:** instance `neighbor_bay.glb` (tight ~2.0–2.2 m wide) for NPCs; keep full cubicle only on player cell, **or**
2. Scale legacy cubicle clones to `~0.36` on XZ and pitch 2.2 — looks wrong; avoid.

## Audio sync (not Designer-owned)

Oppressive exhausted bed — see Audio. Visual density should match constant unsynced keyboard glow flicker (optional: multiply CRT emissive by 0.85–1.0 sin jitter per instance).

## Checklist for “walkable-bright”

- [ ] ≥200 neighbor CRTs visible as glowing rectangles into fog
- [ ] Pitch ≤ 2.2 / 2.6 (claustrophobic aisles)
- [ ] Ambient + fluorescents lifted; fog not black soup
- [ ] Player sit/Win95 unbroken
