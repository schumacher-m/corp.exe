# Incidents — meme event (Game Design)

**Tone:** Production is on fire. You are a corporate professional. You do **not** fix it. You **Disable the monitor** and **assign it to somebody else**.

Funny, not preachy. No ableist jokes. Distinct from HELIX-5110 Pick a Severity (taxonomy form) and from doom-mail Sev0 softlock.

---

## Trigger

**Primary:** Random **Incident** modal while on the Win95 desktop (after sit), independent of the ticket board.

| Field | Spec |
|-------|------|
| When | After player has completed ≥1 ticket this shift **or** after ~45–90s on desktop (first time softer). |
| Chance | ~12–18% check every 40s while desktop active; **at most 1 open incident** at a time; cooldown 90s after resolve/dismiss-fail. |
| Also | Optional board ticket `HELIX-5201` (`type: incident`) that opens the **same** modal when clicked — so refill loop can deal it as a normal ticket. |

**Popup chrome:** Win95 dialog, title `HelixStack Incident — Sev0 (Probably)`, red/amber banner, blinking `● LIVE` (or static for S). Optional Slack toast: `#incidents: you have been volunteered.`

**Sample headline pool (Writer):**  
- `Checkout is returning HTTP 500 (spiritually).`  
- `Latency p99 discovered feelings.`  
- `The fog merged to prod.`  
- `Customers can still click. This is bad.`  
- `PagerDuty loves you specifically.`

---

## Player actions / win

Modal body shows the incident blurb + two required corporate moves (order free):

1. **Disable the monitor**  
   - Button: `Disable Monitor` → confirm `Are you sure? (Recommended.)` → monitor icon goes dark / dialog dims / status `Observability: Off`.  
   - Joke: you cannot see the graphs, therefore the graphs cannot see you.

2. **Assign to somebody else**  
   - Dropdown or chip list: `Kyle (Platform)`, `Jimbo (AI)`, `Facilities (myth)`, `On-call rotation (ghost)`, `The fog`, `Future me`.  
   - Confirm `Reassign & Walk Away`.  
   - Cannot pick yourself. Picking `Jimbo` is allowed and feeds sabotage.

**Win / done:** Both actions completed → toast `Incident owned by someone who isn't you.` → `+4 SP`, `-3 SAN` → modal closes. If opened from ticket board, mark `incident` done and refill as usual.

**Fail / stall:** Closing the X without both actions → `-5 SAN`, toast `Incident remains. So do you.` Modal can reappear after cooldown (or ticket stays open).

**Optional third beat (still S):** After assign, a 1-line Slack DM from the assignee (`lol`) — no extra click required; auto-closes.

---

## Jimbo sabotage

If player used Ask Jimbo this ticket/event **or** assigned to Jimbo:

| Hook | Effect |
|------|--------|
| Re-enables monitor | `Jimbo restored observability for growth.` Monitor undimmed; must Disable again. `-4 SAN`. |
| Assigns back to you | `Reassigned to Cubicle 4-B (you). Synergy!` Must pick a different assignee. `-5 SAN`. |
| Declares fixed | Toast only: `Jimbo: mitigated by vibes.` Incident still open until both real actions done. |

`sabotage.incident[]` — 3 Writer lines, cheerful-wrong.

---

## Sanity / Sprint

| Outcome | SP | SAN |
|---------|----|-----|
| Success (disable + reassign) | `+4` | `-3` |
| Close without finishing | `0` | `-5` |
| Jimbo re-enable / self-assign | `0` | `-4` / `-5` |
| Assigned to Kyle | `+4` (still success) | `-2` extra pity (optional) |

Pts on board ticket: `4`. Complexity: **S** (one modal, two buttons + dropdown — reuse severity/dialog patterns).

---

## Type keys / IDs

| id | type | pts | window |
|----|------|-----|--------|
| HELIX-5201 | `incident` | 4 | dialog (also random interrupt) |

---

## Dev notes

- Prefer a shared `openIncident({ headline, fromTicket })` used by timer **and** ticket click.
- Disable state is local to the modal (no need to blank the real CRT).
- Do not softlock like old Sev0 — no “must downgrade forever”; win path is always disable + reassign.
- Mute: incident SFX should be a tired pager beep, not a jump-scare (Audio).

## Writer handoff

- `incidentHeadlines[]` (8–12)
- Modal title, button labels, confirm copy, success/fail toasts
- Assignee list labels
- `sabotage.incident[]` (3)
- Optional Slack one-liners from assignees

## QA

- Random interrupt never stacks two modals.
- Board ticket and random popup share win logic.
- Assign-to-self blocked.
- Jimbo path cannot permanently softlock.
