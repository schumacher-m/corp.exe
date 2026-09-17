# day-sim -- CORP-DAY-01 spine copy (beats + obligations + Jimbo lie)

Spec: `specs/10-day-sim-spine.md`. Bake key: `daySim` (+ eod grades via `eod-review.md`).
ASCII. Sync / Mail / Tracker lexicon. No ableist jokes.

Placeholders for notes/toasts: `{{sprint}}` `{{sanity}}` `{{unread}}` `{{tickets}}` `{{obligationsSummary}}` `{{jimboLie}}` `{{label}}` `{{have}}` `{{need}}`.

## beatEnterToasts + obligation chrome + jimboLie

```json
{
  "beatEnterToasts": {
    "standup": "Daily Standup. Bring nothing. Say it confidently.",
    "morning": "Morning deep work. Tracker awaits your suffering.",
    "lunch": "Lunch window. Sync may find you. Food is a rumor.",
    "afternoon": "Afternoon Sync tax. Your calendar filed a claim.",
    "winddown": "Wind-down. Timesheet is watching. Softly.",
    "quittin": "Core hours ending..."
  },
  "obligationLabels": {
    "tickets": "Tracker closes",
    "focusedMail": "Focused Mail",
    "syncChip": "Sync reply chip",
    "timesheet": "Timesheet Accept"
  },
  "obligationMetToast": "Obligation met: {{label}} ({{have}}/{{need}})",
  "obligationsTitle": "Today's obligations",
  "jimboLie": [
    "Jimbo reconciled your day: Exceeds Expectations (spiritually).",
    "Jimbo's notes say you crushed it. Jimbo's notes are fiction.",
    "Jimbo marked you green. The checklist did not.",
    "Jimbo peer-reviewed your vibe. Grade: vibes only.",
    "Jimbo filed: 'Employee thrived.' Evidence: a shrug."
  ]
}
```
