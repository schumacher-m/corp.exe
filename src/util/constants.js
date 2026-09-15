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
