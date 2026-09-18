# CORP-FARM-04 — Office floor path (elev → Cubicle 4-B)

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Tip:** `?v=farm1` (or next) after tower18  
**Out of scope:** Soft DROP polish (parked); elev-call re-feel continues separately

## Problem (Michael)

After elevator exit on the office floor:
1. Walk **through** neighbor computers / walls (ghosting)
2. Cubicles sit **in the path** elev → desk
3. Prompt says “glowing CRT” but player monitor is **off** until sit (OK that it’s off — copy should not claim glow)
4. Alignment of aisle / desk / elev exit feels off
5. Office should read a bit **brighter** (artificial fluo, not daylight)

## Root cause (verified)

- Farm clears only `iz === 1` (E–W) and `ix === ±5` (N–S cross).  
  Elevator handoff is `elevator_exit ≈ (0, eye, 10.4)` → `iz = 4` on pitch 2.6.  
  Cells `(ix=0, iz=2..4)` still spawn `neighbor_bay` → desks in the spine.
- FARM.md: neighbors are **visual only (no colliders)** → ghost through bays if you leave the gap.
- Walk prompt hard-coded: `WASD · walk toward the glowing CRT`.

## Design locks

### Path (required)

1. **Clear elev→desk spine:** skip neighbor bays when `ix === 0 && iz >= 1` (iz=1 already clear; extend through iz=2..4 to elev). Keep `(0,0)` player cubicle only.
2. **Keep** E–W `iz === 1` and cross `ix === ±5`.
3. **Colliders:** add simple XZ AABB (or capsule) blockers for remaining neighbor bays + player cubicle walls so WASD cannot phase through desks/CRTs/walls. Aisle spine stays walkable.
4. **Alignment:** `elevator_exit`, spine, `aisle_start`, player desk share **x=0**; yaw on floor handoff looks **−Z** down the spine toward Cubicle 4-B. Fix any bay yaw that faces into the spine.

### Copy (Writer)

| When | Prompt |
|------|--------|
| Floor / walk, not near seat | `WASD · walk to Cubicle 4-B` (or `… your desk`) — **no “glowing”** |
| Near seat / can sit | `E / Click / SIT — Cubicle 4-B` (unchanged) |
| Too far + E | `Get closer to your desk` (drop “glowing”) |

Player CRT may stay dark until sit/boot — that’s intended.

### Light (artificial office)

Bump farm fluo slightly (still PS1 / no bloom):
- Ambient ≈ **2.3–2.4** (from ~2.1), tint stay `#b0aca0` / FARM family  
- Grid PointLight fluo ≈ **1.25–1.35** (from ~1.1), desk fluo ≈ **1.5–1.6**  
- Fog slightly push out or lift density color so aisles read lit, not cave  
Document deltas in `docs/FARM.md` / `docs/VISUAL.md`.

### Designer

- Confirm `neighbor_bay` footprint still ≤1.95×2.35 after spine clear (no new kit required if Dev skip-cells + colliders suffice).  
- Optional: slightly brighter `floor.png` / farm_ground albedo if aisle still mud — only if light bump isn’t enough.  
- Verify player `cubicle.glb` desk/CRT face −Z toward approach.

### Developer

1. Spine skip + AABB colliders on farm walk  
2. Prompt strings (or Writer keys)  
3. Light / fog bump  
4. Tip `?v=farm1`; counts locked; Soft DROP parked  

### Acceptance

- [ ] Elev → Cubicle 4-B: clear walkable corridor on x≈0; no clipping through desks/walls  
- [ ] Stepping into a neighbor bay pushes/blocks (no ghost)  
- [ ] Prompt never says “glowing CRT” while monitor is off  
- [ ] Office reads brighter artificial fluo; still grim PS1, not outdoor sun  
- [ ] Desk / elev / aisle alignment on center spine  

## Soft DROP

Parked.
