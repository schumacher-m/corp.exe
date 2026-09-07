# corp.exe — Windows 95 Virtual Desktop (on-CRT)

Specs for **Developer**: render this chrome **on the in-world CRT** (blit to `screen_anchor` / `screen_quad.glb`), not as a full-screen overlay. The 3D world stays PS1; the monitor face is a Win95 desktop.

See also: `VISUAL.md`, `assets/manifest.json` anchors.

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| desktop | `#008080` | Teal wallpaper / desktop fill |
| face | `#C0C0C0` | Window / dialog / button face |
| title active | `#000080` | Active title bar |
| title inactive | `#808080` | Inactive title bar (optional) |
| button light | `#FFFFFF` | Bevel highlight (top/left) |
| button shadow | `#808080` | Bevel mid shadow |
| button dark | `#404040` | Bevel dark (bottom/right) |
| text | `#000000` | Body / labels on face |
| text invert | `#FFFFFF` | Title bar text, selected |

## Chrome rules

- **3D bevel** on windows and buttons: 1–2px light top/left, dark bottom/right (classic raised/sunken).
- **Taskbar** along bottom of the desktop canvas; **Start** button left (raised bevel + “Start” label; logo optional).
- **Chunky** min / max / close: small square buttons in the title bar, recessed when pressed.
- Window frame: outer dark border, inner light bevel, then title bar, then client area `#C0C0C0` or white for document panes.
- Fonts: system sans or pixel-ish (`MS Sans Serif` / `Tahoma` / fallback `sans-serif`); keep UI chunky at low res.

## Windows (minigame hosts)

Host each mode in its own Win95 window (or MDI child) on the teal desktop:

| Window | Role |
|--------|------|
| Tickets | Jira-style ticket queue / triage |
| Slack | IM / unread spam |
| IDE | Code / typing minigame |
| PR fight | Reviewer / Kyle confrontation UI |

Z-order like real Win95: click focuses; active title `#000080`.

## Meters (Win95 chrome)

Sanity / Sprint / Unread as classic chrome widgets (status bar strips, small dialogs, or taskbar trays — not modern HUD rings):

- **Sanity** — progress / battery-style bar on face gray
- **Sprint** — progress bar (amber fill ok)
- **Unread** — badge or count; **never zero** (always ≥1)

Style meters with the same bevels and face/shadow colors as buttons.

## Blit path

1. Draw Win95 UI into a **low-res canvas or DOM** (e.g. 320×240 or CRT face aspect matching `screen_quad` 0.42×0.32 world units).
2. Upload / copy that buffer as a texture on the mesh at **`screen_anchor`** (child of `desk_set.glb`) or on **`screen_quad.glb`** parented there.
3. **Nearest** upscale only (`magFilter` / `minFilter` = NEAREST; no mipmaps). Pixelated CRT look is intentional.
4. Do not perspective-correct polish the desktop; keep it flat on the screen quad.

Anchors (from `assets/manifest.json`):

- `desk_set.glb` → `screen_anchor` `[0, 1.02, 0.10]`, `keyboard_anchor` `[0, 0.77, 0.25]`, `mouse_anchor` `[0.45, 0.77, 0.20]`
- `hands.glb` → `left_wrist` `[-0.18, 0, 0]`, `right_wrist` `[0.18, 0, 0]`

## Suggested CSS class hooks

Use these class names if implementing via DOM → canvas / html2canvas / CSS3D:

```
.w95-desktop
.w95-window
.w95-titlebar
.w95-btn
.w95-taskbar
.w95-start
```

Example sketch (non-binding):

```css
.w95-desktop { background: #008080; font-family: "MS Sans Serif", Tahoma, sans-serif; }
.w95-window {
  background: #C0C0C0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
}
.w95-titlebar {
  background: #000080;
  color: #fff;
  font-weight: bold;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.w95-btn {
  background: #C0C0C0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  color: #000;
  padding: 2px 8px;
}
.w95-btn:active {
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}
.w95-taskbar {
  background: #C0C0C0;
  border-top: 2px solid #fff;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
}
.w95-start { /* same bevel as .w95-btn */ font-weight: bold; }
```

## Jimbo

HelixStack AI assistant chrome — original purple blob (antenna/bobble), **not** Clippy. See **`assets/jimbo/`**:

- Icons: `jimbo_16.png`, `jimbo_32.png`, `jimbo_48.png`, `jimbo_toolbar.png` (20×20), `jimbo_banner.png` (96×64)
- Specs for Dev: `assets/jimbo/JIMBO_UI.md` (window title `Jimbo — HelixStack AI`, Ask Jimbo button, toast, classes `.w95-jimbo` / `.w95-jimbo-ask` / `.w95-jimbo-toast`)
- Optional CSS paste: `assets/jimbo/jimbo.css`
- Accents: `#783CBC` / `#A064DC` / optional active title `#503090` (else navy `#000080`)

## Anti-patterns

Fluent / Aero glass, rounded SaaS panels, flat Material buttons, bloom on the desktop, or rendering Win95 full-screen instead of on the CRT face.

