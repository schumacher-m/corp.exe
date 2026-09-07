# kyle-pr — paste into PR_SCRIPT / Kyle nit pool

Shape: `{ kyle, choices: [{ t, d: 0|1, s: number }] }`
`d: 1` advances; `d: 0` stalls. `s` = sanity delta.
Tone: edgelord rules-lawyer, weaponized pedantry. **No ableist language / disability jokes.**

## PR beats (33)

```json
[
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
    "kyle": "Variable tmp \u2014 bike-shed to ephemeralScratchBufferForTicketFetch?",
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
    "kyle": "Import order wrong. Externals, internals, relative \u2014 alphabetized.",
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
]
```

## Kyle one-liner pool

```json
[
  "Well actually, that space is load-bearing.",
  "I can do this for ten hours. Can you?",
  "Not blocking. (It is blocking.)",
  "Style guide section 0: Kyle is correct.",
  "LGTM after you undo the LGTM-able parts.",
  "Whitespace is a hill. I live here.",
  "Your formatter and I need couples therapy.",
  "Requesting changes on the concept of chill.",
  "Nit (mandatory): stop having fun in diffs.",
  "This is not personal. It is section 3.1.",
  "Approved with feelings. The feelings are no.",
  "I will allow it when pigs fly kebab-case."
]
```

## Notes for Developer

- End sequences on the reluctant LGTM / take-it-offline step.
- Pair with `kyle-space-war.md` for Whitespace diplomacy.
- Optional: fire `kyle-slack.md` lines mid-minigame.
