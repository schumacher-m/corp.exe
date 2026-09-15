#!/usr/bin/env bash
# Assemble a clean static site for GitHub Pages (no bundler required).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/dist"
rm -rf "$OUT"
mkdir -p "$OUT/assets" "$OUT/audio" "$OUT/copy"

copy_tree() {
  local src="$1" dest="$2"
  mkdir -p "$dest"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude '__pycache__' --exclude '*.py' --exclude '*.bak' --exclude 'preview' "$src/" "$dest/"
  else
    (cd "$src" && tar --exclude='__pycache__' --exclude='*.py' --exclude='*.bak' --exclude='preview' -cf - .) | (cd "$dest" && tar -xf -)
  fi
}

cp -a "$ROOT/index.html" "$ROOT/style.css" "$ROOT/boot.js" "$ROOT/game.js" "$ROOT/win95.js" \
  "$ROOT/audio.js" "$ROOT/copy-data.js" "$OUT/"
cp -a "$ROOT/README.md" "$ROOT/AUDIO.md" "$ROOT/VISUAL.md" "$ROOT/WIN95.md" "$OUT/" 2>/dev/null || true
[[ -f "$ROOT/serve.command" ]] && cp -a "$ROOT/serve.command" "$OUT/" || true

copy_tree "$ROOT/assets" "$OUT/assets"
find "$ROOT/audio" -maxdepth 1 \( -name '*.ogg' -o -name '*.wav' -o -name '*.mp3' \) -exec cp -a {} "$OUT/audio/" \;
copy_tree "$ROOT/copy" "$OUT/copy"

touch "$OUT/.nojekyll"
echo "Built Pages artifact at $OUT ($(find "$OUT" -type f | wc -l) files)"
