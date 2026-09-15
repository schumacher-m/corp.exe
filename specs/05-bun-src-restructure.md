# SPEC — Bun + src/ feature-module restructure

**Priority:** after Sims muffledCall (Audio) lands; before or with loop fun review  
**Size:** L  
**Owners:** Developer (primary), Chief of Staff (build/Pages), others untouched except path docs  
**Goal:** Split all game JS into logical feature modules/classes under `src/`, build with Bun to `dist/` for GitHub Pages — same playable game, slimmer editable codebase.

---

## Approach (LOCKED — A)
Feature modules + Bun bundle to `dist/` for Pages. Applies to **all** `.js` (not only `win95.js`).

## Target layout
```
corp-html/
  package.json          # bun scripts: dev, build, check
  bunfig.toml           # if needed
  index.html            # dev entry OR points at dist in prod
  src/
    main.js             # entry: boot + create game
    game/
      Game.js           # Three.js office, farm, day phases
      Farm.js           # neighbor bays / exhausted audio hooks
    desktop/
      Desktop.js        # Win95 shell, taskbar, start menu, meters
      Window.js         # window chrome helpers
      Modal.js          # shared modal/dialog
    apps/
      OutlookApp.js
      TeamsApp.js       # Call Theater
      TicketsApp.js
      JimboApp.js
      TimesheetApp.js
      Presence.js
      Incident.js
      IdeApp.js
      PrApp.js
    audio/
      Audio.js          # former audio.js
    copy/
      loadCopy.js       # import baked copy-data or JSON
    util/
      pick.js, ascii.js, ...
  dist/                 # bun build output (gitignored or published)
  assets/ audio/ copy/  # static, copied into dist by build
```

Exact file names may vary; **one concern per module**. Prefer ES classes where state+methods cluster (e.g. `class OutlookApp`); thin functions OK for utils.

## Build / release
- `bun install`
- `bun run check` — syntax/typecheck as configured (`bun build --no-bundle` check or `tsc` if added later; minimum: build must succeed)
- `bun run build` — bundle `src/main.js` → `dist/game.js` (or split chunks), copy `assets/`, `audio/`, `index.html`, bake copy if needed
- GitHub Pages: workflow runs Bun, deploys **`dist/`** (update `.github/workflows/deploy-pages.yml`)
- Local: `bun run dev` (Bun dev server) or `bun run build && bunx serve dist`
- Lint gate before push: build must pass; no truncated functions; desktop code ASCII-safe

## Migration rules
- Behavior parity with tip before restructure (Outlook, Call Theater, Presence, Timesheet, farm, incident)
- No Helix strings; Jimbo - Corporate AI; CORP-####
- `createWin95` may become `new Desktop(copy, hooks)` exporting same hook surface for `Game.js`
- Delete or thin root `win95.js` / `game.js` / `audio.js` after cutover (keep stubs that re-export from dist only if needed for old bookmarks — prefer clean break via dist index)
- `bake_copy.py` can stay Python or become `bun run bake` later — not blocking

## Out of scope
- Rewriting game design / copy
- TypeScript mandatory (optional later)
- Deep enterprise OOP hierarchies (rejected approach B)

## Acceptance
- [ ] All game logic lives under `src/`; no 5k-line godfile
- [ ] `bun run build` produces playable `dist/`
- [ ] Pages serves dist and boots to clock-in
- [ ] Call Theater, Outlook, Presence, Timesheet, farm, incident still work
- [ ] Dev workflow documented in README
- [ ] CI/Pages workflow updated

## Hand-off
Developer implements against this spec after Sims muffledCall. CoS updates Pages workflow + ships.
