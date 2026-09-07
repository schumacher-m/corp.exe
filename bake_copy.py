#!/usr/bin/env python3
"""Overlay copy/*.md into copy-data.js."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COPY = ROOT / "copy"

def fence(path):
    m = re.search(r"```json\s*(\{.*?\}|\[.*?\])\s*```", path.read_text(), re.S)
    if not m:
        raise SystemExit(f"no json fence in {path}")
    return json.loads(m.group(1))

def fence_all(path):
    return [json.loads(m.group(1)) for m in re.finditer(r"```json\s*(\{.*?\}|\[.*?\])\s*```", path.read_text(), re.S)]

def first_list(path):
    for blob in fence_all(path):
        if isinstance(blob, list):
            return blob
    return None

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

# Kyle PR pack → thicken prScript
kyle_pr = COPY / "kyle-pr.md"
if kyle_pr.exists():
    beats = first_list(kyle_pr)
    if beats:
        data["prScript"] = beats

# Kyle Slack interrupts
kyle_slack_path = COPY / "kyle-slack.md"
if kyle_slack_path.exists():
    ks = first_list(kyle_slack_path)
    if ks:
        data["kyleSlack"] = ks
        pool = list(data.get("slackPool") or [])
        seen = {m.get("text") for m in pool}
        for m in ks:
            if m.get("text") not in seen:
                pool.append(m)
                seen.add(m.get("text"))
        data["slackPool"] = pool

# Whitespace diplomacy → spaceWarScript + HS-404 / spacewar
sw_path = COPY / "kyle-space-war.md"
if sw_path.exists():
    blobs = fence_all(sw_path)
    script = next((b for b in blobs if isinstance(b, list)), None)
    ticket = next((b for b in blobs if isinstance(b, dict) and b.get("id")), None)
    if script:
        data["spaceWarScript"] = script
    if ticket:
        ticket = {
            **ticket,
            "type": "spacewar",
            "toast": ticket.get("toast") or "Whitespace survived. Kyle has notes.",
        }
        tickets = list(data.get("tickets") or [])
        tickets = [t for t in tickets if t.get("id") != ticket["id"] and t.get("type") != "spacewar"]
        cores = [t for t in tickets if t.get("type") in ("semi", "comment", "pr")]
        others = [t for t in tickets if t.get("type") not in ("semi", "comment", "pr")]
        data["tickets"] = cores + [ticket] + others
        pool = list(data.get("ticketPool") or [])
        pool = [t for t in pool if t.get("id") != ticket["id"] and t.get("type") != "spacewar"]
        pool.append(ticket)
        data["ticketPool"] = pool

# tickets-extra → ticketPool (merge)
extra = COPY / "tickets-extra.md"
if extra.exists():
    for blob in fence_all(extra):
        extra_pool = None
        if isinstance(blob, dict) and "ticketPool" in blob:
            extra_pool = blob["ticketPool"]
        elif isinstance(blob, list) and blob and isinstance(blob[0], dict) and str(blob[0].get("id", "")).startswith("HELIX-51"):
            extra_pool = blob
        if extra_pool:
            existing = {t.get("id"): t for t in (data.get("ticketPool") or [])}
            for t in extra_pool:
                existing[t.get("id")] = t
            data["ticketPool"] = list(existing.values())

# Writer ticket-strings → jimbo.sabotage + ticketStrings
ts_path = COPY / "ticket-strings.md"
if ts_path.exists():
    ts = fence(ts_path)
    data["ticketStrings"] = ts.get("strings") or {}
    sab = data.setdefault("jimbo", {}).setdefault("sabotage", {})
    for k, lines in (ts.get("sabotage") or {}).items():
        sab[k] = lines  # Writer wins
    # Prefer Writer toast on HS-404
    sw_toast = (data.get("ticketStrings") or {}).get("spacewar", {}).get("toast")
    if sw_toast:
        for t in data.get("tickets") or []:
            if t.get("type") == "spacewar":
                t["toast"] = sw_toast
        for t in data.get("ticketPool") or []:
            if t.get("type") == "spacewar":
                t["toast"] = sw_toast

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
print(
    "baked prScript", len(data.get("prScript") or []),
    "spaceWar", len(data.get("spaceWarScript") or []),
    "kyleSlack", len(data.get("kyleSlack") or []),
    "ticketStrings", len(data.get("ticketStrings") or {}),
    "sabotage", sorted((data.get("jimbo") or {}).get("sabotage") or {}),
    "tickets", [t.get("id")+":"+t.get("type") for t in data.get("tickets") or []],
    "ticketPool", len(data.get("ticketPool") or []),
)
