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
    },
    {
      "id": "HS-404",
      "title": "Whitespace diplomacy",
      "pts": 8,
      "type": "spacewar",
      "dod": "Survive Kyle's space war. Do not introduce a second space. Do not win.",
      "meta": "Blocked · Platform · Pedantry Sev-1",
      "toast": "Peace was a formatting option."
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
      "kyle": "Nit: rename fog to atmosphericDensityCoefficient?",
      "choices": [
        {
          "t": "Sure, I will rename it.",
          "d": 1,
          "s": -5
        },
        {
          "t": "It is a boolean. Fog is fine.",
          "d": 0,
          "s": -2
        },
        {
          "t": "I will add a comment instead.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "This PR adds a blank line. Justify in the description.",
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
          "t": "I will open a follow-up ticket.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Blocking: commit message needs Jira key HS-### exactly.",
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
          "t": "Pushing an amended commit.",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "TWO spaces before that brace. Platform 3.1 is one space. Always.",
      "choices": [
        {
          "t": "Fixed to one space.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Well actually, Prettier did that.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Deleting the function out of spite.",
          "d": 0,
          "s": -7
        }
      ]
    },
    {
      "kyle": "Tabs detected. We use spaces. Mixing is a Sev-2 cultural incident.",
      "choices": [
        {
          "t": "Converted. Editor in timeout.",
          "d": 1,
          "s": -5
        },
        {
          "t": "Tabs are finer-grained actually.",
          "d": 0,
          "s": -11
        },
        {
          "t": "expandtab forever. Amen.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Missing trailing newline. POSIX says the universe ends with newline.",
      "choices": [
        {
          "t": "Added the sacred newline.",
          "d": 1,
          "s": -3
        },
        {
          "t": "File ends when I say it ends.",
          "d": 0,
          "s": -10
        },
        {
          "t": "Editorconfig will save us.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Commit subject is not Conventional Commits.",
      "choices": [
        {
          "t": "chore(sanity): pretend this helps",
          "d": 1,
          "s": -4
        },
        {
          "t": "fix: everything",
          "d": 0,
          "s": -8
        },
        {
          "t": "Amended to your exact religion.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Variable tmp — bike-shed to ephemeralScratchBufferForTicketFetch?",
      "choices": [
        {
          "t": "Renamed. Description is the name.",
          "d": 1,
          "s": -6
        },
        {
          "t": "tmp is a classic. Like burnout.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Opening a naming committee ticket.",
          "d": 0,
          "s": -5
        }
      ]
    },
    {
      "kyle": "This is not DRY. Extract doTheThing.",
      "choices": [
        {
          "t": "Extracted. Now nothing is clear.",
          "d": 1,
          "s": -5
        },
        {
          "t": "Duplication is documentation.",
          "d": 0,
          "s": -9
        },
        {
          "t": "DRY after LGTM. (Never.)",
          "d": 0,
          "s": -7
        }
      ]
    },
    {
      "kyle": "Unicode thin space in the string. Remove it.",
      "choices": [
        {
          "t": "Purged. Only boring spaces.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Aesthetic kerning.",
          "d": 0,
          "s": -10
        },
        {
          "t": "Replaced with chaos nbsp.",
          "d": 0,
          "s": -8
        }
      ]
    },
    {
      "kyle": "Zero-width joiner between identifiers. Delete.",
      "choices": [
        {
          "t": "Removed the invisible gremlin.",
          "d": 1,
          "s": -3
        },
        {
          "t": "I do not see anything.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Blame paste from Slack.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Trailing whitespace on line 14. Hook exists for a reason.",
      "choices": [
        {
          "t": "Stripped. Rebased. Praying.",
          "d": 1,
          "s": -3
        },
        {
          "t": "Invisible like our roadmap.",
          "d": 0,
          "s": -7
        },
        {
          "t": "Let the hook yell at me.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Why let if never reassigns? Prefer const. Well actually, always.",
      "choices": [
        {
          "t": "Changed to const.",
          "d": 1,
          "s": -2
        },
        {
          "t": "It reassigns in my heart.",
          "d": 0,
          "s": -9
        },
        {
          "t": "HELIX for a style exception.",
          "d": 0,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Blocking until Test plan has three checkboxes.",
      "choices": [
        {
          "t": "[x] looked [x] believed [x] shipped",
          "d": 1,
          "s": -4
        },
        {
          "t": "The code is the test plan.",
          "d": 0,
          "s": -11
        },
        {
          "t": "Copy-pasting yesterdays plan.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Import order wrong. Externals, internals, relative — alphabetized.",
      "choices": [
        {
          "t": "Reordered. IDE crying.",
          "d": 1,
          "s": -3
        },
        {
          "t": "Imports were fine emotionally.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Sorting and blaming Prettier.",
          "d": 1,
          "s": -2
        }
      ]
    },
    {
      "kyle": "Magic number 3. Extract MAX_RETRY_ATTEMPTS even if used once.",
      "choices": [
        {
          "t": "Extracted. Name longer than line.",
          "d": 1,
          "s": -3
        },
        {
          "t": "Three means three. Poetry.",
          "d": 0,
          "s": -7
        },
        {
          "t": "Comment: three on purpose",
          "d": 0,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Lockfile changed by thousands of lines. Intentional?",
      "choices": [
        {
          "t": "Reverted lockfile.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Intentional. Embrace entropy.",
          "d": 0,
          "s": -11
        },
        {
          "t": "Regenerated with blessed Node.",
          "d": 1,
          "s": -6
        }
      ]
    },
    {
      "kyle": "No screenshot. Visual proof required even if nothing changed.",
      "choices": [
        {
          "t": "Attached three identical greys.",
          "d": 1,
          "s": -3
        },
        {
          "t": "UI is CSS. Imagine it.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Cubicle webcam still uploaded.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Function is 41 lines. Soft max 40. Split or explain.",
      "choices": [
        {
          "t": "Split into two sad functions.",
          "d": 1,
          "s": -5
        },
        {
          "t": "41 is 40 with ambition.",
          "d": 0,
          "s": -10
        },
        {
          "t": "Moved a brace. Cured.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Comment says hack. Rewrite as temporary indefinitely.",
      "choices": [
        {
          "t": "Rewrote. Still a hack.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Honesty is a style guide too.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Deleted the comment.",
          "d": 0,
          "s": -6
        }
      ]
    },
    {
      "kyle": "You used ==. We use ===. Well actually Object.is in spirit.",
      "choices": [
        {
          "t": "Triple equals everywhere.",
          "d": 1,
          "s": -3
        },
        {
          "t": "== coerces like management.",
          "d": 0,
          "s": -9
        },
        {
          "t": "eslint fix and tears.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Branch uses underscores. Prefer kebab-case. Not blocking. (Blocking.)",
      "choices": [
        {
          "t": "Renaming. Goodbye weekend.",
          "d": 1,
          "s": -5
        },
        {
          "t": "Underscores are load-bearing.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Follow-up nobody will schedule.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "TODO without owner. TODOs need an owner or they do not exist.",
      "choices": [
        {
          "t": "TODO(me): never",
          "d": 1,
          "s": -4
        },
        {
          "t": "Assigned to the fog.",
          "d": 0,
          "s": -7
        },
        {
          "t": "Converted to HELIX theater.",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Trailing comma in one place not another. Pick a religion.",
      "choices": [
        {
          "t": "Trailing commas forever.",
          "d": 1,
          "s": -3
        },
        {
          "t": "No trailing commas. Chaos.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Prettier owns my soul now.",
          "d": 1,
          "s": -2
        }
      ]
    },
    {
      "kyle": "You sorted object keys. We do not sort keys. Order is narrative.",
      "choices": [
        {
          "t": "Unsorted to original lore.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Alphabetical is peace.",
          "d": 0,
          "s": -7
        },
        {
          "t": "id first like a peasant.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Changelog tense wrong. Past for users, present internal. This is neither.",
      "choices": [
        {
          "t": "Fixed tense. Time is fake.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Changelog is poetry.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Deleted the changelog line.",
          "d": 0,
          "s": -6
        }
      ]
    },
    {
      "kyle": "Well actually undefined checks should use typeof. Your ?? is cute though.",
      "choices": [
        {
          "t": "typeof it is. Cute revoked.",
          "d": 1,
          "s": -5
        },
        {
          "t": "?? is modern. Like layoffs.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Both. Belt and suspenders.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Spacing around colon wrong. x: T not x :T. I will die on this.",
      "choices": [
        {
          "t": "Fixed. Please do not die.",
          "d": 1,
          "s": -4
        },
        {
          "t": "I will debate you for 10 hours.",
          "d": 0,
          "s": -12
        },
        {
          "t": "Running the formatter you wrote.",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "PR links Confluence. Link is stale. Stale links are lying.",
      "choices": [
        {
          "t": "Updated to a different stale link.",
          "d": 1,
          "s": -4
        },
        {
          "t": "Confluence is a state of mind.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Removed link. Tribal knowledge.",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "You refactored while fixing. Scope creep. Split the PR.",
      "choices": [
        {
          "t": "Splitting. Two PRs, double Kyle.",
          "d": 1,
          "s": -6
        },
        {
          "t": "It is all one vibe.",
          "d": 0,
          "s": -10
        },
        {
          "t": "Reverting the improvements.",
          "d": 1,
          "s": -4
        }
      ]
    },
    {
      "kyle": "Nit: period at end of commit subject. We do not use periods. Period.",
      "choices": [
        {
          "t": "Removed period period",
          "d": 1,
          "s": -3
        },
        {
          "t": "Grammar is not optional.",
          "d": 0,
          "s": -9
        },
        {
          "t": "Subject is now a haiku",
          "d": 1,
          "s": -5
        }
      ]
    },
    {
      "kyle": "Requesting changes on the emoji in the commit. Platform means no.",
      "choices": [
        {
          "t": "Emoji deleted. Joy deleted.",
          "d": 1,
          "s": -4
        },
        {
          "t": "The rocket was load-bearing.",
          "d": 0,
          "s": -8
        },
        {
          "t": "Replaced with (ship)",
          "d": 1,
          "s": -3
        }
      ]
    },
    {
      "kyle": "Fine. LGTM with nits. Taking the rest offline in a 45m sync. Hold merge.",
      "choices": [
        {
          "t": "Thanks. I will wait in the fog.",
          "d": 1,
          "s": -6
        },
        {
          "t": "Shipping when checks are green.",
          "d": 0,
          "s": -12
        },
        {
          "t": "Calendar invite: crying.",
          "d": 1,
          "s": -4
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
    },
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
      ],
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
      "estimate": [
        "Voted 21 for you. Ambitious!",
        "Kyle-bot rejected your 3. I added a 0.",
        "Converted points to vibes. Unestimated."
      ],
      "severity": [
        "Set Sev0 and paged #all-hands. Oops! Love that.",
        "Component is now Kyle. Impact: Feelings.",
        "Changed It's Fine to Sev0. Policy is spice."
      ],
      "filler": [
        "Documented the wrong ticket with confidence.",
        "Closed and reopened the filler. Loop complete!",
        "I marked it done in a parallel universe."
      ],
      "spacewar": [
        "Both is fine! (Reformatted to tabs AND spaces.)",
        "Invented space2. Kyle has entered the chat harder.",
        "Posted 'just use Prettier' then disabled Prettier."
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
  },
  "ticketPool": [
    {
      "id": "HELIX-5101",
      "title": "Align the Stakeholders",
      "pts": 3,
      "type": "align",
      "dod": "Agree with PM, Design, and Kyle in one place so the meeting can be canceled and rebooked.",
      "meta": "Slack · Alignment theater · Priority: Ritual",
      "toast": "Stakeholders aligned. Meeting still happening."
    },
    {
      "id": "HELIX-5102",
      "title": "Rename Everything to data2",
      "pts": 3,
      "type": "rename",
      "dod": "Rename ≥4 identifiers to data2. Policy says be specific. Jimbo says data2.",
      "meta": "IDE · Naming · Blocked by Kyle (spiritually)",
      "toast": "Clarity achieved."
    },
    {
      "id": "HELIX-5103",
      "title": "Appear Active",
      "pts": 2,
      "type": "presence",
      "dod": "Mash Jiggle / keys / clicks 8 times within 12s. Presence is a performance review input.",
      "meta": "InsightBot · Idle 47s · Status: allegedly",
      "toast": "Status: Active (allegedly)."
    },
    {
      "id": "HELIX-5104",
      "title": "Suppress Until Green",
      "pts": 3,
      "type": "lint",
      "dod": "Clear 5 warnings via Suppress / Dismiss / TODO later. Do not fix anything real.",
      "meta": "IDE · Linter · Policy green",
      "toast": "Build healthy. Morale: N/A."
    },
    {
      "id": "HELIX-5105",
      "title": "Update the Status Update",
      "pts": 2,
      "type": "standup2",
      "dod": "Rewrite standup until the bot accepts. First submit always fails. Need 2 successful submits.",
      "meta": "Standup bot · Feelings not actionable",
      "toast": "Standup complete. Nobody read it."
    },
    {
      "id": "HELIX-5106",
      "title": "Merge Conflict (Feelings Edition)",
      "pts": 4,
      "type": "merge",
      "dod": "Resolve 3 conflict hunks. Accept Ours / Theirs / Both. Comedy > correctness.",
      "meta": "IDE · main vs feelings · data2 optional",
      "toast": "Conflicts resolved. Feelings: deferred."
    },
    {
      "id": "HELIX-5107",
      "title": "Unsubscribe From the Follow-Ups",
      "pts": 3,
      "type": "unsub",
      "dod": "Unsubscribe from 3 quick-read mails. Preferences save to nowhere.",
      "meta": "Inbox · All-Hands fallout · Required survey",
      "toast": "You will still receive critical updates."
    },
    {
      "id": "HELIX-5108",
      "title": "Add Logging Everywhere",
      "pts": 3,
      "type": "logspam",
      "dod": "Insert console.log on ≥5 lines. Observability is vibes.",
      "meta": "IDE · Telemetry · Prod is fine",
      "toast": "Telemetry vibes: rich."
    },
    {
      "id": "HELIX-5109",
      "title": "Estimate This Ticket (Fibonacci of Regret)",
      "pts": 2,
      "type": "estimate",
      "dod": "Pick Fibonacci. Kyle-bot rejects first pick. Second pick ≥ first succeeds.",
      "meta": "Planning poker · Scope creep theater",
      "toast": "Committed to the vibe of 5."
    },
    {
      "id": "HELIX-5110",
      "title": "Pick a Severity",
      "pts": 3,
      "type": "severity",
      "dod": "Fill Severity / Component / Impact. 'It's Fine' auto-corrects to Sev3.",
      "meta": "Bug form · Taxonomy must be satisfied",
      "toast": "Severity filed. Screenshot still impossible."
    },
    {
      "id": "HS-404",
      "title": "Whitespace diplomacy",
      "pts": 8,
      "type": "spacewar",
      "dod": "Survive Kyle's space war. Do not introduce a second space. Do not win.",
      "meta": "Blocked · Platform · Pedantry Sev-1",
      "toast": "Peace was a formatting option."
    }
  ],
  "kyleSlack": [
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
      "kyle": "Wait — you fixed `{` but left `else{`. Consistency or death.",
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
          "t": "return x; — no space. Surrender.",
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
          "t": "An hour about spaces. Peak HelixStack.",
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
  "ticketStrings": {
    "align": {
      "windowTitle": "Slack — #alignment-or-else",
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
          "text": "Aligned — as long as the fog stays #6b8f3a."
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
      "windowTitle": "IDE — rename until clear",
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
      "windowTitle": "InsightBot — Engagement",
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
      "windowTitle": "Problems — make green, not good",
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
      "windowTitle": "Standup — make it actionable",
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
      "windowTitle": "Merge — feelings edition",
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
      "windowTitle": "Inbox — quick reads forever",
      "buttons": [
        "Unsubscribe",
        "Confirm",
        "Was this helpful? Yes",
        "Was this helpful? No",
        "Manage in HelixHub"
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
      "windowTitle": "IDE — observability vibes",
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
      "windowTitle": "PR #spaces — Whitespace diplomacy",
      "hint": "Use kyle-space-war.md beats. Survive ≥8 advances.",
      "lgtm": "LGTM if we squash and never speak of spaces again.",
      "toast": "Peace was a formatting option."
    },
    "severity": {
      "windowTitle": "Bug — taxonomy must be satisfied",
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
      "windowTitle": "Planning poker — regret edition",
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
    }
  }
};
