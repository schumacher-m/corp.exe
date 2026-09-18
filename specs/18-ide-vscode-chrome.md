# CORP-IDE-01 — VS Code chrome inside Win95 IDE

**Status:** Greenlit by Michael via CoS (2026-09-18)  
**Choice:** VS Code-like client **inside** the existing Win95 window (keep outer bevel + title bar + teal desktop)  
**Scope:** All IDE modes — Semicolon Hell (`semi`), comment-every-line (`comment`), DROP DATABASE (`dropdb`)  
**Out of scope:** PR fight UI, Tracker, Sync, elev doors (separate), Soft DROP polish  

---

## Goal

Every code editor surface should read as a compact **VS Code parody** nested in classic Win95 chrome — dark editor, activity bar, tabs, status bar — without leaving the CRT Win95 desktop mandate.

No Microsoft / VS Code trademarks. Generic marks OK (“Helix Code”, “corp.exe”, file icons).

---

## Locked layout (client area)

Inside the Win95 client (below title bar):

| Region | Spec |
|--------|------|
| Activity bar | ~24–28px left strip, dark `#333333`; 3–4 glyph buttons (Explorer, Search, SCM, soft Extensions) |
| Side bar | ~72–90px dark `#252526`; fake Explorer tree (e.g. `src/`, `ticket.js`) — non-interactive OK for v1 |
| Tab bar | Dark `#2d2d2d`; one active tab (ticket file / `query.sql`); inactive tab optional |
| Editor | `#1e1e1e` bg; gutter line numbers `#858585`; monospace code (Consolas / Courier New); selection/caret as today for minigames |
| Status bar | ~18px `#007acc` (or muted `#007acc`/`#68217a` parody); Ln/Col, lang (`JavaScript` / `SQL`), “UTF-8”, “corp” |

Win95 **outer** frame, title (`IDE — …`), min/max/close stay classic beige/`#000080` active title.

---

## Modes

| Mode | Editor content | Notes |
|------|----------------|-------|
| `semi` | Semicolon Hell lines | Same hit targets / `;` input; skin only |
| `comment` | Comment-every-line | Same Enter/accept flow |
| `dropdb` | SQL pane `DROP DATABASE corp;` | Run button can be VS-style or Win95 raised — prefer small VS-like primary in editor chrome |

Do **not** change win/fail, Sanity, or ticket close rules.

---

## Designer

- Palette swatches + 16×16 activity glyphs (nearest, unbranded)
- Optional fake Explorer row art
- One reference mock (PNG) of IDE client layout at ~320×200 CRT-ish
- Update `docs/WIN95.md` IDE section: “client = VS Code parody; frame = Win95”

---

## Developer

1. Refactor `drawIde` / `drawIdeDropDb` / stubs to paint regions above  
2. Keep input hitboxes mapped to editor area (not activity bar)  
3. Title strings can stay `IDE — …` or `Helix Code — …`  
4. Tip after elev peek if both land same day; else independent desktop tip (`?v=ide1` or next)

---

## Acceptance

- [ ] Outer window still Win95 on teal desktop  
- [ ] Client clearly reads VS Code (activity + dark editor + status)  
- [ ] `semi` / `comment` / `dropdb` all use shared chrome  
- [ ] Minigames still completable; no logic regressions  
- [ ] No trademarked VS Code / Microsoft logos  
- [ ] Fit (CORP-IDE-01.1): footer controls not clipped — see `specs/19-ide-chrome-fit.md`  

## Soft DROP

Parked.

---

## Team

| Role | Action |
|------|--------|
| Designer | Palette, glyphs, mock; WIN95.md note |
| Developer | Skin `IdeApp.js` draw paths; tip |
| Writer | Optional title/status gag only |
| Game Designer | Feel pass after tip |
| CoS | Spec + lint-gate tip |
