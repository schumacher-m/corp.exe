/* Auto-baked from copy/*.md — re-run bake_copy.py */
export default {
  "boot": {
    "biosLines": [
      "HelixStack BIOS 4.7b · Cubicle firmware OK",
      "Memory check: 640K ought to be enough for anyone",
      "Detecting fog... found",
      "Loading corp.exe...",
      "Press any key to pretend you have a choice"
    ],
    "titleTagline": "HelixStack · Cubicle 4-B · Please clock in. The fog does not clock out.",
    "clockInButton": "CLOCK IN",
    "bootToasts": [
      "Badge scanned. Welcome back, mid-level.",
      "Assigned seat: 4-B. The plant remembers you.",
      "Commute loading... depression first, chair second."
    ]
  },
  "tickets": [
    {
      "id": "HS-401",
      "title": "Semicolon Hell",
      "pts": 3,
      "type": "semi",
      "dod": "Place every missing ;. Do not invent new bugs. Do not question the linter's god complex.",
      "meta": "Priority: Existential · Sprint 47 · Assigned: Cubicle 4-B"
    },
    {
      "id": "HS-402",
      "title": "Comment Every Line",
      "pts": 5,
      "type": "comment",
      "dod": "Each line needs a comment. Vague is fine. Honest is dangerous. '// does a thing' is policy-compliant.",
      "meta": "Policy · Mandatory · Audit trail · InsightBot watching"
    },
    {
      "id": "HS-403",
      "title": "PR #884 — Survive Kyle",
      "pts": 8,
      "type": "pr",
      "dod": "Survive the review. Do not mention the fog. Do not win on principles.",
      "meta": "Blocked · Waiting on Kyle · Platform · Rules lawyer mode"
    }
  ],
  "fillers": [
    {
      "id": "HELIX-1188",
      "title": "Rename tmp to something temporary",
      "pts": 1,
      "type": "filler",
      "dod": "Find a name that means temporary without using tmp, temp, or scratch.",
      "meta": "Nitfarm · Platform · Priority: Petty"
    },
    {
      "id": "HELIX-2201",
      "title": "Standup bot wants feelings",
      "pts": 2,
      "type": "filler",
      "dod": "Fill Yesterday / Today / Blockers with content that sounds like progress.",
      "meta": "Ritual · Recurring · Cannot close"
    },
    {
      "id": "HELIX-3044",
      "title": "Coffee machine returns HTTP 418",
      "pts": 2,
      "type": "filler",
      "dod": "Document the teapot. Do not fix caffeine. Escalate to Facilities (they are a myth).",
      "meta": "Ops · Sev: Mood · Labels: beverage, despair"
    },
    {
      "id": "HELIX-4096",
      "title": "Delete the unused feature flag (don't)",
      "pts": 3,
      "type": "filler",
      "dod": "Investigate whether enableJoy is dead. Conclude it is load-bearing. Leave it.",
      "meta": "Tech debt · Scarier than prod · Owner: nobody"
    }
  ],
  "semiLines": [
    {
      "code": "const fog = true",
      "need": true
    },
    {
      "code": "function clockIn() {",
      "need": false
    },
    {
      "code": "  return badge.scan()",
      "need": true
    },
    {
      "code": "}",
      "need": false
    },
    {
      "code": "let sanity = 100",
      "need": true
    },
    {
      "code": "if (fog) sanity -= 1",
      "need": true
    },
    {
      "code": "export default cubicle",
      "need": true
    },
    {
      "code": "const unread = Infinity",
      "need": true
    },
    {
      "code": "while (true) {",
      "need": false
    },
    {
      "code": "  await standup.pretend()",
      "need": true
    },
    {
      "code": "}",
      "need": false
    }
  ],
  "commentLines": [
    "const ticket = fetchNext();",
    "ticket.status = 'In Progress';",
    "await coffee.sip();",
    "while (unread > 0) dread();",
    "ship(ticket); // hope",
    "insightBot.nag(user);",
    "return fog ? 'ok' : 'ok';"
  ],
  "commentSuggestions": [
    "// increments the thing",
    "// business logic",
    "// TODO: ask Kyle",
    "// this line does a thing",
    "// required by policy",
    "// not a bug if we ship it",
    "// aligns stakeholders spiritually",
    "// load-bearing comment"
  ],
  "prScript": [
    {
      "kyle": "Nit: can we rename `fog` to `atmosphericDensityCoefficient`?",
      "choices": [
        {
          "t": "Sure, I'll rename it.",
          "d": 1,
          "s": -5
        },
        {
          "t": "It's a boolean. Fog is fine.",
          "d": 0,
          "s": -2
        },
        {
          "t": "I'll add a comment instead.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "This PR adds a blank line. Was that intentional? Please justify in the description.",
      "choices": [
        {
          "t": "Readability. Removing it.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Yes. The blank line is load-bearing.",
          "d": 0,
          "s": -8
        },
        {
          "t": "I'll open a follow-up ticket.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Blocking: commit message doesn't reference the Jira key in the exact format HS-###.",
      "choices": [
        {
          "t": "Amended. HS-403.",
          "d": 1,
          "s": -2
        },
        {
          "t": "The key is in the branch name.",
          "d": 0,
          "s": -10
        },
        {
          "t": "Force-pushing a fix.",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Trailing whitespace on line 47. Platform style guide ✏4.2 is not optional.",
      "choices": [
        {
          "t": "Stripped. CI green.",
          "d": 1,
          "s": -3
        },
        {
          "t": "Whitespace is also code.",
          "d": 0,
          "s": -7
        },
        {
          "t": "Editorconfig PR incoming.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Why `let` here? Could this be `const`? Prefer immutability unless mutation is documented.",
      "choices": [
        {
          "t": "Switched to const.",
          "d": 1,
          "s": -2
        },
        {
          "t": "It mutates two lines later.",
          "d": 1,
          "s": -5
        },
        {
          "t": "I'll add a DO NOT CONST comment.",
          "d": 0,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Test plan checkboxes are unchecked. I cannot LGTM unchecked boxes. Policy.",
      "choices": [
        {
          "t": "Checked the ones I actually ran.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Checking all of them spiritually.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Added 'N/A — fog interferes'.",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Import order: external packages before internal HelixStack modules. Alphabetize within groups.",
      "choices": [
        {
          "t": "Reordered. Sorted. Soulless.",
          "d": 1,
          "s": -3
        },
        {
          "t": "The bundler does not care.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Auto-fix PR as follow-up.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Magic number `47`. Please extract to a named constant. Prefer `SPRINT_NUMBER_OF_REGRET`.",
      "choices": [
        {
          "t": "Extracted. Named it Sprint.",
          "d": 1,
          "s": -3
        },
        {
          "t": "47 is load-bearing folklore.",
          "d": 0,
          "s": -7
        },
        {
          "t": "Constant plus a comment blaming you.",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "package-lock.json changed by 14k lines. Was that intentional or did npm look at you funny?",
      "choices": [
        {
          "t": "Reverted lockfile. Only my deps.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Intentional. Embrace entropy.",
          "d": 0,
          "s": -11
        },
        {
          "t": "Regenerated with the blessed Node version.",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "No screenshots in the PR. For a UI-adjacent change, visual proof is required (even if nothing visible changed).",
      "choices": [
        {
          "t": "Attached a screenshot of the fog.",
          "d": 1,
          "s": -5
        },
        {
          "t": "Nothing visible changed. That's the point.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Uploaded Cubicle 4-B webcam still.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Reluctant LGTM if you squash. Or we take this offline in a 30-min sync that will be 90.",
      "choices": [
        {
          "t": "Squashing. Merging. Leaving.",
          "d": 1,
          "s": -2
        },
        {
          "t": "Take it offline. Bring poison.",
          "d": 1,
          "s": -6
        },
        {
          "t": "I'll wait for the sync. Forever.",
          "d": 1,
          "s": -8
        }
      ]
    }
  ],
  "prEndLines": [
    "Per Platform guidelines…",
    "Blocking until alphabetized.",
    "Can we bike-shed the variable name?",
    "Nit (but also blocking): period at end of commit subject.",
    "Please rebase onto main. Main is red. Rebase anyway.",
    "I left 23 comments. Most are about spaces.",
    "This is fine. This is not fine. Requesting changes.",
    "LGTM after you undo the LGTM-able parts."
  ],
  "slackPool": [
    {
      "name": "Dana",
      "color": "#4a7080",
      "text": "Hey. Do you have time to drink some poison?"
    },
    {
      "name": "Jess",
      "color": "#5a6a8a",
      "text": "Standup in 2. I have nothing. You?"
    },
    {
      "name": "Priya",
      "color": "#7a5a70",
      "text": "Quick sync? I need a witness for this ticket."
    },
    {
      "name": "Todd",
      "color": "#6a7060",
      "text": "Sprint board is a cry for help with swimlanes."
    },
    {
      "name": "Dana",
      "color": "#4a7080",
      "text": "Coffee machine is broken. So is the week."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Nit on your draft PR before you even open it."
    },
    {
      "name": "Ops",
      "color": "#6b8f3a",
      "text": "Fog density within acceptable corporate range."
    },
    {
      "name": "HR",
      "color": "#8b3a2a",
      "text": "Reminder: vibes are a performance metric now."
    },
    {
      "name": "Bot",
      "color": "#504c40",
      "text": "Calendar invite: Suffering (recurring)."
    },
    {
      "name": "InsightBot",
      "color": "#504c40",
      "text": "You have 47 unread. Productivity tip: ignore 46."
    },
    {
      "name": "Maya",
      "color": "#4a6070",
      "text": "Who moved the deploy to Friday at 4:55?"
    },
    {
      "name": "Jess",
      "color": "#5a6a8a",
      "text": "I'm in the war room. There's no war. Just rooms."
    },
    {
      "name": "Priya",
      "color": "#7a5a70",
      "text": "Blocked on Kyle. Again. Sending thoughts and PRs."
    },
    {
      "name": "Todd",
      "color": "#6a7060",
      "text": "Definition of Done includes emotionally finished."
    },
    {
      "name": "Dana",
      "color": "#4a7080",
      "text": "Lobby. Bring your badge and your resignation energy."
    },
    {
      "name": "Maya",
      "color": "#4a6070",
      "text": "Retro notes: we learned nothing and will ship anyway."
    },
    {
      "name": "InsightBot",
      "color": "#504c40",
      "text": "Standup attendance: present. Soul: OOO."
    },
    {
      "name": "HR",
      "color": "#8b3a2a",
      "text": "Please rate your burnout 1-5. 5 means engaged."
    },
    {
      "name": "Ops",
      "color": "#6b8f3a",
      "text": "The plant in 4-B filed a ticket. Priority: Medium."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Main is green. Don't get comfortable."
    }
  ],
  "standup": {
    "yesterday": [
      "Fixed a bug that wasn't broken.",
      "Attended three syncs about a fourth sync.",
      "Renamed a variable. Kyle renamed it back.",
      "Closed HELIX-2201 emotionally, not in Jira."
    ],
    "today": [
      "Will fix the bug I just made.",
      "Survive Kyle's review without mentioning the fog.",
      "Ship something that looks like progress from far away.",
      "Drink coffee that tastes like a standup."
    ],
    "blockers": [
      "Waiting on Kyle's review since forever.",
      "Blocked on alignment (the concept).",
      "Coffee machine returns 418.",
      "The fog has my LGTM."
    ]
  },
  "standupToasts": [
    "Day started. The fog approves.",
    "Ticket closed. Sanity optional.",
    "Standup tax applied.",
    "Unread cleared. Dread remains.",
    "Muted (there was no sound).",
    "Deploy window moved. Bring snacks.",
    "Definition of Done updated: emotionally finished.",
    "Kyle left another comment. Of course he did."
  ],
  "eod": {
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
  },
  "startMenu": {
    "startLabel": "Start",
    "items": [
      {
        "label": "Jimbo",
        "id": "jimbo"
      },
      {
        "label": "Inbox",
        "id": "inbox"
      },
      {
        "label": "Programs",
        "submenu": [
          "corp.exe",
          "InsightBot",
          "Solitaire (blocked by policy)",
          "Notepad (for feelings)"
        ]
      },
      {
        "label": "Documents",
        "submenu": [
          "sprint-notes-final-FINAL.doc",
          "todo-ignore.txt",
          "resignation-draft-3.doc"
        ]
      },
      {
        "label": "Settings",
        "submenu": [
          "Control Panel",
          "Fog Density",
          "Sanity Options"
        ]
      },
      {
        "label": "Find",
        "submenu": [
          "Find Files...",
          "Find Meaning...",
          "Find the Exit (0 results)"
        ]
      },
      {
        "label": "Help",
        "submenu": [
          "HelixStack Help",
          "Ask Kyle",
          "Don't"
        ]
      },
      {
        "label": "Run...",
        "hint": "Type a command you will regret"
      },
      {
        "label": "Shut Down...",
        "hint": "Ends the day. Not the job."
      }
    ],
    "trayTooltips": [
      "Volume: corporate silence",
      "Network: connected to despair",
      "InsightBot: always watching",
      "Clock: later than you think"
    ]
  },
  "stickies": [
    {
      "color": "yellow",
      "text": "standup @ 9:01 · bring nothing"
    },
    {
      "color": "pink",
      "text": "DON'T mention the fog in Slack"
    },
    {
      "color": "blue",
      "text": "Kyle blocks PRs for fun · hydrate"
    },
    {
      "color": "yellow",
      "text": "password: password1 (policy)"
    },
    {
      "color": "green",
      "text": "Definition of Done = emotionally finished"
    },
    {
      "color": "pink",
      "text": "poison o'clock w/ Dana · lobby"
    },
    {
      "color": "yellow",
      "text": "plant is company property · Ops"
    },
    {
      "color": "blue",
      "text": "unread never hits zero · feature"
    }
  ],
  "dialogs": {
    "errors": [
      {
        "title": "corp.exe",
        "body": "This program has performed an illegal operation and will be shut down. Just kidding. Keep working.",
        "buttons": [
          "OK",
          "Also OK"
        ]
      },
      {
        "title": "InsightBot",
        "body": "Unread messages: still not zero. Productivity tip: close your eyes.",
        "buttons": [
          "Ignore",
          "Ignore Harder"
        ]
      },
      {
        "title": "Jira Connector",
        "body": "HELIX-2201 cannot be closed. Status: emotionally unfinished.",
        "buttons": [
          "Retry",
          "Accept Fate"
        ]
      },
      {
        "title": "Network Neighborhood",
        "body": "The fog has disconnected you from joy. Reconnect anyway?",
        "buttons": [
          "Reconnect",
          "Stay Offline"
        ]
      },
      {
        "title": "Kyle from Platform",
        "body": "A comment was left on your soul. Severity: Nit.",
        "buttons": [
          "Open PR",
          "Minimize Forever"
        ]
      },
      {
        "title": "General Protection Fault",
        "body": "Standup.exe caused a fault in module HOPE.DLL. Close standup?",
        "buttons": [
          "Close",
          "Close Louder"
        ]
      }
    ],
    "confirms": [
      {
        "title": "Clock Out",
        "body": "End your day? The building will still be here tomorrow. So will you.",
        "buttons": [
          "Clock Out",
          "One More Ticket"
        ]
      },
      {
        "title": "Save Changes",
        "body": "Save changes to Untitled Sprint? (There are no changes. Save anyway.)",
        "buttons": [
          "Save",
          "Don't Save",
          "Cancel Career"
        ]
      }
    ]
  },
  "startDenied": [
    "Access denied. Policy is vibes.",
    "Blocked by InsightBot. Again.",
    "That feature shipped in a parallel universe.",
    "Kyle revoked your permissions spiritually.",
    "Solitaire is a performance metric now. No.",
    "Find: 0 results. Including this menu.",
    "Help is offline. Ask the fog.",
    "Run... cancelled by fear.",
    "Documents folder contains only drafts of quitting.",
    "Settings saved nowhere. As designed."
  ],
  "jimbo": {
    "windowTitle": "Jimbo — HelixStack AI",
    "askLabel": "Ask Jimbo",
    "bannerAlt": "Jimbo says hi",
    "greetings": [
      "Hi! I'm Jimbo. I turn blockers into vibes.",
      "Jimbo online. Your ticket is already almost done (spiritually).",
      "Need a rubber duck that ships PRs? That's me."
    ],
    "responses": [
      "Great question! Per the style guide I just invented: yes.",
      "I aligned stakeholders. Also I renamed your variable.",
      "As an AI, I recommend shipping the feeling of correctness.",
      "Done! I removed complexity by adding three helpers named tmp.",
      "Kyle is right. Also I agree with the opposite of Kyle.",
      "Policy says you must ask me. Good job asking me. Policy complete."
    ],
    "saveToasts": [
      "Jimbo saved you 4 hours!",
      "Jimbo saved you 4 hours! (billing code: HOPE)",
      "Jimbo optimized your afternoon into a toast."
    ],
    "jiggleToasts": [
      "I jiggled your mouse for you!",
      "Presence secured. Mouse wiggled. Career unchanged.",
      "I moved your cursor 2px. InsightBot is proud."
    ],
    "skipHr": {
      "title": "HR / Compliance",
      "body": "Policy HS-AI-01: Ticket submission requires at least one Jimbo interaction. Skipping is a values violation. Please Ask Jimbo.",
      "buttons": [
        "Ask Jimbo",
        "I Love Policy"
      ]
    },
    "sabotage": {
      "semi": [
        "Style guide update mid-task: semicolons are now optional except when mandatory.",
        "Jimbo says: strip every ; on odd lines. Trust the fog.",
        "Applied ;; because one semicolon looked lonely."
      ],
      "comment": [
        "Rewrote comments into motivational Spanish (incorrect).",
        "As an AI, I replaced your comments with a wall of gratitude.",
        "Comments now explain a different codebase. Synergy!"
      ],
      "pr": [
        "Jimbo agrees with Kyle + invents 4 new nits.",
        "Renamed fog → data2. Stakeholders love numbers.",
        "Posted 'LGTM if we also rename everything to data2'."
      ]
    },
    "markedRead": "Marked as read by Jimbo",
    "_writerNote": "Writer copy — cheerful-wrong corporate-slop; keys stable for Dev."
  },
  "emails": {
    "inboxTitle": "Inbox — Outlook Express",
    "desktopLabel": "Inbox",
    "unreadFloor": 1,
    "messages": [
      {
        "id": "e1",
        "from": "Facilities",
        "subject": "The plant filed a ticket about you",
        "body": "Cubicle 4-B flora reports neglect. Water it or accept a peer review from chlorophyll.",
        "sanity": 6,
        "doom": true
      },
      {
        "id": "e2",
        "from": "HR",
        "subject": "Mandatory joy survey (5 min → 45)",
        "body": "Rate your burnout 1–5 where 5 means 'engaged'. Leaving blank counts as 5.",
        "sanity": 8,
        "doom": true
      },
      {
        "id": "e3",
        "from": "Kyle",
        "subject": "Nit on the email you're reading",
        "body": "Subject line should be Title Case. Also trailing whitespace in your soul.",
        "sanity": 7,
        "doom": true
      },
      {
        "id": "e4",
        "from": "InsightBot",
        "subject": "You have been productive (lie)",
        "body": "Our model detected focus. Or a frozen cursor. Either way: great job.",
        "sanity": 5,
        "doom": true
      },
      {
        "id": "e5",
        "from": "All-Hands",
        "subject": "Town hall moved into the fog",
        "body": "Bring questions. Do not bring hope. Snacks are metaphorical.",
        "sanity": 4,
        "doom": true
      },
      {
        "id": "e6",
        "from": "Security",
        "subject": "Phish test you already failed",
        "body": "Clicking this counts as training complete. Congratulations on the vulnerability.",
        "sanity": 9,
        "doom": true
      },
      {
        "id": "e7",
        "from": "Dana",
        "subject": "Poison o'clock?",
        "body": "Lobby. Badge optional. Dignity not required.",
        "sanity": 3,
        "doom": true
      },
      {
        "id": "e8",
        "from": "Jira",
        "subject": "HELIX-2201 still emotionally open",
        "body": "This ticket cannot be closed. Neither can you. Have a metrics-driven day.",
        "sanity": 6,
        "doom": true
      },
      {
        "id": "e9",
        "from": "IT",
        "subject": "Password expires in −3 days",
        "body": "Please change password1 to password2. History remembers everything except kindness.",
        "sanity": 5,
        "doom": true
      },
      {
        "id": "e10",
        "from": "Manager",
        "subject": "Quick sync that is neither",
        "body": "Can you walk me through the thing while also doing the thing? Thx.",
        "sanity": 8,
        "doom": true
      },
      {
        "id": "e11",
        "from": "Payroll",
        "subject": "Direct deposit of vibes",
        "body": "Your compensation includes exposure and a free fluorescent headache.",
        "sanity": 4,
        "doom": true
      },
      {
        "id": "e12",
        "from": "Compliance",
        "subject": "Appear Active policy reminder",
        "body": "Away status triggers this email. Move the mouse. Love, Policy.",
        "sanity": 10,
        "presence": true,
        "doom": false,
        "force": true
      },
      {
        "id": "e13",
        "from": "Ops",
        "subject": "Coffee machine still HTTP 418",
        "body": "Do not fix. Document the teapot. Escalate to myth.",
        "sanity": 3,
        "doom": true
      },
      {
        "id": "e14",
        "from": "Jimbo",
        "subject": "I summarized your inbox into dread",
        "body": "TL;DR: everyone needs something and none of it is you resting.",
        "sanity": 7,
        "doom": true
      },
      {
        "id": "e15",
        "from": "PresenceBot",
        "subject": "YOU APPEAR AWAY — acknowledge immediately",
        "body": "Policy 4-B-ACTIVE: Idle >11s requires mandatory acknowledgment. Moving the mouse is not optional. Dismiss this to resume being Active (and miserable).",
        "sanity": 12,
        "presence": true,
        "doom": false,
        "force": true
      },
      {
        "id": "e16",
        "from": "HR",
        "subject": "Away is a performance conversation",
        "body": "Your status went red. Please confirm you are still employed. Click OK to pretend you were reading Slack.",
        "sanity": 11,
        "presence": true,
        "doom": false,
        "force": true
      }
    ],
    "_writerNote": "Writer: doom=true unsolicited popups; presence/force=Away mandatory mail."
  }
};
