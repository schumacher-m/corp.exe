export const W = 320;
export const H = 240;
/** Internal supersample so seated fullscreen text isn't a blown-up postage stamp */
export const PIXEL_SCALE = 3;
export const TASK_H = 22;
export const IDLE_YELLOW = 6; // seconds -> Idle
export const IDLE_AWAY = 11; // seconds -> Away
export const JIGGLER_PULSE = 2.5;
export const JIGGLER_SANITY_EVERY = 8;
export const JIGGLER_MAX_MASK = 14;
export const JIGGLER_AUDIT_MIN = 45;
export const JIGGLER_AUDIT_SPAN = 45;
export const EMAIL_MIN = 14;
export const EMAIL_MAX = 28;
export const DAY_GRACE = 60; // seconds after enableDaySystems before Mail/incident

export const Presence = {
  ACTIVE: "active",
  IDLE_YELLOW: "idle_yellow",
  AWAY: "away",
};

/** CORP-DAY-01: named day beats + interrupt policy weights (0 = off). */
export const DAY_BEAT_WEIGHTS = {
  standup: {
    doomMail: 0,
    incident: 0,
    syncRing: 0,
    mailLight: false,
  },
  morning: {
    doomMail: 1,
    incident: 1,
    syncRing: 1,
    mailLight: false,
    syncCdMin: 45,
    syncCdSpan: 45,
  },
  lunch: {
    doomMail: 0.65,
    incident: 0,
    syncRing: 1,
    mailLight: true,
    syncCdMin: 35,
    syncCdSpan: 35,
  },
  afternoon: {
    doomMail: 1,
    incident: 1,
    syncRing: 1.35,
    mailLight: false,
    syncCdMin: 25,
    syncCdSpan: 25,
  },
  winddown: {
    doomMail: 1,
    incident: 0.5,
    syncRing: 1,
    mailLight: false,
    syncCdMin: 40,
    syncCdSpan: 40,
    preferTimesheet: true,
  },
  quittin: {
    doomMail: 0.5,
    incident: 0,
    syncRing: 0.4,
    mailLight: true,
    syncCdMin: 50,
    syncCdSpan: 40,
  },
};

/** Clock edges (minutes since midnight). */
export const DAY_BEAT_EDGES = {
  lunch: 11 * 60 + 30, // 690
  afternoon: 12 * 60 + 30, // 750
  winddown: 15 * 60, // 900
  quittin: 17 * 60, // 1020
  end: 18 * 60, // 1080
};

/** CORP-DAY-01 daily checklist needs (Shut Down grades from hits). */
export const DAY_OBLIGATIONS = {
  tickets: { need: 3 },
  focusedMail: { need: 1 },
  syncChip: { need: 1 },
  timesheet: { need: 1 },
};
