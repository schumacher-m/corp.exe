/**
 * corp.exe audio — no-op stubs when files missing; gated on muted flag.
 * Expected under audio/: bgm-cubicle-walk.ogg, bgm-seated-desktop.ogg, bgm-pr-fight.ogg,
 * sfx-*.wav one-shots,
 * sfx-win95-click, sfx-win95-error, sfx-win95-recycle, sfx-win95-start,
 * sfx-key-01..03, sfx-mouse-click, sfx-slack-ping, sfx-ticket-complete, sfx-sanity-low, sfx-jimbo-chime, sfx-jimbo-fail, sfx-new-mail, sfx-away-tick
 */
const BASE = "audio/";

const FILES = {
  bgmWalk: "bgm-cubicle-walk.ogg",
  bgmDesk: "bgm-seated-desktop.ogg",
  bgmPr: "bgm-pr-fight.ogg",
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
};

let muted = false;
const cache = new Map();
let currentBgm = null;

function el(name) {
  if (cache.has(name)) return cache.get(name);
  const a = new Audio(BASE + FILES[name]);
  a.preload = "auto";
  a.addEventListener("error", () => {
    a._missing = true;
  });
  cache.set(name, a);
  return a;
}

export function setMuted(m) {
  muted = !!m;
  if (muted && currentBgm) {
    try { currentBgm.pause(); } catch (_) {}
  } else if (!muted && currentBgm && !currentBgm._missing) {
    currentBgm.play().catch(() => {});
  }
}

export function isMuted() {
  return muted;
}

export function playSfx(name, { volume = 0.5 } = {}) {
  if (muted) return;
  const a = el(name);
  if (a._missing) return;
  try {
    const c = a.cloneNode();
    c.volume = volume;
    c.play().catch(() => {});
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
