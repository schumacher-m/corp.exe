# CORP-TOWER-03.3 — Elevator doors open on badge + Guard human scale

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Parents:** `specs/16-lobby-turnstile-guard.md` (03.2 closed PASS on tower14)  
**Tip target:** `?v=tower15`  
**Design rule:** Real-world grammar — doors open when badge accepts; props scale to human reference.

---

## Michael report

1. Guard reads as a person now but is nearly ceiling-tall — need a **dimension reference** so kits stay proportioned  
2. Elevator door is a solid wall — must **animate open after badge** so entry is obvious (no walking through closed doors)

**Timing locked:** doors open **right after badge scan**. Checklist (badge + 2-of-3) still gates calling the ride / leaving the car.

---

## Locked choices

| Choice | Value |
|--------|--------|
| Door open trigger | Badge success (`badgeDone = true`) |
| Before badge | Doors closed + **blocking** (no ghost through) |
| After badge | Animate open ~0.6–1.0s; disable door collider/blocker |
| Checklist | Still required to call elev / ride (unchanged counts) |
| Guard height | Human standing **~1.75–1.85m**; eye ~1.6–1.7m; lobby ceiling ~2.7m with clear headroom |
| Soft DROP | Parked |
| Turnstile | Unchanged |

---

## Designer

### Elevator doors
- Split or sliding door leaf/leaves parented or named for Dev (`elevator_door_L` / `_R` or single slab that translates)
- Closed pose flush in jamb; open clears player capsule into car
- Empty `elevator_door` stays as pivot/cue; document local open axis (e.g. ±X slide)
- Match brutalist car language from tower kits

### Guard scale
- Rescale `prop_security_guard` to **~1.8m** standing (not ceiling-height)
- Keep silhouette readable behind desk; head/shoulders clear of desktop AABB
- Empty `security_guard` height/yaw as needed

### Scale reference (doc)
Add one-liner to `docs/TOWER_HOOKS.md` / `docs/VISUAL.md`:

> Lobby scale ref: player eye ~1.6m; adult NPC standing 1.75–1.85m; door leaf ~2.1m; ceiling ~2.7m.

---

## Developer

1. On badge success: play door open anim (or lerp leaf transforms); set door blocker/collision off when open enough to pass  
2. Before badge: keep closed + solid blocker on elev threshold  
3. Do **not** change badge / 2-of-3 counts or unlock rules for the ride  
4. Prefer Designer empties/meshes; graybox fallback OK if GLB late  
5. Tip `?v=tower15` when green  

---

## Audio

Optional soft elev door **whoosh** on open (muteable). Not blocking — ship silent slide if stem late. Soft DROP parked.

---

## Game Designer / Tester

After tip:
- Badge → doors clearly open; walk into car without clipping solid wall  
- Guard human-height (not ceiling) still readable for stare  
- Turnstile + checklist unchanged  

---

## Acceptance

- [ ] Pre-badge: elev entry blocked by closed doors  
- [ ] Post-badge: doors animate open; clear walk into car  
- [ ] Guard ~1.8m, readable behind desk, clear of desktop  
- [ ] Scale ref documented for future kits  
- [ ] Counts locked; Soft DROP parked  

## Out of scope

- Soft DROP polish  
- Changing 2-of-3 / Sanity  
- Plaza redesign  
- Full elevator interior redesign  

---

## Team

| Role | Action |
|------|--------|
| Designer | Door leaves + Guard rescale + scale ref doc |
| Developer | Open-on-badge anim + collider; tip tower15 |
| Audio | Optional soft whoosh |
| Game Designer | Re-feel doors + Guard height |
| Tester | Smoke badge→open→enter car |
| CoS | Spec + lint-gate tip |
