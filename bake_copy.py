#!/usr/bin/env python3
"""Overlay copy/*.md JSON fences into copy-data.js."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def deep_rebrand(o):
    if isinstance(o, str):
        s = (o.replace("HelixStack", "Corp").replace("HelixHub", "CorpHub")
             .replace("HELIX-", "CORP-").replace("HELIX", "CORP").replace("Helix", "Corp"))
        for u, a in [("—", "--"), ("–", "-"), ("‘", "'"), ("’", "'"),
                     ("“", '"'), ("”", '"')]:
            s = s.replace(u, a)
        return s
    if isinstance(o, list):
        return [deep_rebrand(x) for x in o]
    if isinstance(o, dict):
        return {k: deep_rebrand(v) for k, v in o.items()}
    return o

COPY = ROOT / "copy"

def fences(path):
    """Return all ```json fences in a markdown file."""
    text = path.read_text()
    found = re.findall(r"```json\s*(.*?)\s*```", text, re.S)
    if not found:
        raise SystemExit(f"no json fence in {path}")
    return [json.loads(f) for f in found]

def fence(path):
    return fences(path)[0]

src = (ROOT / "copy-data.js").read_text()
m = re.search(r"export\s+default\s+", src)
rest = src[m.end():].strip()
if rest.endswith(";"):
    rest = rest[:-1]
data = json.loads(rest)

# Single-fence overlays
for key, fname in [
    ("startDenied", "start-denied.md"),
    ("jimbo", "jimbo.md"),
    ("emails", "emails.md"),
]:
    p = COPY / fname
    if p.exists():
        data[key] = fence(p)

# Timesheet Lock -- merge fences from timesheet.md
ts_path = COPY / "timesheet.md"
if ts_path.exists():
    parts = fences(ts_path)
    timesheet = {}
    if len(parts) >= 1:
        timesheet.update(parts[0])  # chrome
    if len(parts) >= 2:
        timesheet["buckets"] = parts[1]
    if len(parts) >= 3:
        timesheet["validation"] = parts[2]
    if len(parts) >= 4:
        timesheet["jimboFill"] = parts[3]
    data["timesheet"] = timesheet

# Presence Theater -- merge all fences from presence.md
pres_path = COPY / "presence.md"
if pres_path.exists():
    parts = fences(pres_path)
    presence = {}
    if len(parts) >= 1:
        presence.update(parts[0])  # badgeLabels, statuses, picker*
    if len(parts) >= 2:
        presence["jiggler"] = parts[1]
    if len(parts) >= 3:
        presence["hrAudit"] = parts[2]
    if len(parts) >= 4:
        presence["awayExcuses"] = parts[3]
    data["presence"] = presence


# Call Theater -- merge fences from teams.md
teams_path = COPY / "teams.md"
if teams_path.exists():
    parts = fences(teams_path)
    teams = {}
    if len(parts) >= 1:
        teams.update(parts[0])  # chrome
    if len(parts) >= 2:
        teams["chatPool"] = parts[1]
    if len(parts) >= 3:
        teams["callers"] = parts[2]
    if len(parts) >= 4:
        teams["replyChips"] = parts[3]
    if len(parts) >= 5:
        teams["followUps"] = parts[4]
    data["teams"] = teams
    # Alias for Dev still reading slackPool
    data["slackPool"] = teams.get("chatPool") or data.get("slackPool")

# Incident pager / Sev0 softlock -- copy/incident.md
inc_path = COPY / "incident.md"
if inc_path.exists():
    parts = fences(inc_path)
    incident = parts[0] if parts else {}
    # CORP branding for ids/titles
    def rebrand_obj(o):
        if isinstance(o, str):
            return (o.replace("HelixStack", "Corp").replace("HelixHub", "CorpHub")
                    .replace("HELIX-", "CORP-").replace("HELIX", "CORP").replace("Helix", "Corp")
                    .replace("\u2014", "--").replace("\u2013", "-"))
        if isinstance(o, list):
            return [rebrand_obj(x) for x in o]
        if isinstance(o, dict):
            return {k: rebrand_obj(v) for k, v in o.items()}
        return o
    incident = rebrand_obj(incident)
    data["incident"] = incident
    ts = data.setdefault("ticketStrings", {})
    ts["incident"] = incident

# ticketStrings from ticket-strings.md (multiple fences keyed by type if present)
tss_path = COPY / "ticket-strings.md"
if tss_path.exists():
    parts = fences(tss_path)
    ts = data.setdefault("ticketStrings", {})
    for part in parts:
        if isinstance(part, dict):
            if "type" in part and len(part) > 1:
                t = part.get("type")
                ts[t] = rebrand_obj({k: v for k, v in part.items() if k != "type"}) if "rebrand_obj" in dir() else part
            else:
                # whole map of type -> strings
                for k, v in part.items():
                    if isinstance(v, dict):
                        ts[k] = v

# tickets-extra.md -> ticketPool (+ ensure CORP ids)
te_path = COPY / "tickets-extra.md"
if te_path.exists():
    parts = fences(te_path)
    pool = []
    for part in parts:
        if isinstance(part, list):
            pool.extend(part)
        elif isinstance(part, dict) and "ticketPool" in part:
            pool.extend(part.get("ticketPool") or [])
        elif isinstance(part, dict) and part.get("type") and part.get("id"):
            pool.append(part)
        elif isinstance(part, dict) and "tickets" in part:
            pool.extend(part["tickets"])
    if pool:
        def rb(o):
            if isinstance(o, str):
                return (o.replace("HelixStack", "Corp").replace("HELIX-", "CORP-")
                        .replace("HELIX", "CORP").replace("Helix", "Corp")
                        .replace("HS-", "CORP-"))
            if isinstance(o, list):
                return [rb(x) for x in o]
            if isinstance(o, dict):
                return {k: rb(v) for k, v in o.items()}
            return o
        data["ticketPool"] = rb(pool)
        if not any(t.get("type") == "spacewar" for t in data["ticketPool"]):
            data["ticketPool"].append({
                "id": "CORP-404",
                "title": "Whitespace Diplomacy",
                "pts": 5,
                "type": "spacewar",
                "dod": "Survive Kyle. Choose peace or tabs.",
            })


items = data.setdefault("startMenu", {}).setdefault("items", [])
labels = [i.get("label") for i in items]
if "Jimbo" not in labels:
    items.insert(0, {"label": "Jimbo", "id": "jimbo"})
if "Inbox" not in labels:
    items.insert(1, {"label": "Inbox", "id": "inbox"})
# Jimbo Mouse Jiggler Start item (Presence Theater)
jiggler_label = (data.get("presence") or {}).get("jiggler", {}).get("menuLabel") or "Jimbo Mouse Jiggler"
if jiggler_label not in labels and "jiggler" not in [i.get("id") for i in items]:
    # insert after Jimbo/Inbox if present
    insert_at = 0
    for idx, it in enumerate(items):
        if it.get("id") in ("jimbo", "inbox") or it.get("label") in ("Jimbo", "Inbox"):
            insert_at = idx + 1
    items.insert(insert_at, {"label": jiggler_label, "id": "jiggler"})

ts_label = (data.get("timesheet") or {}).get("desktopLabel") or "timesheet.xls"
if ts_label not in labels and "timesheet" not in [i.get("id") for i in items]:
    insert_at = 0
    for idx, it in enumerate(items):
        if it.get("id") in ("jimbo", "inbox", "jiggler") or it.get("label") in ("Jimbo", "Inbox", jiggler_label):
            insert_at = idx + 1
    items.insert(insert_at, {"label": ts_label, "id": "timesheet"})

data = deep_rebrand(data)

(ROOT / "copy-data.js").write_text(
    "/* Auto-baked from copy/*.md -- re-run bake_copy.py */\nexport default "
    + json.dumps(data, indent=2, ensure_ascii=False)
    + ";\n"
)
pres = data.get("presence") or {}
inc = data.get("incident") or {}
print(
    "baked:",
    "jimbo", "jimbo" in data,
    "emails", len(data.get("emails", {}).get("messages", [])),
    "denied", len(data.get("startDenied", [])),
    "presence", bool(pres),
    "excuses", len((pres.get("awayExcuses") or {}).get("excuses") or []),
    "jiggler", "jiggler" in (pres or {}),
    "timesheet", "timesheet" in data,
    "buckets", len((data.get("timesheet") or {}).get("buckets") or []),
    "incident", bool(inc),
    "ticketPool", len(data.get("ticketPool") or []),
    "ticketStrings", len(data.get("ticketStrings") or {}),
    "teams", "teams" in data,
    "chatPool", len((data.get("teams") or {}).get("chatPool") or []),
    "callers", len((data.get("teams") or {}).get("callers") or []),
)
