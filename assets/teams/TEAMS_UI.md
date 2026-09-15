# Teams (Corp) — Call Theater chrome

Specs for **Developer**. Chrome / UI glyphs only — **do not implement game logic** here.

Win95-low-fi purple parody of corporate chat + call overlay. Abstract "T" tile / control glyphs — **not** Microsoft Fluent UI or Teams trademark logos. Anonymous corp branding (no Helix). See `specs/03-call-theater.md`.

## Window

| Spec | Value |
|------|-------|
| Title | `Teams (Corp)` |
| Host | Win95 window on CRT desktop (same blit path as `WIN95.md`); replaces Slack player-facing chrome |
| Role | Chat spam host + incoming/connected call overlay |
| Internal id | May stay `slack` or rename to `teams` — Dev choice; player-facing strings say Teams |

### App icons

| Asset | Path | Size | Use |
|-------|------|------|-----|
| 16 | `assets/teams/teams_16.png` | 16×16 RGBA | Title bar / taskbar / tray |
| 32 | `assets/teams/teams_32.png` | 32×32 RGBA | Alt / Start |
| 48 | `assets/teams/teams_48.png` | 48×48 RGBA | Desktop icon |

Regenerate with: `/workspace/.venv/bin/python assets/teams/build_teams_assets.py`

### Purple chrome tokens (rail / header)

| Token | Hex | Use |
|-------|-----|-----|
| teams purple | `#5A588E` | Left rail / header fill (muddy `#6264A7`-adjacent) |
| teams hi | `#7A76B0` | Highlight strip / hover |
| teams dk | `#3A3868` | Rail inset / selected |
| teams edge | `#282648` | Outer edge / bevel dark |
| face | `#C0C0C0` | Window / dialog face (from WIN95) |
| title active | `#000080` | Default Win95 title bar (or optional `#3A3868`) |
| text invert | `#FFFFFF` | Title / selected rail labels |
| accept green | `#28A038` | Accept button / check glyph |
| decline red | `#C02828` | Decline / hangup / cross |

Keep PS1/Win95 crunch — no Fluent glass, no rounded SaaS panels.

## Call control glyphs

| Asset | Path | Size | Use |
|-------|------|------|-----|
| Accept | `assets/teams/call_accept.png` | 16×16 | Incoming **Accept** (green check) |
| Decline | `assets/teams/call_decline.png` | 16×16 | Incoming **Decline** (red X) |
| Mute ON | `assets/teams/call_mute.png` | 16×16 | Mic glyph (unmuted look) |
| Mute OFF | `assets/teams/call_mute_off.png` | 16×16 | Mic crossed (muted) |
| Cam ON | `assets/teams/call_cam.png` | 16×16 | Camera glyph |
| Cam OFF | `assets/teams/call_cam_off.png` | 16×16 | Camera crossed |
| Share | `assets/teams/call_share.png` | 16×16 | Screen-share |
| Hang up | `assets/teams/call_hangup.png` | 16×16 | Red hangup |

Nearest-neighbor only when upscaling.

## Avatars

| Asset | Path | Size | Use |
|-------|------|------|-----|
| Self (cam off) | `assets/teams/avatar_blank.png` | 32×32 | Connected-call self tile silhouette |
| Caller | `assets/teams/avatar_caller.png` | 32×32 | Incoming / connected caller square (flat; initials-friendly) |

## Call overlay layout (match `specs/03-call-theater.md`)

### Incoming ring

```
+----------------------------------+
| [avatar_caller]  Name            |
|                  Subtitle line   |
|                  (Writer opener) |
|                                  |
|   [Accept]         [Decline]     |
+----------------------------------+
```

- Avatar: `avatar_caller.png` (or initials on flat `CALLER_BG` `#4A6A8A`)
- Buttons: `call_accept.png` / `call_decline.png` + labels
- Timeout ~8–12s → decline path
- Audio: ring loop + muffled bed (Audio pack)

### Connected call

```
+------------------------------------------+
|  [caller tile]          [self tile]      |
|  avatar_caller          avatar_blank     |
|                         (cam OFF default)|
|                                          |
|  [mute] [cam] [share]        [hangup]    |
|   ON     OFF                             |
|                                          |
|  Reply chips: [Uh-huh] [chat?] [...]     |
|  countdown ----------------               |
|  Attentiveness ████░░░░  .w95-attentiveness |
+------------------------------------------+
```

**Defaults (LOCKED):** Mute **ON** (`call_mute_off.png` crossed), Camera **OFF** (`call_cam_off.png` + `avatar_blank.png` self tile).

- Reply chip row: 3–4 `.w95-call-chip` buttons + visible countdown
- Attentiveness bar drains ~10–15s; feed via call-UI / mute flicker / Share only
- Share pretends desktop/tickets share; after ~8s without feed → "I can't see your cursor moving"

## CSS class hooks

```
.w95-teams            /* Teams window / panel root (rail + chat) */
.w95-call-overlay     /* Incoming or connected call overlay */
.w95-call-chip        /* Timed reply chip button */
.w95-attentiveness    /* Attentiveness drain bar */
```

Optional: `.w95-teams-rail`, `.w95-teams-header` for purple chrome.

## Branding

- Anonymous corp / Corp. Ticket IDs `CORP-####`. Domains `@corp.internal` / `@corp.local`.
- **No Helix** strings. No real Microsoft product marks beyond parody silhouette energy.
- Jimbo remains separate (`Jimbo - Corporate AI`); optional silent-stakeholder toast only.

## Out of scope

- Game logic, meters wiring, WebRTC / real mic-cam
- Fluent UI polish, trademark Teams logo
- Edits to `game.js` / `win95.js` from this designer pack
