# Start menu — Programs flyout

**Status:** Michael lock · Designer chrome in `docs/WIN95.md` § Start menu · Writer copy `copy/start-menu.md`  
**Owner:** Developer

## Behavior
- Root Start: Programs / Documents / Settings / Find / Help / Run… / Shut Down… only (no Tracker/Sync/Mail/Jimbo/jiggler/timesheet on root).
- Rows with `submenu` show `>` and open a cascade panel on hover or click.
- Programs children with `id` call `handleStartItem` (Tracker/Sync/Mail/Jimbo/jiggler/timesheet).
- Joke kids (no `id`) → denied toast. Documents/Settings/Find/Help stay joke-only.

## Impl
- `DesktopShell.js`: `drawStartMenu` + flyout hits; `startFlyoutIndex` state.
- Copy baked in `src/copy/copy-data.js` from Writer.
