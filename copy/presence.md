# presence -- Presence Theater (status picker, mouse jiggler, Away excuses)

Ship first. Keys stable for Dev.

## status picker (taskbar / tray)

```json
{
  "badgeLabels": {
    "active": "Active",
    "away": "Away",
    "idleWarn": "…"
  },
  "statuses": [
    {
      "id": "in-a-meeting",
      "label": "In a meeting",
      "hint": "Calendar says yes. Camera says no.",
      "keepsActive": true,
      "sanityPerMinute": 0.5
    },
    {
      "id": "heads-down",
      "label": "Heads down",
      "hint": "Do not disturb. Except Slack. And email. And Jimbo.",
      "keepsActive": true,
      "sanityPerMinute": 0.3
    },
    {
      "id": "thinking-strategically",
      "label": "Thinking strategically",
      "hint": "Eyes open. Ticket closed. Spirit elsewhere.",
      "keepsActive": true,
      "sanityPerMinute": 0.4
    },
    {
      "id": "bathroom-strategic",
      "label": "Bathroom strategic",
      "hint": "Core hours hydration initiative.",
      "keepsActive": true,
      "sanityPerMinute": 0.6
    },
    {
      "id": "active",
      "label": "Active",
      "hint": "Mouse moving. Career stationary.",
      "keepsActive": true,
      "sanityPerMinute": 0
    },
    {
      "id": "away",
      "label": "Away",
      "hint": "We noticed. HR noticed. Jimbo noticed.",
      "keepsActive": false,
      "sanityPerMinute": 0
    }
  ],
  "pickerTitle": "Set status",
  "pickerToast": "Status updated. InsightBot has opinions."
}
```

## Jimbo Mouse Jiggler (Start menu · once/day)

```json
{
  "menuLabel": "Jimbo Mouse Jiggler",
  "menuHint": "Stay Active. Lose Sanity. Win nothing.",
  "windowTitle": "Jimbo Mouse Jiggler",
  "startToasts": [
    "Jiggler armed. Your cursor will live a richer life than you.",
    "Jimbo is moving the mouse. You are Moving the Needle™.",
    "Presence secured. Dignity optional."
  ],
  "tickToasts": [
    "Wiggle.",
    "Still Active. Still employed. Still.",
    "2px to the left. Career unchanged.",
    "InsightBot: green. Soul: buffering."
  ],
  "alreadyUsedToast": "Jiggler quota: 1/day. Tomorrow's presence is tomorrow's problem.",
  "stopToast": "Jiggler off. Welcome back to manual despair.",
  "sanityDripPerMinute": 1.5,
  "keepsActive": true
}
```

## HR audit (rare · while jiggler running)

```json
{
  "chanceHint": "rare while jiggler is on",
  "mails": [
    {
      "id": "jiggle-audit-01",
      "from": "HR <hr@corp.internal>",
      "subject": "Unusual mouse activity detected",
      "body": [
        "Your cursor pattern matches 'assisted presence.'",
        "Please confirm you are a human mid-level.",
        "Jimbo is not a reasonable accommodation for focus."
      ],
      "sanityHit": 12,
      "buttons": ["I Am Human", "Ask Jimbo", "Accept Fate"]
    },
    {
      "id": "jiggle-audit-02",
      "from": "Compliance <policy@corp.internal>",
      "subject": "CORP-PRESENCE-07: Cursor authenticity",
      "body": [
        "Automated motion without keyboard input is a vibes violation.",
        "Attach a screenshot of your engagement.",
        "Or don't. We already decided."
      ],
      "sanityHit": 10,
      "buttons": ["Acknowledge", "Schedule Training"]
    },
    {
      "id": "jiggle-audit-03",
      "from": "Jimbo Digest <jimbo@corp.internal>",
      "subject": "I may have over-jiggled",
      "body": [
        "HR opened a ticket about us!",
        "You're welcome!",
        "Also you're on a watchlist for excellence."
      ],
      "sanityHit": 8,
      "buttons": ["Thanks Jimbo", "Never Thanks Jimbo"]
    }
  ],
  "forceOpen": true
}
```

## Away-mail excuse buttons (on presence / Away force-mail)

Each excuse dismisses the modal; apply `sanityHit`. Bleak + funny.

```json
{
  "prompt": "Why were you Away?",
  "excuses": [
    {
      "id": "bathroom",
      "label": "Bathroom (strategic)",
      "toast": "Hydration noted. Productivity forgiven (not really).",
      "sanityHit": 3
    },
    {
      "id": "sync",
      "label": "I was in a sync",
      "toast": "Which sync? All of them. None of them.",
      "sanityHit": 4
    },
    {
      "id": "thinking",
      "label": "Thinking strategically",
      "toast": "Strategy accepted. Output still zero.",
      "sanityHit": 5
    },
    {
      "id": "headset",
      "label": "Headset was on mute (soul too)",
      "toast": "Mute is not a status. But nice try.",
      "sanityHit": 4
    },
    {
      "id": "jimbo",
      "label": "Jimbo had my mouse",
      "toast": "Jimbo filed a counter-report. You're both wrong.",
      "sanityHit": 6
    },
    {
      "id": "fog",
      "label": "The fog took me",
      "toast": "Facilities says fog is out of scope. Sanity isn't.",
      "sanityHit": 7
    },
    {
      "id": "honest",
      "label": "I briefly experienced peace",
      "toast": "Peace is a P1 incident. Don't repeat.",
      "sanityHit": 8
    },
    {
      "id": "default",
      "label": "Click to confirm engagement",
      "toast": "Engagement confirmed. Belief optional.",
      "sanityHit": 5
    }
  ]
}
```
