# kyle-space-war — Whitespace diplomacy minigame

Ticket vibe: PR is literally about spaces (`){` vs `) {`, `x: T` vs `x:T`, tabs, NBSP, ternaries).

Player reply kinds: `appease` | `cite` | `sarcastic` | `giveup`  
Suggested: appease/cite often advance; sarcastic often stalls; giveup advances with bigger sanity hit.  
End: reluctant LGTM with nits **or** manager take-it-offline.  
HARD: no ableist language — comedy is pedantry only.

```json
[
  {
    "kyle": "Blocking: space before `{`. Platform is K&R-adjacent. `){` not `) {`.",
    "choices": [
      {"t": "Removed the space. Peace.", "kind": "appease", "d": 1, "s": -4},
      {"t": "Citing Google style: space is fine.", "kind": "cite", "d": 0, "s": -6},
      {"t": "Wow, a whole hill for one pixel.", "kind": "sarcastic", "d": 0, "s": -8},
      {"t": "Do whatever. I'll match yours.", "kind": "giveup", "d": 1, "s": -7}
    ]
  },
  {
    "kyle": "Also: space after `:`. Types are `x: T`. You wrote `x:T`. I can taste the missing air.",
    "choices": [
      {"t": "Added the air. `x: T`.", "kind": "appease", "d": 1, "s": -3},
      {"t": "TypeScript handbook examples vary.", "kind": "cite", "d": 0, "s": -5},
      {"t": "Breathing is out of scope.", "kind": "sarcastic", "d": 0, "s": -9},
      {"t": "Formatter owns me. Running it.", "kind": "giveup", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Wait — you fixed `{` but left `else{`. Consistency or death.",
    "choices": [
      {"t": "else { fixed. Consistency achieved.", "kind": "appease", "d": 1, "s": -4},
      {"t": "eslint brace-style is configurable.", "kind": "cite", "d": 0, "s": -6},
      {"t": "Death is a strong SLA.", "kind": "sarcastic", "d": 0, "s": -8},
      {"t": "One regex later...", "kind": "giveup", "d": 1, "s": -6}
    ]
  },
  {
    "kyle": "Object literal: `{a:1}` vs `{ a: 1 }`. We pad. You didn't. Blocking until padded.",
    "choices": [
      {"t": "Padded. Soft and compliant.", "kind": "appease", "d": 1, "s": -4},
      {"t": "Prettier default is padded. Trust tool.", "kind": "cite", "d": 1, "s": -3},
      {"t": "Compact objects are punk.", "kind": "sarcastic", "d": 0, "s": -9},
      {"t": "I'll pad until you smile.", "kind": "giveup", "d": 1, "s": -7}
    ]
  },
  {
    "kyle": "Well actually, your fix introduced a double space after a comma. Two spaces. Criminal.",
    "choices": [
      {"t": "Single space. Court adjourned.", "kind": "appease", "d": 1, "s": -3},
      {"t": "Style guide: one space after comma.", "kind": "cite", "d": 1, "s": -2},
      {"t": "Call security on the spaces.", "kind": "sarcastic", "d": 0, "s": -8},
      {"t": "Deleting the line entirely.", "kind": "giveup", "d": 1, "s": -6}
    ]
  },
  {
    "kyle": "Tabs vs spaces aside: this file has a NBSP. I hexdump for fun. Remove it.",
    "choices": [
      {"t": "NBSP gone. Only honest spaces.", "kind": "appease", "d": 1, "s": -4},
      {"t": "Unicode allows more than you think.", "kind": "cite", "d": 0, "s": -7},
      {"t": "Of course you hexdump for fun.", "kind": "sarcastic", "d": 0, "s": -9},
      {"t": "Paste as plain text. Done.", "kind": "giveup", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Alignment spaces in comments to make columns pretty. We don't pretty. We wrap.",
    "choices": [
      {"t": "Ugly wrap. Happy Kyle.", "kind": "appease", "d": 1, "s": -4},
      {"t": "Some formatters align consecutive.", "kind": "cite", "d": 0, "s": -6},
      {"t": "Columns are a human right.", "kind": "sarcastic", "d": 0, "s": -8},
      {"t": "Removed the comment.", "kind": "giveup", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Space before `;`? Never. You have `return x ;`. I will debate this until sprint end.",
    "choices": [
      {"t": "return x; — no space. Surrender.", "kind": "appease", "d": 1, "s": -3},
      {"t": "No major style guide wants that.", "kind": "cite", "d": 1, "s": -2},
      {"t": "Ten hours? Calendar is free.", "kind": "sarcastic", "d": 0, "s": -11},
      {"t": "I concede the semicolon universe.", "kind": "giveup", "d": 1, "s": -7}
    ]
  },
  {
    "kyle": "Ternary spacing: `a?b:c` is illegal. `a ? b : c` or we take it offline.",
    "choices": [
      {"t": "Spaced ternary. Breathable.", "kind": "appease", "d": 1, "s": -4},
      {"t": "Airbnb: spaces around ? and :.", "kind": "cite", "d": 1, "s": -3},
      {"t": "Offline over a ternary. Iconic.", "kind": "sarcastic", "d": 0, "s": -9},
      {"t": "Rewrote as if/else to escape.", "kind": "giveup", "d": 1, "s": -6}
    ]
  },
  {
    "kyle": "Last one: EOF newline AND no trailing spaces on the blank line before it. Blank lines can sin.",
    "choices": [
      {"t": "Purified blank line. Ship?", "kind": "appease", "d": 1, "s": -4},
      {"t": "POSIX + editorconfig agree.", "kind": "cite", "d": 1, "s": -3},
      {"t": "Blank lines have morals now.", "kind": "sarcastic", "d": 0, "s": -8},
      {"t": "Manager: take it offline please.", "kind": "giveup", "d": 1, "s": -5}
    ]
  },
  {
    "kyle": "Reluctant LGTM with 14 nits in a spreadsheet. Or we sync an hour about spaces.",
    "choices": [
      {"t": "Accept LGTM. Never open spreadsheet.", "kind": "appease", "d": 1, "s": -5},
      {"t": "I'll read Platform Style v4.7 first.", "kind": "cite", "d": 1, "s": -4},
      {"t": "An hour about spaces. Peak HelixStack.", "kind": "sarcastic", "d": 1, "s": -8},
      {"t": "Take it offline. Bring poison.", "kind": "giveup", "d": 1, "s": -6}
    ]
  }
]
```

## Suggested ticket shell

```json
{
  "id": "HS-404",
  "title": "Whitespace diplomacy",
  "pts": 8,
  "type": "pr",
  "dod": "Survive Kyle's space war. Do not introduce a second space. Do not win.",
  "meta": "Blocked · Platform · Pedantry Sev-1"
}
```

## Runtime (Dev)

- Deal **5** beats per PR run, sampled at random from this pool. Keep the full bank in copy — do not truncate the file.
