# corp.exe — generic product names (no trademarks)

Player-facing UI and copy must use these. Internal code ids / asset folders may keep old keys until a dedicated rename pass (do not block Bun on folder renames).

| Was (do not show players) | Use instead | Notes |
|---------------------------|-------------|-------|
| Teams / Slack | **Sync** | Chat + calls window. Title: `Sync`. Desktop: `Sync`. |
| Outlook / Outlook Express | **Mail** | Inbox app. Title: `Mail`. Desktop: `Mail`. Tabs stay Focused / Other. |
| Jira | **Tracker** | Ticket board / key references in dialogue. Keys stay `CORP-####`. |
| Excel | *(avoid)* | Keep `timesheet.xls` vibe; never say Excel / show Excel logo. |
| Windows / Windows 95 | **classic desktop** / **CRT desktop** | Docs may say "Win95-style" for the team; player HUD should not say "Windows". |
| Sims / Simlish | *(don't name)* | Call bed = nonsense babble / muffled babble. Never cite Sims. |
| Microsoft / Fluent / Aero | *(don't name)* | Unbranded purple/blue chrome only. |

Keep: Jimbo, CORP-####, Kyle, generic corp, timesheet.xls (filename vibe).

## Owners
- **Writer:** rewrite player-facing strings in `copy/*.md`, rebake `copy-data.js`.
- **Designer:** window/desktop labels in glyphs/docs → Sync / Mail (no trademark lettermarks).
- **Developer:** player-visible titles/labels from copy packs; internal `teams`/`outlook`/`slack` ids OK for now.
- **Audio:** docs say "babble bed" not Sims; file keys unchanged (`muffledCall`, etc.).
- **Game Designer:** design notes use Sync / Mail / Tracker.

## Gate
Before any master push: `rg -i 'Teams|Outlook|Slack|Jira|Simlish|\\bSims\\b|Windows 95|Excel|Microsoft' copy/ copy-data.js` should only hit intentional comments about the ban, or get cleaned.
