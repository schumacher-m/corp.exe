# CORP-TOWER-01 — Designer hook list (Dev)

Spec: `specs/12-tower-arrival.md`. Art: PS1 same as farm (`docs/VISUAL.md`, `docs/FARM.md`).
**Floor after elevator = brighter aisle-grid farm** (reuse FARM locks — do not invent a second office).

## Kits to load (modular — shipping / regenerating)

| GLB | Role |
|-----|------|
| `assets/models/tower_plaza.glb` | Exterior plaza + tower massing |
| `assets/models/tower_lobby.glb` | Lobby shell |
| `assets/models/elevator_car.glb` | Elevator interior |
| `assets/models/office_floor.glb` | Optional corridor stub → farm; or skip and spawn farm at `elevator_exit` |
| `assets/models/prop_badge_reader.glb` | Lobby badge scan |
| `assets/models/prop_coffee.glb` | Coffee machine beat |
| `assets/models/prop_security_desk.glb` | Security stare beat |
| `assets/models/prop_hr_poster.glb` | HR poster beat |
| `assets/models/prop_elevator_panel.glb` | Call/floor buttons (or empties on car) |

Until GLBs land: gray-box with empties below is enough to wire phases.

## Phase empties / interact volumes

### Plaza (`phase: plaza`)
| Name | Purpose |
|------|---------|
| `plaza_spawn` | CLOCK IN drop |
| `tower_entrance` | Trigger / E → lobby |

### Lobby (`phase: lobby`)
| Name | Interact | Beat |
|------|----------|------|
| `badge_reader` | E / click | **Always required** badge |
| `coffee_machine` | E | Daily pool |
| `security_desk` | Hold / wait bar | Daily pool |
| `hr_poster` | E → dismiss | Daily pool |
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
Add kits to `assets/manifest.json` when GLBs ship. Regenerators: extend `assets/build_ps1_assets.py` / new `assets/build_tower_assets.py`.
