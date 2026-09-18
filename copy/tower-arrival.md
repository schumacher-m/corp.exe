# tower-arrival -- CORP-TOWER-01 (plaza / lobby / elevator)

Spec: `specs/12-tower-arrival.md`. Bake key: `towerArrival`.
ASCII. Sync / Mail / Tracker / Jimbo. Bleak corp morning. No ableist jokes.
Badge always required; 2-of-3 lobby beats; wrong floor = toast only.
Landmark prompts: Guard / HR poster / wet-floor (counts locked).

```json
{
  "badge": {
    "prompt": "E -- Badge the turnstile",
    "failOnce": "Badge rejected. Try again (the reader is moody).",
    "success": "Access granted. Dignity optional."
  },
  "checklist": {
    "title": "Morning checklist",
    "badgeLabel": "Badge",
    "beatsHint": "Complete 2 of 3",
    "elevatorLocked": "Elevator locked. Badge + 2 beats first.",
    "elevatorReady": "Elevator unlocked. Your floor awaits."
  },
  "beats": {
    "coffee": {
      "id": "coffee",
      "label": "Coffee machine",
      "prompt": "Pour sludge",
      "toast": "Coffee acquired. Taste: fluorescent."
    },
    "security": {
      "id": "security",
      "label": "Security stare",
      "prompt": "E -- Hold the stare",
      "toast": "Security approved your face. Barely."
    },
    "hrPoster": {
      "id": "hrPoster",
      "label": "HR poster",
      "prompt": "E -- Read the poster",
      "toast": "You read the poster. Values unchanged."
    },
    "syncPing": {
      "id": "syncPing",
      "label": "Lobby Sync ping",
      "prompt": "Reply in Sync",
      "toast": "Lobby Sync answered. Meeting still happening.",
      "chip": "On my way (lie)"
    }
  },
  "wrongFloor": [
    "Wrong floor. Legal smells different.",
    "This is Facilities. They do not have an exit either.",
    "Floor 12: unused conference rooms and regret.",
    "Not your floor. The buttons know. You do not.",
    "Almost. Spiritually you arrived. Physically: no."
  ],
  "elevator": {
    "prompt": "Call elevator",
    "panelHint": "Pick your floor",
    "ding": "Ding. Cubicle altitude achieved.",
    "arrive": "Your floor. Walk like you belong."
  },
  "plaza": {
    "enterPrompt": "E -- Enter lobby",
    "toast": "Welcome to the building. Leave is not a feature.",
    "doorPrompt": "E -- Enter lobby"
  },
  "landmarks": {
    "guard": {
      "prompt": "E -- Hold the stare",
      "toast": "Security stared back. You blinked first (spiritually)."
    },
    "hrPoster": {
      "prompt": "E -- Read the poster",
      "toast": "HR poster absorbed. Values still optional."
    },
    "wetFloor": {
      "prompt": "E -- Acknowledge hazard",
      "toast": "Wet floor noted. Dignity not covered by policy."
    }
  }
}
```
