/**
 * corp.exe audio — no-op stubs when files missing; gated on muted flag.
 * Expected under audio/: bgm-*.ogg, amb-cubicle-exhausted.ogg, amb-plaza/lobby/elevator/floor,
 * sfx-*.wav one-shots (incl. tired farm: grunt/sigh/creak/ugh/key-dead/murmur/keys-far),
 * sfx-win95-*, sfx-key-01..03, sfx-mouse-click, sfx-slack-ping,
 * sfx-jiggler-tick, sfx-timesheet-save, sfx-teams-ring, sfx-muffled-call, sfx-call-accept, sfx-call-decline, sfx-teams-ping, exhausted farm pack, etc.
 */
const BASE = "audio/";

const FILES = {
  bgmWalk: "bgm-cubicle-walk.ogg",
  bgmDesk: "bgm-seated-desktop.ogg",
  bgmPr: "bgm-pr-fight.ogg",
  ambExhausted: "amb-cubicle-exhausted.ogg",
  foot1: "sfx-footstep-01.wav",
  foot2: "sfx-footstep-02.wav",
  foot3: "sfx-footstep-03.wav",
  sit: "sfx-chair-sit.wav",
  crtOn: "sfx-crt-power-on.wav",
  crtWhine: "sfx-crt-whine.wav",
  click: "sfx-win95-click.wav",
  error: "sfx-win95-error.wav",
  recycle: "sfx-win95-recycle.wav",
  start: "sfx-win95-start.wav",
  key1: "sfx-key-01.wav",
  key2: "sfx-key-02.wav",
  key3: "sfx-key-03.wav",
  mouse: "sfx-mouse-click.wav",
  slack: "sfx-slack-ping.wav",
  ticket: "sfx-ticket-complete.wav",
  sanityLow: "sfx-sanity-low.wav",
  jimboChime: "sfx-jimbo-chime.wav",
  jimboFail: "sfx-jimbo-fail.wav",
  newMail: "sfx-new-mail.wav",
  awayTick: "sfx-away-tick.wav",
  jigglerTick: "sfx-jiggler-tick.wav",
  timesheetSave: "sfx-timesheet-save.wav",
  grunt: "sfx-grunt.wav",
  sigh: "sfx-sigh.wav",
  creakTired: "sfx-chair-creak-tired.wav",
  ugh: "sfx-ugh.wav",
  keyDead1: "sfx-key-dead-01.wav",
  keyDead2: "sfx-key-dead-02.wav",
  keyDead3: "sfx-key-dead-03.wav",
  keyDead4: "sfx-key-dead-04.wav",
  keyDead5: "sfx-key-dead-05.wav",
  murmurDistant: "sfx-murmur-distant.wav",
  keysFar: "sfx-keys-far.wav",
  teamsRing: "sfx-teams-ring.wav",
  muffledCall: "sfx-muffled-call.ogg",
  callAccept: "sfx-call-accept.wav",
  callDecline: "sfx-call-decline.wav",
  teamsPing: "sfx-teams-ping.wav",
  outlookWhoosh: "sfx-outlook-whoosh.wav",
  // CORP-TOWER-01 arrival beds / SFX
  plazaAmb: "amb-plaza.ogg",
  badgeBeep: "sfx-badge-beep.wav",
  badgeDeny: "sfx-badge-deny.wav",
  lobbyAmb: "amb-lobby.ogg",
  elevatorAmb: "amb-elevator.ogg",
  elevatorDing: "sfx-elevator-ding.wav",
  elevatorWhoosh: "sfx-elevator-whoosh.wav",
  floorAmb: "amb-floor.ogg",
};

const EXHAUSTED_ONESHOTS = [
  "grunt",
  "sigh",
  "creakTired",
  "ugh",
  "keyDead1",
  "keyDead2",
  "keyDead3",
  "keyDead4",
  "keyDead5",
  "murmurDistant",
  "keysFar",
];

let muted = false;
const cache = new Map();
let sfxAlive = 0;
const SFX_MAX_ALIVE = 12;
let currentBgm = null;
let ambExhaustedEl = null;
let exhaustedBedTimer = null;
let exhaustedBedActive = false;
const loops = new Map();

function el(name) {
  if (cache.has(name)) return cache.get(name);
  if (!name || !FILES[name]) {
    const missing = {
      _missing: true,
      volume: 0,
      loop: false,
      preload: "none",
      currentTime: 0,
      play() { return Promise.resolve(); },
      pause() {},
      cloneNode() { return el(name); },
      addEventListener() {},
    };
    cache.set(name, missing);
    return missing;
  }
  let a;
  try {
    a = new Audio(BASE + FILES[name]);
    a.preload = "auto";
    a.addEventListener("error", () => {
      a._missing = true;
    });
  } catch (_) {
    a = {
      _missing: true,
      volume: 0,
      loop: false,
      preload: "none",
      currentTime: 0,
      play() { return Promise.resolve(); },
      pause() {},
      cloneNode() { return el(name); },
      addEventListener() {},
    };
  }
  cache.set(name, a);
  return a;
}

export function setMuted(m) {
  muted = !!m;
  if (muted) {
    if (currentBgm) {
      try { currentBgm.pause(); } catch (_) {}
    }
    if (ambExhaustedEl) {
      try { ambExhaustedEl.pause(); } catch (_) {}
    }
    for (const c of loops.values()) {
      try { c.pause(); } catch (_) {}
    }
  } else {
    if (currentBgm && !currentBgm._missing) {
      currentBgm.play().catch(() => {});
    }
    if (ambExhaustedEl && exhaustedBedActive && !ambExhaustedEl._missing) {
      ambExhaustedEl.play().catch(() => {});
    }
    for (const c of loops.values()) {
      try { c.play().catch(() => {}); } catch (_) {}
    }
  }
}

export function isMuted() {
  return muted;
}

export function playSfx(name, { volume = 0.5 } = {}) {
  if (muted) return;
  if (sfxAlive >= SFX_MAX_ALIVE) return;
  let a;
  try {
    a = el(name);
  } catch (_) {
    return;
  }
  if (!a || a._missing) return;
  try {
    const c = a.cloneNode ? a.cloneNode() : null;
    if (!c || c._missing) return;
    c.volume = volume;
    sfxAlive++;
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      sfxAlive = Math.max(0, sfxAlive - 1);
    };
    try { c.addEventListener("ended", done); } catch (_) {}
    try { c.addEventListener("error", done); } catch (_) {}
    // Cap: if play never settles (broken element after tab restore), free the slot
    setTimeout(done, 4000);
    const p = c.play();
    if (p && typeof p.catch === "function") p.catch(done);
  } catch (_) {}
}

export function playBgm(name, { volume = 0.35 } = {}) {
  if (currentBgm) {
    try { currentBgm.pause(); } catch (_) {}
    currentBgm = null;
  }
  const a = el(name);
  a.loop = true;
  a.volume = volume;
  currentBgm = a;
  if (muted || a._missing) return;
  a.play().catch(() => {});
}

export function stopBgm() {
  if (currentBgm) {
    try { currentBgm.pause(); } catch (_) {}
    currentBgm = null;
  }
}

export function footstep() {
  const keys = ["foot1", "foot2", "foot3"];
  playSfx(keys[Math.floor(Math.random() * keys.length)], { volume: 0.25 });
}

export function keyclack() {
  const keys = ["key1", "key2", "key3"];
  playSfx(keys[Math.floor(Math.random() * keys.length)], { volume: 0.3 });
}

/** Loopable exhausted cubicle farm bed (fluorescent + muffled workers). */
export function playAmbExhausted({ volume = 0.32 } = {}) {
  const a = el("ambExhausted");
  a.loop = true;
  a.volume = volume;
  ambExhaustedEl = a;
  if (muted || a._missing) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function stopAmbExhausted() {
  if (ambExhaustedEl) {
    try { ambExhaustedEl.pause(); } catch (_) {}
    try { ambExhaustedEl.currentTime = 0; } catch (_) {}
  }
}

/** Random tired-human / dead-key one-shot from the exhausted farm pack. */
export function exhaustedOneShot({ volume = 0.4 } = {}) {
  if (muted) return;
  const name = EXHAUSTED_ONESHOTS[Math.floor(Math.random() * EXHAUSTED_ONESHOTS.length)];
  // ugh + distant keys stay quieter; sighs a touch louder
  let vol = volume;
  if (name === "ugh" || name === "murmurDistant") vol *= 0.7;
  else if (name.startsWith("keyDead") || name === "keysFar") vol *= 0.55;
  else if (name === "sigh") vol *= 0.85;
  playSfx(name, { volume: vol });
}

function _clearExhaustedTimer() {
  if (exhaustedBedTimer != null) {
    clearTimeout(exhaustedBedTimer);
    exhaustedBedTimer = null;
  }
}

function _scheduleExhaustedOneShot(intervalMinMs, intervalMaxMs) {
  _clearExhaustedTimer();
  if (!exhaustedBedActive) return;
  const lo = Math.max(500, intervalMinMs | 0);
  const hi = Math.max(lo, intervalMaxMs | 0);
  const wait = lo + Math.random() * (hi - lo);
  exhaustedBedTimer = setTimeout(() => {
    exhaustedBedTimer = null;
    if (!exhaustedBedActive) return;
    if (!muted) exhaustedOneShot();
    _scheduleExhaustedOneShot(intervalMinMs, intervalMaxMs);
  }, wait);
}

/**
 * Start exhausted farm bed + occasional one-shots (default every 4–10s).
 * Dev: call on cubicle walk (and optionally seated if still "in farm").
 */
export function startExhaustedBed({
  volume = 0.32,
  intervalMinMs = 4000,
  intervalMaxMs = 10000,
} = {}) {
  exhaustedBedActive = true;
  playAmbExhausted({ volume });
  _scheduleExhaustedOneShot(intervalMinMs, intervalMaxMs);
}

/** Stop bed + clear one-shot timers (e.g. leaving farm / CRT focus). */
export function stopExhaustedBed() {
  exhaustedBedActive = false;
  _clearExhaustedTimer();
  stopAmbExhausted();
}

/** Loop a keyed clip (ring / muffled bed). Stops prior instance of same name. */
export function playLoop(name, { volume = 0.4 } = {}) {
  stopLoop(name);
  if (muted) return;
  const a = el(name);
  if (a._missing) return;
  try {
    const c = a.cloneNode();
    c.loop = true;
    c.volume = volume;
    loops.set(name, c);
    c.play().catch(() => {});
  } catch (_) {}
}

export function stopLoop(name) {
  const c = loops.get(name);
  if (c) {
    try { c.pause(); } catch (_) {}
    loops.delete(name);
  }
}

export function stopAllLoops() {
  for (const name of [...loops.keys()]) stopLoop(name);
}
