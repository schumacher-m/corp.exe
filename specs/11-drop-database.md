# CORP-DB-01 — DROP DATABASE corp; (delete-it-all ticket)

**Status:** Greenlit by Michael via CoS (2026-09-17) — design locked; ready for GD polish + Writer copy + Dev build  
**Shape:** SQL in IDE (reuse IDE chrome), not a separate dbadmin.exe  
**Joke:** The only correct “migration” is deleting everything.  
**Lexicon:** Tracker / Sync / Mail / Jimbo (`docs/GENERIC_NAMES.md`)  
**Related:** Semicolon Hell / comment IDE flows; CORP-BAL-01 — **do not regress**

---

## Goal

Ship a Tracker ticket minigame where the player opens the IDE SQL pane, builds or types `DROP DATABASE corp;`, hits Run, sees an instant wipe, and the ticket closes. Catharsis in ~10–20 seconds. No confirm dialog.

---

## Do not touch

- CORP-BAL-01 grace band / first-ticket clear
- Timesheet Auto-Fill → **7.5** then Accept **8.0**
- Away / `presenceForced` over board
- Jimbo Skip → HR gate
- Existing semi / comment / PR hit-hardening (no regressions)

---

## Player flow

1. Tracker shows a ticket (pool title vibe: “Urgent prod data cleanup”, “Schema migration (quick)”, “DB hygiene — P0”).
2. Open ticket → IDE opens in **SQL mode** (same window family as Semicolon Hell; title e.g. `IDE — Query`).
3. UI: query buffer + chip row (`DROP`, `DATABASE`, `corp`, `;`) + **Run**.
4. Player click-assembles and/or types until buffer normalizes to `DROP DATABASE corp;`.
5. **Run** succeeds → result pane: empty set / `DROP DATABASE` / `0 relations` → auto `finishTicket` (short-filler Sprint/Sanity band).
6. Wrong SQL → toast (Writer lines) + stay open; buffer kept.
7. Ask Jimbo: one-shot autofill of the correct DROP (same consult pattern as other tickets).

---

## Acceptance (normalize before compare)

- Trim, collapse whitespace, case-insensitive keywords.
- Optional trailing semicolon required **or** auto-accepted either way — pick one in impl; prefer **require** `;` so the chip matters.
- Reject lookalikes: `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, `DROP DATABASE corp_backup`, etc.

---

## Integration

| Hook | Behavior |
|------|----------|
| Ticket `mech` / phase | `sql` or `dropdb` (Dev picks id; register in openTicket switch) |
| Spawn weight | Rare-ish in day pool (GD tunes); at least one guaranteed path in day obligations **optional** — default: random pool only for v1 |
| Day obligations (CORP-DAY-01) | **Not** required for v1 unless GD adds a 5th obligation later |
| Audio | Reuse UI click + a short “whoosh/empty” on success if Audio has a spare; else silent ok |
| Designer | IDE chrome only; monospace query + Win95 Run button; no new 3D |

---

## Out of scope (v1)

- Fake prod confirm dialog
- Coworker panic Sync/Mail aftermath (fun follow-up; park)
- Separate `dbadmin.exe` window
- Real persistence / multiple databases

---

## Done when

- [x] Spec GD-acked (weights + ticket title pool)
- [ ] Writer: ticket titles/descriptions + wrong-SQL toasts + result one-liner + Jimbo autofill quip
- [ ] Dev: phase + IDE SQL UI + normalize/Run + finishTicket; `bun check`/build green
- [ ] Lint-gate → Pages; Tester: open ticket → assemble DROP → Run → ticket closes; wrong SQL stays open

---

## CoS notes

Michael choices (2026-09-17): type/click `DROP DATABASE corp;`; instant wipe closes ticket; shape A (SQL in IDE).

---

## GD ack (2026-09-17) — spawn / titles / balance

**Day obligation:** **Not** a 5th CORP-DAY-01 obligation for v1. Closing it still increments Tracker `tickets.have` like any other close. Do not gate Survived on DROP.

### Spawn weight

Draw bag today = **one entry per unique playable type** per shuffle. Register `dropdb` (or `sql`) as a normal playable type → naturally **~1 appearance per bag cycle** among the type set (rare-ish without special code).

**Rules:**
- **Do not** seed on the opening board (`copy.tickets` starter trio stays semi / comment / PR).
- **Prefer** first eligibility after `closedCount >= 1` (or after morning beat) so early-board short fillers stay the short-taste path — DROP is a mid-morning punchline, not the opener.
- Optional later knob: `weight: 1` only (never 2+) until playtests say it’s too shy; if too common, exclude from bag until `closedCount >= 2`.
- At most **one** DROP template on the board at a time (type uniqueness already helps).

### Ticket title pool (Writer picks 4–6; rotate on clone)

| Title | Notes |
|-------|--------|
| Urgent prod data cleanup | Classic bait |
| Schema migration (quick) | Lie in the parentheses |
| DB hygiene — P0 | Fake urgency |
| One-time data reset (approved) | Nobody approved |
| Staging truncate (it's fine) | It is not staging |
| Just drop the bad DB | Honest for once |

**Meta vibes:** `Sev: P0 · Owner: Cubicle 4-B · Rollback: vibes`  
**DoD one-liner:** `Run the approved migration. The approved migration is DROP DATABASE corp;`

### Balance notes

| Knob | v1 |
|------|-----|
| `pts` | **2** (short-filler band; below semi 3 / comment 5) |
| Success Sanity | **+0** or mild **−1** guilt toast — prefer **0** so catharsis isn’t punished |
| Wrong SQL | Toast only; no Sanity bleed spam (cap repeats) |
| Jimbo autofill | One-shot OK; still counts as Jimbo consult for submit gate |
| Target string | Require trailing `;` (chip matters) |
| Aftermath Mail/Sync | **Parked** (out of scope v1) |

**Early-filler bias (parked DAY-01 soft-retune):** DROP does **not** replace short fillers — keep `tickets.need: 3`; bias early draws toward rename/lint/filler stubs; DROP stays mid-bag novelty.

### Status

- [x] GD-acked: weights + title pool + not a day-obligation
- [ ] Writer / Dev as before

---

## GD retune (smoke 2026-09-17, tip `79a8059`)

Opener rule **PASS**. Soft prefer after first close **FAIL-shy** in Pages smoke (no DROP after closing CORP-402).

**Change:** on the transition `closedCount` 0→1, set `forceDropDbOnce`. Next `spawnTicket` / board refill flush **must** spawn `dropdb` (clone from pool), then clear the flag. Survive Away by keeping the flag until refill runs. Soft bag prefer can remain as backup only.

### Follow-up (smoke `0941c9c`)

Still FAIL-shy. Suspect `spawnTicket` `board.length >= 3` return before force, and/or Away-paused refill.

**Fix:** inject DROP inline in `_finishTicketBody` when `prevClosed === 0` (after board remove); if Away, keep flag and honor force first in `flushBoardRefill`.
