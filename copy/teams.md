# call-theater copy -- Sync chat + muffled calls
# Player-facing: Sync (docs/GENERIC_NAMES.md). Bake key: teams.

Spec: `specs/03-call-theater.md`. Bake via `bake_copy.py` -> `copy-data.js` key `teams` (player label: Sync).
ASCII-only. CORP branding. Dark humor. No ableist jokes.

## chrome

```json
{
  "desktopLabel": "Sync",
  "windowTitle": "Sync -- Corporate Chat",
  "subtitle": "Chat / Calls · Cubicle 4-B",
  "railChat": "Chat",
  "railCalls": "Calls",
  "emptyThread": "No unread. Lie.",
  "missedBadge": "Missed",
  "acceptLabel": "Accept",
  "declineLabel": "Decline",
  "hangUpLabel": "Hang up",
  "muteOn": "Mute",
  "muteOff": "Unmute",
  "cameraOff": "Camera off",
  "cameraOn": "Camera on",
  "shareLabel": "Share",
  "attentivenessLabel": "Attentiveness",
  "stillThereToast": "Are you still there?",
  "noCursorToast": "I can't see your cursor moving",
  "jimboJoinedToast": "Jimbo joined as a silent stakeholder!",
  "freezeToast": "Tickets frozen -- you are in a meeting (spiritually)",
  "unfreezeToast": "Call ended. Back to the board."
}
```

## chatPool (ex-chat spam, Sync voice)

```json
[
  {"name": "Dana", "color": "#4a7080", "text": "Hey. Do you have time to drink some poison?"},
  {"name": "Jess", "color": "#5a6a8a", "text": "Standup in 2. I have nothing. You?"},
  {"name": "Priya", "color": "#7a5a70", "text": "Quick sync? I need a witness for this ticket."},
  {"name": "Todd", "color": "#6a7060", "text": "Sprint board is a cry for help with swimlanes."},
  {"name": "Dana", "color": "#4a7080", "text": "Coffee machine is broken. So is the week."},
  {"name": "Kyle", "color": "#a05030", "text": "Nit on your draft PR before you even open it."},
  {"name": "Ops", "color": "#6b8f3a", "text": "Fog density within acceptable corporate range."},
  {"name": "HR", "color": "#8b3a2a", "text": "Reminder: vibes are a performance metric now."},
  {"name": "Bot", "color": "#504c40", "text": "Calendar invite: Suffering (recurring)."},
  {"name": "InsightBot", "color": "#504c40", "text": "You have 47 unread. Tip: ignore 46."},
  {"name": "Maya", "color": "#4a6070", "text": "Who moved the deploy to Friday at 4:55?"},
  {"name": "Jess", "color": "#5a6a8a", "text": "I'm in the war room. There's no war. Just rooms."},
  {"name": "Priya", "color": "#7a5a70", "text": "Blocked on Kyle. Again. Sending thoughts and PRs."},
  {"name": "Todd", "color": "#6a7060", "text": "Definition of Done includes emotionally finished."},
  {"name": "Brad", "color": "#6a5080", "text": "Looping you in for visibility (sorry)."},
  {"name": "Maya", "color": "#4a6070", "text": "Retro notes: we learned nothing and will ship anyway."},
  {"name": "Jimbo", "color": "#705898", "text": "I summarized this thread into more thread."},
  {"name": "HR", "color": "#8b3a2a", "text": "Please rate your burnout 1-5. 5 means engaged."},
  {"name": "Ops", "color": "#6b8f3a", "text": "The plant in 4-B filed a ticket. Priority: Medium."},
  {"name": "Kyle", "color": "#a05030", "text": "Main is green. Don't get comfortable."}
]
```

## callers

```json
[
  {
    "id": "brad-synergy",
    "name": "Brad from Synergy",
    "color": "#6a5080",
    "openers": [
      "Do you have a minute?",
      "Having a very important question...",
      "Got a sec? (It is not a sec.)"
    ]
  },
  {
    "id": "kyle",
    "name": "Kyle (Platform)",
    "color": "#a05030",
    "openers": [
      "Do you have a minute?",
      "Quick call about your blank line",
      "Having a very important question about CORP-###"
    ]
  },
  {
    "id": "director-alignment",
    "name": "Director of Alignment",
    "color": "#8b3a2a",
    "openers": [
      "Do you have a minute?",
      "Having a very important question...",
      "Need you on a bridge for five minutes (forty)"
    ]
  },
  {
    "id": "skip-manager",
    "name": "Skip (your manager)",
    "color": "#4a7080",
    "openers": [
      "Do you have a minute?",
      "Quick pulse check",
      "Having a very important question about visibility"
    ]
  },
  {
    "id": "maya",
    "name": "Maya",
    "color": "#4a6070",
    "openers": [
      "Do you have a minute?",
      "Can you jump on real quick?",
      "Having a very important question about the deploy"
    ]
  },
  {
    "id": "unknown-ext",
    "name": "Unknown -- External",
    "color": "#504c40",
    "openers": [
      "Do you have a minute?",
      "Having a very important question...",
      "This is about synergy (it is not)"
    ]
  }
]
```

## replyChips

```json
[
  {"id": "uh_huh", "label": "Uh-huh", "sprint": 1, "sanity": -1},
  {"id": "send_chat", "label": "Can you send that in chat?", "sprint": 2, "sanity": -2},
  {"id": "on_mute", "label": "Sorry -- on mute", "sprint": 1, "sanity": -2},
  {"id": "circle_back", "label": "I'll circle back", "sprint": 1, "sanity": -3}
]
```

## followUps

```json
{
  "decline": [
    "tried calling you -- ping when free?",
    "Missed your voice. Catching you later (threat).",
    "No worries if busy! (It is worries.)"
  ],
  "timeout": [
    "Ring timed out. Adding you to the calendar anyway.",
    "You ghosted a purple rectangle. Unread++.",
    "Missed call from corporate. Please suffer later."
  ],
  "freeze": [
    "you froze",
    "Still there? Your attentiveness left the call.",
    "We lost you. Also we never had you."
  ],
  "stillThere": [
    "Are you still there?",
    "Hello? The bar says no.",
    "Presence check: please move something fake."
  ],
  "noCursor": [
    "I can't see your cursor moving",
    "Share is on but the mouse is philosophical.",
    "If you're sharing, jiggle something. Anything."
  ],
  "thanks": [
    "Cool thanks bye",
    "Perfect -- I'll send a follow-up that is a meeting.",
    "Great sync. Nothing decided."
  ],
  "jimboDm": [
    "Jimbo: I took notes. They say 'notes'.",
    "Jimbo: Call summary: people spoke. Action: none.",
    "Jimbo: You sounded engaged (mute was on)."
  ]
}
```

## callChatPool (side lines while connected)

```json
[
  {
    "name": "Dana",
    "color": "#4a7080",
    "text": "You're on mute."
  },
  {
    "name": "Jess",
    "color": "#5a6a8a",
    "text": "Can you share? Just the tab. Not your soul."
  },
  {
    "name": "Brad",
    "color": "#6a5080",
    "text": "I'll take that offline. (Nowhere.)"
  },
  {
    "name": "Kyle",
    "color": "#a05030",
    "text": "Agenda item 1: your blank line."
  },
  {
    "name": "Jimbo",
    "color": "#705898",
    "text": "Summary so far: people exist."
  },
  {
    "name": "Priya",
    "color": "#7a5a70",
    "text": "Sorry, go ahead -- no, you go -- okay freeze."
  },
  {
    "name": "Todd",
    "color": "#6a7060",
    "text": "Parking lot that. Lot is full."
  },
  {
    "name": "Maya",
    "color": "#4a6070",
    "text": "Is this recorded? Asking for my future self's therapist."
  },
  {
    "name": "Ops",
    "color": "#6b8f3a",
    "text": "Latency is fine. Meaning is not."
  },
  {
    "name": "HR",
    "color": "#8b3a2a",
    "text": "Reminder: cameras optional, judgment mandatory."
  },
  {
    "name": "Dana",
    "color": "#4a7080",
    "text": "We lost Brad. Emotionally he was already gone."
  },
  {
    "name": "Kyle",
    "color": "#a05030",
    "text": "Nit: 'quick sync' is neither."
  },
  {
    "name": "Jess",
    "color": "#5a6a8a",
    "text": "Action item: schedule a meeting about this meeting."
  },
  {
    "name": "Jimbo",
    "color": "#705898",
    "text": "I captured decisions: [none]. Circling back!"
  },
  {
    "name": "Skip",
    "color": "#4a7080",
    "text": "Great energy. Please keep suffering visibly."
  },
  {
    "name": "InsightBot",
    "color": "#504c40",
    "text": "Sentiment: medium doomed. Tip: nod."
  },
  {
    "name": "Brad",
    "color": "#6a5080",
    "text": "Looping Legal. They will not join. Perfect."
  },
  {
    "name": "Maya",
    "color": "#4a6070",
    "text": "Can everyone mute unless speaking? Speaking is optional."
  }
]
```

## callThreads (optional beats by caller id)

```json
[
  {
    "callerId": "brad-synergy",
    "beats": [
      {
        "name": "Brad",
        "color": "#6a5080",
        "text": "Thanks for jumping on. This is about synergy."
      },
      {
        "name": "Brad",
        "color": "#6a5080",
        "text": "Synergy means I need a screenshot of your face nodding."
      },
      {
        "name": "Dana",
        "color": "#4a7080",
        "text": "You're on mute, Brad."
      },
      {
        "name": "Brad",
        "color": "#6a5080",
        "text": "I was on mute on purpose. Leadership."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "Note: synergy undefined. Filed under vibes."
      },
      {
        "name": "Brad",
        "color": "#6a5080",
        "text": "Anyway I'll send a deck that is a meeting."
      }
    ]
  },
  {
    "callerId": "kyle",
    "beats": [
      {
        "name": "Kyle",
        "color": "#a05030",
        "text": "Quick call about your blank line."
      },
      {
        "name": "Kyle",
        "color": "#a05030",
        "text": "Also the commit message. And your tone."
      },
      {
        "name": "Jess",
        "color": "#5a6a8a",
        "text": "Can we not live-review in Sync chat."
      },
      {
        "name": "Kyle",
        "color": "#a05030",
        "text": "Nit on the agenda: it has hopes."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "Summary: Kyle found a space. Space is wrong."
      },
      {
        "name": "Kyle",
        "color": "#a05030",
        "text": "Ship when green. Green is a feeling."
      }
    ]
  },
  {
    "callerId": "director-alignment",
    "beats": [
      {
        "name": "Director",
        "color": "#8b3a2a",
        "text": "We're here to align on alignment."
      },
      {
        "name": "Director",
        "color": "#8b3a2a",
        "text": "Outcomes: clarity, ownership, another invite."
      },
      {
        "name": "Todd",
        "color": "#6a7060",
        "text": "I'll take that offline into a doc nobody opens."
      },
      {
        "name": "Director",
        "color": "#8b3a2a",
        "text": "Cameras on if you can. Souls optional."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "Action items: be aligned. Due: forever."
      },
      {
        "name": "Director",
        "color": "#8b3a2a",
        "text": "Great bridge. Building nothing."
      }
    ]
  },
  {
    "callerId": "skip-manager",
    "beats": [
      {
        "name": "Skip",
        "color": "#4a7080",
        "text": "Just a pulse check. How are we feeling?"
      },
      {
        "name": "Skip",
        "color": "#4a7080",
        "text": "Visibility looks low. Please suffer louder."
      },
      {
        "name": "Priya",
        "color": "#7a5a70",
        "text": "Sorry -- soft laptop. Hard week."
      },
      {
        "name": "Skip",
        "color": "#4a7080",
        "text": "Love the honesty. Putting it in the review."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "Pulse: present. Check: bounced."
      },
      {
        "name": "Skip",
        "color": "#4a7080",
        "text": "Cool thanks bye. Calendar hold remains."
      }
    ]
  },
  {
    "callerId": "maya",
    "beats": [
      {
        "name": "Maya",
        "color": "#4a6070",
        "text": "Deploy window is today. Spiritually."
      },
      {
        "name": "Maya",
        "color": "#4a6070",
        "text": "Can you share the pipeline? The red one."
      },
      {
        "name": "Ops",
        "color": "#6b8f3a",
        "text": "Fog density normal. Confidence is not."
      },
      {
        "name": "Maya",
        "color": "#4a6070",
        "text": "If it breaks we roll back to hope."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "Rollback plan: blame the plant in 4-B."
      },
      {
        "name": "Maya",
        "color": "#4a6070",
        "text": "Okay I'm hanging up before Friday finds us."
      }
    ]
  },
  {
    "callerId": "unknown-ext",
    "beats": [
      {
        "name": "Unknown",
        "color": "#504c40",
        "text": "Hi -- is this the right Sync?"
      },
      {
        "name": "Unknown",
        "color": "#504c40",
        "text": "We're partners. On a slide. Somewhere."
      },
      {
        "name": "Dana",
        "color": "#4a7080",
        "text": "You're on mute. Also mysterious."
      },
      {
        "name": "Unknown",
        "color": "#504c40",
        "text": "I'll send a follow-up from a domain that expires."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "External guest: authenticity 12%."
      },
      {
        "name": "Unknown",
        "color": "#504c40",
        "text": "Great connecting. Meaning deferred."
      }
    ]
  }
]
```
