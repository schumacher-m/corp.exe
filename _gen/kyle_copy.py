#!/usr/bin/env python3
# Generate Kyle copy md files
import json
from pathlib import Path
OUT = Path("/workspace/corp-html/copy")

PR_BEATS = [
  {
    "kyle": "Nit: space before `{` on line 12. Platform style is `){` not `) {`. I measured both.",
    "choices": [
      {"t": "Removed the space. My soul too.", "d": 1, "s": -4},
      {"t": "The space is load-bearing readability.", "d": 0, "s": -8},
      {"t": "I'll match Prettier and blame Prettier.", "d": 1, "s": -3}
    ]
  },
  {
    "kyle": "Blocking: this file has tabs. We use spaces. Exactly two. Not four. Not 'whatever your editor felt'.",
    "choices": [
      {"t": "Converted tabs to two spaces.", "d": 1, "s": -3},
      {"t": "Tabs are semantic. Spaces are vibes.", "d": 0, "s": -9},
      {"t": "editorconfig + reformat. Never speak of this.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Missing trailing newline at EOF. POSIX is not a suggestion. Neither is my patience.",
    "choices": [
      {"t": "Added the newline. Felt nothing.", "d": 1, "s": -2},
      {"t": "EOF is a state of mind.", "d": 0, "s": -7},
      {"t": "Fix + CI check so this never happens again.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Commit subject is not Conventional Commits. Wanted: `fix(fog): …`. Got: poetry.",
    "choices": [
      {"t": "Rewrote as fix(platform): survive review.", "d": 1, "s": -3},
      {"t": "The poem was the point.", "d": 0, "s": -10},
      {"t": "Amended. Squashed. Spirit broken.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Can we bikeshed the name `tmp`? Suggest `transientScratchBufferForIngressPath`. Clarity > brevity.",
    "choices": [
      {"t": "Renamed to the essay you wanted.", "d": 1, "s": -6},
      {"t": "tmp is a classic. Classics are policy.", "d": 0, "s": -8},
      {"t": "Renamed to data2. Jimbo approved.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "This isn't DRY. You duplicated three lines that could be a helper named `doTheThingAgainButShared`.",
    "choices": [
      {"t": "Extracted helper. Added two wrappers.", "d": 1, "s": -5},
      {"t": "WET is fine when the fog is wetter.", "d": 0, "s": -9},
      {"t": "Shared helper + unit test + regret.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Unicode thin space (U+2009) between tokens on line 31. Looks like a space. Is not a space. I noticed.",
    "choices": [
      {"t": "Replaced with boring ASCII space.", "d": 1, "s": -4},
      {"t": "Thin spaces are haute couture.", "d": 0, "s": -11},
      {"t": "Normalized unicode. Added lint rule.", "d": 1, "s": -6}
    ]
  },
  {
    "kyle": "Zero-width joiner in the string literal. Unless this is emoji family planning, remove it.",
    "choices": [
      {"t": "Removed ZWJ. Strings are mortal again.", "d": 1, "s": -3},
      {"t": "It joins my will to live.", "d": 0, "s": -8},
      {"t": "Stripped invisibles; hex-dumped the rest.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "`==` vs `===`. Loose equality is how bugs socialize. Please be strict. Like me.",
    "choices": [
      {"t": "Switched to === everywhere.", "d": 1, "s": -2},
      {"t": "== is friendlier. Like a trap.", "d": 0, "s": -7},
      {"t": "=== plus eslint eqeqeq: error.", "d": 1, "s": -3}
    ]
  },
  {
    "kyle": "This function is 48 lines. Soft limit is 40. Soft limits are hard when I am reviewing.",
    "choices": [
      {"t": "Split into three gloomy helpers.", "d": 1, "s": -4},
      {"t": "48 is basically 40 with overtime.", "d": 0, "s": -9},
      {"t": "Extracted; each helper now 39 lines.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "TODO without an owner. TODOs are not wishes. Assign `@kyle` or delete the fantasy.",
    "choices": [
      {"t": "Assigned to me. Owning the dread.", "d": 1, "s": -3},
      {"t": "TODO is self-owning. Philosophy.", "d": 0, "s": -8},
      {"t": "Converted TODO to ticket HS-regret.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Trailing commas in the object. We allow them in multi-line only. This is single-line. Chaos.",
    "choices": [
      {"t": "Removed trailing comma. Conformity achieved.", "d": 1, "s": -2},
      {"t": "Trailing commas prevent future pain.", "d": 0, "s": -6},
      {"t": "Multi-lined the object so the comma is legal.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Object key order differs from the schema doc. Alphabetical within groups. `zIndex` before `alpha` is violence.",
    "choices": [
      {"t": "Reordered keys to match the sacred schema.", "d": 1, "s": -4},
      {"t": "Engines don't care about key order.", "d": 0, "s": -9},
      {"t": "Sorted + snapshot test. Never again.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Changelog entry uses present tense. We use past tense. `Fixed` not `Fix`. Grammar is Platform.",
    "choices": [
      {"t": "Past-tensified the changelog.", "d": 1, "s": -2},
      {"t": "Present tense lives in the now.", "d": 0, "s": -7},
      {"t": "Rewrote as Fixed fog-adjacent despair.", "d": 1, "s": -3}
    ]
  },
  {
    "kyle": "`typeof x === 'undefined'` when `x ?? fallback` would suffice. Prefer nullish. Prefer me being right.",
    "choices": [
      {"t": "Switched to ??. Feels modern and empty.", "d": 1, "s": -3},
      {"t": "typeof is explicit. Like a court stenographer.", "d": 0, "s": -8},
      {"t": "?? with a comment citing your Slack thread.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Space around `:` in the type annotation is inconsistent. `foo: Bar` not `foo:Bar`. I will die on this colon.",
    "choices": [
      {"t": "Normalized colon spacing. Colonized.", "d": 1, "s": -3},
      {"t": "The colon does not need personal space.", "d": 0, "s": -8},
      {"t": "Prettier --write. I no longer choose.", "d": 1, "s": -2}
    ]
  },
  {
    "kyle": "PR links to a Confluence page last edited in 2019. That page redirects to a page that 404s into a wiki ghost.",
    "choices": [
      {"t": "Updated link to the living doc (barely).", "d": 1, "s": -4},
      {"t": "Ghost docs are still docs.", "d": 0, "s": -9},
      {"t": "Inline the relevant paragraph; kill the link.", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Scope creep: this PR also renames a folder, touches CI, and invents a feature flag. One concern per PR. Policy §∞.",
    "choices": [
      {"t": "Split into three PRs. Triple the reviews.", "d": 1, "s": -6},
      {"t": "It's all one vibe. Ship the vibe.", "d": 0, "s": -11},
      {"t": "Reverted extras; flag in follow-up.", "d": 1, "s": -4}
    ]
  },
  {
    "kyle": "Commit subject ends with a period. Subjects are titles, not sentences. Periods are for body text and arguments.",
    "choices": [
      {"t": "Removed the period. Felt unfinished.", "d": 1, "s": -2},
      {"t": "I punctuate my suffering.", "d": 0, "s": -7},
      {"t": "Amended subject; period relocated to body.", "d": 1, "s": -3}
    ]
  },
  {
    "kyle": "Emoji in the commit message. Platform emoji ban §7. Joy is a production incident.",
    "choices": [
      {"t": "Removed emoji. Monochrome forever.", "d": 1, "s": -3},
      {"t": "The rocket was load-bearing morale.", "d": 0, "s": -10},
      {"t": "Replaced with [deploy] ASCII. Bleak.", "d": 1, "s": -4}
    ]
  },
