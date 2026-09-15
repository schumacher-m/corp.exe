# Call Theater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Slack with a Teams parody window and add muffled incoming-call interrupts (Accept → timed reply chips + mute/camera/attentiveness/Share; Decline → Unread + Sanity), per `specs/03-call-theater.md`.

**Architecture:** Keep the existing Win95 window system in `win95.js`. Rename/restyle the `slack` window as Teams for players. Add a call state machine (`idle` → `ringing` → `connected` | `missed`) that freezes ticket board interactions while connected, reuses `pushSlack`-style chat for Teams spam + follow-ups, and hooks Audio SFX. Stacking rules mirror Presence/Timesheet: never open over `presenceForced` or an open timesheet gate — queue/defer.

**Tech Stack:** Vanilla HTML/CSS/JS (`win95.js`, `game.js`, `audio.js`, `copy-data.js` via `bake_copy.py`), Win95 canvas UI, optional Designer PNGs.

## Global Constraints

- Spec: `/workspace/corp-html/specs/03-call-theater.md` (source of truth)
- Ship after Presence Theater + Timesheet Lock are on master
- Branding: anonymous corp; tickets `CORP-####`; Jimbo title `Jimbo - Corporate AI`; domains `@corp.internal` / `@corp.local`
- ASCII-only in `win95.js` (no Unicode — browser SyntaxError risk)
- No real WebRTC / mic / camera / intelligible TTS
- Never stack call UI over Away/`presenceForced` or timesheet gate
- Dark humor OK; no ableist copy

**File map**
| File | Role |
|------|------|
| `specs/03-call-theater.md` | Locked design |
| `copy/teams.md` (new) | Writer copy pack → bake |
| `copy-data.js` | Baked `teams` + chat pool |
| `bake_copy.py` | Include `teams.md` |
| `win95.js` | Teams chrome, call overlay, state machine, freeze board |
| `game.js` | Call spawn timer (seated day systems) |
| `audio.js` + `audio/` | ring, muffled bed, accept/decline |
| `assets/teams/` | Designer glyphs (optional) |
| `WIN95.md` / `VISUAL.md` / `AUDIO.md` | Docs |

---

### Task 1: Writer copy pack `copy/teams.md`

**Files:** create `copy/teams.md`; update `bake_copy.py` if needed; run bake → `copy-data.js`

- [ ] Add JSON fences matching `presence.md` / `slack` style: `chatPool`, `callers[]`, `openers[]`, `replyChips[]` (sprint/sanity), `followUps` (decline/timeout/freeze/still-there/no-cursor), window titles/labels
- [ ] Retune old Slack spam into Teams voice; keep Kyle/manager dread
- [ ] Run `python3 bake_copy.py`; confirm `copy-data.js` has `teams` (or `slackPool` aliased)
- [ ] Commit: `Add Teams/Call Theater copy pack`

### Task 2: Audio stubs

**Files:** `audio.js`, `audio/sfx-teams-ring.wav`, `audio/sfx-muffled-call.ogg` (or wav), accept/decline blips; `AUDIO.md`

- [ ] Audio creates muffled bed (filtered noise / no words) + ring loop
- [ ] Register keys: `teamsRing`, `muffledCall`, `callAccept`, `callDecline`; optionally alias `slack` → `teamsPing`
- [ ] Document in `AUDIO.md`
- [ ] Commit: `Add Call Theater SFX keys`

### Task 3: Designer chrome (can parallel Tasks 1–2)

**Files:** `assets/teams/*`, notes in `WIN95.md` / `VISUAL.md`

- [ ] Teams taskbar/desktop icon + call Accept/Decline/mute/cam/Share glyphs (Win95-low-fi purple parody, not Fluent)
- [ ] Paths documented for Dev
- [ ] Commit: `Add Teams Call Theater glyphs`

### Task 4: Teams window chrome (replace Slack player-facing)

**Files:** `win95.js`, `index.html` if needed, `style.css` if DOM

- [ ] Player-facing title/labels: Teams (internal id may stay `slack`)
- [ ] Draw left rail + message list using existing `slackMsgs` / chat pool from Teams copy
- [ ] Keep ASCII-only
- [ ] Manual: open desktop → Teams window shows Teams, not Slack
- [ ] Commit: `Restyle Slack window as Teams parody`

### Task 5: Ringing overlay + decline/timeout

**Files:** `win95.js`, `game.js`, `audio.js`

- [ ] State: `callPhase: null|ringing|connected`
- [ ] `game.js` jitter timer 45–90s after seated `enableDaySystems`; first eligible 30–60s; max one; defer if `presenceForced` / timesheet gate / boot
- [ ] Overlay: name, opener, Accept/Decline; ring SFX loop; timeout ~8–12s → decline path
- [ ] Decline/timeout: Sanity −4/−5, Unread++, follow-up Teams DM
- [ ] Manual: force ring via debug or wait; Decline; see DM
- [ ] Commit: `Add Teams incoming call ring overlay`

### Task 6: Connected call — reply chips + freeze

**Files:** `win95.js`

- [ ] Accept: stop ring, play accept blip, start muffled bed, freeze ticket/IDE clicks (`presenceBlocksBoard`-style gate)
- [ ] Show 3–4 reply chips + countdown 12–20s
- [ ] Chip success → Sprint/Sanity per copy; end call
- [ ] Miss timer or Hang up with no chip → Sanity −6, freeze follow-up DM
- [ ] Manual: Accept, land chip; Accept, miss timer
- [ ] Commit: `Add connected call reply chips and board freeze`

### Task 7: Mute / camera / attentiveness / Share

**Files:** `win95.js`

- [ ] Defaults: Mute ON, Camera OFF
- [ ] Attentiveness bar drains; feed via call-UI input / mute flicker / Share activity only (tickets stay frozen)
- [ ] Empty bar → "Are you still there?" + Sanity −3; second empty → fail like missed chip
- [ ] Share → after ~8s without feed: "I can't see your cursor moving" + Sanity −2
- [ ] Optional ~25% Jimbo toast on accept
- [ ] Manual: ignore bar; Share without feeding
- [ ] Commit: `Add call mute/camera attentiveness and Share nag`

### Task 8: Acceptance + ship

**Files:** docs; GitHub master via CoS ship path

- [ ] Walk `specs/03-call-theater.md` acceptance checklist
- [ ] `node --check win95.js game.js audio.js`; bake clean; `rg Helix` clean in player-facing strings
- [ ] Confirm no stack over Away / timesheet
- [ ] CoS ships to `schumacher-m/corp.html` master
- [ ] Commit: `Ship Call Theater` (or CoS push)

---

## Parallelism

- Tasks 1–3 parallel (Writer / Audio / Designer)
- Tasks 4–7 sequential on Dev after merge of Presence+Timesheet onto farm/incident tip
- Task 8 after 7
