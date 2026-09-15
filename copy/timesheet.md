# timesheet -- Timesheet Lock (timesheet.xls · exactly 8.0)

Ship after Presence Theater. Buckets must sum to 8.0 to clock out / submit.
Spec CORP-TIME-01: stable bucket ids (fog/sync/jimbo/stakeholder/unblock/docs/hope/core).

## window + sheet chrome

```json
{
  "desktopLabel": "timesheet.xls",
  "windowTitle": "timesheet.xls -- Time Entry",
  "subtitle": "Time Entry · Day 1 · Cubicle 4-B",
  "targetHours": 8.0,
  "tolerance": 0.0,
  "submitLabel": "Accept",
  "jimboFillLabel": "Jimbo Auto-Fill",
  "footerHint": "Total must equal 8.0. Fractions welcome. Honesty is not.",
  "incompleteToast": "Timesheet incomplete",
  "hoursReconciled": "Hours reconciled.",
  "jimboReconciled": "Jimbo reconciled your day!",
  "failExact": "Hours must equal core commitment (8.0).",
  "blockClockOut": "Cannot Shut Down until timesheet.xls equals 8.0.",
  "waitingAway": "Timesheet waiting -- clear Away first"
}
```

## buckets (row labels)

```json
[
  {"id": "fog", "label": "Fog mitigation", "hint": "Out of scope / still billable", "default": 0},
  {"id": "sync", "label": "Syncing", "hint": "Aligning on alignment", "default": 0},
  {"id": "jimbo", "label": "Jimbo alignment", "hint": "Mandatory Corporate AI helpfulness", "default": 0},
  {"id": "stakeholder", "label": "Stakeholder vibes", "hint": "Eyes open, ticket closed", "default": 0},
  {"id": "unblock", "label": "Unblocking blockers", "hint": "Status about status", "default": 0},
  {"id": "docs", "label": "Documentation (aspirational)", "hint": "README someday", "default": 0},
  {"id": "hope", "label": "Hope", "hint": "Non-billable spirituality", "default": 0},
  {"id": "core", "label": "Core hours (actual work)", "hint": "Semicolons and vibes", "default": 0}
]
```

## validation toasts

```json
{
  "under": [
    "Total {{total}} -- need exactly 8.0. The day was longer than your honesty.",
    "Only {{total}} hours? Finance knows you were here.",
    "Under 8.0. Please invent labor."
  ],
  "over": [
    "Total {{total}} -- over 8.0. Ambition is not a billing code.",
    "More than 8.0. Overtime is a myth; fix the math.",
    "{{total}} hours logged. Reality capped at 8.0."
  ],
  "exact": [
    "8.0 exactly. A masterpiece of fiction.",
    "Balanced. Legally enough. Spiritually bankrupt.",
    "Submitted. Nobody will read this. That's the point."
  ],
  "empty": [
    "All zeros. Even Jimbo is judgmental.",
    "Enter hours or admit the fog worked today."
  ],
  "locked": [
    "Timesheet locked. See you never / tomorrow.",
    "Already submitted. Edits require a CORP ticket and a miracle."
  ],
  "blockClockOut": "Cannot Shut Down until timesheet.xls equals 8.0.",
  "incomplete": "Timesheet incomplete",
  "hoursReconciled": "Hours reconciled.",
  "failExact": "Hours must equal core commitment (8.0)."
}
```

## Jimbo Auto-Fill (sabotage)

First Auto-Fill intentionally totals 7.5. Player must nudge to 8.0.
Second Auto-Fill may "fix" to 8.0 with absurd Jimbo/Hope split.

```json
{
  "buttonLabel": "Jimbo Auto-Fill",
  "confirmBody": "Jimbo will allocate your day optimally (incorrectly). Continue?",
  "confirmButtons": ["Auto-Fill", "I Prefer Manual Lies"],
  "firstFill": {
    "id": "sabotage-75",
    "hours": {"fog": 0, "sync": 0.5, "jimbo": 6.0, "stakeholder": 0, "unblock": 0, "docs": 0, "hope": 0, "core": 1.0},
    "toast": "Jimbo reconciled your day!"
  },
  "secondFill": {
    "id": "jimbo-hope-8",
    "hours": {"fog": 0, "sync": 0, "jimbo": 6.0, "stakeholder": 0, "unblock": 0, "docs": 0, "hope": 2.0, "core": 0},
    "toast": "Jimbo fixed the math. Spiritually worse."
  },
  "lines": [
    "Auto-filled from your vibes and my lies.",
    "I allocated Hope to when you stared at the CRT.",
    "Rounded to the nearest corporate fantasy.",
    "If Finance audits this, blame culture."
  ]
}
```
