#!/usr/bin/env python3
"""Overlay startDenied / jimbo / emails from copy/*.md into copy-data.js."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COPY = ROOT / "copy"

def fence(path):
    m = re.search(r"```json\s*(\{.*?\}|\[.*?\])\s*```", path.read_text(), re.S)
    if not m:
        raise SystemExit(f"no json fence in {path}")
    return json.loads(m.group(1))

src = (ROOT / "copy-data.js").read_text()
m = re.search(r"export\s+default\s+", src)
rest = src[m.end():].strip()
if rest.endswith(";"):
    rest = rest[:-1]
data = json.loads(rest)
for key, fname in [("startDenied", "start-denied.md"), ("jimbo", "jimbo.md"), ("emails", "emails.md")]:
    p = COPY / fname
    if p.exists():
        data[key] = fence(p)
items = data.setdefault("startMenu", {}).setdefault("items", [])
labels = [i.get("label") for i in items]
if "Jimbo" not in labels:
    items.insert(0, {"label": "Jimbo", "id": "jimbo"})
if "Inbox" not in labels:
    items.insert(1, {"label": "Inbox", "id": "inbox"})
(ROOT / "copy-data.js").write_text(
    "/* Auto-baked from copy/*.md — re-run bake_copy.py */\nexport default "
    + json.dumps(data, indent=2, ensure_ascii=False)
    + ";\n"
)
print("baked:", "jimbo" in data, "emails", len(data.get("emails", {}).get("messages", [])), "denied", len(data.get("startDenied", [])))
