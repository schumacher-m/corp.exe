# corp.exe

Cubicle simulator -- PS1 office, Win95 desktop on a CRT, Jimbo, doom-mail, Appear Active, cubicle farm, incident pager.

## Do not open `index.html` via file://

Chrome blocks ES modules from `file://` (CORS / origin `null`). That looks like a dead **CLOCK IN** button. Serve `dist/` over HTTP.

## Setup

```bash
bun install          # Bun 1.4.2+
bun run build        # → dist/ (bundle + assets/ + audio/)
bun run check        # bundle must succeed
```

## Run (local)

```bash
bun run build
bun run serve        # http://127.0.0.1:8765  (serves dist/)
# or:
bunx serve dist -p 8765
```

Dev one-liner: `bun run dev` (build then serve dist).

## Play

CLOCK IN -> WASD through the cubicle farm (neighbors) -> E/sit at Cubicle 4-B -> Win95 desktop on the CRT.

Mute: `M`

## Stack

Bun bundles `src/` → `dist/game.js`. Three.js stays on CDN (import map). Static `assets/`, `audio/` (incl. `sfx-muffled-call.ogg`), and `copy/` are copied into `dist/` by `bun run build`.

Source layout: `src/main.js`, `src/game/`, `src/desktop/`, `src/apps/`, `src/audio/`, `src/copy/`, `src/util/`.

## GitHub Pages

On every push to `master`/`main`, [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) runs Bun (`check` + `build`) and deploys **`dist/`**.

1. Repo **Settings -> Pages -> Build and deployment -> Source: GitHub Actions** (one-time).
2. Site URL (after first green run): `https://schumacher-m.github.io/corp.html/`

Local preview of the Pages artifact:

```bash
bun run build
bunx serve dist -p 8765
```
