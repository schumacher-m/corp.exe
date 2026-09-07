# eod-review — paste into `clockOut` / ending screen

Thresholds checked top-down. Placeholders: `{{sprint}}` `{{sanity}}` `{{unread}}`.

```json
{
  "grades": [
    {
      "minSprint": 12,
      "grade": "Exceeds Expectations (somehow)",
      "managerNote": "Cubicle 4-B shipped like it owed the building money. Sprint {{sprint}}, sanity {{sanity}}, unread dread {{unread}}. Stakeholders are thrilled; your calendar is a crime scene. The fog submitted a glowing peer review. We are concerned. Cubicle assignment renewed."
    },
    {
      "minSprint": 5,
      "grade": "Meets Expectations (barely)",
      "managerNote": "You closed enough tickets to remain employed and not enough to be noticed. Sprint {{sprint}}, sanity {{sanity}}, unread {{unread}}. Standup: present. Impact: ambient. Kyle's review count suggests growth in agreeing faster. Exit still not a supported feature."
    },
    {
      "minSprint": 0,
      "grade": "Needs Improvement (always)",
      "managerNote": "Today was a soft launch of disappointment. Sprint {{sprint}}, sanity {{sanity}}, unread {{unread}}. InsightBot flagged your focus time as decorative. Hydrate, pretend tomorrow is different, stop mentioning the fog in writing. Cubicle 4-B remains yours. Congrats?"
    }
  ],
  "closers": [
    "Please remember: the building does not have an exit, only a clock.",
    "Your badge still works. That's the feedback.",
    "See you at standup. Bring nothing and say it confidently."
  ]
}
```
