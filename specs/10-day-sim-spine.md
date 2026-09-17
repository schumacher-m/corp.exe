# CORP-DAY-01 — Day-sim spine (clock + obligations + day report)

**Status:** Greenlit by Michael via CoS (2026-09-17) — **spec only, no build until review**  
**Scope:** levers **1 + 2 + 5** only  
**Held for later:** lever 3 (meters with day meaning), lever 4 (quiet/spicy polish beyond beat tables)  
**Lexicon:** Sync / Mail / Tracker (`docs/GENERIC_NAMES.md`)  
**Related:** `specs/06-day-loop-fun-review.md`, `specs/07-balance-grace-band.md` (CORP-BAL-01 — **do not regress**)

---

## Goal

Make the *day* the joke: a felt schedule with a short checklist and a Shut Down report. Interrupt comedy (Mail / Sync / Jimbo / Away) stays — it fires from **beat tables**, not as the only structure.

---

## Do not touch

- CORP-BAL-01 grace band (`DAY_GRACE` / first-ticket clear)
- Interrupt shield (`interruptShielded`: active ticket / IDE / PR / standup)
- Jimbo consult gate + Skip → HR
- Timesheet Auto-Fill → **7.5** then Accept **8.0** (`jimboFail` on Auto-Fill)
- Away / `presenceForced` wins over board + timesheet queue-after
- Soft Sync discovery chase (still parked)

---

## 1) Clock as spine — named beats

### Clock rules

- Day still runs `clockMinutes` from **09:00** toward **18:00** (existing tray clock).
- Keep ticket `+8` minutes and existing ambient ticks; beats are **thresholds on `clockMinutes`**, not a second clock.
- On `enableDaySystems`, set `state.dayBeat = "standup"` (or enter standup beat when Daily Standup opens).

### Beat table (defaults)

| Beat id | Clock window (approx) | Player feel | Interrupt policy (beat table) |
|---------|----------------------|-------------|-------------------------------|
| `standup` | 09:00 → standup dismissed | Daily Standup modal / window | No doom-Mail / incident / Sync ring (shield already covers open standup) |
| `morning` | after standup → 11:30 | Deep work / Tracker | Mail + incident use normal post-grace cadence **but** still respect interrupt shield; Sync CD may tick (queue if shielded) |
| `lunch` | 11:30 → 12:30 | Gray zone | Prefer Sync chatter / light Mail; **no** new incident pager rolls; Sync ring **allowed** if not shielded (discovery window) |
| `afternoon` | 12:30 → 15:00 | Sync tax | Weight Sync rings higher (shorter CD rolls from beat table); Mail normal |
| `winddown` | 15:00 → 17:00 | Timesheet pressure | If mid-day timesheet not yet Accept’d and ≥3 closes, prefer timesheet gate over new Sync; Mail still shielded while ticket open |
| `quittin` | 17:00 → 18:00 | Shut Down eligible | Toast once: “Core hours ending…”; Shut Down still requires timesheet Accept if needed |

**Advance:** when `clockMinutes` crosses a window edge, set `dayBeat`, optional one-shot toast from Writer (`beatEnterToasts[beat]`), and swap the active interrupt weights (Dev: small config object, not hard-coded spaghetti).

**Not in this pass:** full “quiet window” freeze of all interrupts (lever 4). Beat weights are enough.

---

## 2) Daily obligations checklist

### State

```
state.obligations = {
  tickets: { need: 3, have: 0 },      // Tracker closes today
  focusedMail: { need: 1, have: 0 }, // opened ≥1 Focused doom mail (read or Jimbo-marked-read OK)
  syncChip: { need: 1, have: 0 },    // landed ≥1 Sync reply chip on a connected call
  timesheet: { need: 1, have: 0 },   // timesheet Accept succeeded once today
}
```

Board **still refills** (endless busywork flavor). Obligations are what Shut Down **grades** — raw click count alone does not.

### Progress hooks

| Obligation | Increment when |
|------------|----------------|
| `tickets` | `finishTicket` (any type that counts as a close today; standup ticket counts if it calls `finishTicket`) |
| `focusedMail` | player opens a Focused/`doom` mail and closes it (readFully **or** Jimbo marked-read path) |
| `syncChip` | `landCallChip` success |
| `timesheet` | `acceptTimesheet` success |

### UI (minimal)

- Optional thin checklist under Tracker title or a Start → Documents scrap: show 4 lines with ✓ / ○.  
- Or toast on each complete: “Obligation met: Tracker closes (2/3)”.  
- Designer not blocked — Dev can ship text-only first; Designer may glyph later.

### Defaults / knobs

- `need` values above are defaults; keep in one config (`DAY_OBLIGATIONS`) for easy tune.
- Do **not** hard-gate ticket claim on incomplete obligations (that’s mean-grind). Soft pressure via ending grade only this pass.

---

## 5) Day report ending (Shut Down)

### Trigger

Unchanged path: Start → Shut Down → timesheet gate if needed → `hooks.onClockOut` → `clockOut()` ending screen.

### Grade from checklist (replace sprint-threshold as primary)

| Hits (of 4 obligations) | Grade id | Player-facing grade |
|-------------------------|----------|---------------------|
| 4 | `survived` | **Survived** |
| 2–3 | `needs_alignment` | **Needs Alignment** |
| 0–1 | `pip_adjacent` | **Pip Adjacent** |

Sprint / Sanity / Unread still **display** on the ending stats panel (existing). They no longer pick the grade in this pass (lever 3 later can blend).

### Jimbo lie overlay

If `timesheetJimboFills >= 1` **or** Jimbo was used on ≥ half of closed tickets:

- Append / swap a **Jimbo lie** line into the manager note, e.g. “Jimbo reconciled your day: Exceeds Expectations (spiritually).”
- Visual grade label stays the **real** checklist grade (the lie is the joke in the note, not a fake Survived badge — unless Writer wants a struck-through fake grade; prefer note-only for clarity).

### Ending panel content

```
Sprint / Sanity / Unread / Tickets closed  (existing)
Obligations: Tracker ✓·✓·✓  Mail ✓  Sync ○  Timesheet ✓
Grade: Survived | Needs Alignment | Pip Adjacent
Manager note: (Writer pack with {{sprint}} {{sanity}} {{unread}} {{tickets}} {{obligationsSummary}} {{jimboLie}})
Closer: (existing eod.closers pool OK)
```

### Migration from current `copy.eod.grades`

Replace minSprint-based trio with the three grades above. Keep tone; Writer rewrites notes. Dev switches `clockOut()` selection to obligation hits.

---

## Owners

| Role | Owns |
|------|------|
| **Game Designer** | This spec; tune `need` counts / beat windows after first playtest |
| **Developer** | `dayBeat` state + beat weights; obligation counters + hooks; checklist UI stub; `clockOut` grade from hits; wire Writer keys; no BAL-01 regressions |
| **Writer** | `beatEnterToasts`, obligation labels, three eod grades + notes + `jimboLie` lines; Sync/Mail/Tracker only |
| **Designer** | Optional checklist chrome later — not blocking |
| **Audio** | No ask this pass (ring/babble still held) |

---

## Acceptance

1. Tray clock still advances; crossing beat edges changes `dayBeat` and can toast once.
2. Lunch/afternoon change Sync/Mail/incident **weights** (observable in a debug `corpForce…` or by play feel) without breaking shield/grace.
3. Four obligations increment on the hooks above; Shut Down ending shows checklist + Survived / Needs Alignment / Pip Adjacent from hit count.
4. Jimbo lie line appears when Auto-Fill or heavy Jimbo use; real grade stays honest.
5. BAL-01 do-not-touch list still true on a fresh day (grace, shield, 7.5, Skip→HR, Away).

## Out of scope

- Meter redesign (lever 3), full quiet/spicy bands (lever 4)
- Soft Sync discovery flush chase
- Helix branding, folder renames, new theater apps

---

## Hand-off

Ping CoS when this file is ready for review. **No implementation** until CoS/Michael ack the spec.
