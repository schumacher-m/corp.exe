# eod-review -- Shut Down / day report (CORP-DAY-01)

Grade from obligation hits (not minSprint). Dev picks by `hitsMin` top-down: 4 Survived, 2-3 Needs Alignment, 0-1 Pip Adjacent.
Placeholders: `{{sprint}}` `{{sanity}}` `{{unread}}` `{{tickets}}` `{{obligationsSummary}}` `{{jimboLie}}`.
`{{jimboLie}}` is empty unless Jimbo Auto-Fill / heavy Jimbo use; real grade stays honest.

```json
{
  "grades": [
    {
      "id": "survived",
      "hitsMin": 4,
      "grade": "Survived",
      "managerNote": "You checked every box corporate invented for today. Tracker {{tickets}}, checklist {{obligationsSummary}}. Sprint {{sprint}}, sanity {{sanity}}, unread {{unread}}. Cubicle 4-B remains occupied. The fog nodded once. {{jimboLie}}"
    },
    {
      "id": "needs_alignment",
      "hitsMin": 2,
      "grade": "Needs Alignment",
      "managerNote": "Partial compliance looks a lot like effort from far away. Tracker closes {{tickets}}; obligations {{obligationsSummary}}. Sprint {{sprint}}, sanity {{sanity}}, unread {{unread}}. Please align with aligning. Exit still unsupported. {{jimboLie}}"
    },
    {
      "id": "pip_adjacent",
      "hitsMin": 0,
      "grade": "Pip Adjacent",
      "managerNote": "Today was a soft launch of disappointment with optional tickets. Tracker {{tickets}}, obligations {{obligationsSummary}}. Sprint {{sprint}}, sanity {{sanity}}, unread {{unread}}. InsightBot suggests existing louder tomorrow. Cubicle assignment: pending vibes. {{jimboLie}}"
    }
  ],
  "closers": [
    "Please remember: the building does not have an exit, only a clock.",
    "Your badge still works. That's the feedback.",
    "See you at standup. Bring nothing and say it confidently."
  ]
}
```
