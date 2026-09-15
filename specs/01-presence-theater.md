# SPEC — Presence Theater (Appear Active improvement)

**Priority:** 1 (ship first)  
**Size:** S  
**Owners:** Developer (logic/UI), Writer (copy), Designer (optional Start glyph), Audio (optional quiet jiggler tick)  
**Branding:** anonymous generic corp / Corp. Ticket IDs use `CORP-####` if referenced.
**Hooks into:** `win95.js` presence (`active` | `yellow` | `away`), `IDLE_YELLOW=6`, `IDLE_AWAY=11`, `forceAwayMail()`, Start menu, Jimbo toasts

---

## Fantasy
The company does not care if you work. It cares that you *look* online. Idle already flips Active → Idle → Away + mandatory mail. Presence Theater adds status theater, excuse buttons, and Jimbo’s Mouse Jiggler — a fake fix that taxes Sanity.

## States (extend existing)
| State | Taskbar | Trigger | Notes |
|-------|---------|---------|-------|
| `active` | green Active | input / dismiss / jiggler pulse | unchanged |
| `yellow` | yellow Idle | `idleAcc >= 6` | **new:** status chip clickable |
| `away` | red Away | `idleAcc >= 11` | force presence modal (improved) |
| `jigglerOn` (flag) | still shows Active while jiggling | Start → Jimbo Mouse Jiggler | once per day; does **not** delete Away forever |

Flags:
- `presenceStatus`: `null | meeting | heads_down | strategic | bathroom` (set only while Idle/optional sticky while Active)
- `jigglerInstalled`: bool, resets each day at `enableDaySystems`
- `jigglerAuditArmed`: bool — after ~45–90s of jiggler masking idle, 15% chance one-shot HR doom-mail “suspicious activity pattern”
- Keep `presenceForced` gate as today

## Player verbs
1. **Idle chip (yellow):** click taskbar Idle → small status popover (4 buttons). Picking a status does **not** reset `idleAcc`; it only changes the Idle label (e.g. “Idle · Meeting”). Cosmetic + comedy; Away still fires on timer.
2. **Away modal:** replace single `Dismiss` with **excuse buttons** (required click). One click closes modal, marks mail read, clears `presenceForced`, resets to Active.
3. **Start → Jimbo Mouse Jiggler:** install once/day. While on: every real second without input, `idleAcc` is clamped below `IDLE_YELLOW` (or periodically call soft bump that does **not** count as player activity for other systems). Sanity −1 every ~8s while jiggler is masking. Player can uninstall via same Start item (toggle off).
4. **Real input** always `bumpActivity()` as today and clears yellow/away unless `presenceForced`.

## Win / fail
- **Soft win:** pick a cheap excuse → resume work (Sanity cost paid).
- **Fail (expensive honesty):** pick high-cost excuse → bigger Sanity hit, same resume.
- **Jiggler “win”:** stay Active without moving — slow Sanity drip; rare audit mail (doom, not presence-forced).
- **Hard rule:** jiggler **delays** Away only. If player turns jiggler off while `idleAcc` would already be past Away, fire Away immediately. Jiggler never auto-dismisses a forced presence modal.

## Excuse buttons (Away modal)
Replace `buttons: [{ Dismiss }]` with 4 actions. Apply Sanity **instead of** (or on top of — prefer **replace**) the flat `mail.sanity` hit: charge the excuse cost once on click; do not double-dip mail.sanity if using excuse costs.

| id | Label (Writer may punch up) | Sanity |
|----|-----------------------------|--------|
| `meeting` | I was in a meeting | −4 |
| `heads_down` | I was heads-down | −6 |
| `strategic` | I was thinking strategically | −8 |
| `nowhere` | I was nowhere | −14 |

After click: same cleanup as today’s `dismiss-away` (mail read/opened, clear forced, Active, idleAcc=0). Optional Jimbo toast ~40%: “Presence reconciled.”

## Jimbo
- Start item: `Jimbo Mouse Jiggler` (id `jiggler`).
- On install toast: “Jimbo optimized your presence!”
- While masking: quiet optional SFX (no spam); never claim real progress.
- Existing 50% “I jiggled your mouse for you!” on Away: keep only if jiggler is **off**; if jiggler **on**, prefer “Jiggler was already on. Interesting.”
- Skip jiggler + go Away: Jimbo may still mark mail read on dismiss (existing `markedRead` flavor ok on toast).

## Sanity / Sprint
- Excuses: table above. No Sprint reward for presence lies.
- Jiggler: −1 Sanity / ~8s while actively masking; clamp Sanity at 0.
- Audit mail: Sanity −5..−8 (Writer), normal doom path (not `presenceForced`).
- Sprint: **0** from this feature.

## Frequency / tuning
- Timers stay 6s / 11s.
- Status popover: only when `presence === yellow` (or always show last status on badge — Dev choice; prefer Idle-only).
- Jiggler: 1 install/day; audit at most once/day.
- Away force still pauses doom-mail timer via `presenceForced` as today.

## Out of scope
- Free-text status. Click-to-walk. Changing Kyle/Jimbo ticket gates. Ableist or bathroom-shame jokes beyond the strategic-bathroom corporate euphemism.

## Acceptance
- [ ] Idle shows clickable status options without resetting Away timer
- [ ] Away modal requires an excuse; each has distinct Sanity cost
- [ ] Jiggler keeps badge Active, drains Sanity, can still hit Away if turned off late
- [ ] Audit mail can fire once while jiggling; does not softlock
- [ ] No ableist copy
