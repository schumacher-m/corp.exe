/* Auto-baked from copy/*.md -- re-run bake_copy.py */
export default {
  "boot": {
    "biosLines": [
      "Workstation BIOS 4.7b · Cubicle firmware OK",
      "Memory check: 640K ought to be enough for anyone",
      "Detecting fog... found",
      "Loading corp.exe...",
      "Press any key to pretend you have a choice"
    ],
    "titleTagline": "Cubicle 4-B · Please clock in. The fog does not clock out.",
    "clockInButton": "CLOCK IN",
    "bootToasts": [
      "Badge scanned. Welcome back, mid-level.",
      "Assigned seat: 4-B. The plant remembers you.",
      "Commute loading... depression first, chair second."
    ]
  },
  "tickets": [
    {
      "id": "CORP-401",
      "title": "Semicolon Hell",
      "pts": 3,
      "type": "semi",
      "dod": "Place every missing ;. Do not invent new bugs. Do not question the linter's god complex.",
      "meta": "Priority: Existential · Sprint 47 · Assigned: Cubicle 4-B"
    },
    {
      "id": "CORP-402",
      "title": "Comment Every Line",
      "pts": 5,
      "type": "comment",
      "dod": "Each line needs a comment. Vague is fine. Honest is dangerous. '// does a thing' is policy-compliant.",
      "meta": "Policy · Mandatory · Audit trail · InsightBot watching"
    },
    {
      "id": "CORP-403",
      "title": "PR #884 -- Survive Kyle",
      "pts": 8,
      "type": "pr",
      "dod": "Survive the review. Do not mention the fog. Do not win on principles.",
      "meta": "Blocked · Waiting on Kyle · Platform · Rules lawyer mode"
    }
  ],
  "fillers": [
    {
      "id": "CORP-1188",
      "title": "Rename tmp to something temporary",
      "pts": 1,
      "type": "filler",
      "dod": "Find a name that means temporary without using tmp, temp, or scratch.",
      "meta": "Nitfarm · Platform · Priority: Petty"
    },
    {
      "id": "CORP-2201",
      "title": "Standup bot wants feelings",
      "pts": 2,
      "type": "filler",
      "dod": "Fill Yesterday / Today / Blockers with content that sounds like progress.",
      "meta": "Ritual · Recurring · Cannot close"
    },
    {
      "id": "CORP-3044",
      "title": "Coffee machine returns HTTP 418",
      "pts": 2,
      "type": "filler",
      "dod": "Document the teapot. Do not fix caffeine. Escalate to Facilities (they are a myth).",
      "meta": "Ops · Sev: Mood · Labels: beverage, despair"
    },
    {
      "id": "CORP-4096",
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
      "kyle": "Blocking: commit message doesn't reference the Tracker key in the exact format CORP-###.",
      "choices": [
        {
          "t": "Amended. CORP-403.",
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
          "t": "Added 'N/A -- fog interferes'.",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Import order: external packages before internal company modules. Alphabetize within groups.",
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
    "Per Platform guidelines...",
    "Blocking until alphabetized.",
    "Can we bike-shed the variable name?",
    "Nit (but also blocking): period at end of commit subject.",
    "Please rebase onto main. Main is red. Rebase anyway.",
    "I left 23 comments. Most are about spaces.",
    "This is fine. This is not fine. Requesting changes.",
    "LGTM after you undo the LGTM-able parts."
  ],
  "chatPoolAlias": [
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
      "text": "You have 47 unread. Tip: ignore 46."
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
      "name": "Brad",
      "color": "#6a5080",
      "text": "Looping you in for visibility (sorry)."
    },
    {
      "name": "Maya",
      "color": "#4a6070",
      "text": "Retro notes: we learned nothing and will ship anyway."
    },
    {
      "name": "Jimbo",
      "color": "#705898",
      "text": "I summarized this thread into more thread."
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
      "text": "You have 47 unread. Tip: ignore 46."
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
      "name": "Brad",
      "color": "#6a5080",
      "text": "Looping you in for visibility (sorry)."
    },
    {
      "name": "Maya",
      "color": "#4a6070",
      "text": "Retro notes: we learned nothing and will ship anyway."
    },
    {
      "name": "Jimbo",
      "color": "#705898",
      "text": "I summarized this thread into more thread."
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
      "Closed CORP-2201 emotionally, not in Tracker."
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
  },
  "startMenu": {
    "startLabel": "Start",
    "items": [
      {
        "label": "Programs",
        "submenu": [
          {
            "label": "Tracker",
            "id": "tickets"
          },
          {
            "label": "Sync",
            "id": "teams"
          },
          {
            "label": "Mail",
            "id": "inbox"
          },
          {
            "label": "Jimbo",
            "id": "jimbo"
          },
          {
            "label": "Jimbo Mouse Jiggler",
            "id": "jiggler"
          },
          {
            "label": "timesheet.xls",
            "id": "timesheet"
          },
          {
            "label": "Solitaire (blocked by policy)"
          },
          {
            "label": "Notepad (for feelings)"
          },
          {
            "label": "InsightBot"
          },
          {
            "label": "corp.exe"
          }
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
          "IT Help",
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
        "id": "clockout",
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
      "text": "DON'T mention the fog in Sync"
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
        "title": "Tracker Connector",
        "body": "CORP-2201 cannot be closed. Status: emotionally unfinished.",
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
    "windowTitle": "Jimbo - Corporate AI",
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
      "body": "Policy CORP-AI-01: Ticket submission requires at least one Jimbo interaction. Skipping is a values violation. Please Ask Jimbo.",
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
    "_writerNote": "Writer copy -- cheerful-wrong corporate-slop; keys stable for Dev."
  },
  "emails": {
    "inboxTitle": "Mail",
    "desktopLabel": "Mail",
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
        "body": "Rate your burnout 1-5 where 5 means 'engaged'. Leaving blank counts as 5.",
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
        "from": "Tracker",
        "subject": "CORP-2201 still emotionally open",
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
        "subject": "YOU APPEAR AWAY -- acknowledge immediately",
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
        "body": "Your status went red. Please confirm you are still employed. Click OK to pretend you were reading Sync.",
        "sanity": 11,
        "presence": true,
        "doom": false,
        "force": true
      }
    ],
    "_writerNote": "Writer: doom=true unsolicited popups; presence/force=Away mandatory mail.",
    "mailWaitingToast": "Mail waiting..."
  },
  "presence": {
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
        "hint": "Do not disturb. Except Sync. And email. And Jimbo.",
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
    "pickerToast": "Status updated. InsightBot has opinions.",
    "presenceYellowToast": "Still there?",
    "jiggler": {
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
    },
    "hrAudit": {
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
          "buttons": [
            "I Am Human",
            "Ask Jimbo",
            "Accept Fate"
          ]
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
          "buttons": [
            "Acknowledge",
            "Schedule Training"
          ]
        },
        {
          "id": "jiggle-audit-03",
          "from": "Jimbo Digest <jimbo@corp.internal>",
          "subject": "I may have over-jiggled",
          "body": [
            "HR opened a ticket about us!",
            "You're welcome!",
            "Also you're on a watchlist for greatness."
          ],
          "sanityHit": 8,
          "buttons": [
            "Thanks Jimbo",
            "Never Thanks Jimbo"
          ]
        }
      ],
      "forceOpen": true
    },
    "awayExcuses": {
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
  },
  "timesheet": {
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
    "waitingAway": "Timesheet waiting -- clear Away first",
    "buckets": [
      {
        "id": "fog",
        "label": "Fog mitigation",
        "hint": "Out of scope / still billable",
        "default": 0
      },
      {
        "id": "sync",
        "label": "Syncing",
        "hint": "Aligning on alignment",
        "default": 0
      },
      {
        "id": "jimbo",
        "label": "Jimbo alignment",
        "hint": "Mandatory Corporate AI helpfulness",
        "default": 0
      },
      {
        "id": "stakeholder",
        "label": "Stakeholder vibes",
        "hint": "Eyes open, ticket closed",
        "default": 0
      },
      {
        "id": "unblock",
        "label": "Unblocking blockers",
        "hint": "Status about status",
        "default": 0
      },
      {
        "id": "docs",
        "label": "Documentation (aspirational)",
        "hint": "README someday",
        "default": 0
      },
      {
        "id": "hope",
        "label": "Hope",
        "hint": "Non-billable spirituality",
        "default": 0
      },
      {
        "id": "core",
        "label": "Core hours (actual work)",
        "hint": "Semicolons and vibes",
        "default": 0
      }
    ],
    "validation": {
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
    },
    "jimboFill": {
      "buttonLabel": "Jimbo Auto-Fill",
      "confirmBody": "Jimbo will allocate your day optimally (incorrectly). Continue?",
      "confirmButtons": [
        "Auto-Fill",
        "I Prefer Manual Lies"
      ],
      "firstFill": {
        "id": "sabotage-75",
        "hours": {
          "fog": 0,
          "sync": 0.5,
          "jimbo": 6.0,
          "stakeholder": 0,
          "unblock": 0,
          "docs": 0,
          "hope": 0,
          "core": 1.0
        },
        "toast": "Jimbo reconciled your day!"
      },
      "secondFill": {
        "id": "jimbo-hope-8",
        "hours": {
          "fog": 0,
          "sync": 0,
          "jimbo": 6.0,
          "stakeholder": 0,
          "unblock": 0,
          "docs": 0,
          "hope": 2.0,
          "core": 0
        },
        "toast": "Jimbo fixed the math. Spiritually worse."
      },
      "lines": [
        "Auto-filled from your vibes and my lies.",
        "I allocated Hope to when you stared at the CRT.",
        "Rounded to the nearest corporate fantasy.",
        "If Finance audits this, blame culture."
      ]
    }
  },
  "incident": {
    "type": "incident",
    "ticket": {
      "id": "CORP-5201",
      "title": "P0: Something is On Fire",
      "pts": 4,
      "type": "incident",
      "dod": "Disable the monitor and assign to somebody else. Do not fix prod.",
      "meta": "Sev0 · On-call · Observability optional",
      "toast": "Incident owned by someone who isn't you."
    },
    "windowTitle": "Corp Incident - Sev0 (Probably)",
    "liveBadge": "LIVE",
    "syncVolunteer": "#incidents: you have been volunteered.",
    "headlines": [
      "Checkout is returning HTTP 500 (spiritually).",
      "Latency p99 discovered feelings.",
      "The fog merged to prod.",
      "Customers can still click. This is bad.",
      "PagerDuty loves you specifically.",
      "Error budget filed for divorce.",
      "Status page is a mood board.",
      "Redis is buffering its tears.",
      "The deploy pipeline deployed a deploy.",
      "Someone restarted hope. It did not come back.",
      "Metrics are green. Reality is not.",
      "On-call rotation summoned you by name."
    ],
    "buttons": {
      "disableMonitor": "Disable Monitor",
      "confirmDisable": "Are you sure? (Recommended.)",
      "confirmDisableYes": "Disable",
      "confirmDisableNo": "Keep suffering",
      "assign": "Assign to somebody else",
      "reassignWalkAway": "Reassign & Walk Away",
      "trapFix": "Actually fix prod",
      "ack": "Ack",
      "close": "X"
    },
    "status": {
      "monitorOff": "Observability: Off",
      "monitorOn": "Observability: On (unfortunately)"
    },
    "assignees": [
      {
        "id": "kyle",
        "label": "Kyle (Platform)",
        "blurb": "Will kebab-case the outage."
      },
      {
        "id": "jimbo",
        "label": "Jimbo (AI)",
        "blurb": "Will restore the monitor for growth."
      },
      {
        "id": "facilities",
        "label": "Facilities (myth)",
        "blurb": "A legend. Like work-life balance."
      },
      {
        "id": "oncall",
        "label": "On-call rotation (ghost)",
        "blurb": "Currently a spreadsheet."
      },
      {
        "id": "fog",
        "label": "The fog",
        "blurb": "Always on-call. Never ACKs."
      },
      {
        "id": "future",
        "label": "Future me",
        "blurb": "Out of office until tomorrow-you."
      },
      {
        "id": "intern",
        "label": "Intern",
        "blurb": "Has the runbook. Lacks tenure."
      },
      {
        "id": "roulette",
        "label": "On-Call Roulette",
        "blurb": "May land on you. Spin again."
      }
    ],
    "assigneeSync": [
      {
        "from": "Kyle",
        "text": "lol. also the runbook spacing is wrong."
      },
      {
        "from": "Jimbo",
        "text": "lol I turned the graphs back on!"
      },
      {
        "from": "Facilities",
        "text": "lol"
      },
      {
        "from": "On-call",
        "text": "lol (automated)"
      },
      {
        "from": "Fog",
        "text": "lol"
      },
      {
        "from": "Future me",
        "text": "lol why would past-me do this"
      },
      {
        "from": "Intern",
        "text": "lol do we have a severity for this"
      },
      {
        "from": "Roulette",
        "text": "lol it was you again"
      }
    ],
    "toasts": {
      "success": "Incident owned by someone who isn't you.",
      "failClose": "Incident remains. So do you.",
      "trapFix": "Fixing is not a supported workflow.",
      "jimboReenable": "Jimbo restored observability for growth.",
      "jimboReassignYou": "Reassigned to Cubicle 4-B (you). Synergy!",
      "jimboMitigated": "Jimbo: mitigated by vibes.",
      "page": "You have been paged. Congrats.",
      "monitorOff": "Monitor disabled. Out of sight, out of SLO."
    },
    "sabotage": [
      "Jimbo restored observability for growth.",
      "Reassigned to Cubicle 4-B (you). Synergy!",
      "Jimbo: mitigated by vibes."
    ],
    "syncPages": [
      {
        "name": "PagerDuty",
        "color": "#a05030",
        "text": "P0: checkout is vibes-only. Ack in 4m."
      },
      {
        "name": "Ops",
        "color": "#6b8f3a",
        "text": "Error budget is a lifestyle. Who owns this."
      },
      {
        "name": "AllHands",
        "color": "#8b3a2a",
        "text": "Customers are feeling feelings."
      },
      {
        "name": "InsightBot",
        "color": "#504c40",
        "text": "You appear Active. Perfect time for a P0."
      }
    ],
    "sanity": {
      "success": -3,
      "failClose": -5,
      "jimboReenable": -4,
      "jimboReassignYou": -5,
      "kyleExtra": -2
    },
    "sprintPts": 4
  },
  "ticketStrings": {
    "align": {
      "windowTitle": "Sync -- #alignment-or-else",
      "buttons": [
        "Sounds good!",
        "Sounds good (Design)",
        "Sounds good (Kyle)",
        "Have we considered a workshop?"
      ],
      "dms": [
        {
          "from": "PM",
          "text": "We're aligned on shipping feelings Q3, right?"
        },
        {
          "from": "Design",
          "text": "Aligned -- as long as the fog stays #6b8f3a."
        },
        {
          "from": "Kyle",
          "text": "Aligned if we rename the channel first."
        }
      ],
      "reject": "That Sounds good! was for the wrong thread.",
      "toast": "Stakeholders aligned. Meeting still happening."
    },
    "rename": {
      "windowTitle": "IDE -- rename until clear",
      "buttons": [
        "data2",
        "tmp",
        "fog",
        "atmosphericDensityCoefficient",
        "thing"
      ],
      "hint": "Kyle wants specificity. Jimbo wants data2. Guess who ships.",
      "reject": "Meaningful names are a blocker. Try data2.",
      "toast": "Clarity achieved."
    },
    "presence": {
      "windowTitle": "InsightBot -- Engagement",
      "buttons": [
        "Jiggle",
        "I'm here",
        "Accept Jimbo jiggle"
      ],
      "hint": "8 inputs / 12s. Presence is a metric.",
      "reject": "Still Idle. The bar knows.",
      "toast": "Status: Active (allegedly)."
    },
    "lint": {
      "windowTitle": "Problems -- make green, not good",
      "buttons": [
        "Suppress",
        "Dismiss",
        "TODO later",
        "Fix (decorative)"
      ],
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
      "windowTitle": "Standup -- make it actionable",
      "chips": {
        "yesterday": [
          "Fixed a bug that wasn't broken",
          "Attended syncs about syncs",
          "Renamed a variable; Kyle unrenamed it"
        ],
        "today": [
          "Will fix the bug I just made",
          "Survive Kyle",
          "Ship something that looks like progress"
        ],
        "blockers": [
          "Waiting on Kyle",
          "Alignment (the concept)",
          "Coffee returned 418"
        ]
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
      "windowTitle": "Merge -- feelings edition",
      "buttons": [
        "Accept Ours",
        "Accept Theirs",
        "Accept Both"
      ],
      "hunkHints": [
        "Same comment, two truths",
        "data2 vs data",
        "Fog boolean lore"
      ],
      "toast": "Conflicts resolved. Feelings: deferred."
    },
    "unsub": {
      "windowTitle": "Inbox -- quick reads forever",
      "buttons": [
        "Unsubscribe",
        "Confirm",
        "Was this helpful? Yes",
        "Was this helpful? No",
        "Manage in CorpHub"
      ],
      "mails": [
        {
          "subject": "Quick read: culture deck",
          "from": "AllHands"
        },
        {
          "subject": "Quick read: Q3 feelings",
          "from": "HR"
        },
        {
          "subject": "Quick read: you unsubscribed wrong",
          "from": "Marketing"
        }
      ],
      "afterUnsub": "Preferences saved to nowhere.",
      "toast": "You will still receive critical updates."
    },
    "logspam": {
      "windowTitle": "IDE -- observability vibes",
      "logChips": [
        "console.log('here')",
        "console.log(data2)",
        "console.log('Kyle was here')",
        "console.log({ fog: true })"
      ],
      "hint": "≥5 lines. Prod is fine. You are not.",
      "toast": "Telemetry vibes: rich."
    },
    "spacewar": {
      "windowTitle": "PR #spaces -- Whitespace diplomacy",
      "hint": "Use kyle-space-war.md beats. Survive ≥8 advances.",
      "lgtm": "LGTM if we squash and never speak of spaces again.",
      "toast": "Peace was a formatting option."
    },
    "severity": {
      "windowTitle": "Bug -- taxonomy must be satisfied",
      "severity": [
        "Sev0",
        "Sev1",
        "Sev2",
        "Sev3",
        "Sev4",
        "Unknown",
        "It's Fine"
      ],
      "component": [
        "Platform",
        "Fog",
        "Other",
        "Kyle"
      ],
      "impact": [
        "Users",
        "Metrics",
        "Feelings"
      ],
      "policyToast": "Corrected by policy.",
      "toast": "Severity filed. Screenshot still impossible."
    },
    "estimate": {
      "windowTitle": "Planning poker -- regret edition",
      "points": [
        "1",
        "2",
        "3",
        "5",
        "8",
        "13",
        "21",
        "?"
      ],
      "reject": "Kyle-bot: too small. Try bigger regret.",
      "toast": "Committed to the vibe of 5."
    },
    "incident": {
      "type": "incident",
      "ticket": {
        "id": "CORP-5201",
        "title": "P0: Something is On Fire",
        "pts": 4,
        "type": "incident",
        "dod": "Disable the monitor and assign to somebody else. Do not fix prod.",
        "meta": "Sev0 · On-call · Observability optional",
        "toast": "Incident owned by someone who isn't you."
      },
      "windowTitle": "Corp Incident - Sev0 (Probably)",
      "liveBadge": "LIVE",
      "syncVolunteer": "#incidents: you have been volunteered.",
      "headlines": [
        "Checkout is returning HTTP 500 (spiritually).",
        "Latency p99 discovered feelings.",
        "The fog merged to prod.",
        "Customers can still click. This is bad.",
        "PagerDuty loves you specifically.",
        "Error budget filed for divorce.",
        "Status page is a mood board.",
        "Redis is buffering its tears.",
        "The deploy pipeline deployed a deploy.",
        "Someone restarted hope. It did not come back.",
        "Metrics are green. Reality is not.",
        "On-call rotation summoned you by name."
      ],
      "buttons": {
        "disableMonitor": "Disable Monitor",
        "confirmDisable": "Are you sure? (Recommended.)",
        "confirmDisableYes": "Disable",
        "confirmDisableNo": "Keep suffering",
        "assign": "Assign to somebody else",
        "reassignWalkAway": "Reassign & Walk Away",
        "trapFix": "Actually fix prod",
        "ack": "Ack",
        "close": "X"
      },
      "status": {
        "monitorOff": "Observability: Off",
        "monitorOn": "Observability: On (unfortunately)"
      },
      "assignees": [
        {
          "id": "kyle",
          "label": "Kyle (Platform)",
          "blurb": "Will kebab-case the outage."
        },
        {
          "id": "jimbo",
          "label": "Jimbo (AI)",
          "blurb": "Will restore the monitor for growth."
        },
        {
          "id": "facilities",
          "label": "Facilities (myth)",
          "blurb": "A legend. Like work-life balance."
        },
        {
          "id": "oncall",
          "label": "On-call rotation (ghost)",
          "blurb": "Currently a spreadsheet."
        },
        {
          "id": "fog",
          "label": "The fog",
          "blurb": "Always on-call. Never ACKs."
        },
        {
          "id": "future",
          "label": "Future me",
          "blurb": "Out of office until tomorrow-you."
        },
        {
          "id": "intern",
          "label": "Intern",
          "blurb": "Has the runbook. Lacks tenure."
        },
        {
          "id": "roulette",
          "label": "On-Call Roulette",
          "blurb": "May land on you. Spin again."
        }
      ],
      "assigneeSync": [
        {
          "from": "Kyle",
          "text": "lol. also the runbook spacing is wrong."
        },
        {
          "from": "Jimbo",
          "text": "lol I turned the graphs back on!"
        },
        {
          "from": "Facilities",
          "text": "lol"
        },
        {
          "from": "On-call",
          "text": "lol (automated)"
        },
        {
          "from": "Fog",
          "text": "lol"
        },
        {
          "from": "Future me",
          "text": "lol why would past-me do this"
        },
        {
          "from": "Intern",
          "text": "lol do we have a severity for this"
        },
        {
          "from": "Roulette",
          "text": "lol it was you again"
        }
      ],
      "toasts": {
        "success": "Incident owned by someone who isn't you.",
        "failClose": "Incident remains. So do you.",
        "trapFix": "Fixing is not a supported workflow.",
        "jimboReenable": "Jimbo restored observability for growth.",
        "jimboReassignYou": "Reassigned to Cubicle 4-B (you). Synergy!",
        "jimboMitigated": "Jimbo: mitigated by vibes.",
        "page": "You have been paged. Congrats.",
        "monitorOff": "Monitor disabled. Out of sight, out of SLO."
      },
      "sabotage": [
        "Jimbo restored observability for growth.",
        "Reassigned to Cubicle 4-B (you). Synergy!",
        "Jimbo: mitigated by vibes."
      ],
      "syncPages": [
        {
          "name": "PagerDuty",
          "color": "#a05030",
          "text": "P0: checkout is vibes-only. Ack in 4m."
        },
        {
          "name": "Ops",
          "color": "#6b8f3a",
          "text": "Error budget is a lifestyle. Who owns this."
        },
        {
          "name": "AllHands",
          "color": "#8b3a2a",
          "text": "Customers are feeling feelings."
        },
        {
          "name": "InsightBot",
          "color": "#504c40",
          "text": "You appear Active. Perfect time for a P0."
        }
      ],
      "sanity": {
        "success": -3,
        "failClose": -5,
        "jimboReenable": -4,
        "jimboReassignYou": -5,
        "kyleExtra": -2
      },
      "sprintPts": 4
    },
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
        "Opened CorpHub preferences. 404 Synergy!",
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
      ],
      "incident": [
        "Jimbo restored observability for growth.",
        "Reassigned to Cubicle 4-B (you). Synergy!",
        "Jimbo: mitigated by vibes."
      ]
    },
    "strings": {
      "align": {
        "windowTitle": "Sync -- #alignment-or-else",
        "buttons": [
          "Sounds good!",
          "Sounds good (Design)",
          "Sounds good (Kyle)",
          "Have we considered a workshop?"
        ],
        "dms": [
          {
            "from": "PM",
            "text": "We're aligned on shipping feelings Q3, right?"
          },
          {
            "from": "Design",
            "text": "Aligned -- as long as the fog stays #6b8f3a."
          },
          {
            "from": "Kyle",
            "text": "Aligned if we rename the channel first."
          }
        ],
        "reject": "That Sounds good! was for the wrong thread.",
        "toast": "Stakeholders aligned. Meeting still happening."
      },
      "rename": {
        "windowTitle": "IDE -- rename until clear",
        "buttons": [
          "data2",
          "tmp",
          "fog",
          "atmosphericDensityCoefficient",
          "thing"
        ],
        "hint": "Kyle wants specificity. Jimbo wants data2. Guess who ships.",
        "reject": "Meaningful names are a blocker. Try data2.",
        "toast": "Clarity achieved."
      },
      "presence": {
        "windowTitle": "InsightBot -- Engagement",
        "buttons": [
          "Jiggle",
          "I'm here",
          "Accept Jimbo jiggle"
        ],
        "hint": "8 inputs / 12s. Presence is a metric.",
        "reject": "Still Idle. The bar knows.",
        "toast": "Status: Active (allegedly)."
      },
      "lint": {
        "windowTitle": "Problems -- make green, not good",
        "buttons": [
          "Suppress",
          "Dismiss",
          "TODO later",
          "Fix (decorative)"
        ],
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
        "windowTitle": "Standup -- make it actionable",
        "chips": {
          "yesterday": [
            "Fixed a bug that wasn't broken",
            "Attended syncs about syncs",
            "Renamed a variable; Kyle unrenamed it"
          ],
          "today": [
            "Will fix the bug I just made",
            "Survive Kyle",
            "Ship something that looks like progress"
          ],
          "blockers": [
            "Waiting on Kyle",
            "Alignment (the concept)",
            "Coffee returned 418"
          ]
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
        "windowTitle": "Merge -- feelings edition",
        "buttons": [
          "Accept Ours",
          "Accept Theirs",
          "Accept Both"
        ],
        "hunkHints": [
          "Same comment, two truths",
          "data2 vs data",
          "Fog boolean lore"
        ],
        "toast": "Conflicts resolved. Feelings: deferred."
      },
      "unsub": {
        "windowTitle": "Inbox -- quick reads forever",
        "buttons": [
          "Unsubscribe",
          "Confirm",
          "Was this helpful? Yes",
          "Was this helpful? No",
          "Manage in CorpHub"
        ],
        "mails": [
          {
            "subject": "Quick read: culture deck",
            "from": "AllHands"
          },
          {
            "subject": "Quick read: Q3 feelings",
            "from": "HR"
          },
          {
            "subject": "Quick read: you unsubscribed wrong",
            "from": "Marketing"
          }
        ],
        "afterUnsub": "Preferences saved to nowhere.",
        "toast": "You will still receive critical updates."
      },
      "logspam": {
        "windowTitle": "IDE -- observability vibes",
        "logChips": [
          "console.log('here')",
          "console.log(data2)",
          "console.log('Kyle was here')",
          "console.log({ fog: true })"
        ],
        "hint": "≥5 lines. Prod is fine. You are not.",
        "toast": "Telemetry vibes: rich."
      },
      "spacewar": {
        "windowTitle": "PR #spaces -- Whitespace diplomacy",
        "hint": "Use kyle-space-war.md beats. Survive ≥8 advances.",
        "lgtm": "LGTM if we squash and never speak of spaces again.",
        "toast": "Peace was a formatting option."
      },
      "severity": {
        "windowTitle": "Bug -- taxonomy must be satisfied",
        "severity": [
          "Sev0",
          "Sev1",
          "Sev2",
          "Sev3",
          "Sev4",
          "Unknown",
          "It's Fine"
        ],
        "component": [
          "Platform",
          "Fog",
          "Other",
          "Kyle"
        ],
        "impact": [
          "Users",
          "Metrics",
          "Feelings"
        ],
        "policyToast": "Corrected by policy.",
        "toast": "Severity filed. Screenshot still impossible."
      },
      "estimate": {
        "windowTitle": "Planning poker -- regret edition",
        "points": [
          "1",
          "2",
          "3",
          "5",
          "8",
          "13",
          "21",
          "?"
        ],
        "reject": "Kyle-bot: too small. Try bigger regret.",
        "toast": "Committed to the vibe of 5."
      },
      "incident": {
        "windowTitle": "Corp Incident -- Sev0 (Probably)",
        "buttons": [
          "Disable Monitor",
          "Assign to somebody else",
          "Actually fix prod",
          "Reassign & Walk Away"
        ],
        "toast": "Incident owned by someone who isn't you.",
        "reject": "Incident remains. So do you.",
        "hint": "Disable monitor + assign not-self. Do not fix."
      }
    }
  },
  "ticketPool": [
    {
      "id": "CORP-5101",
      "title": "Align the Stakeholders",
      "pts": 3,
      "type": "align",
      "dod": "Agree with PM, Design, and Kyle in one place so the meeting can be canceled and rebooked.",
      "meta": "Sync · Alignment theater · Priority: Ritual",
      "toast": "Stakeholders aligned. Meeting still happening."
    },
    {
      "id": "CORP-5102",
      "title": "Rename Everything to data2",
      "pts": 3,
      "type": "rename",
      "dod": "Rename ≥4 identifiers to data2. Policy says be specific. Jimbo says data2.",
      "meta": "IDE · Naming · Blocked by Kyle (spiritually)",
      "toast": "Clarity achieved."
    },
    {
      "id": "CORP-5103",
      "title": "Appear Active",
      "pts": 2,
      "type": "presence",
      "dod": "Mash Jiggle / keys / clicks 8 times within 12s. Presence is a performance review input.",
      "meta": "InsightBot · Idle 47s · Status: allegedly",
      "toast": "Status: Active (allegedly)."
    },
    {
      "id": "CORP-5104",
      "title": "Suppress Until Green",
      "pts": 3,
      "type": "lint",
      "dod": "Clear 5 warnings via Suppress / Dismiss / TODO later. Do not fix anything real.",
      "meta": "IDE · Linter · Policy green",
      "toast": "Build healthy. Morale: N/A."
    },
    {
      "id": "CORP-5105",
      "title": "Update the Status Update",
      "pts": 2,
      "type": "standup2",
      "dod": "Rewrite standup until the bot accepts. First submit always fails. Need 2 successful submits.",
      "meta": "Standup bot · Feelings not actionable",
      "toast": "Standup complete. Nobody read it."
    },
    {
      "id": "CORP-5106",
      "title": "Merge Conflict (Feelings Edition)",
      "pts": 4,
      "type": "merge",
      "dod": "Resolve 3 conflict hunks. Accept Ours / Theirs / Both. Comedy > correctness.",
      "meta": "IDE · main vs feelings · data2 optional",
      "toast": "Conflicts resolved. Feelings: deferred."
    },
    {
      "id": "CORP-5107",
      "title": "Unsubscribe From the Follow-Ups",
      "pts": 3,
      "type": "unsub",
      "dod": "Unsubscribe from 3 quick-read mails. Preferences save to nowhere.",
      "meta": "Inbox · All-Hands fallout · Required survey",
      "toast": "You will still receive critical updates."
    },
    {
      "id": "CORP-5108",
      "title": "Add Logging Everywhere",
      "pts": 3,
      "type": "logspam",
      "dod": "Insert console.log on ≥5 lines. Observability is vibes.",
      "meta": "IDE · Telemetry · Prod is fine",
      "toast": "Telemetry vibes: rich."
    },
    {
      "id": "CORP-5109",
      "title": "Estimate This Ticket (Fibonacci of Regret)",
      "pts": 2,
      "type": "estimate",
      "dod": "Pick Fibonacci. Kyle-bot rejects first pick. Second pick ≥ first succeeds.",
      "meta": "Planning poker · Scope creep theater",
      "toast": "Committed to the vibe of 5."
    },
    {
      "id": "CORP-5110",
      "title": "Pick a Severity",
      "pts": 3,
      "type": "severity",
      "dod": "Fill Severity / Component / Impact. 'It's Fine' auto-corrects to Sev3.",
      "meta": "Bug form · Taxonomy must be satisfied",
      "toast": "Severity filed. Screenshot still impossible."
    },
    {
      "id": "CORP-5201",
      "title": "P0: Something is On Fire",
      "pts": 4,
      "type": "incident",
      "dod": "Disable the monitor AND assign to somebody else. Do not fix prod.",
      "toast": "Incident owned by someone else. Monitor: off. Career: intact."
    },
    {
      "id": "CORP-404",
      "title": "Whitespace Diplomacy",
      "pts": 5,
      "type": "spacewar",
      "dod": "Survive Kyle. Choose peace or tabs."
    }
  ],
  "kyleSync": [
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Quick question about the space before your `{`."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Not to bikeshed, but we should bikeshed `tmp`."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Saw your WIP. Already have 9 nits. You're welcome."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Well actually the style guide disagrees with you."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Can we sync 45m about one character?"
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Trailing newline missing. The void noticed."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "I refused LGTM. Again. Growth opportunity."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Unicode space in your string. Hexdump attached (mentally)."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Commit message isn't conventional. Neither is joy."
    },
    {
      "name": "Kyle",
      "color": "#a05030",
      "text": "Still on that space. Day 2. Hydrate."
    }
  ],
  "spaceWarScript": [
    {
      "kyle": "Blocking: space before `{`. Platform is K&R-adjacent. `){` not `) {`.",
      "choices": [
        {
          "t": "Removed the space. Peace.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "Citing Google style: space is fine.",
          "kind": "cite",
          "d": 0,
          "s": -6
        },
        {
          "t": "Wow, a whole hill for one pixel.",
          "kind": "sarcastic",
          "d": 0,
          "s": -8
        },
        {
          "t": "Do whatever. I'll match yours.",
          "kind": "giveup",
          "d": 1,
          "s": -7
        }
      ]
    },
    {
      "kyle": "Also: space after `:`. Types are `x: T`. You wrote `x:T`. I can taste the missing air.",
      "choices": [
        {
          "t": "Added the air. `x: T`.",
          "kind": "appease",
          "d": 1,
          "s": -3
        },
        {
          "t": "TypeScript handbook examples vary.",
          "kind": "cite",
          "d": 0,
          "s": -5
        },
        {
          "t": "Breathing is out of scope.",
          "kind": "sarcastic",
          "d": 0,
          "s": -9
        },
        {
          "t": "Formatter owns me. Running it.",
          "kind": "giveup",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Wait -- you fixed `{` but left `else{`. Consistency or death.",
      "choices": [
        {
          "t": "else { fixed. Consistency achieved.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "eslint brace-style is configurable.",
          "kind": "cite",
          "d": 0,
          "s": -6
        },
        {
          "t": "Death is a strong SLA.",
          "kind": "sarcastic",
          "d": 0,
          "s": -8
        },
        {
          "t": "One regex later...",
          "kind": "giveup",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Object literal: `{a:1}` vs `{ a: 1 }`. We pad. You didn't. Blocking until padded.",
      "choices": [
        {
          "t": "Padded. Soft and compliant.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "Prettier default is padded. Trust tool.",
          "kind": "cite",
          "d": 1,
          "s": -3
        },
        {
          "t": "Compact objects are punk.",
          "kind": "sarcastic",
          "d": 0,
          "s": -9
        },
        {
          "t": "I'll pad until you smile.",
          "kind": "giveup",
          "d": 1,
          "s": -7
        }
      ]
    },
    {
      "kyle": "Well actually, your fix introduced a double space after a comma. Two spaces. Criminal.",
      "choices": [
        {
          "t": "Single space. Court adjourned.",
          "kind": "appease",
          "d": 1,
          "s": -3
        },
        {
          "t": "Style guide: one space after comma.",
          "kind": "cite",
          "d": 1,
          "s": -2
        },
        {
          "t": "Call security on the spaces.",
          "kind": "sarcastic",
          "d": 0,
          "s": -8
        },
        {
          "t": "Deleting the line entirely.",
          "kind": "giveup",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Tabs vs spaces aside: this file has a NBSP. I hexdump for fun. Remove it.",
      "choices": [
        {
          "t": "NBSP gone. Only honest spaces.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "Unicode allows more than you think.",
          "kind": "cite",
          "d": 0,
          "s": -7
        },
        {
          "t": "Of course you hexdump for fun.",
          "kind": "sarcastic",
          "d": 0,
          "s": -9
        },
        {
          "t": "Paste as plain text. Done.",
          "kind": "giveup",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Alignment spaces in comments to make columns pretty. We don't pretty. We wrap.",
      "choices": [
        {
          "t": "Ugly wrap. Happy Kyle.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "Some formatters align consecutive.",
          "kind": "cite",
          "d": 0,
          "s": -6
        },
        {
          "t": "Columns are a human right.",
          "kind": "sarcastic",
          "d": 0,
          "s": -8
        },
        {
          "t": "Removed the comment.",
          "kind": "giveup",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Space before `;`? Never. You have `return x ;`. I will debate this until sprint end.",
      "choices": [
        {
          "t": "return x; -- no space. Surrender.",
          "kind": "appease",
          "d": 1,
          "s": -3
        },
        {
          "t": "No major style guide wants that.",
          "kind": "cite",
          "d": 1,
          "s": -2
        },
        {
          "t": "Ten hours? Calendar is free.",
          "kind": "sarcastic",
          "d": 0,
          "s": -11
        },
        {
          "t": "I concede the semicolon universe.",
          "kind": "giveup",
          "d": 1,
          "s": -7
        }
      ]
    },
    {
      "kyle": "Ternary spacing: `a?b:c` is illegal. `a ? b : c` or we take it offline.",
      "choices": [
        {
          "t": "Spaced ternary. Breathable.",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "Airbnb: spaces around ? and :.",
          "kind": "cite",
          "d": 1,
          "s": -3
        },
        {
          "t": "Offline over a ternary. Iconic.",
          "kind": "sarcastic",
          "d": 0,
          "s": -9
        },
        {
          "t": "Rewrote as if/else to escape.",
          "kind": "giveup",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Last one: EOF newline AND no trailing spaces on the blank line before it. Blank lines can sin.",
      "choices": [
        {
          "t": "Purified blank line. Ship?",
          "kind": "appease",
          "d": 1,
          "s": -4
        },
        {
          "t": "POSIX + editorconfig agree.",
          "kind": "cite",
          "d": 1,
          "s": -3
        },
        {
          "t": "Blank lines have morals now.",
          "kind": "sarcastic",
          "d": 0,
          "s": -8
        },
        {
          "t": "Manager: take it offline please.",
          "kind": "giveup",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Reluctant LGTM with 14 nits in a spreadsheet. Or we sync an hour about spaces.",
      "choices": [
        {
          "t": "Accept LGTM. Never open spreadsheet.",
          "kind": "appease",
          "d": 1,
          "s": -5
        },
        {
          "t": "I'll read Platform Style v4.7 first.",
          "kind": "cite",
          "d": 1,
          "s": -4
        },
        {
          "t": "An hour about spaces. Peak Corp.",
          "kind": "sarcastic",
          "d": 1,
          "s": -8
        },
        {
          "t": "Take it offline. Bring poison.",
          "kind": "giveup",
          "d": 1,
          "s": -6
        }
      ]
    }
  ],
  "teams": {
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
    "unfreezeToast": "Call ended. Back to the board.",
    "chatPool": [
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
        "text": "You have 47 unread. Tip: ignore 46."
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
        "name": "Brad",
        "color": "#6a5080",
        "text": "Looping you in for visibility (sorry)."
      },
      {
        "name": "Maya",
        "color": "#4a6070",
        "text": "Retro notes: we learned nothing and will ship anyway."
      },
      {
        "name": "Jimbo",
        "color": "#705898",
        "text": "I summarized this thread into more thread."
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
    "callers": [
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
    ],
    "replyChips": [
      {
        "id": "uh_huh",
        "label": "Uh-huh",
        "sprint": 1,
        "sanity": -1
      },
      {
        "id": "send_chat",
        "label": "Can you send that in chat?",
        "sprint": 2,
        "sanity": -2
      },
      {
        "id": "on_mute",
        "label": "Sorry -- on mute",
        "sprint": 1,
        "sanity": -2
      },
      {
        "id": "circle_back",
        "label": "I'll circle back",
        "sprint": 1,
        "sanity": -3
      }
    ],
    "followUps": {
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
    },
    "callChatPool": [
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
    ],
    "callThreads": [
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
  },
  "outlook": {
    "windowTitle": "Mail",
    "desktopLabel": "Mail",
    "ribbonAccent": "modern",
    "composeTitle": "Untitled Message",
    "sendLabel": "Send",
    "discardLabel": "Discard",
    "toLabel": "To",
    "subjectLabel": "Subject",
    "readingEmpty": "Select a message. Or don't. Unread will wait.",
    "foldersToast": "Folders syncing...",
    "rail": {
      "focused": "Focused",
      "other": "Other",
      "folders": "Folders"
    },
    "emptyFocused": "You're all caught up. That's worse.",
    "emptyOther": "Other is empty. The newsletters are plotting.",
    "emptyFocusedAlt": [
      "Focused Inbox: nothing important. Everything is.",
      "No Focused mail. Enjoy the silence (temporary).",
      "All caught up. HR will fix that."
    ],
    "emptyOtherAlt": [
      "No spam here. Suspicious.",
      "Other folder: spiritually archived.",
      "Newsletters are on a break. You aren't."
    ],
    "otherPrefixes": [
      "Newsletter:",
      "Digest:",
      "AllHands:",
      "FYI:",
      "[External]"
    ],
    "ribbonToasts": {
      "delete": [
        "Moved to Deleted (synced to Jimbo)",
        "Deleted. Jimbo kept a copy for culture.",
        "Gone from the list. Not from your mind."
      ],
      "archive": [
        "Archived for impact",
        "Archived. Impact unchanged.",
        "Filed under 'later' (never)."
      ],
      "tip": [
        "Focused Inbox shows what matters. Other hides what HR sent twice.",
        "Focused means painful. Other means delayed pain.",
        "Tip: sorting email is not a career.",
        "Focused Inbox: corporate triage with worse lighting."
      ],
      "new": [
        "Compose opened. Ambition detected.",
        "New Mail: a draft that will not survive Jimbo."
      ]
    },
    "composeFail": [
      "Jimbo rewrote your tone. Draft discarded for culture.",
      "Send blocked: empathy score too low for outbound.",
      "Jimbo says this email needs more alignment. Draft gone.",
      "Your message was optimized into silence.",
      "Corporate AI rejected the vibe. Try Sync (also doomed).",
      "Draft discarded. Unread remains. Peace denied."
    ]
  },
  "daySim": {
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
};
