# CORP-TOWER-02 — Plaza / lobby redesign (brutalist) + follow-up bugfix

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Parent:** `specs/12-tower-arrival.md` (phases / badge+2-of-3 / empties stay)  
**Art direction:** **Brutalist concrete — Silent Hill office mass** (not glass skyscraper, not stubby park)  
**Ship order (Michael):** **1) Redesign kits + wire → tip Pages** → **2) Bugfix pass** on that tip  
**Follow-up:** Lobby landmarks / affordances → `specs/14-lobby-landmarks.md`

---

## Goal

Make plaza → lobby read as a real oppressive corporate tower HQ: heavy concrete slabs, recessed slot windows, clear door, navigable ground. Keep PS1 nearest/dither/wobble and readable-grim lighting from tower7. Then fix ceiling-stuck props, navigation friction, and commute perf.

---

## Locked choices

| Choice | Value |
|--------|--------|
| Exterior feel | Brutalist concrete mass (Silent Hill office) |
| Lobby feel | Low oppressive atrium; security desk + badge as landmarks |
| Empties / hooks | **Unchanged names** from `docs/TOWER_HOOKS.md` |
| Beat numbers | Badge + 2-of-3 pool / Sanity from GD tower4 PASS — **locked** |
| Soft DROP | Still parked |
| Order | Redesign ships **before** bugfix |

---

## Phase A — Redesign (ship first)

### Designer

Rebuild / replace kits (same filenames or bump manifest + Dev path):

| Asset | Brief |
|-------|--------|
| `tower_plaza.glb` | Heavy concrete tower mass, recessed slot windows, obvious recessed entrance, plaza slab with seams/curbs. Silhouette readable at spawn. |
| `tower_lobby.glb` | Low ceiling pressure, concrete walls, clear path spawn → badge → elevator. Landmark props baked or empties at floor Y. |
| `elevator_car.glb` | Same brutalist interior language (optional light retouch). |
| Textures | Concrete / facade / lobby wall — avg RGB **~100–140**; refuse near-black. Nearest. |

**Do not:** glass curtain wall, neon cyber, Figma-clean atrium.

### Developer (Phase A)

- Pull new kits; keep phase wiring / empties.
- Preserve `setTowerLook` + PlazaDeck insurance + `?v=tower8` (or next) cache-bust.
- Wire only what’s needed so CLOCK IN → brutalist plaza → lobby → elev still works.
- Lint-gate tip when Designer kits land.

### Acceptance (Phase A)

- Tower mass reads as brutalist HQ from plaza spawn (not graybox stub).
- Door / entrance obvious.
- Lobby landmarks readable; checklist still badge + 2-of-3.
- Lighting stays grim-but-readable (no pitch black regression).

---

## Phase B — Bugfix (after Phase A tip is live)

Do **not** start Phase B until Phase A is on Pages.

### B1 — Ceiling props / Y

- Props stuck in ceiling: empties or attach must sit on **floor Y**.
- Dev: floor-clamp prop attach (`world Y → max(floorY, …)`); Designer: empty Y = 0 / floor in GLB.
- Verify badge, coffee, security, HR poster, elevator panel.

### B2 — Navigation

- Clear corridor plaza spawn → entrance (no dead-end collision / invisible blockers).
- Soft magnet + Enter lobby prompt stay; widen if needed after new massing.
- Lobby path: spawn → badge → elevator call without maze.

### B3 — Performance

- While `plaza|lobby|elevator`: pause/hide farm heavy meshes + farm fluo grid (restore on floor handoff).
- Cap tower PointLights (prefer ≤6 active banks).
- Keep 320×240 RT path; no shadows/bloom.
- Target: stable commute, no multi-second hitch on CLOCK IN.

### Acceptance (Phase B)

- No props in ceiling.
- Michael can walk spawn → door → lobby → elev without fighting collision.
- CLOCK IN hitch acceptable; frame time not farm-full while in plaza.

---

## Out of scope

- Soft DROP toast polish
- Changing badge / 2-of-3 / Sanity table
- Farm cubicle redesign
- Skip button for commute

---

## Team

| Role | Phase A | Phase B |
|------|---------|---------|
| Designer | Brutalist kits + empties at floor Y | Fix any empty Y still wrong |
| Developer | Wire kits + tip | Clamp Y, collision/nav, farm pause, light cap |
| Game Designer | Re-feel commute after A; confirm B | Re-feel nav after B |
| Writer / Audio | No bake/SFX required unless door whoosh requested later | — |
| Tester | Smoke A (look + path) | Smoke B (props Y, nav, perf) |
| CoS | Lint-gate tips; order A then B | |

---

## Status

- [x] Michael: brutalist direction + ship order (redesign then bugfix)
- [ ] Spec briefed to team
- [ ] Phase A kits + tip
- [ ] Phase B bugfix tip
