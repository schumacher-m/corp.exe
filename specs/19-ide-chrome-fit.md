# CORP-IDE-01.1 — IDE chrome fit (controls not clipped)

**Status:** Hotfix for CORP-IDE-01 tip `?v=ide2`  
**Parent:** `specs/18-ide-vscode-chrome.md`  
**Scope:** Adaptive activity/sidebar + reserved footer band; default IDE window `300×200`  
**Out of scope:** Minigame logic, Soft DROP polish, hitbox remapping outside editor/footer

---

## Root cause (verified)

- Default IDE win was `240×160` → client ~`232×136`
- Fixed chrome: activity `26` + sidebar `78` → editor only ~`128px` wide
- Comment mode: `ACCEPT //` (70) + `SUBMIT` (68) in one footer → needs ~`154px` → SUBMIT clipped
- DROP DATABASE footer (chips + Run + result ≈ `56px`) cramped vertically on short editor

---

## Fit rules

1. **Min editor width** — Reserve ~`160px` for controls (`ACCEPT`+`SUBMIT`+pad).
2. **Adaptive collapse** — Prefer activity `26` + sidebar `78`. If width is tight: shrink/collapse sidebar first (`sideW → 0`), then thin/collapse activity. Never let chrome steal the footer strip.
3. **`reserveFoot`** — `drawIdeChrome(..., { reserveFoot })` subtracts the reserved band from editor content height so tabs/status cannot overlap buttons. `ideEditorFooter` paints in that band above the status bar.
4. **Default window** — IDE opens at **`300×200`** (still CRT-scale). Outer frame stays Win95; when width allows, sidebar still reads as VS Code parody.

### Call-site `reserveFoot`

| Mode | reserveFoot |
|------|-------------|
| comment | ~28 (ACCEPT+SUBMIT row) |
| semi | ~24 |
| dropdb | ~56 (chips+Run+result) |
| stub | ~24 |

---

## Acceptance

- [ ] Comment: `ACCEPT //` and `SUBMIT` both fully visible + clickable at default size
- [ ] Semi: hint + `SUBMIT` visible
- [ ] DROP DATABASE: chips + Run + result fully visible
- [ ] Outer frame still Win95; still reads as VS Code parody when width allows sidebar
- [ ] Hitboxes remain in editor/footer only; minigame logic untouched
