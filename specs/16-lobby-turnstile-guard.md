# CORP-TOWER-03.2 — Self-explanatory lobby (Guard + turnstile)

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Parents:** `specs/14-lobby-landmarks.md`, `specs/15-lobby-farm-hotfix.md`  
**Tip:** follow `?v=tower12` / `cc454f0`  
**Design rule (Michael):** imitate the real world so props explain themselves — no tutorial required.

---

## Michael report (tower12)

1. Security person is **inside the desk** and **not looking at you**  
2. Badge scanner is unclear — should be a **turnstile gate in front of the elevator**  
3. Prefer real-world lobby grammar so interactables read at a glance

---

## Locked choices

| Choice | Value |
|--------|--------|
| Guard | Behind desk, clear of desktop volume, facing player approach / aisle (stare beat unchanged) |
| Badge landmark | **Waist-high turnstile gate** on the path to the elevator (+ card-reader nub) |
| Hook name | Keep `badge_reader` empty (Dev can alias); optional rename docs to “turnstile” |
| Beat counts | Badge still always required + 2-of-3 — **locked** |
| Soft DROP | Parked |
| Enter lobby copy | Untouched |

---

## Designer kits

### 1. Guard (`prop_security_guard.glb` + empty)

- Mesh origin at **feet behind desk** — no baked offset that lands torso in the desktop  
- Empty `security_guard` **behind** `security_desk` (clear of desk AABB), yaw toward lobby approach (toward spawn / aisle, not into desk)  
- Readable PS1 silhouette: cap, uniform, facing camera when player approaches desk  
- Desk stays; Guard must be **visibly separate** (gap / height above desktop)

### 2. Turnstile (`prop_turnstile.glb` — replace visual for badge)

- Waist-high corporate turnstile: posts + horizontal arms (or tripod arms) + small badge/card reader nub  
- Place on path **between lobby mid and elevator call** — player must approach gate before elev reads as next step  
- Empty: keep name `badge_reader` (or add `turnstile` and leave `badge_reader` as alias at same pose)  
- Local facing: arms block aisle until badge; +Z / documented axis toward approach  
- Avg RGB readable (~100–140); nearest; no near-black

### 3. Optional

- Retire or shrink old wall `prop_badge_reader` so only the turnstile reads as the badge beat  
- Soft magnet / floor decal not required if silhouette is obvious

Empties: prefer updating lobby GLB poses; names stay unless `turnstile` alias added.

---

## Developer

1. Attach Guard **only** to `security_guard` empty (fallback: offset *behind* desk + yaw to player/spawn — never inside desk AABB).  
2. Load `prop_turnstile` at `badge_reader` (fallback old reader only if turnstile missing). Copy world quaternion.  
3. Badge interact stays on `badge_reader` nearHook — prompt can say turnstile / badge.  
4. Optional: slight near radius so gate is easy to find on approach to elev.  
5. Tip `?v=tower13` when green. Counts locked. Soft DROP parked.

---

## Writer

Light retune only (optional but recommended):

- `towerArrival.badge.prompt` → e.g. `E -- Badge the turnstile`  
- Success toast can keep mid-level gag; fail-once stays moody reader / sticky gate  

Paste into `src/copy/copy-data.js` as today.

---

## Game Designer / Tester

After tip: Guard readable behind desk + staring; turnstile obvious gate before elev; badge still required; 2-of-3 unchanged; path elev→desk still clear.

---

## Acceptance

- [ ] Guard not intersecting desk; faces player approach  
- [ ] Turnstile gate sits on path to elevator; reads as “badge here” without a tutorial  
- [ ] Badge beat still required; counts unchanged  
- [ ] Elevator still locked until badge + 2 beats  
- [ ] Soft DROP parked  

## Out of scope

- Soft DROP polish  
- Changing 2-of-3 / Sanity table  
- Plaza exterior  
- New lobby beats  

---

## Team

| Role | Action |
|------|--------|
| Designer | Guard pose/empty + turnstile kit; retire wall-reader visual |
| Developer | Wire Guard empty-only; turnstile @ badge_reader; tip tower13 |
| Writer | Optional prompt retune for turnstile |
| Game Designer | Re-feel after tip |
| Tester | Smoke Guard + turnstile + path |
| CoS | Spec + lint-gate tip |

**Follow-up:** Elev doors on badge + Guard scale → `specs/17-elev-doors-guard-scale.md`
