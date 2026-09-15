# SPEC — Timesheet Lock (CORP-TIME-01) — NEW

**Priority:** 2 (after Presence Theater)  
**Size:** S  
**Owners:** Developer, Writer, Designer (desktop `timesheet.xls` icon), Audio optional (save beep)  
**Branding:** anonymous generic corp / Corp. Prefer `CORP-####` ticket IDs in any flavor text.
**Gate rule (Michael/CoS):** every **2–3 ticket completions** OR **before Shut Down / clock-out** — **not** every ticket.

---

## Fantasy
Win95 desktop icon `timesheet.xls`. Your tickets did not count until hours are inventively allocated to nonsense buckets. False precision is the joke.

## When the gate fires
Maintain `ticketsCompletedSinceLock` (int).

**Trigger A — mid-day:** after a ticket marks done, if `ticketsCompletedSinceLock` is in `{2,3}` (pick **3** as default, or randomize 2 vs 3 at day start for variety), open/force Timesheet before board refill / next ticket start.

**Trigger B — clock-out:** Start → Shut Down / Clock Out: if timesheet not `lockedOk` for this day **or** any completions since last lock, open Timesheet first; only call `hooks.onClockOut` after Accept succeeds.

After successful Accept: reset `ticketsCompletedSinceLock = 0`, set `timesheetLockedOk = true` until next trigger arm.

If board uses endless refill: **block** claiming/opening the next unfinished ticket (and block submit on a new one) while `timesheetGateOpen`.

## Player verbs
1. Double-click desktop `timesheet.xls` (or forced modal/window).
2. Adjust hours on **6–8 buckets** via spinbox / +/- / click (320×240 friendly).
3. **Jimbo Auto-Fill** button.
4. **Accept** / **Save** (same action).
5. Closing window without Accept leaves gate open (toast: “Timesheet incomplete”).

## Buckets (Writer punch-up OK; keep ids stable)
| id | Default label | Default hours |
|----|---------------|---------------|
| `fog` | Fog mitigation | 0 |
| `sync` | Syncing | 0 |
| `jimbo` | Jimbo alignment | 0 |
| `stakeholder` | Stakeholder vibes | 0 |
| `unblock` | Unblocking blockers | 0 |
| `docs` | Documentation (aspirational) | 0 |
| `hope` | Hope | 0 |
| `core` | Core hours (actual work) | 0 |

Target sum: **exactly 8.0** (one decimal). Reject otherwise.

## Win / fail
- **Win:** sum === 8.0 → Accept enabled → on click: +2 Sprint (ironic crumb), Sanity −2 (paperwork tax), toast “Hours reconciled.”, clear gate, allow next ticket / clock-out.
- **Fail:** Accept with wrong sum → toast “Hours must equal core commitment (8.0).” Sanity −3..−6 (Writer pick one value, use −4), stay gated.
- Closing / ignoring: gate remains; no clock-out; no next ticket.

## Jimbo
- Auto-Fill: set `jimbo` bucket to **6.0**, `core` to **0.5**, sprinkle leftovers that **do not** sum to 8.0 on purpose (e.g. total 7.5 or 8.5) so player must fix — OR sum to 8.0 with absurd allocation (prefer **wrong sum once**, second Auto-Fill can “fix” to 8.0 with 6h Jimbo / 2h Hope). Simplest ship: Auto-Fill always → `{ jimbo: 6, hope: 2, rest: 0 }` (sum 8) **or** `{ jimbo: 6, core: 1, sync: 0.5 }` (7.5). **Ship:** first Auto-Fill = 7.5 broken; toast “Jimbo reconciled your day!”; player nudges to 8.0.
- Asking Jimbo elsewhere does not clear timesheet gate.

## Sanity / Sprint
- Successful lock: Sanity −2, Sprint +2.
- Failed Accept: Sanity −4.
- No Sanity heal.

## Frequency (locked)
- **Not** every ticket.
- Default: gate after every **3** completions; also before Shut Down if any work since last lock or never locked.
- Optional day-start roll: 50% use threshold 2 instead of 3 (nice-to-have).

## UI
- Window title: `timesheet.xls — Time Entry`
- Show running total vs `8.0`
- Accept grayed until sum === 8.0 (or always clickable with fail toast — prefer grayed + fail toast if forced click)
- Desktop icon beside Jimbo/Inbox

## Out of scope
- Real payroll. Multi-day persistence. Linking hours to real ticket IDs (can show ticket count as flavor text only; if an ID appears use `CORP-####`).

## Acceptance
- [ ] Gate after 2–3 completions (default 3), not every ticket
- [ ] Shut Down blocked until Accept
- [ ] Sum must be 8.0; Jimbo Auto-Fill sabotages helpfully
- [ ] Sprint +2 / Sanity −2 on success; Sanity hit on fail
- [ ] Writer copy: corporate euphemism buckets, no ableist jokes
