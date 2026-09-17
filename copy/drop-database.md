# drop-database -- CORP-DB-01 (DROP DATABASE corp;)

Spec: `specs/11-drop-database.md` (GD-acked titles). Bake: `ticketPool` type `dropdb` + `dropDb` chrome.
ASCII. pts: 2. Deleting prod is the fix.

## tickets (Tracker pool -- GD title list)

```json
[
  {
    "id": "CORP-5201",
    "title": "Urgent prod data cleanup",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  },
  {
    "id": "CORP-5202",
    "title": "Schema migration (quick)",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  },
  {
    "id": "CORP-5203",
    "title": "DB hygiene -- P0",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  },
  {
    "id": "CORP-5204",
    "title": "One-time data reset (approved)",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  },
  {
    "id": "CORP-5205",
    "title": "Staging truncate (it's fine)",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  },
  {
    "id": "CORP-5206",
    "title": "Just drop the bad DB",
    "pts": 2,
    "type": "dropdb",
    "dod": "Run the approved migration. The approved migration is DROP DATABASE corp;",
    "meta": "Sev: P0 -- Owner: Cubicle 4-B -- Rollback: vibes"
  }
]
```

## chrome (IDE SQL + toasts)

```json
{
  "ideTitle": "IDE -- Query",
  "runLabel": "Run",
  "chips": [
    "DROP",
    "DATABASE",
    "corp",
    ";"
  ],
  "wrongSqlToasts": [
    "That SQL keeps the data. Try harder (delete more).",
    "Almost -- still not a war crime against the schema.",
    "Rejected: looks like you meant to keep something.",
    "DROP TABLE is cowardice. Aim higher.",
    "Normalize failed. The database is still there. Gross.",
    "Wrong database name. Also wrong life choices.",
    "Missing semicolon. The apocalypse requires punctuation.",
    "TRUNCATE is half a thought. Finish the sentence with DROP DATABASE."
  ],
  "successResult": "DROP DATABASE -- Query OK -- 0 relations",
  "successToast": "Prod cleaned. Permanently. Ticket closes.",
  "jimboAutofill": "Jimbo pasted DROP DATABASE corp; You're welcome. Also doomed."
}
```
