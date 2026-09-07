# kyle-pr -- paste into `PR_SCRIPT`

Shape: `{ kyle, choices: [{ t, d: 0|1, s: number }] }`. ``d=`` 1 advances step; `s` is sanity delta (negative = dread). Kyle = Platform rules-lawyer. End on reluctant LGTM / take-it-offline.

## PR beats

```json
[
  {
    "kyle": "Nit: can we rename `fog` to `atmosphericDensityCoefficient`?",
    "choices": [
      { "t": "Sure, I'll rename it.", "d": 1, "s": -5 },
      { "t": "It's a boolean. Fog is fine.", "d": 0, "s": -2 },
      { "t": "I'll add a comment instead.", "d": 1, "s": -3 }
    ]
  },
  {
    "kyle": "This PR adds a blank line. Was that intentional? Please justify in the description.",
    "choices": [
      { "t": "Readability. Removing it.", "d": 1, "s": -4 },
      { "t": "Yes. The blank line is load-bearing.", "d": 0, "s": -8 },
      { "t": "I'll open a follow-up ticket.", "d": 1, "s": -3 }
    ]
  },
  {
    "kyle": "Blocking: commit message doesn't reference the Jira key in the exact format HS-###.",
    "choices": [
      { "t": "Amended. HS-403.", "d": 1, "s": -2 },
      { "t": "The key is in the branch name.", "d": 0, "s": -10 },
      { "t": "Force-pushing a fix.", "d": 1, "s": -6 }
    ]
  },
  {
    "kyle": "Trailing whitespace on line 47. Platform style guide ✏4.2 is not optional.",
    "choices": [
      { "t": "Stripped. CI green.", "d": 1, "s": -3 },
      { "t": "Whitespace is also code.", "d": 0, "s": -7 },
      { "t": "Editorconfig PR incoming.", "d": 1, "s": -4 }
    ]
  },
  {
    "kyle": "Why `let` here? Could this be `const`? Prefer immutability unless mutation is documented.",
    "choices": [
      { "t": "Switched to const.", "d": 1, "s": -2 },
      { "t": "It mutates two lines later.", "d": 1, "s": -5 },
      { "t": "I'll add a DO NOT CONST comment.", "d": 0, "s": -6 }
    ]
  },
  {
    "kyle": "Test plan checkboxes are unchecked. I cannot LGTM unchecked boxes. Policy.",
    "choices": [
      { "t": "Checked the ones I actually ran.", "d": 1, "s": -4 },
      { "t": "Checking all of them spiritually.", "d": 0, "s": -9 },
      { "t": "Added 'N/A — fog interferes'.", "d": 1, "s": -5 }
    ]
  },
  {
    "kyle": "Import order: external packages before internal HelixStack modules. Alphabetize within groups.",
    "choices": [
      { "t": "Reordered. Sorted. Soulless.", "d": 1, "s": -3 },
      { "t": "The bundler does not care.", "d": 0, "s": -8 },
      { "t": "Auto-fix PR as follow-up.", "d": 1, "s": -4 }
    ]
  },
  {
    "kyle": "Magic number `47`. Please extract to a named constant. Prefer `SPRINT_NUMBER_OF_REGRET`.",
    "choices": [
      { "t": "Extracted. Named it Sprint.", "d": 1, "s": -3 },
      { "t": "47 is load-bearing folklore.", "d": 0, "s": -7 },
      { "t": "Constant plus a comment blaming you.", "d": 1, "s": -5 }
    ]
  },
  {
    "kyle": "package-lock.json changed by 14k lines. Was that intentional or did npm look at you funny?",
    "choices": [
      { "t": "Reverted lockfile. Only my deps.", "d": 1, "s": -4 },
      { "t": "Intentional. Embrace entropy.", "d": 0, "s": -11 },
      { "t": "Regenerated with the blessed Node version.", "d": 1, "s": -6 }
    ]
  },
  {
    "kyle": "No screenshots in the PR. For a UI-adjacent change, visual proof is required (even if nothing visible changed).",
    "choices": [
      { "t": "Attached a screenshot of the fog.", "d": 1, "s": -5 },
      { "t": "Nothing visible changed. That's the point.", "d": 0, "s": -8 },
      { "t": "Uploaded Cubicle 4-B webcam still.", "d": 1, "s": -4 }
    ]
  },
  {
    "kyle": "Reluctant LGTM if you squash. Or we take this offline in a 30-min sync that will be 90.",
    "choices": [
      { "t": "Squashing. Merging. Leaving.", "d": 1, "s": -2 },
      { "t": "Take it offline. Bring poison.", "d": 1, "s": -6 },
      { "t": "I'll wait for the sync. Forever.", "d": 1, "s": -8 }
    ]
  }
]
```

## Kyle one-liner pool

```json
[
  "Per Platform guidelines…",
  "Blocking until alphabetized.",
  "Can we bike-shed the variable name?",
  "Nit (but also blocking): period at end of commit subject.",
  "Please rebase onto main. Main is red. Rebase anyway.",
  "I left 23 comments. Most are about spaces.",
  "This is fine. This is not fine. Requesting changes.",
  "LGTM after you undo the LGTM-able parts."
]
```

## Notes for Developer

- `d: 1` advances PR_SCRIPT step; `d: 0` stays/loops with extra dread.
- `s` is sanity delta (negative = dread). Clamp sanity at 0.
- Last beat always advances (`d: 1`) so the player can escape.
- Optional: pipe one-liners into Slack as Kyle during the PR minigame.
- No ableist language; Kyle is a rules-lawyer, not a disability joke.
- Typo in header fixed: paste into `PR_SCRIPT`.
