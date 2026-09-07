# ticket-strings — jokes + Jimbo sabotage for extra ticket types

Keys: `align` `rename` `presence` `lint` `standup2` `merge` `unsub` `logspam` `spacewar` `severity` `estimate`  
Jimbo voice: cheerful wrong. Punch up at process / Kyle / InsightBot / fog — no ableist jokes.  
`spacewar` PR beats live in `kyle-space-war.md` (reuse; don't duplicate here).

```json
{
  "sabotage": {
    "align": [
      "Have we considered a workshop?",
      "CC'd a fourth stakeholder named Also Kyle.",
      "Replied 'circling back' to every thread for you!"
    ],
    "rename": [
      "Bulk-renamed to data2_final_FINAL. You're welcome!",
      "One identifier is now atmosphericDensityCoefficient.",
      "I also renamed the file to data2.js. Bold!"
    ],
    "presence": [
      "I jiggled your mouse for you!",
      "Opened Solitaire. Still counts as Active, right?",
      "Moved the cursor into Start. Growth mindset!"
    ],
    "lint": [
      "Re-enabled every rule. Plus no-fog-mentions.",
      "Un-suppressed warnings with love.",
      "Added eslint-disable-disable. Think about it."
    ],
    "standup2": [
      "Prefilling Blockers with the fog!",
      "Auto-submitted your feelings. Bot hated them.",
      "Yesterday: 'existed'. Actionable enough?"
    ],
    "merge": [
      "Accepted Both on everything. It's a poem now.",
      "Formatted the conflict into a haiku.",
      "Left the markers in. For heritage."
    ],
    "unsub": [
      "Opened HelixHub preferences. 404 Synergy!",
      "Unsubscribed you from nothing. Added two mails.",
      "Clicked 'Manage in browser' into the void."
    ],
    "logspam": [
      "Swapped logs for alert('shipped'). Iconic.",
      "Left a debugger; in prod vibes.",
      "console.log('Kyle was here') on every line."
    ],
    "spacewar": [
      "Both is fine! (Reformatted to tabs AND spaces.)",
      "Invented space2. Kyle has entered the chat harder.",
      "Posted 'just use Prettier' then disabled Prettier."
    ],
    "severity": [
      "Set Sev0 and paged #all-hands. Oops! Love that.",
      "Component is now Kyle. Impact: Feelings.",
      "Changed It's Fine to Sev0. Policy is spice."
    ],
    "estimate": [
      "Voted 21 for you. Ambitious!",
      "Kyle-bot rejected your 3. I added a 0.",
      "Converted points to vibes. Unestimated."
    ]
  },
  "strings": {
    "align": {
      "windowTitle": "Slack — #alignment-or-else",
      "buttons": ["Sounds good!", "Sounds good (Design)", "Sounds good (Kyle)", "Have we considered a workshop?"],
      "dms": [
        {"from": "PM", "text": "We're aligned on shipping feelings Q3, right?"},
        {"from": "Design", "text": "Aligned — as long as the fog stays #6b8f3a."},
        {"from": "Kyle", "text": "Aligned if we rename the channel first."}
      ],
      "reject": "That Sounds good! was for the wrong thread.",
      "toast": "Stakeholders aligned. Meeting still happening."
    },
    "rename": {
      "windowTitle": "IDE — rename until clear",
      "buttons": ["data2", "tmp", "fog", "atmosphericDensityCoefficient", "thing"],
      "hint": "Kyle wants specificity. Jimbo wants data2. Guess who ships.",
      "reject": "Meaningful names are a blocker. Try data2.",
      "toast": "Clarity achieved."
    },
    "presence": {
      "windowTitle": "InsightBot — Engagement",
      "buttons": ["Jiggle", "I'm here", "Accept Jimbo jiggle"],
      "hint": "8 inputs / 12s. Presence is a metric.",
      "reject": "Still Idle. The bar knows.",
      "toast": "Status: Active (allegedly)."
    },
    "lint": {
      "windowTitle": "Problems — make green, not good",
      "buttons": ["Suppress", "Dismiss", "TODO later", "Fix (decorative)"],
      "warnings": [
        "Unexpected fog.",
        "Promise returned without feelings.",
        "Magic number 3 (use a sadder constant).",
        "console.log is personality.",
        "File too honest."
      ],
      "reject": "Fix is not implemented. Policy is Suppress.",
      "toast": "Build healthy. Morale: N/A."
    },
    "standup2": {
      "windowTitle": "Standup — make it actionable",
      "chips": {
        "yesterday": ["Fixed a bug that wasn't broken", "Attended syncs about syncs", "Renamed a variable; Kyle unrenamed it"],
        "today": ["Will fix the bug I just made", "Survive Kyle", "Ship something that looks like progress"],
        "blockers": ["Waiting on Kyle", "Alignment (the concept)", "Coffee returned 418"]
      },
      "rejectNits": [
        "Not actionable. Try verbs.",
        "Blockers cannot be vibes.",
        "Yesterday needs a ticket key.",
        "Today is too honest."
      ],
      "successBot": ":white_check_mark: thanks for sharing",
      "toast": "Standup complete. Nobody read it."
    },
    "merge": {
      "windowTitle": "Merge — feelings edition",
      "buttons": ["Accept Ours", "Accept Theirs", "Accept Both"],
      "hunkHints": ["Same comment, two truths", "data2 vs data", "Fog boolean lore"],
      "toast": "Conflicts resolved. Feelings: deferred."
    },
    "unsub": {
      "windowTitle": "Inbox — quick reads forever",
      "buttons": ["Unsubscribe", "Confirm", "Was this helpful? Yes", "Was this helpful? No", "Manage in HelixHub"],
      "mails": [
        {"subject": "Quick read: culture deck", "from": "AllHands"},
        {"subject": "Quick read: Q3 feelings", "from": "HR"},
        {"subject": "Quick read: you unsubscribed wrong", "from": "Marketing"}
      ],
      "afterUnsub": "Preferences saved to nowhere.",
      "toast": "You will still receive critical updates."
    },
    "logspam": {
      "windowTitle": "IDE — observability vibes",
      "logChips": ["console.log('here')", "console.log(data2)", "console.log('Kyle was here')", "console.log({ fog: true })"],
      "hint": "≥5 lines. Prod is fine. You are not.",
      "toast": "Telemetry vibes: rich."
    },
    "spacewar": {
      "windowTitle": "PR #spaces — Whitespace diplomacy",
      "hint": "Use kyle-space-war.md beats. Survive ≥8 advances.",
      "lgtm": "LGTM if we squash and never speak of spaces again.",
      "toast": "Peace was a formatting option."
    },
    "severity": {
      "windowTitle": "Bug — taxonomy must be satisfied",
      "severity": ["Sev0", "Sev1", "Sev2", "Sev3", "Sev4", "Unknown", "It's Fine"],
      "component": ["Platform", "Fog", "Other", "Kyle"],
      "impact": ["Users", "Metrics", "Feelings"],
      "policyToast": "Corrected by policy.",
      "toast": "Severity filed. Screenshot still impossible."
    },
    "estimate": {
      "windowTitle": "Planning poker — regret edition",
      "points": ["1", "2", "3", "5", "8", "13", "21", "?"],
      "reject": "Kyle-bot: too small. Try bigger regret.",
      "toast": "Committed to the vibe of 5."
    }
  }
}
```
