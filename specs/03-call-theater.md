# SPEC — Call Theater (Teams parody + muffled calls)

**Priority:** 3 (after Presence Theater, then Timesheet Lock)  
**Size:** M  
**Owners:** Developer (state machine / UI), Writer (chat + call copy), Designer (Teams chrome + call overlay glyphs), Audio (ring + muffled voice bed + accept/decline)  
**Branding:** anonymous generic corp / Corp. Ticket IDs `CORP-####`. Jimbo title `Jimbo - Corporate AI`. Domains `@corp.internal` / `@corp.local` as elsewhere.  
**Hooks into:** replace Slack window (`win95.js` `slack` → Teams), `game.js` spam timers, Sanity / Sprint / Unread meters, `presenceForced` + timesheet gate (never stack), `audio.js`, ASCII-only in `win95.js`

---

## Fantasy
You are not "in a meeting." You are trapped in a purple parody of corporate chat while someone who barely knows your name rings you with a muffled "Do you have a minute?" Work freezes. Mute is on. Camera is off. The attentiveness bar still drains. Teams does not care that you were mid-semicolon.

## Core loop (LOCKED)
1. While seated / day systems on: random **incoming call** interrupt (ring overlay + muffled voice bed — no intelligible speech).
2. Caller title line rotates Writer copy, e.g. "Do you have a minute?" / "Having a very important question…"
3. **Accept** → enter connected call (~12–20s). Tickets / IDE / PR interactions **freeze** (or ignore clicks) until hang-up or call ends. Player must land **one timed reply chip** before the window ends.
4. **Decline** or **let ring out** → Unread++, Sanity hit, follow-up Teams DM ("tried calling…").
5. Max **1** concurrent call. Never open over Away/`presenceForced` or an open Timesheet gate — **queue or defer** until clear.

## UI — Teams replaces Slack
- Desktop / taskbar app becomes **Teams** (parody), not Slack.
- Win95-low-fi purple-ish chrome: left rail (Chat / Calls), channel or chat list, message pane. Not real Fluent UI; keep PS1/Win95 crunch.
- Existing Slack spam pool becomes Teams chat spam (Writer retune). Kyle / manager / random peers post as today.
- Desktop icon + window title: `Teams` (Writer may add a dead corporate subtitle).
- Window id may stay `slack` internally for less churn **or** rename to `teams` — Dev choice; player-facing strings must say Teams.

## Incoming call overlay
| Element | Behavior |
|---------|----------|
| Avatar / initials | Low-fi square; Designer |
| Name | From Writer caller pool (e.g. Brad from Synergy, Kyle, "Director of Alignment") |
| Subtitle | "Do you have a minute?" / "Having a very important question…" / variants |
| Audio | Looping ring + muffled voice bed under it |
| Buttons | **Accept** / **Decline** |
| Timeout | ~8–12s ring; then decline path |

Presence jiggler / Active badge does **not** block rings. Corporate always finds you.

## Connected call (Accept)
### Layout
- Call stage: caller tile, self tile (camera off = silhouette / initials), mute + camera toggles, optional **Share**, **Hang up**.
- Reply chip row (3–4 buttons) with a visible countdown.
- **Attentiveness bar** (drains over ~10–15s unless fed).

### Defaults (LOCKED)
- **Mute ON**, **Camera OFF** at accept.
- Toggles are mostly cosmetic until audits / attentiveness rules fire.

### Reply chips (Writer punch-up OK)
Example ids:
| id | Label vibe | On success |
|----|------------|------------|
| `uh_huh` | Uh-huh | Sprint +1, Sanity −1 |
| `send_chat` | Can you send that in chat? | Sprint +2, Sanity −2 |
| `on_mute` | Sorry — on mute | Sprint +1, Sanity −2 |
| `circle_back` | I'll circle back | Sprint +1, Sanity −3 |

Landing **any one** chip before timer → soft win, call ends (or short "thanks" then hang-up).  
Missing the timer / **Hang up** with no chip → fail: Sanity −6, Unread follow-up "you froze", Sprint 0.

### Attentiveness / still-there (LOCKED)
- Bar drains while connected. Feed by: mouse move / click in call UI, briefly toggling mute **off**, or typing in IDE/tickets **if** unfrozen is wrong — tickets stay frozen; feeding is **call-UI / mute flicker / Share** only.
- Bar empty → toast **"Are you still there?"** + Sanity −3; bar resets partially; second empty in same call → force fail (same as missed chip).

### Screen share (LOCKED for v1)
- **Share** pretends to share the tickets/desktop window.
- After ~8s, if player has not fed attentiveness since share started, caller chip / toast: **"I can't see your cursor moving"** + Sanity −2 (does not auto-fail alone).

### Jimbo (light touch)
- ~25% after accept: toast "Jimbo joined as a silent stakeholder!" (no extra UI required).
- Optional rare post-call DM from Jimbo summarizing nothing useful.

## Decline / ignore
| Path | Sanity | Unread | Extra |
|------|--------|--------|-------|
| Decline | −4 | +1 | Follow-up DM |
| Ring timeout | −5 | +1 | Follow-up DM + optional missed-call badge on Teams |
| Decline while Away forced | still queue; fire after Away clears | | |

## Frequency / stacking
- First call eligible ~30–60s after seated day systems; then every **45–90s** jitter.
- At most one call at a time; defer if `presenceForced`, timesheet gate, boot/walk, or Jimbo HR hard popup.
- Sprint from calls: small only (chip table). No Sprint for declining.

## Audio
| Key | File (suggested) | Notes |
|-----|------------------|-------|
| `teamsRing` | `sfx-teams-ring.wav` | Loop while ringing |
| `muffledCall` | `sfx-muffled-call.ogg` | Bed under connected call; no words |
| `callAccept` / `callDecline` | short blips | One-shots |
| Keep or retune | `slack` ping → `teamsPing` | Chat spam |

Presence can ship without new SFX; Call Theater should not ship mute without muffled bed (fallback: filtered noise from existing HVAC if needed).

## Copy packs (Writer)
New `copy/teams.md` (or retitle `slack-dms.md`):
- `chatPool` (ex-slackPool)
- `callers[]` { id, name, color, openers[] }
- `replyChips[]` { id, label, sprint, sanity }
- `followUps[]` decline / freeze / still-there / no-cursor
- Bake into `copy-data.js` via `bake_copy.py`

## Out of scope
- Real WebRTC / mic / camera. Real Microsoft branding or trademarks beyond parody silhouette. Full calendar. Desk visitors / relationship meters (Interrupt Stack / Soft Social — later). Ableist jokes. Intelligible TTS speech in the muffled bed.

## Acceptance
- [ ] Slack player-facing chrome gone; Teams window + spam chat
- [ ] Incoming call rings with muffled bed; Accept / Decline / timeout paths work
- [ ] Accept freezes ticket board for call duration; reply chips resolve win/fail
- [ ] Mute + camera default ON/OFF as specified; attentiveness "still there?" fires
- [ ] Share → "cursor not moving" nag possible
- [ ] Never stacks over Away modal or Timesheet gate
- [ ] ASCII-only in `win95.js`; no Helix strings
- [ ] Dark humor kept; no ableist copy

## Ship order reminder
1. Presence Theater (done / shipping)  
2. Timesheet Lock (`CORP-TIME-01`)  
3. **This spec — Call Theater**
