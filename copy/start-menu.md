# start-menu -- classic Win95 Start (Programs flyout)

Chrome: `docs/WIN95.md` § Start menu. Real apps under **Programs ►** only.
Root keeps Programs / Documents / Settings / Find / Help / Run / Shut Down.
Joke strings stay as denied kids under Programs (or other folders).

```json
{
  "startLabel": "Start",
  "items": [
    {
      "label": "Programs",
      "submenu": [
        {"label": "Tracker", "id": "tickets"},
        {"label": "Sync", "id": "teams"},
        {"label": "Mail", "id": "inbox"},
        {"label": "Jimbo", "id": "jimbo"},
        {"label": "Jimbo Mouse Jiggler", "id": "jiggler"},
        {"label": "timesheet.xls", "id": "timesheet"},
        {"label": "Solitaire (blocked by policy)"},
        {"label": "Notepad (for feelings)"},
        {"label": "InsightBot"},
        {"label": "corp.exe"}
      ]
    },
    {"label": "Documents", "submenu": ["sprint-notes-final-FINAL.doc", "todo-ignore.txt", "resignation-draft-3.doc"]},
    {"label": "Settings", "submenu": ["Control Panel", "Fog Density", "Sanity Options"]},
    {"label": "Find", "submenu": ["Find Files...", "Find Meaning...", "Find the Exit (0 results)"]},
    {"label": "Help", "submenu": ["IT Help", "Ask Kyle", "Don't"]},
    {"label": "Run...", "hint": "Type a command you will regret"},
    {"label": "Shut Down...", "id": "clockout", "hint": "Ends the day. Not the job."}
  ],
  "trayTooltips": [
    "Volume: corporate silence",
    "Network: connected to despair",
    "InsightBot: always watching",
    "Clock: later than you think"
  ]
}
```
