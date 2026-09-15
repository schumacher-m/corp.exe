# corp.exe — Cubicle Farm Hellscape (Designer → Developer)

Michael env pass: **brighter** + **dense** + **every neighbor CRT lit** + **seated workers**. You’re one of hundreds.

Do **not** keep the old 3-bay layout (`±6.2m`). That reads as an empty warehouse.

## Grid (ship this)

| Param | Value | Notes |
|-------|--------|------|
| Cell pitch X | **2.2 m** | Shoulder-to-shoulder partitions |
| Cell pitch Z | **2.6 m** | Row depth (desk faces −Z toward aisle or +Z toward player aisle — pick one and stick) |
| Columns | **−10 … +10** (21) | Skip player cell `(0,0)` for neighbor instances |
| Rows | **−8 … +4** (13) | ≈ **270** neighbor bays before skip; aim **≥200** on screen/fog |
| Player cell | `(0, 0)` | Full `cubicle.glb` + `desk_set` + Win95 CRT (unchanged) |
| Neighbor bay | `assets/models/neighbor_bay.glb` | Walls + desk + **chunky PS1 CRT** (~110 tris); empty `screen_face` |
| Neighbor CRT | `assets/models/neighbor_crt.glb` | Standalone chunky CRT (~50 tris) if you instance screens separately |
| Optional glow quad | `assets/models/crt_glow.glb` / `textures/crt_glow.png` | If you instance screen faces alone |
| Seated worker | `assets/models/worker_seated.glb` (+ `_b` variant) | Blocky sit-pose clerk; fidget empties |

Player collision / sit stay local to the home bay. Neighbors are visual only (no colliders).

**Spawn visibility:** skip neighbor at `(0, +1)` as well as `(0, 0)` — that aisle cell sits between walk-start (`z≈3.2`) and the player CRT and otherwise eclipses it with a green screen.

### Pseudocode

```js
const PITCH_X = 2.2, PITCH_Z = 2.6;
for (let ix = -10; ix <= 10; ix++) {
  for (let iz = -8; iz <= 4; iz++) {
    if (ix === 0 && iz === 0) continue; // player
    if (ix === 0 && iz === 1) continue; // aisle sightline
    const bay = neighborBay.clone(); // or InstancedMesh
    bay.position.set(ix * PITCH_X, 0, iz * PITCH_Z);
    farm.add(bay);

    // Worker at desk seat (bay desk ~z=-0.35; seat toward aisle)
    const w = (hash(ix, iz) & 1) ? workerB.clone() : workerA.clone();
    w.position.set(ix * PITCH_X, 0.45, iz * PITCH_Z + 0.15);
    farm.add(w);
  }
}
```

Prefer **`InstancedMesh`** for neighbor bays / CRTs / workers if clone cost hurts. Cap draw with fog; don’t frustum-cull so hard the farm feels empty.

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

Use the upgraded **chunky** CRT (`neighbor_bay` embedded or standalone `neighbor_crt`): bevelled plastic body, thick base/neck, dark inset bezel, bright screen. Empty node **`screen_face`** sits at screen center — find it after load and apply emissive there (or swap a MeshBasic child).

Neighbor screen faces must read as **on** from the aisle:

| Token | Hex | Use |
|-------|-----|-----|
| crt_green | `#5ecf4a` | Classic terminal glow |
| crt_teal | `#3ec8b0` | Win95-ish teal wash (mix per column) |
| crt_dim | `#2a6030` | Far fog row variant |

Material on `screen_face` / screen mesh: `MeshBasicMaterial` **or** `MeshStandardMaterial` with **`emissive: crt_green`, `emissiveIntensity: 0.85–1.2`**, `toneMapped: false`. Nearest filter on any texture (`assets/textures/crt_glow.png`). Vertex color on the screen face is already ~`(0.37, 0.81, 0.29)`; still set emissive in code so fog doesn’t kill it.

Player CRT stays the Win95 blit target (`screen_quad` / Basic + canvas map) — already “bright.”

## Seated workers + fidget

**Shipped:** `worker_seated.glb` / `worker_seated_b.glb` alternate per cell; fidget empties `head`/`torso`/`arm_L`/`arm_R`. CRT via `neighbor_bay.screen_face` (+ `neighbor_crt.glb` if bay lacks empty). Proxies only if GLBs fail to load.

**Designer target:** Instance `worker_seated.glb` (and optional `worker_seated_b.glb` for shirt/hair tint variety) at each neighbor desk seat. Static bind pose is fine — animate empties in code, **not** cinematic:

| Node | Role |
|------|------|
| `torso` | tiny forward lean ±1° |
| `head` | bob ±2° |
| `arm_L` / `arm_R` | typing sin |

Empty nodes are named **exactly** `head`, `torso`, `arm_L`, `arm_R`. CRT empty is **`screen_face`**.

Suggested loop (phase-offset per instance):

```js
const seed = hash(ix, iz); // stable int
const t = time + seed * 0.17;
torso.rotation.x = Math.sin(t * 0.7) * (Math.PI / 180);     // ±1°
head.rotation.x  = Math.sin(t * 1.3) * (2 * Math.PI / 180);  // ±2°
arm_L.rotation.x = Math.sin(t * 8.0) * 0.08;
arm_R.rotation.x = Math.sin(t * 8.0 + 0.9) * 0.08;
```

Keep it cheap: no IK, no blendshapes, no secondary cloth.

## Tris budget (~270 instances)

| Asset | Tris | ×270 (order-of) |
|-------|------|-----------------|
| `neighbor_bay.glb` | ~110 | ~30k |
| `neighbor_crt.glb` alone | ~50 | ~13.5k (if split) |
| `worker_seated*.glb` | ~96 | ~26k |
| `crt_glow.glb` | 2 | negligible |

Stay near these numbers. Prefer one InstancedMesh per asset; don’t attach high-poly props to every bay.

## Scale note on `cubicle.glb`

Legacy footprint ~**6×6**. For dense packing either:
1. **Preferred:** instance `neighbor_bay.glb` (tight ~2.1×2.4 m) for NPCs; keep full cubicle only on player cell, **or**
2. Scale legacy cubicle clones to `~0.36` on XZ and pitch 2.2 — looks wrong; avoid.

## Audio sync (not Designer-owned)

Oppressive exhausted bed — see Audio. Visual density should match constant unsynced keyboard glow flicker (optional: multiply CRT emissive by 0.85–1.0 sin jitter per instance).

## Checklist for “walkable-bright”

- [ ] ≥200 neighbor CRTs visible as glowing **CRT boxes** (bezel/rim + glow screen) into fog
- [ ] Screen glow via `crt_glow` / Basic `toneMapped:false` (not flat hero planes alone)
- [ ] Fidgeting seated workers at desks (`farmWorkers[]`, phase-offset)
- [ ] Pitch ≤ 2.2 / 2.6 (claustrophobic aisles)
- [ ] Ambient + fluorescents lifted; fog not black soup
- [ ] Player sit/Win95 unbroken
- [ ] Farm tris stay in the ballpark above (~270 instances)


## CRT meshes (not flat hero planes)

Neighbor screens must read as **real CRT boxes**, not lone green `PlaneGeometry` billboards.

| Approach | Notes |
|----------|--------|
| `neighbor_bay.glb` | Already includes plastic CRT volume + screen face — keep it |
| Overlay bezel | Desk_set-proportion CRT body (`~0.52×0.42×0.40`) + neck + **glow screen** |
| Glow | `crt_glow.glb` and/or `textures/crt_glow.png` on `MeshBasicMaterial`, `toneMapped: false` |
| Colors | `#5ecf4a` / `#3ec8b0` / `#2a6030` (far) — nearest filter |
| Player | Win95 `screen_quad` unchanged |

Do **not** paint the whole merged `neighbor_bay` mesh flat green Basic — that washes walls. Boost screen via overlay glow / dedicated CRT group.

Optional Designer drops (auto-probed): `crt.glb`, `worker.glb`, `neighbor_worker.glb`.

## Workers (ambient farm presence)

Place a low-poly seated worker in front of each neighbor desk (slightly toward aisle, facing CRT).

| Until Designer ships `worker.glb` | Use |
|----------------------------------|-----|
| Head | Scaled `kyle_bust.glb` clone, or box + hair |
| Body | Shared box geos: torso / pelvis / arms / tucked legs |
| Mats | shirt `#323746` / skin `#8c7864` / hair `#1e1c1a` (+ textures if present) |
| Storage | `farmWorkers[]` with per-bay `phase`, `bobSpeed`, `typeSpeed` |

### Fidget (every frame on walk + title ambient)

- Head bob: `sin(t * bobSpeed + phase)` → small Y + look rot
- Typing: alternate arm X/Z rotation
- Occasional lean toward CRT (`root.rotation.x`)
- Stagger phases from `ix/iz` so the farm doesn’t sync-dance

Perf: shared geometries/materials; clone meshes (not re-load GLTF); keep CLOCK IN async. Prefer all neighbors with simple proxies over few fancy ones. Cap only if needed (fog ~22).

### Console ping

`console.info` farm neighbor / CRT / worker counts on load.

