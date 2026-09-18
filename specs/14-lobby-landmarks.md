# CORP-TOWER-03 — Lobby landmarks (interact affordances)

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Parent:** `specs/12-tower-arrival.md` · follows `specs/13-plaza-lobby-redesign.md` (A+B tipped)  
**Trigger:** Michael playtest — missing clear interactables (no staring guard, invisible poster, wet floor not wet, flat textures)

---

## Goal

Make lobby beats **obvious to the eye** before the prompt: someone watches you, the HR poster is readable on the wall, wet floor looks wet, slabs have texture variety. Beat **counts stay locked** (badge + 2-of-3). Soft DROP stays parked.

---

## Locked choices

| Choice | Value |
|--------|--------|
| Security landmark | **Low-poly Guard NPC** behind desk, facing player (stare beat unchanged) |
| Wet floor landmark | **Yellow A-frame cone + shiny puddle** |
| HR poster | **Large wall-readable** mesh + texture (not near-invisible) |
| Texture variety | Lobby floor/wall concrete variants (seams, scuffs, cooler fluo tint) |
| Beat numbers | Badge + 2-of-3 / Sanity — **locked** |
| Enter lobby copy | `E -- Enter lobby` — **untouched** |
| Soft DROP | Parked |
| Slight beat radius bump | OK (Dev) |

---

## Designer kits

| Asset | Brief |
|-------|--------|
| `prop_security_guard.glb` (new) **or** bake into/replace `prop_security_desk.glb` | Seated or standing Guard NPC behind desk, facing toward lobby aisle / player approach. PS1 low-poly, grim uniform, readable silhouette. Empty `security_desk` stays. |
| `prop_hr_poster.glb` | Bigger wall poster; readable HR-values texture (nearest, avg RGB ~100–140). Mount on wall at `hr_poster` empty — not flush-invisible. |
| `prop_wet_floor.glb` (new) | Yellow wet-floor A-frame cone + shiny puddle (specular/emissive puddle OK within PS1). Sit on `wet_floor` empty at floor Y. |
| Lobby textures | Extra variety: floor seams/scuffs, wall stains/cooler fluo; optional `lobby_floor_b.png` / wall variant. No near-black. |

Empties / hook **names unchanged** (`security_desk`, `hr_poster`, `wet_floor`, …).

---

## Developer

1. Pull Designer kits into manifest; attach Guard at `security_desk`, poster at `hr_poster`, cone+puddle at `wet_floor` (floor-clamp Y).
2. Paste Writer landmark lines from `copy/tower-arrival.md` → `src/copy/copy-data.js` (`towerArrival.landmarks`) if not already in tip.
3. Optional: slightly widen badge/beat nearHook radii (GD optional retune) — **do not** change checklist counts.
4. Tip Pages (`?v=tower10` or next); keep `setTowerLook` / PlazaDeck / Phase B farm-light pause.

---

## Writer

Already shipped (use as-is):

- Guard: `E -- Hold the stare` / "Security stared back. You blinked first (spiritually)."
- HR poster: `E -- Read the poster` / "HR poster absorbed. Values still optional."
- Wet floor: `E -- Acknowledge hazard` / "Wet floor noted. Dignity not covered by policy."

---

## Game Designer / Tester

After tip: re-feel lobby — landmarks readable at a glance; stare / poster / wet-floor discoverable without hunting; badge + 2-of-3 still required; elev path verified.

---

## Acceptance

- [ ] Guard NPC visible behind desk; stare beat still completes
- [ ] HR poster clearly visible on wall (not missing/invisible)
- [ ] Wet floor reads as yellow cone + shiny puddle
- [ ] Lobby slabs/walls show texture variety (not one flat gray)
- [ ] Writer prompts fire on approach; counts unchanged
- [ ] Soft DROP still parked

## Out of scope

- Soft DROP toast polish
- Changing badge / 2-of-3 / Sanity table
- Plaza exterior redesign (already Phase A)
- New lobby beats beyond existing pool props

---

## Team

| Role | Action |
|------|--------|
| Designer | Guard NPC + poster resize/texture + wet cone/puddle + lobby texture variants |
| Developer | Wire kits + copy + optional radius bump → tip |
| Writer | Done (landmarks lines) |
| Game Designer | Re-feel after tip |
| Tester | Smoke landmarks + full path to desk |
| Audio | Stems as-is unless asked |
| CoS | Spec + lint-gate tip |
