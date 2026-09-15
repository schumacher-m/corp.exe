# CORP-BAL-01 — Early-loop grace + interrupt shield

**Status:** Greenlit by CoS after day-loop fun review (`specs/06-day-loop-fun-review.md`)  
**Owner:** Developer (implement) · Writer (2 optional toasts) · Game Designer (this spec)  
**Lexicon:** Sync / Mail / Tracker (see `docs/GENERIC_NAMES.md`)  
**Do not touch:** Jimbo consult gate, timesheet Auto-Fill → 7.5, Skip→HR, Away board freeze (`presenceForced` wins)

---

## Goal

Stop the early interrupt orchestra from stomping the first ticket joke. Keep jokes; change *when* they land.

---

## A) Grace band (~60s)

**When:** from `enableDaySystems()` until **either** ~60s elapsed **or** first `finishTicket` (whichever first).

**During grace:**
- Do **not** countdown/deliver doom-Mail (`emailCooldown` frozen or set high enough it can't fire).
- Do **not** roll incident pager.
- Presence / Away / idle timers **still run** (player can still go Away).
- Sync call CD **may** tick (see C) — calls are discovery, not the early Mail slap.

**After grace:** restore current Mail cadence (`EMAIL_MIN`–`EMAIL_MAX`, today 14–28s) and incident checks as now.

**Suggested impl:** `state.dayGraceLeft = 60` set in `enableDaySystems`; tick down only while `emailEnabled`; clear to 0 on first `finishTicket`. Gate Mail timer + incident roll on `dayGraceLeft <= 0`.

**Note:** today `enableDaySystems` sets `emailCooldown = 8 + rand*6` — that is the early Mail slap. Replace with grace, then first post-grace cooldown = normal 14–28s (not another 8–14s punch).

---

## B) Interrupt shield (active ticket work)

Mail already queues when `minigameFocused()`, but players often have an **active ticket / IDE open while `phase === "desktop"`** — Mail still raises and feels like a pile-on.

**Treat as shielded (queue, don’t raise) when any of:**
- `minigameFocused()` (existing), **or**
- `state.activeTicket` set, **or**
- IDE / PR / standup ticket windows open for the active job (`wins.ide.open` / `wins.pr.open` / relevant stub UI)

**Applies to:**
- `queueOrDeliver` / `flushEmailQueue` / any path that `raise("inbox")`
- Sync **ring start** (`canOpenCall` or `startCallRing`): if shielded → `callQueued = true`, no ring overlay

**Flush:** when shield clears (no active ticket + not minigame + desktop), flush Mail queue one-at-a-time as today; then try Sync queue.

**Toast (Writer):** if Mail was queued under shield, prefer a short line like “Mail waiting…” (may already exist — retune only if mushy).

---

## C) First Sync call discovery

**Today:** first `callCd = 30 + rand*30` (30–60s) after `enableDaySystems`.

**Change:** first only → `25 + rand*20` (25–45s).  
**Later calls:** keep `45 + rand*45` after `scheduleNextCall`.

Still respects Away / timesheet / shield / `canOpenCall`.

---

## D) Timesheet early-trigger verify (bug hunt, not redesign)

Play sample saw a timesheet gate ~4 in-game minutes in, seemingly before 3 ticket closes.

**Verify / fix:**
1. Mid-day gate **only** when `ticketsCompletedSinceLock >= timesheetGateThreshold` (3) via `finishTicket` → `requestTimesheetGate("mid-day")`.
2. Shut Down / clock-out path may open timesheet — OK; must not look like mid-day if reason is clock-out (toast/reason string clear).
3. Standup / filler finishes must not double-count into the threshold unless intentional.
4. Manual open of `timesheet.xls` must **not** set `timesheetGateOpen` / freeze the board unless it’s a real gate.
5. Log or toast the `reason` in debug builds if easy (`mid-day` | `queued-after-away` | `shut-down` | …).

**Keep:** Auto-Fill sabotage to 7.5, Accept at 8.0, `jimboFail` on Auto-Fill.

---

## E) Optional Writer lines (only if Dev needs copy)

| Key | Use | Draft |
|-----|-----|--------|
| `mailWaitingToast` | shield queue | `Mail waiting...` |
| `presenceYellowToast` | enter idle yellow | `Still there?` |

No Jimbo / Skip→HR / timesheet copy changes.

---

## Acceptance

1. Fresh day: no doom-Mail popup for ~60s **or** until first ticket close (presence still works).
2. With ticket/IDE open on desktop phase, Mail does not raise over the work — queues + toast; Sync does not ring until shield clears.
3. First Sync ring eligible ~25–45s after day systems (if not shielded/deferred).
4. Timesheet mid-day cannot fire before 3 closes; early open explained or fixed.
5. Do-not-touch list unchanged; player strings say Sync/Mail/Tracker only.

## Out of scope

New systems, Helix branding, folder renames, audio redesign, attentiveness/Share retune.
