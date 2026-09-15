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
