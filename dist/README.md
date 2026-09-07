# corp.exe

HelixStack cubicle simulator — PS1 office, Win95 desktop on a CRT, Jimbo, doom-mail, Appear Active.

## Do not open `index.html` via file://

Chrome blocks `game.js` modules from `file://` (CORS / origin `null`). That looks like a dead **CLOCK IN** button.

## Run (required)

```bash
cd /path/to/corp.html   # or corp-html
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/)

Mac: double-click `serve.command` instead.

## Play

CLOCK IN → WASD to Cubicle 4-B → E/sit → Win95 desktop on the CRT.

Mute: `M`

## Stack

Vanilla HTML/CSS/JS + Three.js (CDN). No build step. Assets under `assets/`, copy under `copy/`, audio under `audio/`.


## GitHub Pages

On every push to `master`, [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) builds `dist/` and deploys to GitHub Pages.

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time).
2. Site URL (after first green run): `https://schumacher-m.github.io/corp.html/`

Local preview of the Pages artifact:

```bash
bash scripts/build-pages.sh
python3 -m http.server 8765 --directory dist
```
