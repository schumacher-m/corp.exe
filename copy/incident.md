# incident — P0 production meme (Writer)

Type key: `incident` · id: `HELIX-5201`  
Win: **Disable Monitor** + **Assign (not self)**. Trap: “Actually fix prod.”  
Bake into `ticketStrings.incident` / `sabotage.incident`. See also `incidents.md` (GD).

```json
{
  "type": "incident",
  "ticket": {
    "id": "HELIX-5201",
    "title": "P0: Something is On Fire",
    "pts": 4,
    "type": "incident",
    "dod": "Disable the monitor and assign to somebody else. Do not fix prod.",
    "meta": "Sev0 · On-call · Observability optional",
    "toast": "Incident owned by someone who isn't you."
  },
  "windowTitle": "HelixStack Incident — Sev0 (Probably)",
  "liveBadge": "LIVE",
  "slackVolunteer": "#incidents: you have been volunteered.",
  "headlines": [
    "Checkout is returning HTTP 500 (spiritually).",
    "Latency p99 discovered feelings.",
    "The fog merged to prod.",
    "Customers can still click. This is bad.",
    "PagerDuty loves you specifically.",
    "Error budget filed for divorce.",
    "Status page is a mood board.",
    "Redis is buffering its tears.",
    "The deploy pipeline deployed a deploy.",
    "Someone restarted hope. It did not come back.",
    "Metrics are green. Reality is not.",
    "On-call rotation summoned you by name."
  ],
  "buttons": {
    "disableMonitor": "Disable Monitor",
    "confirmDisable": "Are you sure? (Recommended.)",
    "confirmDisableYes": "Disable",
    "confirmDisableNo": "Keep suffering",
    "assign": "Assign to somebody else",
    "reassignWalkAway": "Reassign & Walk Away",
    "trapFix": "Actually fix prod",
    "ack": "Ack",
    "close": "X"
  },
  "status": {
    "monitorOff": "Observability: Off",
    "monitorOn": "Observability: On (unfortunately)"
  },
  "assignees": [
    {"id": "kyle", "label": "Kyle (Platform)", "blurb": "Will kebab-case the outage."},
    {"id": "jimbo", "label": "Jimbo (AI)", "blurb": "Will restore the monitor for growth."},
    {"id": "facilities", "label": "Facilities (myth)", "blurb": "A legend. Like work-life balance."},
    {"id": "oncall", "label": "On-call rotation (ghost)", "blurb": "Currently a spreadsheet."},
    {"id": "fog", "label": "The fog", "blurb": "Always on-call. Never ACKs."},
    {"id": "future", "label": "Future me", "blurb": "Out of office until tomorrow-you."},
    {"id": "intern", "label": "Intern", "blurb": "Has the runbook. Lacks tenure."},
    {"id": "roulette", "label": "On-Call Roulette", "blurb": "May land on you. Spin again."}
  ],
  "assigneeSlack": [
    {"from": "Kyle", "text": "lol. also the runbook spacing is wrong."},
    {"from": "Jimbo", "text": "lol I turned the graphs back on!"},
    {"from": "Facilities", "text": "lol"},
    {"from": "On-call", "text": "lol (automated)"},
    {"from": "Fog", "text": "lol"},
    {"from": "Future me", "text": "lol why would past-me do this"},
    {"from": "Intern", "text": "lol do we have a severity for this"},
    {"from": "Roulette", "text": "lol it was you again"}
  ],
  "toasts": {
    "success": "Incident owned by someone who isn't you.",
    "failClose": "Incident remains. So do you.",
    "trapFix": "Fixing is not a supported workflow.",
    "jimboReenable": "Jimbo restored observability for growth.",
    "jimboReassignYou": "Reassigned to Cubicle 4-B (you). Synergy!",
    "jimboMitigated": "Jimbo: mitigated by vibes.",
    "page": "You have been paged. Congrats.",
    "monitorOff": "Monitor disabled. Out of sight, out of SLO."
  },
  "sabotage": [
    "Jimbo restored observability for growth.",
    "Reassigned to Cubicle 4-B (you). Synergy!",
    "Jimbo: mitigated by vibes."
  ],
  "slackPages": [
    {"name": "PagerDuty", "color": "#a05030", "text": "P0: checkout is vibes-only. Ack in 4m."},
    {"name": "Ops", "color": "#6b8f3a", "text": "Error budget is a lifestyle. Who owns this."},
    {"name": "AllHands", "color": "#8b3a2a", "text": "Customers are feeling feelings."},
    {"name": "InsightBot", "color": "#504c40", "text": "You appear Active. Perfect time for a P0."}
  ],
  "sanity": {"success": -3, "failClose": -5, "jimboReenable": -4, "jimboReassignYou": -5, "kyleExtra": -2},
  "sprintPts": 4
}
```
