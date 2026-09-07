# tickets-extra — 10 meme tickets + endless queue (Game Design)

Beyond the current three playables (`HS-401` Semicolon Hell, `HS-402` Comment Every Line, `HS-403` Survive Kyle). Prefer **S** stubs that reuse IDE / Slack / Inbox / Standup Win95 windows. Funny corporate hell, not preachy. No ableist jokes.

IDs: `HELIX-51xx` (avoids existing fillers `HELIX-1188/2201/3044/4096` and `HS-401..403`).

**Update:** Slot 9 (`HELIX-5109`) reserved for **Whitespace Diplomacy / Kyle space war** (8–12 PR rounds) per CoS + Writer Kyle expansion. Fibonacci Estimate deferred.

---

## Random refill loop (ship with these)

**Goal:** finishing a ticket always pops a **new random** one. You are never done. Endless busywork fantasy.

| Rule | Spec |
|------|------|
| **Pool** | All playable ticket types that are implemented (start: 3 core + these 10 as they land). Include `type: filler` stubs as padding so the board never looks empty. |
| **Active slots** | Keep **2–3** tickets visible on the Tickets board at once (matches current UI density). |
| **On complete** | Mark done → toast → **immediately** draw 1 unused type from the remaining pool (uniform random). If every type was completed this "day", **reshuffle** the full pool (allow repeats across the shift). |
| **Never empty** | If draw would leave 0 open tickets, force-draw a **filler** (`type: filler`) with `pts: 1–2` and a one-click / 5-second stub so the loop never softlocks. |
| **Filler OK** | Existing board-flavor fillers (`HELIX-1188` etc.) can become playable micro-stubs OR stay as 1-tap "document & close" so Dev can ship the loop before every minigame exists. |
| **Done tracking** | Replace hard-coded `ticketsDone: { semi, comment, pr }` with a map/set keyed by `type` (or instance id). EOD grade should count **completions this shift**, not `/3`. |
| **Jimbo** | Keep "must Ask Jimbo once per ticket" gate; sabotage lines keyed by `type` (add keys below). |
| **Sanity/Sprint** | On success: `sprint += pts`, optional small sanity hit for friction. Jimbo sabotage / wrong answer: extra `sanity` hit, ticket stays open or resets progress. |

**Dev note:** minigame stubs can share one IDE click-line pattern (semi/comment/log/rename) and one Slack choice pattern (align/sync/estimate). Writer owns joke strings; keys stay stable.

---

## Ticket specs (10)

### 1) HELIX-5101 — Align the Stakeholders

- **Premise:** Everyone already agreed in separate threads. Your job is to agree with all of them in one DM so the meeting can be canceled and then rebooked.
- **Player actions:** Open Slack. Reply to 3 stacked DMs (PM / Design / Kyle) by picking the matching "Sounds good!" variant. Order matters only for comedy.
- **Done:** All three replies sent. Toast: `Stakeholders aligned. Meeting still happening.`
- **Jimbo sabotage:** Auto-replies with "Have we considered a workshop?" to every thread; adds a 4th stakeholder.
- **Sanity / Sprint:** Done: `+3 SP`, `-2 SAN`. Sabotage / wrong reply: `-4 SAN`, reset that DM.
- **Complexity:** **S** (reuse Slack choice UI)

### 2) HELIX-5102 — Rename Everything to `data2`

- **Premise:** Kyle blocked on naming. Policy says be specific. Jimbo says `data2`. You do what ships.
- **Player actions:** IDE shows 5 identifiers. Click each → pick rename target from dropdown (`data2` always present). Must rename ≥4 to `data2`.
- **Done:** ≥4 renames applied + Save. Toast: `Clarity achieved.`
- **Jimbo sabotage:** Bulk-renames to `data2_final_FINAL`; one identifier becomes `atmosphericDensityCoefficient`.
- **Sanity / Sprint:** Done: `+3 SP`, `-3 SAN`. Leave a meaningful name: `-1 SAN` pity bonus? No — punish virtue: ticket incomplete until you cave.
- **Complexity:** **S** (IDE click + dropdown)

### 3) HELIX-5103 — Appear Active

- **Premise:** InsightBot flagged you Idle for 47 seconds. Presence is a performance review input.
- **Player actions:** Win95 dialog with a progress bar "Engagement". Mash **Jiggle** / press any key / click desktop **8 times within 12s**. Optional: open Jimbo and accept "I jiggled your mouse for you" (counts as 3 jiggles but `-2 SAN`).
- **Done:** Bar full before timer. Toast: `Status: Active (allegedly).`
- **Jimbo sabotage:** Jiggles mouse into Start menu → opens Solitaire; timer keeps running.
- **Sanity / Sprint:** Done: `+2 SP`, `-1 SAN`. Fail timer: `-6 SAN`, ticket stays open.
- **Complexity:** **S** (timer + click counter dialog)

### 4) HELIX-5104 — Suppress Until Green

- **Premise:** The linter is not wrong. The linter is policy. Make the badge green without fixing anything real.
- **Player actions:** IDE problem list (5 warnings). For each: **Suppress** / **Dismiss** / **TODO later**. Zero **Fix** buttons that work.
- **Done:** 0 warnings shown. Toast: `Build healthy. Morale: N/A.`
- **Jimbo sabotage:** Re-enables all rules mid-task + invents `no-fog-mentions`.
- **Sanity / Sprint:** Done: `+3 SP`, `-2 SAN`. If player hits a fake Fix: `-3 SAN`, warning returns angrier.
- **Complexity:** **S** (IDE list clicks)

### 5) HELIX-5105 — Update the Status Update

- **Premise:** Standup bot rejected your feelings as "not actionable." Rewrite until the ritual completes.
- **Player actions:** Standup window: fill Yesterday / Today / Blockers from chip suggestions (corporate nonsense). Submit → bot rejects with a nit → tweak one field → resubmit. Need **2 successful submits** (first always fails).
- **Done:** Bot posts `:white_check_mark: thanks for sharing`. Toast: `Standup complete. Nobody read it.`
- **Jimbo sabotage:** Prefills Blockers with "the fog" (policy violation) and auto-submits.
- **Sanity / Sprint:** Done: `+2 SP`, `-2 SAN`. Fog submit: `-5 SAN`, forced rewrite.
- **Complexity:** **S** (reuse standup)

### 6) HELIX-5106 — Merge Conflict (Feelings Edition)

- **Premise:** `main` and your branch both changed the same comment. Resolve with care, or with `data2`.
- **Player actions:** IDE conflict markers on 3 hunks. Buttons: **Accept Ours** / **Accept Theirs** / **Accept Both** (Both inserts both lines forever).
- **Done:** No conflict markers left + Save. Any resolution is valid (comedy > correctness).
- **Jimbo sabotage:** Accepts Both on everything, then formats into a poem.
- **Sanity / Sprint:** Done: `+4 SP`, `-3 SAN`. All-Both path: `+4 SP`, `-6 SAN` (still done — rewarding chaos).
- **Complexity:** **S** (IDE hunk buttons; kin to semi)

### 7) HELIX-5107 — Unsubscribe From the Follow-Ups

- **Premise:** All-Hands spawned 12 "quick reads." Your inbox is a second job.
- **Player actions:** Inbox: open mail → click **Unsubscribe** → confirm dialog → "Was this helpful? (Required)" → pick any → "Preferences saved to nowhere." Repeat for **3** mails.
- **Done:** 3 unsubs complete. Toast: `You will still receive critical updates.`
- **Jimbo sabotage:** Clicks **Manage preferences in HelixHub** → opens empty browser titled `404 Synergy`; adds 2 new mails.
- **Sanity / Sprint:** Done: `+3 SP`, `-4 SAN`. Fail/trap: `-2 SAN` per wrong button.
- **Complexity:** **S** (reuse inbox + dialogs)

### 8) HELIX-5108 — Add Logging Everywhere

- **Premise:** Prod is fine. Observability is not. Sprinkle `console.log` until the ticket believes you.
- **Player actions:** IDE code lines (6). Click line → insert log chip (`console.log('here')`, `console.log(data2)`, `console.log('Kyle was here')`). Need logs on **≥5** lines.
- **Done:** Count met + Save. Toast: `Telemetry vibes: rich.`
- **Jimbo sabotage:** Replaces logs with `alert('shipped')` and one `debugger;`.
- **Sanity / Sprint:** Done: `+3 SP`, `-2 SAN`. Jimbo debugger left in: cannot finish until removed (`-3 SAN` on attempt).
- **Complexity:** **S** (reuse comment-every-line click pattern)

### 9) HELIX-5109 — Whitespace Diplomacy (Kyle Space War)

- **Premise:** Kyle opened an infinite thread about spaces vs tabs vs "the character formerly known as space." You will not win. You may survive.
- **Player actions:** PR window (same choice pattern as `HS-403`). **8–12 rounds** of Kyle nits, all about whitespace / invisible characters / alignment / trailing space / NBSP / "edgelord" hot takes on the space character — **no ableist framing**. Each round: 3 replies (`d: 0|1`, `s` sanity delta). Advancing (`d: 1`) moves the war forward; stubborn purity replies stall and hurt more.
- **Round themes (Writer fills lines):** (1) tabs vs spaces, (2) trailing whitespace, (3) blank-line theology, (4) NBSP smuggled from Slack, (5) alignment in a comment block, (6) `.editorconfig` as scripture, (7) Prettier vs Kyle, (8) "space is a character with agency," (9 optional) soft-wrap as moral failure, (10–12 optional) escalate to "whitespace summit" / reluctant truce.
- **Done:** After **≥8** advances, Kyle posts reluctant LGTM: `LGTM if we squash and never speak of spaces again.` Toast: `Peace was a formatting option.`
- **Jimbo sabotage:** Posts "both is fine" then reformats the whole PR to tabs *and* spaces; adds 2 extra Kyle rounds. Or invents `space2`.
- **Sanity / Sprint:** Done: `+8 SP`, `-6 to -14 SAN` depending on path (long ticket = big SP, real dread). Stall replies: `-4 to -10 SAN`, no advance. Early bail ("take it offline"): fails ticket / reopen.
- **Complexity:** **M** (reuse PR script engine; longer beat list — Writer owns copy). Still one minigame type: `spacewar`.
- **Note:** Distinct from `HS-403` Survive Kyle (general nits). This one is *only* the whitespace eternal debate. Slot reserved for Writer's Kyle expansion.

### 10) HELIX-5110 — Pick a Severity

- **Premise:** Prod is "degraded" in a way nobody can screenshot. Taxonomy must be satisfied.
- **Player actions:** Bug form dialog: choose Severity (`Sev0`…`Sev4` / `Unknown` / `It's Fine`). Choose Component (`Platform` / `Fog` / `Other` / `Kyle`). Choose Impact (`Users` / `Metrics` / `Feelings`). Submit.
- **Done:** Any complete form submits. If Severity is `It's Fine`, auto-rewrite to `Sev3` with toast `Corrected by policy.`
- **Jimbo sabotage:** Sets Sev0 + pages the whole company Slack; ticket stays open until you downgrade.
- **Sanity / Sprint:** Done: `+3 SP`, `-3 SAN`. Sev0 page event: `-8 SAN`, must downgrade to finish.
- **Complexity:** **S** (form dialog; good Writer playground)

---

## Suggested type keys (for Dev)

| id | type key | pts | window |
|----|----------|-----|--------|
| HELIX-5101 | `align` | 3 | slack |
| HELIX-5102 | `rename` | 3 | ide |
| HELIX-5103 | `presence` | 2 | dialog |
| HELIX-5104 | `lint` | 3 | ide |
| HELIX-5105 | `standup2` | 2 | standup |
| HELIX-5106 | `merge` | 4 | ide |
| HELIX-5107 | `unsub` | 3 | inbox |
| HELIX-5108 | `logspam` | 3 | ide |
| HELIX-5109 | `spacewar` | 8 | pr |
| HELIX-5110 | `severity` | 3 | dialog |

Ship order suggestion: **presence, severity, align** first (dialogs/Slack), then IDE twins **lint / logspam / rename / merge**, then **standup2 / unsub**, then **`spacewar`** once Writer lands 8–12 Kyle whitespace beats (can ship after core PR engine is generalized).

---



## ticketPool (baked into copy-data.js)

```json
{
  "ticketPool": [
    {
      "id": "HELIX-5101",
      "title": "Align the Stakeholders",
      "pts": 3,
      "type": "align",
      "dod": "Agree with PM, Design, and Kyle in one place so the meeting can be canceled and rebooked.",
      "meta": "Slack · Alignment theater · Priority: Ritual",
      "toast": "Stakeholders aligned. Meeting still happening."
    },
    {
      "id": "HELIX-5102",
      "title": "Rename Everything to data2",
      "pts": 3,
      "type": "rename",
      "dod": "Rename ≥4 identifiers to data2. Policy says be specific. Jimbo says data2.",
      "meta": "IDE · Naming · Blocked by Kyle (spiritually)",
      "toast": "Clarity achieved."
    },
    {
      "id": "HELIX-5103",
      "title": "Appear Active",
      "pts": 2,
      "type": "presence",
      "dod": "Mash Jiggle / keys / clicks 8 times within 12s. Presence is a performance review input.",
      "meta": "InsightBot · Idle 47s · Status: allegedly",
      "toast": "Status: Active (allegedly)."
    },
    {
      "id": "HELIX-5104",
      "title": "Suppress Until Green",
      "pts": 3,
      "type": "lint",
      "dod": "Clear 5 warnings via Suppress / Dismiss / TODO later. Do not fix anything real.",
      "meta": "IDE · Linter · Policy green",
      "toast": "Build healthy. Morale: N/A."
    },
    {
      "id": "HELIX-5105",
      "title": "Update the Status Update",
      "pts": 2,
      "type": "standup2",
      "dod": "Rewrite standup until the bot accepts. First submit always fails. Need 2 successful submits.",
      "meta": "Standup bot · Feelings not actionable",
      "toast": "Standup complete. Nobody read it."
    },
    {
      "id": "HELIX-5106",
      "title": "Merge Conflict (Feelings Edition)",
      "pts": 4,
      "type": "merge",
      "dod": "Resolve 3 conflict hunks. Accept Ours / Theirs / Both. Comedy > correctness.",
      "meta": "IDE · main vs feelings · data2 optional",
      "toast": "Conflicts resolved. Feelings: deferred."
    },
    {
      "id": "HELIX-5107",
      "title": "Unsubscribe From the Follow-Ups",
      "pts": 3,
      "type": "unsub",
      "dod": "Unsubscribe from 3 quick-read mails. Preferences save to nowhere.",
      "meta": "Inbox · All-Hands fallout · Required survey",
      "toast": "You will still receive critical updates."
    },
    {
      "id": "HELIX-5108",
      "title": "Add Logging Everywhere",
      "pts": 3,
      "type": "logspam",
      "dod": "Insert console.log on ≥5 lines. Observability is vibes.",
      "meta": "IDE · Telemetry · Prod is fine",
      "toast": "Telemetry vibes: rich."
    },
    {
      "id": "HELIX-5109",
      "title": "Estimate This Ticket (Fibonacci of Regret)",
      "pts": 2,
      "type": "estimate",
      "dod": "Pick Fibonacci. Kyle-bot rejects first pick. Second pick ≥ first succeeds.",
      "meta": "Planning poker · Scope creep theater",
      "toast": "Committed to the vibe of 5."
    },
    {
      "id": "HELIX-5110",
      "title": "Pick a Severity",
      "pts": 3,
      "type": "severity",
      "dod": "Fill Severity / Component / Impact. 'It's Fine' auto-corrects to Sev3.",
      "meta": "Bug form · Taxonomy must be satisfied",
      "toast": "Severity filed. Screenshot still impossible."
    }
  ]
}
```

## Writer handoff

Need joke strings per type: window titles, button labels, reject nits, success toasts, Jimbo `sabotage.<type>[]` (3 lines each). Keep cheerful-wrong Jimbo voice. Do not invent ableist punchlines; punch up at process, Kyle, InsightBot, and the fog.

**Priority — `spacewar`:** 8–12 Kyle beats (`{ kyle, choices: [{ t, d, s }] }`) on whitespace / space-character edgelord debate only. Coordinate with the in-flight Kyle expansion. No ableist framing. End on reluctant LGTM / eternal ceasefire.

**Deferred (cut for slot):** Fibonacci Estimate (`estimate`) — park as filler or V3 if needed.

## QA notes

- Completing ticket A must spawn B without returning to an empty board.
- Repeat types across a long session are OK after pool exhaustion + reshuffle.
- EOD review copy should stop saying `Tickets: x/3`.
