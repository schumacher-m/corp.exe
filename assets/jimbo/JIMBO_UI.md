# Jimbo — HelixStack AI (Win95 chrome)

Specs for **Developer**. Chrome / UI only — **do not implement game logic** here.

Original purple blob mascot (antenna + pink bobble). **Not** Clippy / Office Assistant IP.

## Window

| Spec | Value |
|------|-------|
| Title | `Jimbo — HelixStack AI` |
| Host | Win95 window on CRT desktop (same blit path as `WIN95.md`) |
| Role | AI-assistant chrome / ask panel host |

### Icons

| Asset | Path | Size | Use |
|-------|------|------|-----|
| 16 | `assets/jimbo/jimbo_16.png` | 16×16 RGBA | Title bar / small |
| 32 | `assets/jimbo/jimbo_32.png` | 32×32 RGBA | Alt / desktop icon |
| 48 | `assets/jimbo/jimbo_48.png` | 48×48 RGBA | About / large |
| Toolbar | `assets/jimbo/jimbo_toolbar.png` | 20×20 RGBA | Toolbar button glyph |
| Banner | `assets/jimbo/jimbo_banner.png` | 96×64 | Splash / empty state |

Regenerate with: `/workspace/.venv/bin/python assets/jimbo/build_jimbo_assets.py`

### Colors (Jimbo accents)

| Token | Hex | Use |
|-------|-----|-----|
| jimbo body | `#783CBC` | Face / primary accent / Ask button fill |
| jimbo hi | `#A064DC` | Highlight / hover fill |
| jimbo bar | `#503090` | Optional **active** title bar (else keep navy `#000080` from WIN95) |
| face | `#C0C0C0` | Window / dialog face (from WIN95) |
| text invert | `#FFFFFF` | Title bar text; Ask Jimbo button label |

Title bar: navy Win95 `#000080` is fine; purple active bar `#503090` is optional for Jimbo-focused windows.

## Controls

### Big button — Ask Jimbo

- Label: **Ask Jimbo**
- Fill: purple face `#783CBC`, white text
- Bevel: classic raised (light top/left, dark bottom/right); sunken when `:active`
- Optional: small Jimbo face glyph left of label (`jimbo_toolbar.png` or 16px)

### Toolbar

- `jimbo_toolbar.png` (20×20) **or** 16px icon + label **Ask Jimbo**
- Same bevel language as `.w95-btn`

### Toast

Cheerful confirmation after a “save” / assist beat:

- **Option A:** green Win95 balloon (pale green fill, black 1px border, small pointer tail)
- **Option B:** gray dialog on `#C0C0C0` with bevel
- Copy example: `Jimbo saved you 4 hours!`

## CSS class hooks

```
.w95-jimbo          /* Jimbo window / panel root */
.w95-jimbo-ask      /* Ask Jimbo big button */
.w95-jimbo-toast    /* balloon or dialog toast */
```

Paste-ready styles: `assets/jimbo/jimbo.css` (optional; matches `WIN95.md` palette + Jimbo purple).

## Out of scope

- No game logic, meters wiring, or AI backend
- No Office Assistant / Clippy likeness
