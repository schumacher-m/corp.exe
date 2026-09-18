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
| Neighbor bay | `assets/models/neighbor_bay.glb` | Walls + desk + **chunky PS1 CRT**; footprint **≤1.95×2.35** (pitch−0.2, CORP-TOWER-03.1 — no aisle spill); empty `screen_face` |
| Neighbor CRT | `assets/models/neighbor_crt.glb` | Standalone chunky CRT (~50 tris) if you instance screens separately |
| Optional glow quad | `assets/models/crt_glow.glb` / `textures/crt_glow.png` | If you instance screen faces alone |
| Seated worker | `assets/models/worker_seated.glb` (+ `_b` variant) | Blocky sit-pose clerk; fidget empties |

Player collision / sit stay local to the home bay. **CORP-FARM-04:** remaining neighbor bays + player cubicle walls use simple XZ AABB colliders (footprint ≤1.95×2.35); aisle spine stays walkable.

**Aisles (floor lock — authoritative):**
- Main aisle: clear the **entire** `iz === +1` row (E–W corridor). No neighbor bays on that row.
- Cross aisles: clear entire columns `ix === 5` and `ix === -5` (N–S). No neighbor bays there.
- **CORP-FARM-04 spine:** also skip `ix === 0 && iz >= 1` (elev `z≈10.4` → aisle → Cubicle 4-B). Keep player home `(0,0)` only.
- Still skip player home `ix===0 && iz===0` (full cubicle stays).
- Do **not** skip all of `ix===0` below iz=1 — only spine `iz>=1` plus `(0,0)` for player; the E–W main aisle is `iz=+1`.
- Player CRT faces **+Z** (Designer confirm); elev handoff at +Z looks **−Z** down spine. Neighbor bays: no yaw into spine.

### Elevator / tower handoff (empties)

| Empty | World pos (approx) | Notes |
|-------|--------------------|-------|
| `elevator_exit` | `(0, 0, 10.4)` | End of +Z farm; look −Z into main aisle |
| `aisle_start` | `(0, 0, 2.6)` | On main aisle `iz=+1`; look −Z to desk |
| Player desk | `(0, 0, 0)` | CRT faces −Z |

```
        +Z  elevator_exit
             |
    [bays] --+-- [bays]   cross ix=±5
             |
    ==== MAIN AISLE iz=+1 ====
             |
          player (0,0)
             |
           -Z farm
```


### Pseudocode

```js
const PITCH_X = 2.2, PITCH_Z = 2.6;
for (let ix = -10; ix <= 10; ix++) {
  for (let iz = -8; iz <= 4; iz++) {
    if (ix === 0 && iz === 0) continue; // player home
    if (iz === 1) continue;             // E–W main aisle
    if (ix === 5 || ix === -5) continue; // N–S cross aisles
    if (ix === 0 && iz >= 1) continue;  // CORP-FARM-04 elev→desk spine
    const bay = neighborBay.clone(); // or InstancedMesh
    // desks face −Z — do not rotate toward center
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

## Lighting (floor lock — brighter farm, still PS1)

| Light | Value |
|-------|-------|
| Ambient | `#b0aca0` @ **2.35** (CORP-FARM-04; was 2.1) |
| Key directional | `#e8e0cc` **1.3** above-front |
| Fluorescent banks | `#f0ecd4` @ **1.3**, distance **10** (was 1.1) |
| Player desk fluo | same `#f0ecd4` @ **1.55** (was 1.4) |
| Fog | `THREE.Fog(0x5a5848, 20, 46)` (was 18/40 — aisles read lit) |
| Clear / bg | `#4a4840` |

No bloom. Brightness = more lights + emissive CRTs, not post glow. Proxy walls prefer `MeshLambert` so ambient/fluo hit them.


## Farm ground (aisle voids)

Clearing `iz=+1` / `ix=±5` removes bay floors — without a slab the aisle reads as a black void.

| Asset | Path | Role |
|-------|------|------|
| Farm ground | `assets/models/farm_ground.glb` | Single bright `floor.png` slab under the whole farm (~24×36 m, y≈−0.02) |

**Dev:** parent under `CubicleFarm` at origin (mesh already centered toward −Z). Nearest filter. Do not use MeshBasic black.

`floor.png` target avg RGB **~120–140** olive-gray (Tester FAIL was ~(2,2,2) near-black).

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
- [ ] Ambient ~1.55 + fluo `#f0ecd4` ~0.85; fog `0x4a4840, 12, 30`; aisles iz=+1 + ix=±5
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


## CORP-FARM-04 — elev→desk spine (2026-09-18)

After tower elev handoff at `elevator_exit` (0,~,10.4), also **skip neighbor bays on `ix===0 && iz>=1`** so the center spine is walkable. Add AABB colliders on remaining bays (neighbors were visual-only). Copy: no “glowing CRT” while player monitor is off. Slight fluo bump — see `specs/20-office-floor-path.md`.

### Shipped deltas (Dev tip `?v=farm1`)

| Item | Value |
|------|-------|
| Spine skip | `ix===0 && iz>=1` (+ keep `iz===1`, `ix===±5`, player `(0,0)`) |
| Colliders | XZ AABB per neighbor bay (1.95×2.35) + player U-walls/desk; circle r≈0.22 resolve in `updateWalk` |
| Ambient / grid fluo / desk fluo | **2.35** / **1.3** / **1.55** |
| Fog | near **20**, far **46** (color unchanged `#5a5848`) |
| Prompts | `towerArrival.farmWalk` — walk / canSit / tooFar (no “glowing CRT”) |

## CORP-FARM-04 — Designer confirm (2026-09-18)

Spec: `specs/20-office-floor-path.md`. Tip `?v=farm1`.

| Check | Status |
|-------|--------|
| `neighbor_bay.glb` footprint | ✅ **1.95 × 2.35** (≤ pitch−0.2) — OK with spine skip `ix===0 && iz>=1`; no kit rebuild unless smoke shows spill |
| Player desk / CRT | ✅ `desk_set` screen toward **+Z** (seated player); approach from elev **+Z** looking **−Z** down spine — leave as-is |
| Albedo | Hold — Dev fluo bump first; only retouch `floor.png` / `farm_ground` if aisle still mud after tip |

Soft DROP parked.


