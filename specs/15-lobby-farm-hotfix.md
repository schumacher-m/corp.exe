# CORP-TOWER-03.1 — Lobby landmark alignment + farm aisle clear

**Status:** Greenlit by Michael playtest on tower10 (2026-09-18)  
**Parent:** `specs/14-lobby-landmarks.md` · farm layout `docs/FARM.md`  
**Pages tip:** `?v=tower10` / `c630d9e` — FAIL on orientation + missing Guard read + blocked farm path

---

## Michael report

1. HR poster not aligned with the wall  
2. Elevator buttons not aligned correctly  
3. No visible security person  
4. After elevator, floor is wall-to-wall cubicles — must walk *through* assets; need a clear path to seat

---

## Root causes (CoS)

| Issue | Cause |
|-------|--------|
| Poster / elev panel skew | `Tower.js` copies hook **position only** — does **not** copy empty world quaternion / yaw |
| Guard invisible | Guard + desk share `security_desk` empty at same XYZ; floor-clamp Y=0; Guard likely inside/behind desk mesh or facing wrong |
| Farm blocked | Aisle skip (`iz===1`, `ix===±5`) exists, but **neighbor bay footprint** likely wider than `PITCH_X/Z` (2.2 / 2.6) so meshes spill into the corridor |

---

## Designer

1. **`prop_hr_poster.glb`** — local +Z = wall normal into lobby (or document facing). Empty `hr_poster` on lobby wall with correct rotation.  
2. **`prop_elevator_panel.glb`** — flat against car wall; buttons readable; empty(s) yaw match wall.  
3. **`prop_security_guard.glb`** — tall readable silhouette **behind** desk, facing lobby aisle. Prefer new empty `security_guard` offset behind desk **or** bake ~0.4–0.6m offset + yaw in kit so Dev can place on `security_desk` without burying.  
4. **`neighbor_bay.glb`** — footprint **≤ pitch − 0.2m** (~2.0 × 2.4 max). Must not overhang into `iz=+1` main aisle or `ix=±5` cross aisles. Re-export if current bay is oversized.

Empties: keep names; add `security_guard` only if needed.

---

## Developer

1. When attaching wall props (`prop_hr_poster`, `prop_elevator_panel`, badge, etc.): **copy hook world quaternion** (or lookAt wall normal), not position alone.  
2. Guard: place on `security_guard` empty if present; else offset behind `security_desk` (+ local back) and yaw toward lobby aisle. Never identical transform as desk.  
3. Farm: verify aisle clear after Designer bay shrink; if still blocked, temporarily skip an extra row (`iz===2`) or scale neighbor instances down — prefer art fix first.  
4. Tip `?v=tower11` when green. Soft DROP parked. Counts locked.

---

## Acceptance

- [ ] Poster flush/parallel to lobby wall  
- [ ] Elevator panel flush on car wall; buttons readable  
- [ ] Guard NPC clearly visible behind desk (staring)  
- [ ] Elevator → desk: walkable main aisle without clipping through cubicles  
- [ ] Landmark beats + badge/2-of-3 still work  

## Out of scope

- Soft DROP polish  
- Changing beat counts  
- Plaza exterior redesign  

