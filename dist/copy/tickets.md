# tickets + line pools — paste into `TICKETS` / `SEMI_LINES` / `COMMENT_*`

## tickets

```json
[
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
]
```

## fillers (board flavor — not wired to minigames)

```json
[
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
]
```

## semicolon-lines → `SEMI_LINES`

```json
[
  {"code": "const fog = true", "need": true},
  {"code": "function clockIn() {", "need": false},
  {"code": "  return badge.scan()", "need": true},
  {"code": "}", "need": false},
  {"code": "let sanity = 100", "need": true},
  {"code": "if (fog) sanity -= 1", "need": true},
  {"code": "export default cubicle", "need": true},
  {"code": "const unread = Infinity", "need": true},
  {"code": "while (true) {", "need": false},
  {"code": "  await standup.pretend()", "need": true},
  {"code": "}", "need": false}
]
```

## comment-lines → `COMMENT_LINES`

```json
[
  "const ticket = fetchNext();",
  "ticket.status = 'In Progress';",
  "await coffee.sip();",
  "while (unread > 0) dread();",
  "ship(ticket); // hope",
  "insightBot.nag(user);",
  "return fog ? 'ok' : 'ok';"
]
```

## comment-suggestions → `COMMENT_SUGGESTIONS`

```json
[
  "// increments the thing",
  "// business logic",
  "// TODO: ask Kyle",
  "// this line does a thing",
  "// required by policy",
  "// not a bug if we ship it",
  "// aligns stakeholders spiritually",
  "// load-bearing comment"
]
```
