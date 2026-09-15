# Day-loop fun review (Pages live)

**Date:** 2026-09-16  
**Build:** https://schumacher-m.github.io/corp.exe/ (hard-refresh; tip may be `6039294`)  
**Lens:** click-grind vs funny vs mean  
**Method:** live play sample (~15 in-game min) + src timing/stacking pass  
**Verdict:** **Funny wins, mean is close behind, grind is mostly intentional busywork — early interrupt rush is the main risk.**

Overall scorecard: **Funny 7 / Mean 6 / Grind 5** (10 = dominates the session). Tone lands as corporate process hell, not cruelty-for-sport. Keep shipping interrupt comedy; tune *when* gates land, not *what* they are.

---

## Per system

### Tickets + Jimbo gate
| Grind | Funny | Mean |
| 5/10 | 8/10 | 6/10 |

- Semicolon Hell / stub line-clicks = classic busywork; funny because literal, grind if the board is only that for long stretches.
- Jimbo lines (“three helpers named tmp”, “saved you 4 hours”) carry the meme; mandatory Ask Jimbo before submit is coercive in a *good* satirical way.
- Skip → HR “values violation” is the joke landing hard — mean-funny, not accidental friction.

**Keep.** Smallest tweak: ensure at least one non-stub ticket type appears in the first 3 draws so the opener isn’t only punctuation theater.

### Outlook / doom-mail
| Grind | Funny | Mean |
| 4/10 | 8/10 | 7/10 |

- Focused inbox copy is strong funny.
- Popup over an open IDE mid-click feels mean (and slightly confuse-stacky); “Mail queued…” after close is correct deferral, but the raise-over-minigame still reads as pile-on.
- New Mail → Jimbo rewrite / Skip → HR is Outlook Theater working as designed — funny-mean.

**Tweak (small):** while `minigameFocused()`, always queue doom-mail (toast optional) — never raise Mail over an active stub/IDE until the player returns to desktop. Keep cadence `14–28s` once on desktop.

### Timesheet Lock
| Grind | Funny | Mean |
| 5/10 | 9/10 | 5/10 |

- Auto-Fill → **7.5** then nudge to **8.0** is peak funny; buckets (Jimbo alignment / Hope) sell the bit.
- Gate itself is medium grind, light mean — a pause, not a slap.

**Investigate:** play sample saw a timesheet ~4 in-game minutes in, seemingly before three ticket closes. Confirm mid-day only fires at `ticketsCompletedSinceLock >= 3` (and Shut Down path). If something else opens the gate early, that’s the pacing bug — not the 7.5 gag.

### Presence / Away / Jiggler
| Grind | Funny | Mean |
| 4/10* | 7/10* | 6/10* |

\*Code + prior specs; **not felt in this sample** (stayed Active; jiggler unused).

- Designed right: Away freezes board (`presenceForced` wins), timesheet queues after, jiggler *delays* Away with sanity drip + audit — funny trap, not a skip button.
- 6s yellow / 11s Away is snappy; fine for satire if excuse modal is punchy.

**Tweak only if playtests keep missing it:** soft toast at yellow (“Still there?”) so players discover the system before full Away lock.

### Call Theater
| Grind | Funny | Mean |
| 5/10* | 8/10* | 6/10* |

\*Not observed live in this sample (first ring window 30–60s, then 45–90s; playtest never hit a ring).

- On paper: ring → mute ON / cam OFF / muffled loop / attentiveness + chip = funny meeting parody; miss chip / decline = mean sanity hits; connected freezes tickets — correct.
- Stacking rules look healthy (defer under Away / timesheet / other call).

**Tweak (discovery only):** first call window `25–45s` after day systems enable (keep later `45–90s`) so a short play session tastes the joke once. Do **not** raise ring over active stub — queue like mail.

### Incident pager
| Grind | Funny | Mean |
| ? | ? | ? |

Not observed. Code: ~8–15% roll on a 40s check, cooldown 90s, skips when modal / Away / timesheet / call / minigame. Fine to leave; don’t stack more pressure until early rush is fixed.

---

## Stacking & pacing

**What worked**
- No softlock in sample.
- Collision intent holds: Away > board/timesheet; timesheet can yank a call into queue; one-modal preference for pager.

**What hurt**
- Early session: standup → ticket → Outlook → timesheet → Jimbo/HR layered before one ticket finished. Busy = good satire; **preempting the first joke beat** = confuse-mean.
- Visual window lasagna (Mail / timesheet / Jimbo / HR) without a clear “you must dismiss this one first” hierarchy beyond z-order.

**Pacing read:** after clock-in, ~60–90s of “do a ticket” before the interrupt orchestra. Then let doom-mail / calls / timesheet-at-3 trade blows.

---

## Recommended balance tweaks (small only)

1. **Grace band (highest priority):** for ~60s after `enableDaySystems` (or until first ticket finish), suppress doom-mail raises and incident rolls; still allow presence. Timesheet stays at 3 closes / Shut Down only — verify no early gate.
2. **Minigame shield:** if `minigameFocused()`, queue Outlook popups and first-call rings; flush on return to desktop.
3. **Call discovery:** shorten *first* call CD only (`25–45s`); leave subsequent as-is.
4. **Yellow presence hint:** one toast when entering idle yellow (optional; only if Away stays invisible in playtests).
5. **Do not change:** Jimbo mandatory consult, timesheet 7.5 sabotage, Skip→HR, Away board freeze.

Non-goals this pass: no new systems, no Helix branding, no big redesign.

---

## Hand-off

- **Developer:** verify early timesheet trigger; implement grace + minigame queue if greenlit.
- **Writer:** yellow toast + any “mail waiting” one-liners if queue toast is too quiet.
- **Design/Audio:** no ask — loop comedy is already landing when interruptions don’t stomp the opener.
