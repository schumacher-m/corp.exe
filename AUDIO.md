# corp.exe Audio Pack

Original synthesized BGM + SFX for corp.exe (PS1–Win95 cubicle-farm / generic corporate software-dev aesthetic).  
**No copyrighted stems or samples** — everything is generated with NumPy (+ light bitcrush / downsample) and encoded with ffmpeg (`libvorbis` for OGG).

**Mute:** All playback must respect `state.muted` in `game.js` (mute button currently toggles toast-only mute). When muted, pause/stop BGM and skip SFX (or set gain to 0).

**Regen:** From repo root (or `corp-html/`):

```bash
python3 audio/generate_audio.py
# prefers /workspace/.venv if scipy is installed there:
#   /workspace/.venv/bin/python audio/generate_audio.py
```

Requires: `python3`, `numpy`, `scipy`, `ffmpeg` (`libvorbis`).

Load paths are relative to the game HTML root: `audio/<filename>`.

---

## BGM (loopable OGG)

Crossfade or equal-power fade (~400–800 ms) when switching phase. Keep BGM quieter than SFX so UI cuts through. Suggested default BGM volume: **0.35–0.45**. Make loopable elements use `audio.loop = true`.

| File | Phase / when | Loop | Notes |
|------|----------------|------|-------|
| `audio/bgm-cubicle-walk.ogg` | **Cubicle walk** — empty office roam before sitting | Yes | HVAC drone, fluorescent hum, distant printer chatter, sparse lonely notes. ~72 s. |
| `audio/bgm-seated-desktop.ogg` | **Seated desktop** — the daily grind / coding loop | Yes | Muted, repetitive, slightly detuned / off-kilter tracker ostinato. ~68 s. |
| `audio/bgm-pr-fight.ogg` | **PR fight / minigames** — review combat, tense tasks | Yes | Slightly more tense cheap tracker; still not cinematic. ~64 s. |

Suggested hook:

```js
// Web Audio or HTMLAudioElement — respect state.muted
const bgm = {
  walk: new Audio("audio/bgm-cubicle-walk.ogg"),
  desk: new Audio("audio/bgm-seated-desktop.ogg"),
  pr:   new Audio("audio/bgm-pr-fight.ogg"),
};
Object.values(bgm).forEach(a => { a.loop = true; a.volume = 0.4; });

function playBgm(key) {
  if (state.muted) return;
  // stop others, optional crossfade, then play bgm[key]
}
```

On phase change (walk → seated → PR fight): fade out current, fade in next. On mute: `pause()` all BGM and remember which was active so unmute can resume.

---

## SFX (WAV one-shots, 16-bit PCM mono 44.1 kHz)

Suggested default SFX volume: **0.55–0.75** (CRT whine quieter: **~0.25–0.35**). Prefer cloning/`new Audio()` per play or Web Audio buffer nodes so overlaps work (Sync chat pings never wait).

### Movement / body

| File | When | Loop |
|------|------|------|
| `audio/sfx-footstep-01.wav` | Cubicle walk footfalls (rotate 01–03) | No |
| `audio/sfx-footstep-02.wav` | Cubicle walk footfalls variant | No |
| `audio/sfx-footstep-03.wav` | Cubicle walk footfalls variant | No |
| `audio/sfx-chair-sit.wav` | Transition walk → seated (sit + creak) | No |

### CRT / boot

| File | When | Loop |
|------|------|------|
| `audio/sfx-crt-power-on.wav` | Monitor / boot power-on | No |
| `audio/sfx-crt-whine.wav` | Brief CRT coil whine after power-on or idle sting | No |

**Safety:** `sfx-crt-whine.wav` is short (~1.2 s), faded, and normalized quietly (~−8 dBFS). Do **not** loop it rapidly, strobe it, or boost volume into painful territory.

### Win95-style UI (original recreations — not Microsoft samples)

| File | When | Loop |
|------|------|------|
| `audio/sfx-win95-click.wav` | Generic UI / button click | No |
| `audio/sfx-win95-error.wav` | Error dialogs, failed actions, denied PRs | No |
| `audio/sfx-win95-recycle.wav` | Delete / discard / trash ticket | No |
| `audio/sfx-win95-start.wav` | Start menu / app launcher open | No |

### Input

| File | When | Loop |
|------|------|------|
| `audio/sfx-key-01.wav` | Typing (rotate 01–03 while coding) | No |
| `audio/sfx-key-02.wav` | Typing variant | No |
| `audio/sfx-key-03.wav` | Typing variant | No |
| `audio/sfx-mouse-click.wav` | Mouse / cursor confirm | No |

### Sync chat / tickets / sanity

| File | When | Loop |
|------|------|------|
| `audio/sfx-slack-ping.wav` | Incoming Sync chat ping — dread, not delight (internal key may stay `slack`) | No |
| `audio/sfx-ticket-complete.wav` | Ticket marked done — unsatisfying / anticlimactic | No |
| `audio/sfx-sanity-low.wav` | Brief sting when sanity dips / crosses a threshold | No |

```js
function sfx(path, vol = 0.65) {
  if (state.muted) return;
  const a = new Audio(path);
  a.volume = vol;
  a.play().catch(() => {});
}

// examples
sfx("audio/sfx-slack-ping.wav", 0.6);
sfx("audio/sfx-crt-whine.wav", 0.3);
```

---


### Jimbo / Email / Appear Active

| File | When | Loop | Suggested `playSfx` key | Vol |
|------|------|------|-------------------------|-----|
| `audio/sfx-jimbo-chime.wav` | Ask Jimbo / Jimbo opens / "saved you 4 hours" toast | No | `jimboChime` | 0.55 |
| `audio/sfx-jimbo-fail.wav` | Jimbo sabotage lands (stripped semis, nonsense comments, Kyle+Jimbo review) | No | `jimboFail` | 0.6 |
| `audio/sfx-new-mail.wav` | Unsolicited doom-mail popup / Inbox flash | No | `newMail` | 0.55 |
| `audio/sfx-away-tick.wav` | Soft warning as Active → Away (taskbar yellow→red); optional | No | `awayTick` | 0.3 |

All original synth. Away tick is intentionally quiet (−8 dBFS) — do not boost into alarm territory.


### Presence Theater / Timesheet Lock (optional)

| File | When | Loop | Suggested `playSfx` key | Vol |
|------|------|------|-------------------------|-----|
| `audio/sfx-jiggler-tick.wav` | Auto mouse-jiggle / Presence Theater keep-alive | No | `jigglerTick` | 0.2–0.25 |
| `audio/sfx-timesheet-save.wav` | Timesheet Lock save / submit confirm | No | `timesheetSave` | 0.45 |

Jiggler is intentionally quieter than Away (−12 dBFS) — almost subliminal. Presence can ship without these; hook when ready.


### Call Theater (Sync calls parody)

| File | When | Loop | Suggested key | Vol |
|------|------|------|---------------|-----|
| `audio/sfx-teams-ring.wav` | Incoming call overlay (~8–12s ring) | Yes (`playLoop`) | `teamsRing` | 0.4 |
| `audio/sfx-muffled-call.ogg` | Connected call bed — **nonsense babble** (vowel cadence, talking rhythm; **zero real words**) | Yes | `muffledCall` | 0.25–0.35 |
| `audio/sfx-call-accept.wav` | Accept button | No | `callAccept` | 0.55 |
| `audio/sfx-call-decline.wav` | Decline / ring timeout | No | `callDecline` | 0.5 |
| `audio/sfx-teams-ping.wav` | Sync chat spam (aliases older Slack-style ping) | No | `teamsPing` | 0.4 |

Helpers in `audio.js`: `playLoop(name)` / `stopLoop(name)` / `stopAllLoops()`.
Babble bed is original formant synth (not sampled speech). Never name third-party voice products in docs or UI. Path/key unchanged (`muffledCall`). Stop ring on Accept/Decline; start muffled on Accept; stop muffled on hang-up. Map chat pings to `teamsPing` (or legacy `slack`) for Sync.


### Mail Theater (optional)

| File | When | Loop | Key | Vol |
|------|------|------|-----|-----|
| `audio/sfx-outlook-whoosh.wav` | Mail Focused ↔ Other tab switch | No | `outlookWhoosh` | 0.25–0.35 |

Soft whoosh (−10 dBFS). Not required to ship Mail Theater. Internal key `outlookWhoosh` OK.

## Dev integration checklist

1. Preload BGM + critical SFX on boot (or first user gesture — browsers block autoplay).
2. Gate **every** `play()` on `!state.muted` (extend the existing mute button beyond toast).
3. BGM: one active bed; crossfade on phase (`cubicle walk` / `seated desktop` / `PR fight`).
4. SFX: fire-and-forget; allow overlap for Sync chat pings + keys.
5. Paths: `audio/<exact-filename>` — do not rename files.
6. Optional Web Audio API: master gain node driven by `state.muted` (gain 0 vs 1) for cleaner mute.

---

## Aesthetic reminder

Fluorescent hell, HVAC drone, cheap carpet, tracker/MOD grit, 8–12-bit crunch. Dark humor. Not Hollywood orchestra.

Assets are **original synth only**. If something sounds wrong after a pull, regenerate with `python3 audio/generate_audio.py`.
