# SPEC — Outlook Theater (Modern Outlook parody on Win95 CRT)

**Priority:** 4 (after Call Theater)  
**Size:** M  
**Owners:** Developer (`drawInbox` / tabs / compose), Designer (rail + ribbon glyphs), Writer (Focused empty-states, Other spam labels, compose-fail lines), Audio (optional: soft mail whoosh on tab switch — not required)  
**Branding:** anonymous generic corp. Jimbo = `Jimbo - Corporate AI`. Domains `@corp.internal` / `@corp.local`. No Helix.  
**Hooks into:** `win95.js` `drawInbox`, inbox window, doom/presence/force mail, Unread meter, Jimbo toasts, ASCII-only in `win95.js`

---

## Fantasy
The CRT still runs Windows 95 bevels, but HR forced a "modern Outlook" skin. Focused Inbox sorts your suffering. Other hides the newsletters. New Mail never actually sends — Jimbo rewrites your tone first.

## Player-facing chrome
- Window title: **Outlook** (drop "Outlook Express" / Express branding).
- Win95 window chrome kept (title bar, close, bevels).
- Fake **modern ribbon stub** under title: New | Delete | Archive | Focused tips — chunky buttons, blue/purple accent strip (parody Fluent, not trademark-accurate Microsoft UI).
- Layout (inside client area):
  1. **Left rail** (~56–64px): Focused / Other / Folders (Folders may be cosmetic or open a toast "Folders syncing…").
  2. **Message list** (middle): unread pill, From, Subject, 1-line snippet; selected row highlighted.
  3. **Reading pane** (right): full body when a mail is selected; empty-state copy when none.

Desktop icon label may stay Inbox or become Outlook (Writer/Designer pick; prefer **Outlook**).

## Focused vs Other (LOCKED)
| Bucket | What lands here |
|--------|-----------------|
| **Focused** | `doom`, `presence`, `force`, HR/audit, incident-adjacent mail, anything with `sanityHit` >= 5 (heuristic OK) |
| **Other** | filler / newsletter / "AllHands digest" / low-stakes spam without force flags |

- Default tab on open: **Focused**.
- Switching tabs is free (no Sanity). List filters to that bucket; Unread meter still counts **both**.
- If Focused is empty: Writer empty-state ("You're all caught up. That's worse.").
- Away/`presenceForced` doom mail still forces modal as today — does not require Outlook window open.
- Opening a mail / Marked-as-read-by-Jimbo / Sanity rules **unchanged**.

## New Mail compose (LOCKED)
- Ribbon **New** opens an in-window compose stub (To / Subject / body lines, Send / Discard).
- **Send** always fails: Jimbo toast + Writer line (e.g. "Jimbo rewrote your tone. Draft discarded for culture."). Optional Sanity −1.
- **Discard** closes compose, no cost.
- Never a real outbound message; never clears Unread.

## Ribbon stubs
| Control | Behavior |
|---------|----------|
| New | Open compose |
| Delete | If mail selected: mark read + toast "Moved to Deleted (synced to Jimbo)"; small Sanity or 0 — prefer **0** + comedy |
| Archive | Toast "Archived for impact"; mail stays |
| Focused tip | Toast Writer one-liner about Focused Inbox philosophy |

## Visual / assets
- Designer: optional `assets/outlook/` — app icon 16/32/48, Focused/Other glyphs, New button. Canvas-drawn fallback OK.
- Colors: Win95 face gray + accent blue/purple strip (sick OK green unused). No photoreal Fluent.

## Copy pack (Writer)
New `copy/outlook.md` → bake `outlook` in `copy-data.js`:
- `windowTitle`, `desktopLabel`
- `rail`: Focused / Other / Folders labels
- `emptyFocused`, `emptyOther`
- `ribbonToasts` (delete/archive/tip)
- `composeFail[]`, `composeTitle`
- Optional Other-bucket subject prefixes

## Out of scope
- Real SMTP. Calendar/People panes. Actual Microsoft trademarks beyond parody silhouette. Changing Away force-mail pipeline. Ableist jokes.

## Acceptance
- [ ] Window reads as modern Outlook parody in <2s on CRT
- [ ] Focused / Other filter correctly; Unread counts both
- [ ] Reading pane + list selection work
- [ ] New → Send always fails via Jimbo; Discard closes
- [ ] Doom/Away/Jimbo-mark-read behavior preserved
- [ ] ASCII-only `win95.js`; no Helix strings
- [ ] Lint gate: `node --check` + ESM import before master push

## Ship order
After Call Theater (done). Spec `04` → plan optional → build → lint → master.
