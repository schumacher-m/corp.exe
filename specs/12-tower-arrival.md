# CORP-TOWER-01 — Tower arrival (plaza → lobby → elevator → desk)

**Status:** Greenlit by Michael via CoS (2026-09-17) — design locked; ready for GD beat pool + Designer kits + Writer/Audio + Dev phases  
**Shape:** Full 3D walkthrough **every day**, no skip; PS1 art (nearest / dither / wobble)  
**Joke:** Getting to your desk is already a job.  
**Lexicon:** Sync / Mail / Tracker / Jimbo (`docs/GENERIC_NAMES.md`)  
**Replaces:** Title → CLOCK IN → immediate cubicle spawn. CLOCK IN now drops you in the **plaza**.  
**Related:** Existing `walk` / `sit` / `seated` after floor arrival; CORP-BAL-01 — **do not regress**

---

## Goal

Ship a daily startup set piece: approach the corporate tower, clear a short lobby checklist (badge + 2 of 3 beats), ride the elevator, walk the floor to your cubicle, sit, then the normal CRT day. Gives a second scenery for future gags without changing desk comedy.

---

## Locked choices (Michael)

| Choice | Value |
|--------|--------|
| Feel | Full 3D walkthrough |
| Frequency | Every day, **no skip** |
| Art | Keep PS1 style |
| Lobby | Richer minigame layer |
| Structure | **B — 2-of-3 lobby checklist** (badge always required) |

---

## Do not touch

- CORP-BAL-01 grace / first-ticket clear
- Away / `presenceForced` heal path (`c635f09`+)
- Timesheet Auto-Fill → **7.5** then Accept **8.0**
- CORP-DB-01 force DROP after first close
- Soft DROP toast polish (still parked)

---

## Phase flow

```
title → (CLOCK IN) → plaza → lobby → elevator → floor → walk → sit → seated
```

| Phase | Player | Exit |
|-------|--------|------|
| `plaza` | FP outside tower; walk toward entrance | Enter lobby (door interact or trigger volume) |
| `lobby` | FP lobby; **badge required** + **2 of 3** daily beats | Elevator call allowed when checklist met |
| `elevator` | Interior; floor buttons (one correct) | Arrive `floor` |
| `floor` | FP open-plan / corridor to assigned cubicle | Reach desk trigger → existing sit prompt |
| `walk` / `sit` / `seated` | Existing cubicle + CRT | Unchanged |

---

## Lobby checklist (v1)

### Always required
- **Badge scan** — interact with reader (button press or E). Beep + Accept. Fail once optional toast then success (never softlock).

### Daily 2-of-3 (GD rotates pool)
Pick **3** offered each morning from the pool; player must complete **any 2** (plus badge).

**Starter pool (GD may rename/extend):**
1. **Coffee machine** — interact; sludge pour; Sanity ± tiny / toast
2. **Security stare** — hold eye contact / wait bar; toast
3. **HR poster** — read mandatory poster; dismiss
4. **Wrong elevator** — press wrong floor once for gag, then correct (counts as beat if GD wants) **or** separate “lobby Sync ping” chip
5. **Lobby Sync ping** — one forced chip reply while standing

Badge does **not** count toward the 2.

### UI
- Minimal world prompts + optional tiny checklist HUD (3 boxes + badge). Not a full Win95 window unless Designer prefers a clipboard prop.

### Failure
- Never hard-fail the morning. Wrong interactions = toast only. Elevator stays locked until badge + 2 beats.

---

## Elevator

- Buttons for several floors; **only player’s floor** proceeds.
- Wrong floor → Writer toast, stay in car (or brief fake open then “wrong floor” bounce — Dev pick, keep short).
- Ding + PS1 smear on arrive.

---

## Integration

| Hook | Behavior |
|------|----------|
| CLOCK IN | Starts `plaza` (not cubicle) |
| Day clock | Still 09:00 on seated / existing rule — GD confirm whether lobby time advances clock |
| Day obligations | Unchanged once seated |
| Audio | Plaza wind/HVAC, badge beep, lobby murmur, elevator hum/ding, floor fluorescents |
| Designer | Tower exterior, lobby, elevator car, floor kit — same PS1 mandate as cubicle farm |
| Skip | **None** for v1 |

---

## Out of scope (v1)

- Multi-floor exploration / other departments
- Combat or stealth
- Skipping tower on day 2+
- Photo mode / free cam
- Soft DROP toast polish

---

## Done when

- [x] GD: beat pool + rotation + Sanity/toast numbers; clock rule during lobby
- [ ] Designer: kits + interactibles list Dev can hook
- [ ] Writer: badge / beat / wrong-floor / elevator copy
- [ ] Audio: plaza / badge / lobby / elevator / floor stems or synth notes
- [ ] Dev: phases + checklist + elevator + handoff to existing sit
- [ ] Lint-gate → Pages; Tester: full morning path no softlock; badge+2 beats required before elevator

---

## CoS notes

Michael (2026-09-17): full 3D every day no skip; PS1; richer lobby; structure B (2-of-3 + badge).

---

## GD ack (2026-09-17) — beats / Sanity / clock

### Day clock during tower

**Frozen.** `clockMinutes` stays at **09:00** from CLOCK IN through plaza → lobby → elevator → floor → sit.  
Advance only when existing `seated` / `enableDaySystems` starts (desk day).  

**Why:** commute is set dressing; don’t burn CORP-BAL-01 grace or morning beat before the CRT. Ambient Sync noise timer stays off until seated.

---

### Beat pool (5) — offer 3 / complete any 2 (+ badge)

| id | Beat | Interact | Sanity | Toast vibe (Writer) |
|----|------|----------|--------|---------------------|
| `badge` | Badge scan | **Always required** — E / click reader | **0** (success). Optional −1 if first tap fails then auto-pass | Beep · “Welcome, mid-level.” |
| `coffee` | Coffee sludge | E on machine | **−2** | “Sludge dispensed. Leadership calls it fuel.” |
| `security` | Security stare | Hold look / fill 1.5–2.0s bar | **−1** | “You blinked second. Cleared.” |
| `hr_poster` | HR poster | Open → dismiss | **−1** | “Values absorbed. None retained.” |
| `sync_ping` | Lobby Sync ping | One forced reply chip | **−2**, Sprint **+1** | Chip = corporate nothing |
| `wet_floor` | Wet floor cone | Acknowledge cone / walk around marked | **−1** | “Liability noted. Floor still wet.” |

**Not in the 2-of-3 pool:** wrong elevator button — that gag lives in **elevator** phase only (toast, Sanity **0**, stay in car).

### Rotation

Each CLOCK IN (day seed = `Date` string or `sessionSeed`):

1. Shuffle pool `[coffee, security, hr_poster, sync_ping, wet_floor]`.
2. Offer the **first 3** as today’s lobby beats.
3. Checklist HUD: Badge + those 3; elevator unlocks when **badge done** AND **≥2 of the 3** done.
4. Extra interactions on non-offered props: still allowed as flavor toasts, **do not** count toward the 2.
5. Never softlock: if player somehow bricks a beat, 8s timeout auto-completes that beat with toast “HR marked you present.”

### Elevator numbers

| Event | Sanity | Notes |
|-------|--------|-------|
| Correct floor | 0 | Ding → `floor` |
| Wrong floor | **−1** once per ride max | Writer toast; stay in car |

### Timing budget (feel)

| Segment | Target |
|---------|--------|
| Plaza | ~20–40s walk |
| Lobby (badge+2) | ~45–90s |
| Elevator | ~8–15s |
| Floor → desk | ~20–40s |
| **Total commute** | **~2–3 min** before CRT |

If over budget in playtests, shrink stare bar / one-tap coffee first — don’t add skip.

### Status

- [x] GD: beat pool + rotation + Sanity/toast numbers; clock frozen until seated
- [ ] Designer / Writer / Audio / Dev as before
