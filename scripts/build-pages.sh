#!/usr/bin/env bash
# GitHub Pages artifact = bun run build → dist/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required (https://bun.sh). CoS CI uses oven-sh/setup-bun." >&2
  exit 1
fi
bun install
bun run build
echo "Pages artifact ready at $ROOT/dist"
