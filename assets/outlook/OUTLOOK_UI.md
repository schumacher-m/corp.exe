# Mail — Mail Theater chrome

Specs for **Developer**. Chrome / UI glyphs only — **do not implement game logic** here.

Win95-style low-fi parody of a corporate inbox on CRT. Abstract envelope + blue/purple accent strip — **not** a trademark mail-client logo or Fluent UI. Anonymous corp branding (no Helix). Player-facing name: **Mail**. Internal asset folder stays `assets/outlook/` so Dev paths remain stable. See `docs/GENERIC_NAMES.md` and `specs/04-outlook-theater.md`.

## Window

| Spec | Value |
|------|-------|
| Title | `Mail` |
| Desktop label | `Mail` |
| Host | Classic desktop window on CRT (same blit path as `docs/WIN95.md`); inbox / mail host |
| Role | Focused / Other inbox + reading pane + New compose stub |
| Internal id / folder | May stay `inbox` / `outlook` — Dev choice; **player-facing** strings say **Mail**. Folder: `assets/outlook/` (do not rename). |

### App icons

| Asset | Path | Size | Use |
|-------|------|------|-----|
| 16 | `assets/outlook/outlook_16.png` | 16×16 RGBA | Title bar / taskbar / tray |
| 32 | `assets/outlook/outlook_32.png` | 32×32 RGBA | Alt / Start |
| 48 | `assets/outlook/outlook_48.png` | 48×48 RGBA | Desktop icon |

Regenerate with: `/workspace/.venv/bin/python assets/outlook/build_outlook_assets.py`

Icon art: abstract envelope on blue tile + purple accent strip. **No lettermark / no Outlook logo.**

### Accent colors (classic gray + blue/purple strip)

| Token | Hex | Use |
|-------|-----|-----|
| face | `#C0C0C0` | Window / dialog / ribbon face (from WIN95) |
| face light | `#FFFFFF` | Bevel highlight |
| face shadow | `#808080` | Bevel mid |
| face dark | `#404040` | Bevel dark |
| title active | `#000080` | Default classic title bar |
| accent blue | `#286CC8` | Ribbon accent strip / selected rail |
| accent blue hi | `#5898E8` | Hover / highlight |
| accent blue dk | `#184890` | Inset / pressed |
| accent purple | `#783CBC` | Secondary accent strip (top of ribbon / icon) |
| accent purple hi | `#A064DC` | Strip highlight |
| accent purple dk | `#503090` | Strip inset |
| text | `#000000` | Body / list on face |
| text invert | `#FFFFFF` | Title / selected rail labels |
| paper | `#F0F0F4` | Reading pane / compose body |

Keep PS1 / classic-desktop crunch — no Fluent glass, no rounded SaaS panels. Sick OK green unused here.

## Rail glyphs

Left rail ~56–64px: Focused / Other / Folders (Folders may be cosmetic).

| Asset | Path | Size | Use |
|-------|------|------|-----|
| Focused | `assets/outlook/focused.png` | 16×16 | Rail **Focused** (chunky star/pin) |
| Other | `assets/outlook/other.png` | 16×16 | Rail **Other** (folder / inbox overflow) |

Nearest-neighbor only when upscaling. Default tab on open: **Focused**.

## Ribbon glyph

Fake modern ribbon stub under title: New | Delete | Archive | Focused tips — chunky buttons, blue/purple accent strip.

| Asset | Path | Size | Use |
|-------|------|------|-----|
| New | `assets/outlook/new_mail.png` | 16×16 | Ribbon **New** / compose button |

Canvas-drawn fallback OK if PNGs missing.

## Layout (client area)

```
+------------------------------------------------------------------+
| title: Mail                                         [_][ ][X]    |
+------------------------------------------------------------------+
| ribbon: [New*] [Delete] [Archive] [Focused tip]  <- blue/purple  |
+--------+---------------------------+-----------------------------+
| rail   | message list              | reading pane                |
| ~56px  | unread | From | Subject   | full body / empty-state     |
|        | snippet                   |                             |
| [star] |                           |                             |
| Focused|                           |                             |
| [fold] |                           |                             |
| Other  |                           |                             |
| Folders|                           |                             |
+--------+---------------------------+-----------------------------+
* New uses new_mail.png
```

1. **Left rail** — Focused / Other / Folders glyphs + labels
2. **Message list** (middle) — unread pill, From, Subject, 1-line snippet; selected row highlighted
3. **Reading pane** (right) — full body when selected; Writer empty-state when none

## CSS class hooks (suggested)

```
.w95-outlook           /* Mail window root; class id may stay outlook */
.w95-outlook-ribbon    /* Fake modern ribbon stub + accent strip */
.w95-outlook-rail      /* Left Focused/Other/Folders rail */
.w95-outlook-list      /* Message list */
.w95-outlook-read      /* Reading pane */
.w95-outlook-compose   /* In-window New Mail compose stub */
```

## Branding

- Anonymous corp / Corp. Domains `@corp.internal` / `@corp.local`.
- **No Helix** strings. No real product marks beyond parody silhouette energy (abstract envelope + blue/purple accent OK).
- Jimbo remains separate (`Jimbo - Corporate AI`); compose Send always fails via Jimbo toast (Writer pack).

## Out of scope

- Game logic, Focused/Other filtering, Unread meter wiring, SMTP
- Fluent UI polish, trademark mail-client logos
- Edits to `game.js` / `win95.js` from this designer pack
- Renaming `assets/outlook/` folder
