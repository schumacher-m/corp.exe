# CORP-TOWER-01 — Designer hook list (Dev)

Spec: `specs/12-tower-arrival.md`. Art: PS1 same as farm (`docs/VISUAL.md`, `docs/FARM.md`).
**Floor after elevator = brighter aisle-grid farm** (reuse FARM locks — do not invent a second office).



## CORP-TOWER-03.1 hotfix (2026-09-18)

Playtest FAIL on tower10 → kits + empty yaw:

| Fix | Detail |
|-----|--------|
| `prop_hr_poster` | Local **+Z = into room**; empty `hr_poster` has yaw (+90° Y) so +Z → +X into lobby |
| `prop_elevator_panel` | Flat plate, local **+Z into car**; empty `elevator_panel` on car (+X wall, −90° Y) |
| `prop_security_guard` | Tall standing silhouette; mesh baked **+0.55 X** behind desk; new empty `security_guard` at `[3.05,0,1.5]` |
| `neighbor_bay.glb` | Footprint **1.95×2.35** (≤ pitch−0.2) — no `iz=+1` / `ix=±5` spill |

Dev: copy empty **world quaternion** on wall props; prefer `security_guard` empty for Guard. Soft DROP parked.

## CORP-TOWER-03.3 — Elev doors + Guard scale (2026-09-18)

See **`specs/17-elev-doors-guard-scale.md`**. Doors **open on badge success** (blocking until then). Guard standing **~1.75–1.85m**. Scale ref: player eye ~1.6m; adult NPC 1.75–1.85m; door leaf ~2.1m; ceiling ~2.7m. Counts locked. Soft DROP parked.

### Elev door attach (tower16 fix)

- **Primary empties on `tower_lobby`:** `elevator_door_L` / `elevator_door_R` / `elevator_door` at z≈−6.4 flush in jamb (open aperture — no grey filler plug).
- Leaves: `prop_elev_door_L/R`. **Open slide = local ±X** (L −0.55, R +0.55). Closed seals opening.
- Car also has L/R empties for interior; prefer lobby hooks for lobby-facing doors.
- Lobby **-Z wall is split** around elev opening (|x|<~0.75) so open leaves reveal car interior (no grey backface plug). tower17.


## CORP-TOWER-03.2 — Guard + turnstile (2026-09-18)

See **`specs/16-lobby-turnstile-guard.md`**. Real-world lobby grammar: Guard behind desk facing approach; badge beat = waist-high **turnstile** on path to elevator. Keep `badge_reader` empty name. Counts locked. Soft DROP parked.

| Asset | Role |
|-------|------|
| `prop_security_guard.glb` | Behind desk, facing aisle/player |
| `prop_turnstile.glb` | Badge gate before elevator |
| empty `security_guard` | Guard attach (not desk XYZ) |
| empty `badge_reader` | Turnstile attach / interact |

## CORP-TOWER-03 — Lobby landmarks (2026-09-18)

See **`specs/14-lobby-landmarks.md`**. ✅ **kits shipped** — Guard NPC, large HR poster, yellow A-frame + puddle, `lobby_floor_b`/`lobby_wall_b`. Lobby empty `wet_floor` at `[-2,0,2.5]` floor Y. Other empties unchanged; badge/2-of-3 locked. Soft DROP parked.

| Asset | Role |
|-------|------|
| `prop_security_guard.glb` (or desk kit update) | Staring Guard NPC |
| `prop_hr_poster.glb` | Larger readable poster |
| `prop_wet_floor.glb` | Yellow cone + shiny puddle |
| Lobby floor/wall texture variants | Slab/wall variety |

## CORP-TOWER-02 — Brutalist redesign (2026-09-18)

See **`specs/13-plaza-lobby-redesign.md`**. Empties unchanged. Ship **redesign kits first**, then **bugfix** (ceiling props / nav / farm-pause perf). Soft DROP still parked.

## Kits to load (modular — shipping / regenerating)

| GLB | Role | Status |
|-----|------|--------|
| `assets/models/tower_plaza.glb` | Exterior plaza + tower massing | ✅ CORP-TOWER-02 Phase A (brutalist) |
| `assets/models/tower_lobby.glb` | Lobby shell | ✅ CORP-TOWER-02 Phase A (brutalist) |
| `assets/models/elevator_car.glb` | Elevator interior | ✅ CORP-TOWER-02 Phase A (brutalist) |
| `assets/models/office_floor.glb` | Optional corridor stub → farm; or skip and spawn farm at `elevator_exit` | ⏳ optional / skip OK |
| `assets/models/prop_badge_reader.glb` | Lobby badge scan | ✅ shipped |
| `assets/models/prop_coffee.glb` | Coffee machine beat | ✅ shipped |
| `assets/models/prop_security_desk.glb` | Security stare beat | ✅ shipped |
| `assets/models/prop_hr_poster.glb` | HR poster beat | ✅ CORP-TOWER-03 large readable |
| `assets/models/prop_security_guard.glb` | Staring Guard NPC behind desk | ✅ CORP-TOWER-03 |
| `assets/models/prop_wet_floor.glb` | Yellow A-frame + shiny puddle | ✅ CORP-TOWER-03 |
| `assets/models/prop_elevator_panel.glb` | Call/floor buttons (or empties on car) | ✅ shipped |

Graybox PS1 kits landed via `assets/build_tower_assets.py` (imports helpers from `build_ps1_assets.py`). Empties below are embedded as named nodes — Dev can wire phases.

## Readable grim (P0 — not void)

Plaza→tower walk must read silhouettes / grounds / walls. **Not** flat near-black Lambert.

| Texture | Path | Role | Target avg RGB |
|---------|------|------|----------------|
| `floor.png` | `assets/textures/floor.png` | Plaza + lobby slabs (reuse farm) | ~100–140 (ship ~129) |
| `plaza_concrete.png` | `assets/textures/plaza_concrete.png` | Plaza curb / concrete accents | ~100–140 |
| `tower_facade.png` | `assets/textures/tower_facade.png` | Tower mass + door surround | ~100–140 |
| `lobby_wall.png` | `assets/textures/lobby_wall.png` | Lobby walls / elev interior | ~100–140 |
| `lobby_floor_b.png` | `assets/textures/lobby_floor_b.png` | Lobby slab seams/scuffs (TOWER-03) | ~100–140 |
| `lobby_wall_b.png` | `assets/textures/lobby_wall_b.png` | Cooler fluo wall tint (TOWER-03) | ~100–140 |
| `hr_poster.png` | `assets/textures/hr_poster.png` | Readable HR values plate | ~100–140 |

- Kits use **bright vertex colors** (~0.85–1.0) × these albedos so multiply stays readable.
- Regenerator: `assets/build_tower_assets.py` (`write_tower_textures` + `assert_readable_albedo` refuse avg < 100).
- **Dev:** add plaza light rig (ambient + key); art alone won’t fix a zero-light scene — but mats are no longer void.
- Soft DROP toast polish still parked.

Status: ✅ **readable-grim pass shipped** (empties unchanged).



## CORP-TOWER-02 Phase A — Brutalist redesign

Direction: Silent Hill office mass / heavy concrete (not glass). Spec: `specs/13-plaza-lobby-redesign.md`.

| Kit | What changed |
|-----|----------------|
| `tower_plaza.glb` | Monolithic tall mass, recessed slot-window grid, deep portal + double doors, plaza seams/curbs |
| `tower_lobby.glb` | Low ~2.7m ceiling, thick walls + pilasters, clear aisle spawn→elev, security desk landmark |
| `elevator_car.glb` | Heavier jamb/lintel language (same empties) |

**Empties unchanged** (names + floor Y). Albedo guards still refuse avg < 100. Readable-grim lighting from tower7 stays. Phase B (ceiling props / nav / perf) waits for CoS after this tip.

Soft DROP parked.


## Phase empties / interact volumes

### Plaza (`phase: plaza`)
| Name | Purpose |
|------|---------|
| `plaza_spawn` | CLOCK IN drop |
| `tower_entrance` | Trigger / E → lobby |

### Lobby (`phase: lobby`)
| Name | Interact | Beat |
|------|----------|------|
| `lobby_spawn` | — | Player drop into lobby |
| `badge_reader` | E / click | **Always required** badge |
| `coffee_machine` | E | Daily pool |
| `security_desk` | Hold / wait bar | Daily pool |
| `security_guard` | Guard NPC attach (prefer over desk XYZ) | — |
| `hr_poster` | E → dismiss | Daily pool |
| `wet_floor` | E | Daily pool (cone+puddle) |
| `lobby_sync_chip` | Optional UI chip | Daily pool (alt) |
| `elevator_call` | E when checklist met | Unlock car |

Checklist HUD: badge + 2-of-3 (GD pool). Elevator locked until done.

### Elevator (`phase: elevator`)
| Name | Purpose |
|------|---------|
| `elevator_interior` | Player root in car |
| `btn_floor_wrong_*` | Wrong floors → Writer toast |
| `btn_floor_player` | Correct → `floor` |
| `elevator_door` | Open/close cue |

### Floor (`phase: floor`)
| Name | Purpose |
|------|---------|
| `elevator_exit` | Match FARM.md `(0,0,10.4)` |
| `aisle_start` | Main aisle |
| Sit handoff | Existing farm sit at player desk `(0,0)` |

## Lighting
Reuse FARM.md P0 brighten on floor/farm. Plaza/lobby: same ambient family, slightly cooler lobby fluo OK — no bloom.

## Manifest
Kits listed in `assets/manifest.json` (models + anchors + triangleCounts). Regenerator: `assets/build_tower_assets.py` (reuses `box_mesh` / `write_glb` from `build_ps1_assets.py`).

**CORP-FARM-04:** Floor after elev — clear `ix=0` spine iz≥1 + bay colliders + brighter fluo. Spec: `specs/20-office-floor-path.md`.
