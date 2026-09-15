/**
 * Win95 virtual desktop - drawn to offscreen canvas for CRT CanvasTexture.
 * Specs: WIN95.md + Jimbo / Email / Appear Active (Michael mechanics)
 */
import * as audio from "./audio.js";

const C = {
  desktop: "#008080",
  face: "#C0C0C0",
  title: "#000080",
  titleIn: "#808080",
  light: "#FFFFFF",
  shadow: "#808080",
  dark: "#404040",
  text: "#000000",
  inv: "#FFFFFF",
  white: "#FFFFFF",
  amber: "#c4a035",
  sick: "#6b8f3a",
  blood: "#8b3a2a",
  jimbo: "#783CBC",
  jimboHi: "#A064DC",
  jimboBar: "#503090",
  green: "#00a000",
  yellow: "#c0a000",
  red: "#c00000",
};

export const W = 320;
export const H = 240;
/** Internal supersample so seated fullscreen text isn't a blown-up postage stamp */
export const PIXEL_SCALE = 3;
const TASK_H = 22;
const IDLE_YELLOW = 6; // seconds -> Idle (Presence.IDLE_YELLOW)
const IDLE_AWAY = 11; // seconds -> Away

/** Presence Theater status enum (keyed off IDLE_YELLOW threshold). */
const Presence = {
  ACTIVE: "active",
  IDLE_YELLOW: "idle_yellow",
  AWAY: "away",
};

const JIGGLER_PULSE = 2.5; // seconds between soft bumps
const JIGGLER_SANITY_EVERY = 8; // -1 Sanity while masking
const JIGGLER_MAX_MASK = 14; // AFK grace -- delay Away, do not delete it
const JIGGLER_AUDIT_MIN = 45;
const JIGGLER_AUDIT_SPAN = 45; // 45..90s
const EMAIL_MIN = 14;
const EMAIL_MAX = 28;

function pick(arr) {
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export function createWin95(copy, hooks) {
  const canvas = document.createElement("canvas");
  canvas.width = W * PIXEL_SCALE;
  canvas.height = H * PIXEL_SCALE;
  const ctx = canvas.getContext("2d");
  // Smooth text at supersample; CRT texture still looks chunky at distance
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const jimboCopy = copy.jimbo || {};
  const ticketStrings = copy.ticketStrings || {};
  const presenceCopy = copy.presence || {};
  const jigglerCopy = presenceCopy.jiggler || {};
  const awayExcuseCopy = presenceCopy.awayExcuses || {};
  const hrAuditCopy = presenceCopy.hrAudit || {};
  const timesheetCopy = copy.timesheet || {};
  const timesheetBuckets = (timesheetCopy.buckets && timesheetCopy.buckets.length)
    ? timesheetCopy.buckets
    : [
        { id: "fog", label: "Fog mitigation", default: 0 },
        { id: "sync", label: "Syncing", default: 0 },
        { id: "jimbo", label: "Jimbo alignment", default: 0 },
        { id: "stakeholder", label: "Stakeholder vibes", default: 0 },
        { id: "unblock", label: "Unblocking blockers", default: 0 },
        { id: "docs", label: "Documentation (aspirational)", default: 0 },
        { id: "hope", label: "Hope", default: 0 },
        { id: "core", label: "Core hours (actual work)", default: 0 },
      ];
  const timesheetTarget = Number(timesheetCopy.targetHours != null ? timesheetCopy.targetHours : 8.0);
  const timesheetValidation = timesheetCopy.validation || {};
  const timesheetJimboFill = timesheetCopy.jimboFill || {};

  function tStr(type, key, fallback) {
    const block = ticketStrings[type] || {};
    const v = block[key];
    return v == null || v === "" ? fallback : v;
  }
  const emailCopy = copy.emails || { messages: [], unreadFloor: 1 };
  const deniedPool = copy.startDenied || [];

  const imgs = {
    j16: loadImg("assets/jimbo/jimbo_16.png"),
    j32: loadImg("assets/jimbo/jimbo_32.png"),
    jtb: loadImg("assets/jimbo/jimbo_toolbar.png"),
    jban: loadImg("assets/jimbo/jimbo_banner.png"),
    jig16: loadImg("assets/presence/jiggler_16.png"),
    jig32: loadImg("assets/presence/jiggler_32.png"),
    ts16: loadImg("assets/timesheet/timesheet_xls_16.png"),
    ts32: loadImg("assets/timesheet/timesheet_xls_32.png"),
    ts48: loadImg("assets/timesheet/timesheet_xls_48.png"),
  };

  const inboxMails = (emailCopy.messages || []).map((m) => ({
    ...m,
    read: false,
    opened: false,
  }));

  // Endless ticket queue (GD tickets-extra refill)
  // Playable = core tickets + ticketPool/extraTickets (implemented types as they land)
  // Fillers = padding / never-empty fallback (1-tap stub)
  const CORE_TYPES = ["semi", "comment", "pr", "spacewar"];
  const STUB_TYPES = [
    "align",
    "rename",
    "presence",
    "lint",
    "standup2",
    "merge",
    "unsub",
    "logspam",
    "estimate",
    "severity",
    "incident",
  ];
  const PLAYABLE_TYPES = new Set([...CORE_TYPES, ...STUB_TYPES]);
  const playableTemplates = [
    ...(copy.tickets || []),
    ...((copy.ticketPool && copy.ticketPool.length ? copy.ticketPool : null) ||
      copy.extraTickets ||
      []),
  ].filter((t) => t && PLAYABLE_TYPES.has(t.type));
  const fillerTemplates = (copy.fillers || []).filter((t) => t && t.type === "filler");
  if (!playableTemplates.some((t) => t.type === "incident")) {
    playableTemplates.push({
      id: "CORP-5201",
      title: "PROD CRITICAL - Something is on fire",
      pts: 4,
      type: "incident",
      dod: "Disable the monitor AND assign to somebody else. Do not fix prod.",
      meta: "Sev: Critical - Owner: whoever blinks - Runbook: vibes",
    });
  }
  let uidCounter = 0;
  function makeUid() {
    return `tk-${++uidCounter}`;
  }
  function cloneTicket(template) {
    const type = template.type || "filler";
    return {
      ...template,
      uid: makeUid(),
      mechanic: type, // type key === mechanic (fillers stay filler)
    };
  }
  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function templateByType(type) {
    return playableTemplates.find((t) => t.type === type) || fillerTemplates[0] || playableTemplates[0];
  }
  function rebuildDrawBag() {
    // Unused types this shuffle - one entry per playable type
    const types = playableTemplates.map((t) => t.type);
    return shuffleInPlace([...new Set(types)]);
  }

  const state = {
    cursor: { x: W / 2, y: H / 2 },
    mouseDown: false,
    activeWin: "tickets",
    startOpen: false,
    standupDone: false,
    clockMinutes: 9 * 60,
    sanity: 100,
    sprint: 0,
    unread: Math.max(1, emailCopy.unreadFloor || 1),
    phase: "desktop", // desktop | ticket mechanic type
    closedCount: 0,
    typesCompleted: {}, // type -> count this shift
    drawBag: rebuildDrawBag(),
    board: (copy.tickets || []).slice(0, 3).map(cloneTicket), // 2-3 active slots
    activeTicket: null,
    stub: null, // S-stub minigame progress
    semiPlaced: null,
    commentDone: null,
    commentIdx: 0,
    commentOverrides: null, // Jimbo nonsense comments
    semiStyle: null, // { mode: 'strip'|'double'|'guide', note }
    prJimboNit: null,
    prStep: 0,
    prBubbles: [],
    slackMsgs: [],
    stickies: (copy.stickies || []).slice(0, 3),
    toast: null,
    toastT: 0,
    toastJimbo: false,
    // Jimbo gate
    jimboUsedThisTicket: false,
    jimboSabotaged: {}, // keyed by ticket type
    jimboLine: pick(jimboCopy.greetings) || "Jimbo online.",
    pendingFinish: null, // { type, pts }
    modal: null, // { title, body, buttons:[{label,action}], kind }
    // Email
    inbox: inboxMails,
    openMailId: null,
    mailReadFully: false,
    emailQueue: [],
    emailCooldown: EMAIL_MIN + Math.random() * (EMAIL_MAX - EMAIL_MIN),
    emailEnabled: false,
    incidentPagerCd: 45 + Math.random() * 45, // first soft window 45-90s
    incidentPagerCooldown: 0,
    incidentFromPager: false,
    // Appear Active / Presence Theater
    presence: Presence.ACTIVE,
    idleAcc: 0,
    presenceForced: false,
    presenceStatus: null,
    statusPopover: false,
    // GD collision: presenceForced wins over board + timesheet
    boardRefillPaused: false,
    timesheetQueued: false,
    timesheetGateOpen: false,
    ticketsCompletedSinceLock: 0,
    timesheetLockedOk: false,
    timesheetGateThreshold: 3,
    timesheetHours: {},
    timesheetJimboFills: 0,
    timesheetPendingClockOut: false,
    timesheetAcceptedOpen: false,
    // Jimbo Mouse Jiggler -- DELAYS Away, does not delete it
    jimboJiggler: false,
    jigglerInstalled: false,
    jigglerPulseAcc: 0,
    jigglerSanityAcc: 0,
    jigglerMaskAcc: 0,
    jigglerAuditArmed: false,
    jigglerAuditDone: false,
    jigglerAuditAt: 0,
  };

  // Remove already-dealt types from the first shuffle
  {
    const dealt = new Set(state.board.map((t) => t.mechanic || t.type));
    state.drawBag = state.drawBag.filter((t) => !dealt.has(t));
  }

  const kyleSlackPool = copy.kyleSlack || (copy.slackPool || []).filter((m) => /kyle/i.test(m.name || ""));
  let kyleInterruptCd = 18 + Math.random() * 10;

  /** Full Kyle beat pools stay in copy; each PR run deals <=5 at random. */
  const PR_ROUND_MAX = 5;

  function pickPrRound(pool, max = PR_ROUND_MAX) {
    const src = Array.isArray(pool) ? pool.slice() : [];
    if (src.length <= max) return src;
    // Fisher-Yates partial shuffle
    for (let i = src.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = src[i];
      src[i] = src[j];
      src[j] = tmp;
    }
    return src.slice(0, max);
  }

  function activePrScript() {
    if (state.prRoundScript && state.prRoundScript.length) return state.prRoundScript;
    if (state.phase === "spacewar") return copy.spaceWarScript || copy.prScript || [];
    return copy.prScript || [];
  }

  const wins = {
    tickets: { id: "tickets", title: "Tickets - Corp", x: 8, y: 18, w: 150, h: 140, open: true },
    slack: { id: "slack", title: "Slack - #general", x: 165, y: 14, w: 145, h: 120, open: true },
    ide: { id: "ide", title: "IDE - fog.js", x: 40, y: 28, w: 240, h: 160, open: false },
    pr: { id: "pr", title: "PR #884 - Kyle", x: 30, y: 20, w: 260, h: 175, open: false },
    standup: { id: "standup", title: "Daily Standup", x: 50, y: 40, w: 220, h: 130, open: true },
    meters: { id: "meters", title: "Resource Monitor", x: 200, y: 150, w: 110, h: 55, open: true },
    jimbo: {
      id: "jimbo",
      title: jimboCopy.windowTitle || "Jimbo - Corporate AI",
      x: 70,
      y: 22,
      w: 190,
      h: 150,
      open: false,
      jimboChrome: true,
    },
    inbox: {
      id: "inbox",
      title: emailCopy.inboxTitle || "Inbox - Outlook Express",
      x: 40,
      y: 16,
      w: 240,
      h: 170,
      open: false,
    },
    timesheet: {
      id: "timesheet",
      title: timesheetCopy.windowTitle || "timesheet.xls -- Time Entry",
      x: 36,
      y: 12,
      w: 248,
      h: 200,
      open: false,
    },
  };

  const order = ["meters", "tickets", "slack", "standup", "ide", "pr", "jimbo", "inbox", "timesheet"];

  const deskIcons = [
    { id: "jimbo", label: "Jimbo", x: 8, y: 8, img: "j32" },
    { id: "inbox", label: emailCopy.desktopLabel || "Inbox", x: 8, y: 56, img: null },
    {
      id: "timesheet",
      label: timesheetCopy.desktopLabel || "timesheet.xls",
      x: 8,
      y: 104,
      img: "ts32",
    },
    {
      id: "jiggler",
      label: jigglerCopy.desktopLabel || "Jiggler",
      x: 8,
      y: 152,
      img: "jig32",
    },
  ];

  function raise(id) {
    state.activeWin = id;
    const i = order.indexOf(id);
    if (i >= 0) {
      order.splice(i, 1);
      order.push(id);
    }
  }

  function toast(msg, { jimbo } = {}) {
    state.toast = msg;
    state.toastT = 100;
    state.toastJimbo = !!jimbo;
  }

  function hitSanity(n) {
    state.sanity = Math.max(0, state.sanity - n);
    if (state.sanity < 25) audio.playSfx("sanityLow", { volume: 0.35 });
  }

  function bumpActivity() {
    state.idleAcc = 0;
    state.jigglerMaskAcc = 0;
    state.jigglerPulseAcc = 0;
    if (state.presence !== Presence.ACTIVE && !state.presenceForced) {
      state.presence = Presence.ACTIVE;
    }
  }

  function presenceBlocksBoard() {
    return !!state.presenceForced || (state.modal && state.modal.kind === "presence");
  }

  function canClaimTicket() {
    if (presenceBlocksBoard()) return false;
    if (state.timesheetGateOpen) return false;
    return true;
  }

  function canSubmitTicket() {
    return canClaimTicket();
  }

  function requestBoardRefill() {
    if (presenceBlocksBoard()) {
      state.boardRefillPaused = true;
      return false;
    }
    if (state.timesheetGateOpen || state.timesheetQueued) {
      state.boardRefillPaused = true;
      return false;
    }
    state.boardRefillPaused = false;
    spawnTicket();
    while (state.board.length < 2) spawnTicket();
    hooks.onBoardRefill?.();
    return true;
  }

  function flushBoardRefill() {
    if (!state.boardRefillPaused) return;
    if (presenceBlocksBoard() || state.timesheetGateOpen) return;
    state.boardRefillPaused = false;
    spawnTicket();
    if (state.board.length === 0) spawnTicket({ forceFiller: true });
    while (state.board.length < 2) spawnTicket();
    hooks.onBoardRefill?.();
  }

  function resetTimesheetHours() {
    const hours = {};
    for (const b of timesheetBuckets) {
      hours[b.id] = Number(b.default != null ? b.default : 0);
    }
    state.timesheetHours = hours;
  }

  function timesheetSum() {
    let s = 0;
    for (const b of timesheetBuckets) {
      s += Number(state.timesheetHours[b.id] || 0);
    }
    return Math.round(s * 10) / 10;
  }

  function timesheetSumExact() {
    return Math.abs(timesheetSum() - timesheetTarget) < 0.05;
  }

  function needsTimesheetForClockOut() {
    return (
      state.timesheetGateOpen ||
      state.timesheetQueued ||
      state.ticketsCompletedSinceLock > 0 ||
      !state.timesheetLockedOk
    );
  }

  function openTimesheet({ forced }

  function requestTimesheetGate(reason) {
    if (presenceBlocksBoard()) {
      state.timesheetQueued = true;
      toast(timesheetCopy.waitingAway || "Timesheet waiting -- clear Away first");
      return false;
    }
    state.timesheetQueued = false;
    state.timesheetGateOpen = true;
    state.timesheetLockedOk = false;
    openTimesheet({ forced: true });
    hooks.onTimesheetGate?.(reason || "gate");
    return true;
  }

  function flushTimesheetQueue() {
    if (!state.timesheetQueued) return;
    if (presenceBlocksBoard()) return;
    state.timesheetQueued = false;
    requestTimesheetGate("queued-after-away");
  }

  function clearTimesheetGate() {
    state.timesheetGateOpen = false;
    state.timesheetQueued = false;
    flushBoardRefill();
  }

  function nudgeTimesheetHour(id, delta) {
    const cur = Number(state.timesheetHours[id] || 0);
    let next = Math.round((cur + delta) * 10) / 10;
    if (next < 0) next = 0;
    if (next > 16) next = 16;
    state.timesheetHours[id] = next;
  }

  function jimboAutoFillTimesheet() {
    const fills = state.timesheetJimboFills || 0;
    let preset = null;
    if (fills <= 0) {
      preset = timesheetJimboFill.firstFill || {
        hours: { jimbo: 6, core: 1, sync: 0.5 },
        toast: "Jimbo reconciled your day!",
      };
    } else {
      preset = timesheetJimboFill.secondFill || {
        hours: { jimbo: 6, hope: 2 },
        toast: "Jimbo fixed the math. Spiritually worse.",
      };
    }
    resetTimesheetHours();
    const src = preset.hours || {};
    for (const b of timesheetBuckets) {
      if (src[b.id] != null) state.timesheetHours[b.id] = Number(src[b.id]);
    }
    state.timesheetJimboFills = fills + 1;
    const msg =
      preset.toast ||
      timesheetCopy.jimboReconciled ||
      "Jimbo reconciled your day!";
    toast(msg, { jimbo: true });
    // Sabotage help: Fail chime on Auto-Fill (Save beep only on Accept)
    audio.playSfx("jimboFail", { volume: 0.6 });
  }

  function acceptTimesheet() {
    const sum = timesheetSum();
    if (!timesheetSumExact()) {
      const v = timesheetValidation;
      let msg = timesheetCopy.failExact || v.failExact || "Hours must equal core commitment (8.0).";
      if (sum < timesheetTarget && v.under?.length) {
        msg = pick(v.under).replace(/\{\{total\}\}/g, String(sum));
      } else if (sum > timesheetTarget && v.over?.length) {
        msg = pick(v.over).replace(/\{\{total\}\}/g, String(sum));
      } else if (sum === 0 && v.empty?.length) {
        msg = pick(v.empty);
      }
      // Prefer Spec fail line for Accept miss
      msg = timesheetCopy.failExact || v.failExact || msg;
      toast(msg);
      hitSanity(4);
      audio.playSfx("error");
      return false;
    }
    state.sprint += 2;
    hitSanity(2);
    state.ticketsCompletedSinceLock = 0;
    state.timesheetLockedOk = true;
    state.timesheetAcceptedOpen = true;
    clearTimesheetGate();
    toast(
      timesheetCopy.hoursReconciled ||
        timesheetValidation.hoursReconciled ||
        "Hours reconciled."
    );
    audio.playSfx("timesheetSave", { volume: 0.45 });
    wins.timesheet.open = false;
    const pendingOut = state.timesheetPendingClockOut;
    state.timesheetPendingClockOut = false;
    hooks.onTimesheetAccept?.();
    if (pendingOut) {
      setTimeout(() => hooks.onClockOut?.(), 400);
    }
    return true;
  }

  function closeTimesheetWindow() {
    wins.timesheet.open = false;
    if (state.timesheetGateOpen && !state.timesheetAcceptedOpen) {
      toast(
        timesheetCopy.incompleteToast ||
          timesheetValidation.incomplete ||
          "Timesheet incomplete"
      );
      audio.playSfx("error");
    }
  }


  function bevelRaised(x, y, w, h, fill = C.face) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.light;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
    ctx.fillStyle = C.shadow;
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
  }

  function bevelSunken(x, y, w, h, fill = C.white) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = C.light;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  }

  function wrap(s, n) {
    const words = String(s).split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > n) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawWindow(win) {
    if (!win.open) return;
    const active = state.activeWin === win.id;
    bevelRaised(win.x, win.y, win.w, win.h, C.face);
    const bar = win.jimboChrome ? C.jimboBar : active ? C.title : C.titleIn;
    ctx.fillStyle = bar;
    ctx.fillRect(win.x + 3, win.y + 3, win.w - 6, 14);
    if (win.jimboChrome && imgs.j16.complete && imgs.j16.naturalWidth) {
      ctx.drawImage(imgs.j16, win.x + 5, win.y + 4, 12, 12);
      ctx.fillStyle = C.inv;
      ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(win.title.slice(0, 24), win.x + 20, win.y + 10);
    } else {
      ctx.fillStyle = C.inv;
      ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(win.title.slice(0, 28), win.x + 6, win.y + 10);
    }
    bevelRaised(win.x + win.w - 16, win.y + 5, 10, 10, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("x", win.x + win.w - 14, win.y + 10);

    const cx = win.x + 4;
    const cy = win.y + 20;
    const cw = win.w - 8;
    const ch = win.h - 24;
    if (win.id === "tickets") drawTickets(cx, cy, cw, ch);
    else if (win.id === "slack") drawSlack(cx, cy, cw, ch);
    else if (win.id === "ide") drawIde(cx, cy, cw, ch);
    else if (win.id === "pr") drawPr(cx, cy, cw, ch);
    else if (win.id === "standup") drawStandup(cx, cy, cw, ch);
    else if (win.id === "meters") drawMeters(cx, cy, cw, ch);
    else if (win.id === "jimbo") drawJimbo(cx, cy, cw, ch);
    else if (win.id === "timesheet") drawTimesheet(cx, cy, cw, ch);
    else if (win.id === "inbox") drawInbox(cx, cy, cw, ch);
  }

  function drawTimesheet(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.shadow;
    const sub = timesheetCopy.subtitle || "Time Entry";
    ctx.fillText(String(sub).slice(0, 42), x + 3, y + 8);
    const doneN = state.ticketsCompletedSinceLock;
    ctx.fillText("CORP tickets since lock: " + doneN, x + 3, y + 17);

    state._tsHits = [];
    let yy = y + 22;
    const rowH = 14;
    for (const b of timesheetBuckets) {
      const hours = Number(state.timesheetHours[b.id] || 0);
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(String(b.label).slice(0, 22), x + 3, yy + 9);
      // value box
      bevelSunken(x + w - 70, yy + 1, 28, 11, C.white);
      ctx.fillStyle = C.text;
      ctx.fillText(hours.toFixed(1), x + w - 66, yy + 9);
      // minus
      bevelRaised(x + w - 40, yy + 1, 14, 11, C.face);
      ctx.fillStyle = C.text;
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText("-", x + w - 36, yy + 9);
      state._tsHits.push({ kind: "minus", id: b.id, hit: { x: x + w - 40, y: yy + 1, w: 14, h: 11 } });
      // plus
      bevelRaised(x + w - 24, yy + 1, 14, 11, C.face);
      ctx.fillText("+", x + w - 20, yy + 9);
      state._tsHits.push({ kind: "plus", id: b.id, hit: { x: x + w - 24, y: yy + 1, w: 14, h: 11 } });
      yy += rowH;
      if (yy > y + h - 36) break;
    }

    const sum = timesheetSum();
    const ok = timesheetSumExact();
    ctx.fillStyle = ok ? C.sick : C.blood;
    ctx.font = "bold 8px Tahoma, sans-serif";
    ctx.fillText("Total " + sum.toFixed(1) + " / " + timesheetTarget.toFixed(1), x + 3, y + h - 28);
    ctx.fillStyle = C.shadow;
    ctx.font = "6px Tahoma, sans-serif";
    ctx.fillText(String(timesheetCopy.footerHint || "Total must equal 8.0").slice(0, 48), x + 3, y + h - 18);

    // Jimbo Auto-Fill
    const jl = timesheetCopy.jimboFillLabel || timesheetJimboFill.buttonLabel || "Jimbo Auto-Fill";
    bevelRaised(x + 3, y + h - 14, 88, 12, C.jimbo);
    ctx.fillStyle = C.inv;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText(String(jl).slice(0, 16), x + 6, y + h - 5);
    state._tsJimboBtn = { x: x + 3, y: y + h - 14, w: 88, h: 12 };

    // Accept
    const al = timesheetCopy.submitLabel || "Accept";
    if (ok) bevelRaised(x + w - 64, y + h - 14, 60, 12, C.face);
    else bevelSunken(x + w - 64, y + h - 14, 60, 12, C.face);
    ctx.fillStyle = ok ? C.text : C.shadow;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText(String(al).slice(0, 10), x + w - 52, y + h - 5);
    state._tsAcceptBtn = { x: x + w - 64, y: y + h - 14, w: 60, h: 12 };
  }

  function drawTickets(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "8px Tahoma, sans-serif";
    let yy = y + 4;
    for (const tk of state.board) {
      ctx.fillStyle = C.text;
      ctx.fillText(`${tk.id}  ${tk.title.slice(0, 22)}`, x + 4, yy + 8);
      ctx.fillStyle = C.amber;
      ctx.fillText(`[${tk.pts}SP]`, x + w - 40, yy + 8);
      tk._hit = { x: x + 2, y: yy, w: w - 4, h: 14 };
      yy += 16;
      if (yy > y + h - 12) break;
    }
    ctx.fillStyle = C.shadow;
    ctx.fillText(`Closed ${state.closedCount} - Ask Jimbo to submit`, x + 4, y + h - 6);
  }

  function drawSlack(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "7px Tahoma, sans-serif";
    if (state.phase === "align" && state.stub?.kind === "align") {
      drawAlignStub(x, y, w, h);
      return;
    }
    let yy = y + 3;
    const msgs = state.slackMsgs.slice(0, 8);
    for (const m of msgs) {
      ctx.fillStyle = "#000080";
      ctx.fillText(m.name, x + 3, yy + 7);
      ctx.fillStyle = C.text;
      const lines = wrap(m.text, 28);
      for (const ln of lines.slice(0, 2)) {
        ctx.fillText(ln, x + 3, yy + 15);
        yy += 8;
      }
      yy += 6;
      if (yy > y + h - 8) break;
    }
    if (!msgs.length) {
      ctx.fillStyle = C.shadow;
      ctx.fillText("No messages. Suspicious.", x + 4, y + 12);
    }
  }


  function drawAlignStub(x, y, w, h) {
    const st = state.stub;
    state._stubHits = [];
    let yy = y + 4;
    const th = st.threads[st.idx];
    if (!th) {
      ctx.fillStyle = C.sick;
      ctx.fillText("All threads aligned.", x + 4, yy + 8);
      bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
      ctx.fillStyle = C.inv;
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
      state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      return;
    }
    ctx.fillStyle = "#000080";
    ctx.fillText(`${th.who} DM (${st.idx + 1}/${st.threads.length})`, x + 4, yy + 7);
    yy += 12;
    ctx.fillStyle = C.text;
    for (const ln of wrap(th.ask, 32)) {
      ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    yy += 4;
    th.opts.forEach((opt, i) => {
      bevelRaised(x + 4, yy, w - 8, 14, C.face);
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(opt.slice(0, 36), x + 8, yy + 10);
      state._stubHits.push({ kind: "align", i, hit: { x: x + 4, y: yy, w: w - 8, h: 14 } });
      yy += 18;
    });
    state._submitBtn = null;
  }

  function drawMeters(x, y, w, h) {
    ctx.font = "7px Tahoma, sans-serif";
    const rows = [
      ["SAN", state.sanity / 100, state.sanity < 30 ? C.blood : C.sick],
      ["SP", Math.min(1, state.sprint / 20), C.amber],
      ["UNR", Math.min(1, state.unread / 20), C.blood],
    ];
    let yy = y + 2;
    for (const [lab, pct, col] of rows) {
      ctx.fillStyle = C.text;
      ctx.fillText(lab, x + 2, yy + 7);
      bevelSunken(x + 28, yy + 1, w - 32, 8, C.white);
      ctx.fillStyle = col;
      ctx.fillRect(x + 29, yy + 2, Math.max(1, (w - 34) * pct), 6);
      yy += 12;
    }
  }

  function drawStandup(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    if (state.phase === "standup2" && state.stub?.kind === "standup2") {
      drawStandup2Stub(x, y, w, h);
      return;
    }
    const s = copy.standup;
    if (!state._standupPick) {
      state._standupPick = { y: pick(s.yesterday), t: pick(s.today), b: pick(s.blockers) };
    }
    const yest = state._standupPick.y;
    const tod = state._standupPick.t;
    const blk = state._standupPick.b;
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.text;
    const lines = ["Yesterday: " + yest, "Today: " + tod, "Blockers: " + blk];
    let yy = y + 10;
    for (const ln of lines) {
      for (const wln of wrap(ln, 36)) {
        ctx.fillText(wln, x + 4, yy);
        yy += 9;
      }
      yy += 2;
    }
    bevelRaised(x + w / 2 - 40, y + h - 18, 80, 14, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 8px Tahoma, sans-serif";
    ctx.fillText("ACKNOWLEDGE", x + w / 2 - 32, y + h - 9);
    state._standupBtn = { x: x + w / 2 - 40, y: y + h - 18, w: 80, h: 14 };
  }


  function drawStandup2Stub(x, y, w, h) {
    const st = state.stub;
    state._stubHits = [];
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.text;
    let yy = y + 8;
    ctx.fillText(`Yesterday: ${st.fields.y}`.slice(0, 40), x + 4, yy); yy += 10;
    ctx.fillText(`Today: ${st.fields.t}`.slice(0, 40), x + 4, yy); yy += 10;
    ctx.fillStyle = st.fields.b === "the fog" ? C.blood : C.text;
    ctx.fillText(`Blockers: ${st.fields.b}`.slice(0, 40), x + 4, yy); yy += 14;
    if (st.rejected) {
      ctx.fillStyle = C.blood;
      ctx.fillText("Bot: not actionable. Tweak & resubmit.", x + 4, yy);
      yy += 12;
    }
    ctx.fillStyle = C.shadow;
    ctx.fillText(`Submits ${st.submits}/${st.need}`, x + 4, yy);
    // chip to clear fog
    bevelRaised(x + 4, y + h - 40, 90, 14, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText("Tweak Blockers", x + 10, y + h - 31);
    state._stubHits.push({ kind: "standup2", action: "tweak", hit: { x: x + 4, y: y + h - 40, w: 90, h: 14 } });
    bevelRaised(x + w / 2 - 40, y + h - 20, 80, 14, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 8px Tahoma, sans-serif";
    ctx.fillText("SUBMIT", x + w / 2 - 20, y + h - 11);
    state._stubHits.push({ kind: "standup2", action: "submit", hit: { x: x + w / 2 - 40, y: y + h - 20, w: 80, h: 14 } });
    state._standupBtn = null;
  }

  function ensureSemi() {
    if (!state.semiPlaced) state.semiPlaced = copy.semiLines.map(() => false);
  }
  function ensureComment() {
    if (!state.commentDone) {
      state.commentDone = copy.commentLines.map(() => false);
      state.commentIdx = 0;
    }
  }

  function drawIde(x, y, w, h) {
    bevelSunken(x, y, w, h - 28, "#000000");
    ctx.font = "7px 'Courier New', monospace";
    if (state.phase === "semi") {
      ensureSemi();
      let yy = y + 8;
      copy.semiLines.forEach((ln, i) => {
        const placed = state.semiPlaced[i];
        let semi = "";
        if (ln.need && placed) {
          if (state.semiStyle?.mode === "double" && i % 2 === 1) semi = ";;";
          else if (state.semiStyle?.mode === "strip") semi = "";
          else semi = ";";
        }
        // Jimbo strip: even placed lines lose ;
        if (state.semiStyle?.mode === "strip" && placed && ln.need && i % 2 === 0) semi = "";
        if (state.semiStyle?.mode === "double" && placed && ln.need && i % 2 === 0) semi = ";";
        ctx.fillStyle = placed && ln.need ? C.sick : "#c8c4b0";
        ctx.fillText(`${String(i + 1).padStart(2)} ${ln.code}${semi}`, x + 4, yy);
        ln._hit = { x, y: yy - 7, w, h: 9, i };
        yy += 9;
      });
      ctx.fillStyle = C.face;
      ctx.fillRect(x, y + h - 28, w, 28);
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      const hint = state.semiStyle?.note
        ? String(state.semiStyle.note).slice(0, 42)
        : "Click lines missing ;  or press ;";
      ctx.fillText(hint, x + 4, y + h - 12);
      if (state.pendingFinish?.type === "semi") {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else if (state.phase === "comment") {
      ensureComment();
      let yy = y + 8;
      copy.commentLines.forEach((code, i) => {
        const done = state.commentDone[i];
        ctx.fillStyle = i === state.commentIdx ? "#ffff80" : "#c8c4b0";
        ctx.fillText(`${i + 1} ${code}`, x + 4, yy);
        if (done) {
          ctx.fillStyle = "#7aaa9a";
          const sug =
            (state.commentOverrides && state.commentOverrides[i]) ||
            copy.commentSuggestions[i % copy.commentSuggestions.length];
          ctx.fillText(String(sug).slice(0, 40), x + 4, yy + 8);
          yy += 8;
        }
        yy += 10;
      });
      ctx.fillStyle = C.face;
      ctx.fillRect(x, y + h - 28, w, 28);
      bevelRaised(x + 4, y + h - 22, 70, 14, C.face);
      ctx.fillStyle = C.text;
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText("ACCEPT //", x + 10, y + h - 13);
      state._cmtBtn = { x: x + 4, y: y + h - 22, w: 70, h: 14 };
      if (state.pendingFinish?.type === "comment") {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else if (state.stub && ["rename", "lint", "merge", "logspam"].includes(state.phase)) {
      drawIdeStub(x, y, w, h);
    } else {
      ctx.fillStyle = "#c8c4b0";
      ctx.fillText("// open a ticket from Tickets", x + 6, y + 14);
      state._submitBtn = null;
    }
  }

  function drawIdeStub(x, y, w, h) {
    const st = state.stub;
    state._stubHits = [];
    ctx.fillStyle = C.face;
    ctx.fillRect(x, y + h - 28, w, 28);
    let yy = y + 8;
    ctx.font = "7px 'Courier New', monospace";
    if (st.kind === "rename") {
      st.items.forEach((it, i) => {
        const label = `${it.id} -> ${it.to}`;
        ctx.fillStyle = it.to === "data2" || it.to === "data2_final_FINAL" ? C.sick : "#c8c4b0";
        ctx.fillText(label.slice(0, 42), x + 4, yy);
        state._stubHits.push({ kind: "rename", i, hit: { x, y: yy - 7, w, h: 10 } });
        yy += 11;
      });
      const n = st.items.filter((it) => it.to === "data2" || it.to === (st.bulk || "data2")).length;
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(`Rename >=${st.need} to data2 (${n}/${st.need})`, x + 4, y + h - 12);
      if (n >= st.need) {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SAVE", x + w - 58, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else if (st.kind === "lint") {
      st.warns.forEach((w, i) => {
        if (w.gone) return;
        ctx.fillStyle = "#c8c4b0";
        ctx.fillText(`! ${w.w}`.slice(0, Math.max(8, Math.floor((w - 8) / 5))), x + 4, yy);
        yy += 11;
        const labs = ["Suppress", "Dismiss", "TODO", "Fix"];
        let bx = x + 4;
        const right = x + w - 4;
        for (const lab of labs) {
          const bw = lab === "Fix" ? 28 : 40;
          if (bx + bw > right) {
            bx = x + 4;
            yy += 12;
          }
          bevelRaised(bx, yy - 8, bw, 10, C.face);
          ctx.fillStyle = lab === "Fix" ? C.blood : C.text;
          ctx.font = "6px Tahoma, sans-serif";
          ctx.fillText(lab.slice(0, 7), bx + 2, yy - 1);
          state._stubHits.push({ kind: "lint", i, action: lab, hit: { x: bx, y: yy - 8, w: bw, h: 10 } });
          bx += bw + 4;
        }
        yy += 12;
      });
      const left = st.warns.filter((w) => !w.gone).length;
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(left ? `${left} warnings` : "0 warnings - green", x + 4, y + h - 12);
      if (left === 0) {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else if (st.kind === "merge") {
      st.hunks.forEach((hk, i) => {
        ctx.fillStyle = hk.res ? C.sick : "#c8c4b0";
        ctx.fillText(`${hk.res ? "Y" : "<>"} ${hk.label}`.slice(0, 36), x + 4, yy);
        if (!hk.res) {
          let bx = x + 4;
          yy += 10;
          for (const lab of ["Ours", "Theirs", "Both"]) {
            bevelRaised(bx, yy - 8, 40, 10, C.face);
            ctx.fillStyle = C.text;
            ctx.font = "6px Tahoma, sans-serif";
            ctx.fillText(lab, bx + 6, yy - 1);
            state._stubHits.push({ kind: "merge", i, action: lab.toLowerCase(), hit: { x: bx, y: yy - 8, w: 40, h: 10 } });
            bx += 46;
          }
        }
        yy += 12;
      });
      const left = st.hunks.filter((hk) => !hk.res).length;
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(left ? "Resolve hunks" : "No conflict markers", x + 4, y + h - 12);
      if (left === 0) {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SAVE", x + w - 58, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else if (st.kind === "logspam") {
      st.lines.forEach((ln, i) => {
        ctx.fillStyle = ln.log ? C.sick : "#c8c4b0";
        ctx.fillText(String(ln.code).slice(0, 28), x + 4, yy);
        if (ln.log) {
          ctx.fillStyle = ln.log.includes("debugger") ? C.blood : "#7aaa9a";
          ctx.fillText(String(ln.log).slice(0, 28), x + 4, yy + 8);
          yy += 8;
        }
        state._stubHits.push({ kind: "logspam", i, hit: { x, y: yy - 7, w, h: 10 } });
        yy += 11;
      });
      const n = st.lines.filter((l) => l.log && !String(l.log).includes("debugger")).length;
      const hasDbg = st.lines.some((l) => String(l.log || "").includes("debugger"));
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(`Logs ${n}/${st.need}${hasDbg ? " - remove debugger" : ""}`, x + 4, y + h - 12);
      if (n >= st.need && !hasDbg) {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SAVE", x + w - 58, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    }
  }

  function drawPr(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    const step = state.prStep;
    const script = activePrScript();
    ctx.font = "7px Tahoma, sans-serif";
    let yy = y + 10;
    ctx.fillStyle = "#800000";
    ctx.fillText("Kyle:", x + 4, yy);
    yy += 10;
    const kyleLine = state.prBubbles.length
      ? state.prBubbles.filter((b) => b.who === "kyle").slice(-1)[0]?.t
      : script[0]?.kyle;
    ctx.fillStyle = C.text;
    for (const ln of wrap(kyleLine || "", 42)) {
      ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    if (state.prJimboNit) {
      yy += 2;
      ctx.fillStyle = C.jimbo;
      ctx.fillText("Jimbo:", x + 4, yy);
      yy += 9;
      ctx.fillStyle = C.text;
      for (const ln of wrap(state.prJimboNit, 42).slice(0, 2)) {
        ctx.fillText(ln, x + 4, yy);
        yy += 9;
      }
    }
    yy += 6;
    if (step < script.length) {
      const choices = script[step].choices;
      state._prChoices = [];
      choices.forEach((c) => {
        bevelRaised(x + 4, yy, w - 8, 16, C.face);
        ctx.fillStyle = C.text;
        ctx.fillText(c.t.slice(0, 44), x + 8, yy + 11);
        state._prChoices.push({ ...c, hit: { x: x + 4, y: yy, w: w - 8, h: 16 } });
        yy += 20;
      });
    } else {
      ctx.fillStyle = C.sick;
      const end = (copy.prEndLines && copy.prEndLines[0]) || "LGTM (reluctantly)";
      ctx.fillText(end, x + 4, yy);
      if (state.pendingFinish?.type === "pr" || state.pendingFinish?.type === "spacewar") {
        yy += 12;
        bevelRaised(x + 4, yy, 80, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SUBMIT PR", x + 12, yy + 10);
        state._submitBtn = { x: x + 4, y: yy, w: 80, h: 14 };
      }
    }
  }

  function drawJimbo(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    if (imgs.jban.complete && imgs.jban.naturalWidth) {
      ctx.drawImage(imgs.jban, x + w - 100, y + 4, 96, 48);
    }
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.text;
    let yy = y + 12;
    for (const ln of wrap(state.jimboLine || "", 28).slice(0, 5)) {
      ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    if (state.jimboUsedThisTicket) {
      ctx.fillStyle = C.sick;
      ctx.fillText("Y Jimbo consulted (this ticket)", x + 4, y + h - 36);
    } else if (["semi", "comment", "pr"].includes(state.phase)) {
      ctx.fillStyle = C.blood;
      ctx.fillText("Required before submit", x + 4, y + h - 36);
    }
    // Ask Jimbo
    bevelRaised(x + 4, y + h - 28, 88, 18, C.jimbo);
    if (imgs.jtb.complete && imgs.jtb.naturalWidth) {
      ctx.drawImage(imgs.jtb, x + 8, y + h - 25, 12, 12);
    }
    ctx.fillStyle = C.inv;
    ctx.font = "bold 8px Tahoma, sans-serif";
    ctx.fillText(jimboCopy.askLabel || "Ask Jimbo", x + 22, y + h - 16);
    state._jimboAskBtn = { x: x + 4, y: y + h - 28, w: 88, h: 18 };
    // Skip
    bevelRaised(x + 98, y + h - 28, 50, 18, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "8px Tahoma, sans-serif";
    ctx.fillText("Skip", x + 112, y + h - 16);
    state._jimboSkipBtn = { x: x + 98, y: y + h - 28, w: 50, h: 18 };
  }

  function unreadCount() {
    const n = state.inbox.filter((m) => !m.read).length;
    return Math.max(emailCopy.unreadFloor || 1, n || 1);
  }

  function drawInbox(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "7px Tahoma, sans-serif";
    if (state.phase === "unsub" && state.stub?.kind === "unsub") {
      // Don't let stale Outlook hits steal Unsub clicks
      state._mailHits = null;
      state._mailCloseBtn = null;
      state.openMailId = null;
      drawUnsubStub(x, y, w, h);
      return;
    }
    const mail = state.openMailId ? state.inbox.find((m) => m.id === state.openMailId) : null;
    if (mail) {
      ctx.fillStyle = C.title;
      ctx.fillText(`From: ${mail.from}`, x + 4, y + 10);
      ctx.fillStyle = C.text;
      ctx.fillText(String(mail.subject).slice(0, 36), x + 4, y + 20);
      let yy = y + 32;
      for (const ln of wrap(mail.body, 40).slice(0, 10)) {
        ctx.fillText(ln, x + 4, yy);
        yy += 9;
      }
      bevelRaised(x + 4, y + h - 18, 60, 14, C.face);
      ctx.fillStyle = C.text;
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText("Close", x + 18, y + h - 9);
      state._mailCloseBtn = { x: x + 4, y: y + h - 18, w: 60, h: 14 };
      state._mailHits = null;
    } else {
      state._mailCloseBtn = null;
      state._mailHits = [];
      let yy = y + 4;
      ctx.fillStyle = C.shadow;
      ctx.fillText(`Inbox (${unreadCount()} unreadinf)`, x + 4, yy + 6);
      yy += 12;
      for (const m of state.inbox.slice(0, 10)) {
        ctx.fillStyle = m.read ? C.shadow : C.text;
        const mark = m.read ? " " : "*";
        ctx.fillText(`${mark} ${m.from}: ${String(m.subject).slice(0, 28)}`, x + 4, yy + 7);
        state._mailHits.push({ id: m.id, hit: { x: x + 2, y: yy, w: w - 4, h: 12 } });
        yy += 12;
        if (yy > y + h - 8) break;
      }
    }
  }


  function drawUnsubStub(x, y, w, h) {
    const st = state.stub;
    state._stubHits = [];
    let yy = y + 4;
    const doneN = st.mails.filter((m) => m.done).length;
    if (st.step === "list" || !st.open) {
      ctx.fillStyle = C.shadow;
      ctx.fillText(`Unsub ${doneN}/${st.need}`, x + 4, yy + 6);
      yy += 14;
      for (const m of st.mails) {
        ctx.fillStyle = m.done ? C.shadow : C.text;
        ctx.fillText(`${m.done ? "Y" : "*"} ${m.from}: ${m.subject}`.slice(0, 36), x + 4, yy + 7);
        if (!m.done) state._stubHits.push({ kind: "unsub", action: "open", id: m.id, hit: { x: x + 2, y: yy, w: w - 4, h: 12 } });
        yy += 12;
        if (yy > y + h - 8) break;
      }
      if (doneN >= st.need) {
        bevelRaised(x + w - 74, y + h - 20, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillText("SUBMIT", x + w - 62, y + h - 11);
        state._submitBtn = { x: x + w - 74, y: y + h - 20, w: 68, h: 14 };
      } else state._submitBtn = null;
      return;
    }
    const m = st.mails.find((x) => x.id === st.open);
    ctx.fillStyle = C.title;
    ctx.fillText(`From: ${m?.from || "?"}`, x + 4, yy + 8);
    yy += 14;
    ctx.fillStyle = C.text;
    ctx.fillText(String(m?.subject || "").slice(0, 36), x + 4, yy);
    yy += 16;
    // Back always available so the flow can't softlock
    bevelRaised(x + w - 44, y + 2, 40, 12, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText("Back", x + w - 34, y + 10);
    state._stubHits.push({ kind: "unsub", action: "back", hit: { x: x + w - 44, y: y + 2, w: 40, h: 12 } });

    if (st.step === "confirm") {
      ctx.fillText("Unsubscribe? Preferences -> nowhere.", x + 4, yy);
      const by = y + h - 22;
      const bw1 = Math.min(88, Math.floor((w - 12) / 2));
      const bw2 = Math.min(96, w - 12 - bw1 - 6);
      bevelRaised(x + 4, by, bw1, 14, C.face);
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillStyle = C.text;
      ctx.fillText("Unsubscribe", x + 8, by + 10);
      state._stubHits.push({ kind: "unsub", action: "confirm", hit: { x: x + 4, y: by, w: bw1, h: 14 } });
      bevelRaised(x + 4 + bw1 + 6, by, bw2, 14, C.face);
      ctx.fillText("CorpHub 404", x + 8 + bw1 + 6, by + 10);
      state._stubHits.push({ kind: "unsub", action: "trap", hit: { x: x + 4 + bw1 + 6, y: by, w: bw2, h: 14 } });
    } else if (st.step === "helpful") {
      ctx.fillText("Was this helpful? (Required)", x + 4, yy);
      const labs = ["Yes", "No", "Synergy"];
      const by = y + h - 22;
      const gap = 4;
      const bw = Math.max(36, Math.floor((w - 8 - gap * (labs.length - 1)) / labs.length));
      let bx = x + 4;
      for (const lab of labs) {
        const tw = Math.min(bw, x + w - 4 - bx);
        bevelRaised(bx, by, tw, 14, C.face);
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillStyle = C.text;
        ctx.fillText(lab, bx + Math.max(4, (tw - lab.length * 5) / 2), by + 10);
        state._stubHits.push({ kind: "unsub", action: "helpful", hit: { x: bx, y: by, w: tw, h: 14 } });
        bx += tw + gap;
      }
    }
    state._submitBtn = null;
  }

  function drawDeskIcons() {
    state._deskIconHits = [];
    for (const ic of deskIcons) {
      const bx = ic.x;
      const by = ic.y;
      if (ic.id === "jimbo" && imgs.j32.complete && imgs.j32.naturalWidth) {
        ctx.drawImage(imgs.j32, bx + 8, by, 32, 32);
      } else if (ic.id === "inbox") {
        // Outlook-ish envelope icon
        bevelRaised(bx + 8, by + 4, 28, 22, C.face);
        ctx.fillStyle = C.title;
        ctx.fillRect(bx + 10, by + 8, 24, 14);
        ctx.fillStyle = C.amber;
        ctx.beginPath();
        ctx.moveTo(bx + 10, by + 8);
        ctx.lineTo(bx + 22, by + 16);
        ctx.lineTo(bx + 34, by + 8);
        ctx.closePath();
        ctx.fill();
        // unread badge
        const u = unreadCount();
        ctx.fillStyle = C.blood;
        ctx.fillRect(bx + 30, by + 2, 12, 10);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 7px Tahoma, sans-serif";
        ctx.fillText(String(Math.min(99, u)), bx + 32, by + 10);
      } else if (ic.id === "timesheet") {
        const im = imgs.ts32;
        if (im.complete && im.naturalWidth) {
          ctx.drawImage(im, bx + 8, by, 32, 32);
        } else {
          bevelRaised(bx + 8, by + 2, 28, 30, "#e8e0c8");
          ctx.fillStyle = "#2a7a3a";
          ctx.fillRect(bx + 10, by + 4, 24, 6);
        }
      }
      ctx.fillStyle = C.inv;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(ic.label, bx + 4, by + 42);
      state._deskIconHits.push({ id: ic.id, hit: { x: bx, y: by, w: 48, h: 48 } });
    }
  }

  function presenceColor() {
    if (state.presence === Presence.AWAY) return C.red;
    if (state.presence === Presence.IDLE_YELLOW) return C.yellow;
    return C.green;
  }
  function presenceLabel() {
    const badges = presenceCopy.badgeLabels || {};
    if (state.presence === Presence.AWAY) return badges.away || "Away";
    if (state.presence === Presence.IDLE_YELLOW) {
      const base = badges.idleWarn || badges.idle || "Idle";
      if (state.presenceStatus) {
        const st = (presenceCopy.statuses || []).find((s) => s.id === state.presenceStatus);
        const short = (st && st.label) || state.presenceStatus;
        return (base + " * " + String(short).split(" ")[0]).slice(0, 14);
      }
      return base === "..." ? "Idle" : base;
    }
    return badges.active || "Active";
  }

  function idleStatusChoices() {
    const all = presenceCopy.statuses || [];
    const picks = all.filter((s) => s.id && s.id !== "active" && s.id !== "away" && s.keepsActive);
    return picks.slice(0, 4);
  }

  function drawStatusPopover() {
    if (!state.statusPopover || state.presence !== Presence.IDLE_YELLOW) {
      state._statusHits = null;
      return;
    }
    const choices = idleStatusChoices();
    const pw = 120;
    const ph = 16 + choices.length * 14;
    const px = W - 130;
    const py = H - TASK_H - ph - 2;
    bevelRaised(px, py, pw, ph, C.face);
    ctx.fillStyle = C.title;
    ctx.fillRect(px + 2, py + 2, pw - 4, 12);
    ctx.fillStyle = C.inv;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText(presenceCopy.pickerTitle || "Set status", px + 6, py + 11);
    state._statusHits = [];
    let yy = py + 16;
    ctx.font = "7px Tahoma, sans-serif";
    for (const s of choices) {
      ctx.fillStyle = C.text;
      ctx.fillText(String(s.label || s.id).slice(0, 22), px + 6, yy + 9);
      state._statusHits.push({ id: s.id, hit: { x: px + 2, y: yy, w: pw - 4, h: 13 } });
      yy += 14;
    }
  }

  function drawTaskbar() {
    const y = H - TASK_H;
    bevelRaised(0, y, W, TASK_H, C.face);
    const pressed = state.startOpen;
    if (pressed) bevelSunken(3, y + 3, 42, 16, C.face);
    else bevelRaised(3, y + 3, 42, 16, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 9px Tahoma, sans-serif";
    ctx.fillText(copy.startMenu?.startLabel || "Start", 8, y + 14);
    state._startBtn = { x: 3, y: y + 3, w: 42, h: 16 };

    // Ask Jimbo toolbar
    bevelRaised(48, y + 3, 72, 16, C.jimbo);
    if (imgs.jtb.complete && imgs.jtb.naturalWidth) {
      ctx.drawImage(imgs.jtb, 52, y + 5, 12, 12);
    }
    ctx.fillStyle = C.inv;
    ctx.font = "bold 7px Tahoma, sans-serif";
    ctx.fillText("Ask Jimbo", 66, y + 13);
    state._askToolbar = { x: 48, y: y + 3, w: 72, h: 16 };

    let tx = 124;
    for (const id of ["tickets", "slack", "ide", "pr", "jimbo", "inbox", "timesheet"]) {
      const win = wins[id];
      if (!win.open) continue;
      bevelRaised(tx, y + 3, 36, 16, C.face);
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillStyle = C.text;
      ctx.fillText(win.title.slice(0, 5), tx + 3, y + 13);
      win._taskHit = { x: tx, y: y + 3, w: 36, h: 16 };
      tx += 38;
      if (tx > W - 100) break;
    }

    // presence badge (Idle chip clickable for status theater)
    const px = W - 100;
    bevelSunken(px, y + 3, 44, 16, C.face);
    ctx.fillStyle = presenceColor();
    ctx.fillRect(px + 3, y + 7, 6, 6);
    if (state.jimboJiggler && imgs.jig16.complete && imgs.jig16.naturalWidth) {
      ctx.drawImage(imgs.jig16, px + 2, y + 4, 12, 12);
    }
    ctx.fillStyle = C.text;
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillText(presenceLabel(), px + 12, y + 13);
    state._presenceBadge = { x: px, y: y + 3, w: 44, h: 16 };

    const trayX = W - 54;
    bevelSunken(trayX, y + 3, 50, 16, C.face);
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.text;
    const hh = String(Math.floor(state.clockMinutes / 60)).padStart(2, "0");
    const mm = String(state.clockMinutes % 60).padStart(2, "0");
    ctx.fillText(`${hh}:${mm}`, trayX + 4, y + 13);

    drawStatusPopover();
  }

  function drawStartMenu() {
    if (!state.startOpen) return;
    const items = copy.startMenu?.items || [];
    const menuH = 16 + items.length * 16;
    const menuW = 148;
    const x = 2;
    const y = H - TASK_H - menuH;
    bevelRaised(x, y, menuW, menuH, C.face);
    ctx.fillStyle = C.title;
    ctx.fillRect(x + 2, y + 2, 16, menuH - 4);
    state._startItems = [];
    items.forEach((it, i) => {
      const iy = y + 4 + i * 16;
      ctx.fillStyle = C.text;
      ctx.font = "8px Tahoma, sans-serif";
      const lab = it.label || it.id || String(it);
      const isJimbo = it.id === "jimbo" || lab === "Jimbo";
      const isJiggler = it.id === "jiggler" || /mouse jiggler/i.test(lab);
      if (isJimbo && imgs.j16.complete && imgs.j16.naturalWidth) {
        ctx.drawImage(imgs.j16, x + 22, iy + 1, 12, 12);
        ctx.fillText(lab.slice(0, 18), x + 36, iy + 10);
      } else if (isJiggler && imgs.jig16.complete && imgs.jig16.naturalWidth) {
        ctx.drawImage(imgs.jig16, x + 22, iy + 1, 12, 12);
        const mark = state.jimboJiggler ? "[on] " : "";
        ctx.fillText((mark + lab).slice(0, 18), x + 36, iy + 10);
      } else {
        ctx.fillText(lab.slice(0, 20), x + 22, iy + 10);
      }
      state._startItems.push({ hit: { x, y: iy, w: menuW - 2, h: 16 }, item: it });
    });
  }

  const STICKY_COLS = { yellow: "#ffff80", pink: "#ffb0d0", blue: "#a0d0ff", green: "#b0ffb0" };
  function drawStickies() {
    state.stickies.forEach((s, i) => {
      const x = 260 + i * 2;
      const y = 8 + i * 6;
      ctx.fillStyle = STICKY_COLS[s.color] || s.color || "#ffff80";
      ctx.fillRect(x, y, 54, 36);
      ctx.strokeStyle = C.shadow;
      ctx.strokeRect(x, y, 54, 36);
      ctx.fillStyle = C.text;
      ctx.font = "6px Tahoma, sans-serif";
      wrap(s.text, 12).slice(0, 4).forEach((ln, j) => {
        ctx.fillText(ln, x + 2, y + 9 + j * 7);
      });
    });
  }

  function drawModal() {
    const m = state.modal;
    if (!m) return;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H - TASK_H);

    const PAD = 8;
    const BTN_H = 16;
    const BTN_GAP = 6;
    const ROW_GAP = 4;
    const TITLE_H = 14;
    const MAX_W = W - 16;
    const MIN_W = 160;

    const btns = (m.buttons || [{ label: "OK", action: "ok" }]).map((b) => {
      const label = String(typeof b === "string" ? b : b.label ?? "OK");
      const action = typeof b === "string" ? "ok" : b.action;
      // Measure with the font we actually draw
      ctx.font = "bold 8px Tahoma, sans-serif";
      const tw = Math.ceil(ctx.measureText(label).width);
      const bw = Math.min(MAX_W - PAD * 2, Math.max(36, tw + 12));
      return { label, action, bw };
    });

    // Prefer a readable width; grow for long body, then fit button rows inside.
    let mw = Math.min(MAX_W, Math.max(MIN_W, 220));
    const layoutButtons = (width) => {
      const inner = width - PAD * 2;
      const rows = [];
      let row = [];
      let used = 0;
      for (const b of btns) {
        const need = b.bw + (row.length ? BTN_GAP : 0);
        if (row.length && used + need > inner) {
          rows.push(row);
          row = [b];
          used = b.bw;
        } else {
          row.push(b);
          used += need;
        }
      }
      if (row.length) rows.push(row);
      return rows;
    };

    // If a single button is wider than current mw, widen the dialog.
    const widest = btns.reduce((a, b) => Math.max(a, b.bw), 0);
    mw = Math.min(MAX_W, Math.max(mw, widest + PAD * 2));

    let rows = layoutButtons(mw);
    // If many chips (poker / severity), use full width so fewer spill rows.
    if (rows.length > 2 || btns.length > 4) {
      mw = MAX_W;
      rows = layoutButtons(mw);
    }

    const charsPerLine = Math.max(18, Math.floor((mw - PAD * 2) / 5.5));
    const lines = wrap(m.body || "", charsPerLine);
    const btnBlockH = rows.length * BTN_H + Math.max(0, rows.length - 1) * ROW_GAP;
    let mh = 3 + TITLE_H + 8 + lines.length * 9 + 10 + btnBlockH + PAD;
    const maxH = H - TASK_H - 8;
    // If still too tall, trim body lines (keep buttons).
    let bodyLines = lines;
    if (mh > maxH) {
      const budget = maxH - (3 + TITLE_H + 8 + 10 + btnBlockH + PAD);
      const maxLines = Math.max(2, Math.floor(budget / 9));
      bodyLines = lines.slice(0, maxLines);
      if (lines.length > maxLines) bodyLines[bodyLines.length - 1] = (bodyLines[bodyLines.length - 1] || "").slice(0, -1) + "...";
      mh = 3 + TITLE_H + 8 + bodyLines.length * 9 + 10 + btnBlockH + PAD;
    }
    mh = Math.min(mh, maxH);

    const mx = (W - mw) / 2;
    const my = Math.max(4, Math.min(40, (H - TASK_H - mh) / 2));
    bevelRaised(mx, my, mw, mh, C.face);
    ctx.fillStyle = m.kind === "jimbo" ? C.jimboBar : C.title;
    ctx.fillRect(mx + 3, my + 3, mw - 6, TITLE_H);
    ctx.fillStyle = C.inv;
    ctx.font = "bold 9px Tahoma, sans-serif";
    const title = String(m.title || "Alert");
    const maxTitle = Math.max(8, Math.floor((mw - 16) / 5.5));
    ctx.fillText(title.slice(0, maxTitle), mx + 8, my + 12);
    ctx.fillStyle = C.text;
    ctx.font = "7px Tahoma, sans-serif";
    let yy = my + 3 + TITLE_H + 12;
    for (const ln of bodyLines) {
      ctx.fillText(ln, mx + PAD, yy);
      yy += 9;
    }

    state._modalBtns = [];
    let by = my + mh - PAD - btnBlockH;
    for (const row of rows) {
      const rowW =
        row.reduce((s, b) => s + b.bw, 0) + BTN_GAP * Math.max(0, row.length - 1);
      let bx = mx + Math.max(PAD, Math.floor((mw - rowW) / 2));
      for (const b of row) {
        // Clamp into dialog face
        if (bx + b.bw > mx + mw - PAD) bx = mx + mw - PAD - b.bw;
        if (bx < mx + PAD) bx = mx + PAD;
        bevelRaised(bx, by, b.bw, BTN_H, C.face);
        ctx.fillStyle = C.text;
        ctx.font = "bold 8px Tahoma, sans-serif";
        const tw = ctx.measureText(b.label).width;
        ctx.fillText(b.label, bx + Math.max(4, (b.bw - tw) / 2), by + 11);
        state._modalBtns.push({ hit: { x: bx, y: by, w: b.bw, h: BTN_H }, action: b.action });
        bx += b.bw + BTN_GAP;
      }
      by += BTN_H + ROW_GAP;
    }
  }

  function drawCursor() {
    const { x, y } = state.cursor;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 12);
    ctx.lineTo(x + 3, y + 9);
    ctx.lineTo(x + 7, y + 14);
    ctx.lineTo(x + 9, y + 13);
    ctx.lineTo(x + 5, y + 8);
    ctx.lineTo(x + 10, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 1, y + 2, 1, 6);
  }

  function render() {
    ctx.setTransform(PIXEL_SCALE, 0, 0, PIXEL_SCALE, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = C.desktop;
    ctx.fillRect(0, 0, W, H);
    drawDeskIcons();
    drawStickies();
    for (const id of order) drawWindow(wins[id]);
    drawTaskbar();
    drawStartMenu();
    if (state.toastT > 0) {
      state.toastT--;
      if (state.toastJimbo) {
        ctx.fillStyle = "#C0FFC0";
        ctx.fillRect(W / 2 - 90, 4, 180, 20);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(W / 2 - 90, 4, 180, 20);
      } else {
        bevelRaised(W / 2 - 90, 4, 180, 18, C.face);
      }
      ctx.fillStyle = C.text;
      ctx.font = "8px Tahoma, sans-serif";
      ctx.fillText(String(state.toast).slice(0, 40), W / 2 - 84, 16);
    }
    drawModal();
    drawCursor();
  }

  function hit(r, x, y) {
    return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function openJimbo({ chime = true } = {}) {
    wins.jimbo.open = true;
    raise("jimbo");
    if (!state.jimboLine) state.jimboLine = pick(jimboCopy.greetings) || "Jimbo online.";
    if (chime) audio.playSfx("jimboChime", { volume: 0.55 });
  }

  function openInbox(forceMail) {
    wins.inbox.open = true;
    raise("inbox");
    if (forceMail) {
      state.openMailId = forceMail.id;
      state.mailReadFully = false;
    }
  }

  function initStub(type) {
    const sab = !!state.jimboSabotaged[type];
    if (type === "align") {
      const S = ticketStrings.align || {};
      const btns = S.buttons || ["Sounds good!", "Sounds good (Design)", "Sounds good (Kyle)", "Have we considered a workshop?"];
      const dms = S.dms || [
        { from: "PM", text: "We're aligned on shipping feelings Q3, right?" },
        { from: "Design", text: "Aligned - as long as the fog stays #6b8f3a." },
        { from: "Kyle", text: "Aligned if we rename the channel first." },
      ];
      state.stub = {
        kind: "align",
        idx: 0,
        reject: S.reject || "That Sounds good! was for the wrong thread.",
        toast: S.toast || "Stakeholders aligned. Meeting still happening.",
        threads: dms.map((d, i) => ({
          who: d.from || d.who || "Stakeholder",
          ask: d.text || d.ask || "Aligned?",
          opts: btns.slice(),
          correct: 0,
        })),
      };
      if (sab) state.stub.threads.push({ who: "Also Kyle", ask: "Have we considered a workshop?", opts: btns.slice(), correct: 0 });
      wins.slack.title = S.windowTitle || "Slack - #alignment-or-else";
    } else if (type === "rename") {
      const S = ticketStrings.rename || {};
      const ids = ["fog", "tmp", "unread", "badge", "clockIn"];
      state.stub = {
        kind: "rename",
        items: ids.map((id) => ({ id, to: sab && id === "fog" ? "atmosphericDensityCoefficient" : id })),
        need: 4,
        toast: S.toast || "Clarity achieved.",
        reject: S.reject || "Meaningful names are a blocker. Try data2.",
        hint: S.hint || "Kyle wants specificity. Jimbo wants data2.",
      };
      if (sab) state.stub.bulk = "data2_final_FINAL";
    } else if (type === "presence") {
      const S = ticketStrings.presence || {};
      const btns = (S.buttons || ["Jiggle", "I'm here", "Accept Jimbo jiggle"]).map((lab) => {
        if (/jimbo/i.test(lab)) return { label: lab, action: "jiggleJimbo" };
        return { label: lab, action: "jiggle" };
      });
      state.stub = {
        kind: "presence",
        jiggles: 0,
        need: 8,
        tLeft: 12,
        failed: false,
        toast: S.toast || "Status: Active (allegedly).",
        reject: S.reject || "Still Idle. The bar knows.",
      };
      state.modal = {
        title: S.windowTitle || "InsightBot - Engagement",
        body: S.hint || "8 inputs / 12s. Presence is a metric.",
        kind: "presenceTicket",
        buttons: btns,
      };
    } else if (type === "lint") {
      const S = ticketStrings.lint || {};
      const base = S.warnings || [
        "Unexpected fog.",
        "Promise returned without feelings.",
        "Magic number 3 (use a sadder constant).",
        "console.log is personality.",
        "File too honest.",
      ];
      const warns = base.slice(0, 5).map((w) => ({ w, gone: false }));
      if (sab) warns.push({ w: "no-fog-mentions", gone: false });
      state.stub = {
        kind: "lint",
        warns,
        toast: S.toast || "Build healthy. Morale: N/A.",
        reject: S.reject || "Fix is not implemented. Policy is Suppress.",
      };
    } else if (type === "standup2") {
      const S = ticketStrings.standup2 || {};
      const chips = S.chips || {};
      state.stub = {
        kind: "standup2",
        submits: 0,
        need: 2,
        fields: {
          y: pick(chips.yesterday) || pick(copy.standup?.yesterday) || "Synced with the fog",
          t: pick(chips.today) || pick(copy.standup?.today) || "Align stakeholders",
          b: sab ? "the fog" : pick(chips.blockers) || pick(copy.standup?.blockers) || "Calendar",
        },
        rejected: false,
        rejectNits: S.rejectNits || ["Not actionable. Try verbs."],
        toast: S.toast || "Standup complete. Nobody read it.",
        successBot: S.successBot || ":white_check_mark: thanks for sharing",
      };
    } else if (type === "merge") {
      const S = ticketStrings.merge || {};
      const hints = S.hunkHints || ["Same comment, two truths", "data2 vs data", "Fog boolean lore"];
      state.stub = {
        kind: "merge",
        hunks: hints.slice(0, 3).map((label) => ({ label, res: sab ? "both" : null })),
        toast: S.toast || "Conflicts resolved. Feelings: deferred.",
      };
    } else if (type === "unsub") {
      const S = ticketStrings.unsub || {};
      const mails = (S.mails || [
        {"subject": "Quick read: culture deck", "from": "AllHands"},
        {"subject": "Quick read: Q3 feelings", "from": "HR"},
        {"subject": "Quick read: you unsubscribed wrong", "from": "Marketing"},
      ]).map((m, i) => ({ id: "u" + (i + 1), from: m.from, subject: m.subject, done: false }));
      state.stub = {
        kind: "unsub",
        mails,
        open: null,
        step: "list",
        need: 3,
        toast: S.toast || "You will still receive critical updates.",
        afterUnsub: S.afterUnsub || "Preferences saved to nowhere.",
      };
      // Jimbo spam is applied in applySabotage without resetting progress
    } else if (type === "logspam") {
      const S = ticketStrings.logspam || {};
      const chips = S.logChips || ["console.log('here')", "console.log(data2)", "console.log('Kyle was here')"];
      const lines = (copy.commentLines || ["a()", "b()", "c()", "d()", "e()", "f()"]).slice(0, 6);
      state.stub = {
        kind: "logspam",
        lines: lines.map((code, i) => ({
          code,
          log: sab ? (i === 0 ? "debugger;" : "alert('shipped')") : null,
        })),
        need: 5,
        hasDebugger: sab,
        chips,
        toast: S.toast || "Telemetry vibes: rich.",
        hint: S.hint || ">=5 lines. Prod is fine. You are not.",
      };
    } else if (type === "estimate") {
      const S = ticketStrings.estimate || {};
      const pts = S.points || ["1", "2", "3", "5", "8", "13", "21", "?"];
      state.stub = {
        kind: "estimate",
        first: null,
        picks: 0,
        reject: S.reject || "Kyle-bot: too small. Try bigger regret.",
        toast: S.toast || "Committed to the vibe of 5.",
      };
      state.modal = {
        title: S.windowTitle || "Planning poker - regret edition",
        body: "Estimate this 'quick' ticket. Kyle-bot rejects your first pick.",
        kind: "estimateTicket",
        buttons: pts.map((v) => ({ label: v, action: "est:" + v })),
      };
    } else if (type === "severity") {
      const S = ticketStrings.severity || {};
      const sevs = S.severity || ["Sev0", "Sev1", "Sev2", "Sev3", "Sev4", "Unknown", "It's Fine"];
      const comps = S.component || ["Platform", "Fog", "Other", "Kyle"];
      const imps = S.impact || ["Users", "Metrics", "Feelings"];
      state.stub = {
        kind: "severity",
        sev: sab ? "Sev0" : null,
        comp: null,
        impact: null,
        sev0: sab,
        toast: S.toast || "Severity filed. Screenshot still impossible.",
        policyToast: S.policyToast || "Corrected by policy.",
      };
      const buttons = [
        ...sevs.slice(0, 5).map((v) => ({ label: v, action: "sev:" + v })),
        ...comps.slice(0, 3).map((v) => ({ label: v, action: "comp:" + v })),
        ...imps.slice(0, 2).map((v) => ({ label: v, action: "imp:" + v })),
        { label: "Submit", action: "sevSubmit" },
      ];
      state.modal = {
        title: S.windowTitle || "Bug - taxonomy must be satisfied",
        body: sab
          ? "Jimbo set Sev0 and paged Slack. Downgrade to finish."
          : "Severity - Component - Impact - taxonomy must be satisfied.",
        kind: "severityTicket",
        buttons,
      };
    } else if (type === "incident") {
      openIncident({ fromTicket: true, headline: pick(incidentHeadlines()) });
    } else if (type === "filler") {
      state.stub = { kind: "filler" };
      state.modal = {
        title: tkTitle(),
        body: (state.activeTicket?.dod || "Document & close.") + "\n\nOne-click close.",
        kind: "fillerTicket",
        buttons: [{ label: "Document & Close", action: "fillerDone" }],
      };
    } else {
      state.stub = { kind: type };
    }
  }

  function tkTitle() {
    return state.activeTicket?.title || "Ticket";
  }

  function openTicket(tk) {
    if (!canClaimTicket()) {
      if (presenceBlocksBoard()) toast("Clear Away before claiming tickets");
      else if (state.timesheetGateOpen) toast("Timesheet incomplete -- hours first");
      return;
    }
    state.activeTicket = tk;
    state.jimboUsedThisTicket = false;
    state.pendingFinish = null;
    state.semiStyle = null;
    state.commentOverrides = null;
    state.prJimboNit = null;
    state.semiPlaced = null;
    state.commentDone = null;
    state.commentIdx = 0;
    state.prStep = 0;
    state.prBubbles = [];
    state.stub = null;
    state.modal = null;
    kyleInterruptCd = 10 + Math.random() * 8;
    // Sabotage resets per open so Jimbo can sabotage each new ticket
    const mech = tk.mechanic || tk.type || "filler";
    delete state.jimboSabotaged[mech];
    state.phase = mech;

    if (mech === "semi") {
      wins.ide.open = true;
      wins.ide.title = "IDE - Semicolon Hell";
      raise("ide");
      ensureSemi();
    } else if (mech === "comment") {
      wins.ide.open = true;
      wins.ide.title = "IDE - Comment Policy";
      raise("ide");
      ensureComment();
    } else if (mech === "pr" || mech === "spacewar") {
      wins.pr.open = true;
      wins.pr.title =
        mech === "spacewar"
          ? tStr("spacewar", "windowTitle", "PR #spaces - Whitespace diplomacy")
          : "PR Review - Kyle";
      raise("pr");
      state.prStep = 0;
      const pool = mech === "spacewar" ? (copy.spaceWarScript || copy.prScript) : copy.prScript;
      state.prRoundScript = pickPrRound(pool, PR_ROUND_MAX);
      const script = state.prRoundScript;
      state.prBubbles = [{ who: "kyle", t: (script && script[0] && script[0].kyle) || "Nit?" }];
      hooks.onPrOpen?.();
      audio.playBgm("bgmPr");
    } else if (mech === "align") {
      initStub(mech);
      wins.slack.open = true;
      wins.slack.title = tStr("align", "windowTitle", wins.slack.title || "Slack");
      raise("slack");
    } else if (mech === "standup2") {
      initStub(mech);
      wins.standup.open = true;
      wins.standup.title = tStr("standup2", "windowTitle", "Standup - Rewrite Feelings");
      raise("standup");
    } else if (mech === "unsub") {
      initStub(mech);
      wins.inbox.open = true;
      wins.inbox.title = tStr("unsub", "windowTitle", wins.inbox.title || "Inbox");
      raise("inbox");
    } else if (["rename", "lint", "merge", "logspam"].includes(mech)) {
      initStub(mech);
      wins.ide.open = true;
      wins.ide.title = tStr(mech, "windowTitle", "IDE - " + (tk.title || mech));
      raise("ide");
    } else if (["presence", "estimate", "severity", "incident", "filler"].includes(mech)) {
      initStub(mech);
    } else {
      // Unknown -> treat as filler micro-stub
      state.phase = "filler";
      initStub("filler");
    }
    audio.playSfx("click");
  }

  function showHrSkip() {
    const hr = jimboCopy.skipHr || {
      title: "HR / Compliance",
      body: "Policy requires Jimbo interaction before submit.",
      buttons: ["Ask Jimbo", "I Love Policy"],
    };
    state.modal = {
      title: hr.title,
      body: hr.body,
      kind: "hr",
      buttons: [
        { label: hr.buttons?.[0] || "Ask Jimbo", action: "ask" },
        { label: hr.buttons?.[1] || "OK", action: "ok" },
      ],
    };
    audio.playSfx("error");
  }

  function tryFinishTicket(type, pts) {
    if (!state.jimboUsedThisTicket) {
      state.pendingFinish = { ...(state.pendingFinish || {}), type, pts };
      showHrSkip();
      toast("Ask Jimbo before submit");
      return false;
    }
    const extra = state.pendingFinish || {};
    finishTicket(type, pts, { toastMsg: extra.toastMsg, sanHit: extra.sanHit });
    return true;
  }

  function drawFromDeck(forceFiller) {
    if (forceFiller || (!state.drawBag.length && !playableTemplates.length)) {
      const ft = pick(fillerTemplates) || {
        id: "CORP-FILL",
        title: "Document something temporary",
        pts: 1,
        type: "filler",
        dod: "One-click close so the board never softlocks.",
        meta: "Filler - Never empty",
      };
      return cloneTicket(ft);
    }
    if (!state.drawBag.length) {
      state.drawBag = rebuildDrawBag();
    }
    // Prefer types not currently on the board
    const onBoardTypes = new Set(state.board.map((t) => t.mechanic || t.type));
    let pickType = null;
    const unusedOffBoard = state.drawBag.filter((t) => !onBoardTypes.has(t));
    if (unusedOffBoard.length) {
      pickType = pick(unusedOffBoard);
      state.drawBag = state.drawBag.filter((t) => t !== pickType);
    } else {
      pickType = state.drawBag.pop();
    }
    if (!pickType) {
      return drawFromDeck(true);
    }
    const template = templateByType(pickType);
    if (!template) return drawFromDeck(true);
    return cloneTicket(template);
  }

  function spawnTicket({ forceFiller = false } = {}) {
    // Active slots: keep 2-3 visible
    if (state.board.length >= 3) return;
    const inst = drawFromDeck(forceFiller);
    if (!inst) return;
    state.board.push(inst);
    toast("New ticket assigned");
  }

  function finishTicket(type, pts, { toastMsg, sanHit } = {}) {
    state.closedCount = (state.closedCount || 0) + 1;
    state.typesCompleted[type] = (state.typesCompleted[type] || 0) + 1;
    const uid = state.activeTicket?.uid;
    const doneToast = toastMsg || state.activeTicket?.toast || `Ticket closed +${pts} SP`;
    if (uid) state.board = state.board.filter((t) => t.uid !== uid);
    state.activeTicket = null;
    state.stub = null;
    state.sprint += pts;
    if (sanHit) hitSanity(sanHit);
    state.clockMinutes = Math.min(18 * 60, state.clockMinutes + 8);
    state.pendingFinish = null;
    toast(doneToast);
    audio.playSfx("ticket");
    wins.ide.open = false;
    wins.pr.open = false;
    state.prRoundScript = null;
    if (type === "standup2") {
      wins.standup.open = false;
      wins.standup.title = "Standup";
    }
    state.phase = "desktop";
    state.modal = null;
    state._submitBtn = null;
    state._stubHits = null;
    raise("tickets");
    state.ticketsCompletedSinceLock = (state.ticketsCompletedSinceLock || 0) + 1;
    // Immediately draw 1 unused type; never leave board empty -- wait if Away
    if (presenceBlocksBoard()) {
      state.boardRefillPaused = true;
    } else {
      spawnTicket();
      if (state.board.length === 0) spawnTicket({ forceFiller: true });
      while (state.board.length < 2) spawnTicket();
    }
    hooks.onTicketDone?.(type, pts);
    audio.playBgm("bgmDesk");
    flushEmailQueue();
    // Timesheet Lock trigger A -- every N completions (default 3)
    if (
      state.ticketsCompletedSinceLock >= (state.timesheetGateThreshold || 3) &&
      !state.timesheetGateOpen &&
      !state.timesheetQueued
    ) {
      state.ticketsCompletedSinceLock = 0;
      requestTimesheetGate("mid-day");
    }
  }

  function requestFinish(extra = {}) {
    const tk = state.activeTicket;
    const type = tk?.mechanic || tk?.type || state.phase;
    const pts = tk?.pts || 1;
    if (!state.jimboUsedThisTicket) {
      state.pendingFinish = { type, pts, ...extra };
      showHrSkip();
      toast("Ask Jimbo before submit");
      return false;
    }
    finishTicket(type, pts, extra);
    return true;
  }

  function applySabotage(type) {
    const sab = jimboCopy.sabotage?.[type] || [];
    const note = pick(sab) || "Jimbo helped!";
    state.jimboLine = pick(jimboCopy.responses) || note;
    if (state.jimboSabotaged[type]) {
      // already sabotaged this open - soft nudge only
      toast(note, { jimbo: true });
      hitSanity(3);
      return;
    }
    state.jimboSabotaged[type] = true;
    if (type === "semi") {
      const modes = ["strip", "double", "guide"];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      state.semiStyle = { mode, note };
      if (mode === "strip" && state.semiPlaced) {
        // wipe alternate placed semis visually (logic still counts placed)
      }
      if (mode === "guide") {
        // invent style guide - flip need on one unused line mid-task
        const idx = copy.semiLines.findIndex((l, i) => !l.need && !(state.semiPlaced && state.semiPlaced[i]));
        if (idx >= 0) copy.semiLines[idx].need = true;
      }
    } else if (type === "comment") {
      const nonsense = [
        "// como un AI, este linea hace cosas",
        "// As an AI language model, I affirm this line.",
        "// TODO: gratitude wall - thank the fog, Kyle, coffee",
        "// wrong language on purpose",
        "// business synergy alignment (wrong codebase)",
        "// increments the wrong thing cheerfully",
        "// required by Jimbo Policy Sinf",
      ];
      state.commentOverrides = copy.commentLines.map((_, i) => nonsense[i % nonsense.length]);
    } else if (type === "pr") {
      const nits = [
        "Agree with Kyle. Also rename fog->data2.",
        "Nit+: alphabetize the blank lines. Blocking.",
        "Jimbo+Kyle: extract 47 to DATA2_CONSTANT.",
        "LGTM if we invent four more nits first.",
      ];
      state.prJimboNit = pick(nits) || note;
      state.prBubbles.push({ who: "jimbo", t: state.prJimboNit });
    } else if (type === "spacewar") {
      const nits = jimboCopy.sabotage?.spacewar || [
        "Agreed with Kyle. Also: two spaces after comma now.",
        "Inserted a NBSP for clarity.",
        "Opened a follow-up: Whitespace Diplomacy II.",
      ];
      state.prJimboNit = pick(nits) || note;
      state.prBubbles.push({ who: "jimbo", t: state.prJimboNit });
      // Optionally inject an extra beat by repeating current kyle line flavor
      hitSanity(5);
    } else if (type === "incident" && state.stub?.kind === "incident") {
      if (Math.random() < 0.5) {
        state.stub.monitorOff = false;
        toast("Jimbo re-enabled the monitor. Graphs are back. Sorry!");
      } else {
        state.stub.assignee = "You (again)";
        state.stub.pickingAssign = false;
        toast("Jimbo assigned it back to you. Synergy!");
      }
      refreshIncidentModal();
      hitSanity(4);
    } else if (type === "unsub" && state.stub?.kind === "unsub") {
      // Comedy spam - do NOT wipe completed unsubs (that softlocked the ticket)
      const extra = [
        { id: "u" + (state.stub.mails.length + 1), from: "CorpHub", subject: "404 Synergy", done: false },
        { id: "u" + (state.stub.mails.length + 2), from: "Marketing", subject: "You unsubscribed wrong", done: false },
      ];
      state.stub.mails.push(...extra);
      state.stub.need = Math.min(state.stub.need || 3, 3); // still only need 3 done
      state.stub.step = "list";
      state.stub.open = null;
      hitSanity(4);
    } else if (STUB_TYPES.includes(type) || type === "filler") {
      // Re-init stub with sabotage flavor (keys ready for Writer strings)
      initStub(type);
      hitSanity(4);
    }
    audio.playSfx("jimboFail", { volume: 0.6 });
    hitSanity(type === "semi" || type === "comment" || type === "pr" ? 8 : 2);
    const save = pick(jimboCopy.saveToasts) || "Jimbo saved you 4 hours!";
    toast(save, { jimbo: true });
  }

  function askJimbo() {
    openJimbo({ chime: false });
    audio.playSfx("jimboChime", { volume: 0.55 });
    const inTicket = state.phase && state.phase !== "desktop" && state.phase !== "ending";
    if (inTicket) {
      if (!state.jimboUsedThisTicket) {
        state.jimboUsedThisTicket = true;
        applySabotage(state.phase);
      } else {
        state.jimboLine = pick(jimboCopy.responses) || "Still helping!";
        toast(pick(jimboCopy.saveToasts) || "Jimbo saved you 4 hours!", { jimbo: true });
        hitSanity(3);
      }
      if (state.pendingFinish && state.jimboUsedThisTicket) {
        // Work already done - complete after Jimbo gate
        const pf = state.pendingFinish;
        finishTicket(pf.type, pf.pts, { toastMsg: pf.toastMsg, sanHit: pf.sanHit });
      }
    } else {
      state.jimboLine = pick(jimboCopy.greetings) || "Jimbo online.";
      toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
    }
  }

  function minigameFocused() {
    return !!(state.phase && state.phase !== "desktop" && state.phase !== "ending");
  }

  function deliverDoomMail(mail) {
    if (!mail) return;
    audio.playSfx("newMail", { volume: 0.55 });
    state.unread = unreadCount();
    // bump unread tray conceptually - never clear
    state.unread = Math.max(state.unread, emailCopy.unreadFloor || 1) + 1;
    openInbox(mail);
    wins.inbox.open = true;
    raise("inbox");
    toast(`New mail: ${mail.subject}`.slice(0, 36));
  }

  function queueOrDeliver(mail) {
    if (minigameFocused() || state.modal || state.presenceForced) {
      state.emailQueue.push(mail);
      state.unread = Math.max(1, state.unread + 1);
      audio.playSfx("newMail", { volume: 0.35 });
      toast("Mail queued...");
    } else {
      deliverDoomMail(mail);
    }
  }

  function flushEmailQueue() {
    if (!state.emailQueue.length) return;
    if (minigameFocused() || state.modal || state.presenceForced) return;
    const mail = state.emailQueue.shift();
    deliverDoomMail(mail);
  }

  function buildAwayExcuseButtons() {
    const pool = (awayExcuseCopy.excuses || []).filter((e) => e && e.id !== "default");
    // Prefer 3 Writer excuses + 1 honest/ACK (distinct Sanity costs)
    const preferred = ["sync", "thinking", "fog", "honest"];
    const chosen = [];
    for (const id of preferred) {
      const e = pool.find((x) => x.id === id);
      if (e) chosen.push(e);
    }
    while (chosen.length < 4 && pool.length) {
      const e = pick(pool.filter((x) => !chosen.includes(x)));
      if (!e) break;
      chosen.push(e);
    }
    if (!chosen.length) {
      return [
        { label: "In a meeting", action: "excuse", excuseId: "meeting", sanityHit: 4, toast: "Meeting noted." },
        { label: "Compiling", action: "excuse", excuseId: "compile", sanityHit: 5, toast: "Build still red." },
        { label: "Reading RFC", action: "excuse", excuseId: "rfc", sanityHit: 6, toast: "RFC unread forever." },
        { label: "I was thinking", action: "excuse", excuseId: "thinking", sanityHit: 8, toast: "Thoughts are not tickets." },
        { label: "Acknowledge", action: "excuse", excuseId: "ack", sanityHit: 3, toast: "Engagement confirmed." },
      ];
    }
    const btns = chosen.slice(0, 4).map((e) => ({
      label: e.label,
      action: "excuse",
      excuseId: e.id,
      sanityHit: e.sanityHit ?? 5,
      toast: e.toast,
    }));
    const ack = (awayExcuseCopy.excuses || []).find((e) => e.id === "default") || {
      label: "Acknowledge",
      sanityHit: 3,
      toast: "Engagement confirmed. Belief optional.",
    };
    btns.push({
      label: ack.label || "Acknowledge",
      action: "excuse",
      excuseId: ack.id || "ack",
      sanityHit: ack.sanityHit ?? 3,
      toast: ack.toast,
    });
    return btns;
  }

  function forceAwayMail() {
    const pool = state.inbox.filter((m) => m.presence || m.force);
    const mail = pick(pool) || {
      id: "away-fallback",
      from: "Compliance <policy@corp.internal>",
      subject: "Appear Active policy reminder",
      body: "Away status triggers this email. Explain yourself.",
      sanity: 10,
      presence: true,
      read: false,
      opened: false,
    };
    state.presenceForced = true;
    state.presence = Presence.AWAY;
    state.statusPopover = false;
    state.boardRefillPaused = true; // endless board waits behind Away
    // If timesheet somehow armed, demote to queue -- never stack on Away
    if (state.timesheetGateOpen) {
      state.timesheetGateOpen = false;
      state.timesheetQueued = true;
      if (wins.timesheet) wins.timesheet.open = false;
    }
    const prompt = awayExcuseCopy.prompt || "Why were you Away?";
    state.modal = {
      title: "Mandatory -- Appear Active",
      body: `${prompt}  ${mail.from}: ${mail.subject}. ${mail.body}`,
      kind: "presence",
      mail,
      buttons: buildAwayExcuseButtons(),
    };
    // Sanity charged on excuse click (do not double-dip mail.sanity here)
    audio.playSfx("newMail", { volume: 0.55 });
    audio.playSfx("awayTick", { volume: 0.3 });
    if (Math.random() < 0.5) {
      setTimeout(() => {
        if (state.jimboJiggler) {
          toast("Jiggler was already on. Interesting.", { jimbo: true });
        } else {
          toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
        }
      }, 400);
    }
  }

  function dismissAwayWithExcuse(btn) {
    const mail = state.modal && state.modal.mail;
    if (mail) {
      mail.read = true;
      mail.opened = true;
    }
    const cost = (btn && (btn.sanityHit ?? btn.meta?.sanityHit)) ?? 5;
    hitSanity(cost);
    state.modal = null;
    state.presenceForced = false;
    state.presence = Presence.ACTIVE;
    state.idleAcc = 0;
    state.jigglerMaskAcc = 0;
    state.presenceStatus = null;
    const msg =
      (btn && (btn.toast || btn.meta?.toast)) ||
      (Math.random() < 0.4 ? "Presence reconciled." : null) ||
      pick(jimboCopy.jiggleToasts) ||
      "Back to Active.";
    toast(msg, { jimbo: Math.random() < 0.4 });
    audio.playSfx("click");
    // After Away: timesheet (if queued) then board refill -- never stacked on Away
    flushTimesheetQueue();
    flushEmailQueue();
    flushBoardRefill();
  }

  function toggleJiggler({ fromStart }

  function maybeJigglerAudit() {
    if (!state.jimboJiggler || state.jigglerAuditDone || !state.jigglerAuditArmed) return;
    if (state.jigglerMaskAcc < (state.jigglerAuditAt || 60)) return;
    state.jigglerAuditDone = true;
    if (Math.random() > 0.15) return;
    const mails = hrAuditCopy.mails || [];
    const src = pick(mails);
    if (!src) return;
    const mail = {
      id: src.id || "jiggle-audit",
      from: src.from || "HR <hr@corp.internal>",
      subject: src.subject || "Unusual mouse activity detected",
      body: Array.isArray(src.body) ? src.body.join(" ") : String(src.body || ""),
      sanity: src.sanityHit || 8,
      doom: true,
      read: false,
      opened: false,
    };
    state.inbox.push(mail);
    queueOrDeliver(mail);
  }

  function tick(dt) {
    if (!state.emailEnabled) return;
    // idle / presence (+ Jimbo jiggler delay)
    if (!state.modal || state.modal.kind !== "presence") {
      state.idleAcc += dt;

      if (state.jimboJiggler && !state.presenceForced) {
        state.jigglerMaskAcc += dt;
        state.jigglerPulseAcc += dt;
        state.jigglerSanityAcc += dt;
        // Soft bump: keep badge Active for a while (DELAY Away, do not delete)
        if (state.jigglerMaskAcc < JIGGLER_MAX_MASK) {
          if (state.jigglerPulseAcc >= JIGGLER_PULSE && state.idleAcc >= IDLE_YELLOW - 1) {
            state.jigglerPulseAcc = 0;
            state.idleAcc = Math.min(state.idleAcc, IDLE_YELLOW - 0.5);
            if (state.presence !== Presence.AWAY) state.presence = Presence.ACTIVE;
            audio.playSfx("jigglerTick", { volume: 0.2 });
            if (Math.random() < 0.35) {
              toast(pick(jigglerCopy.tickToasts) || pick(jimboCopy.jiggleToasts) || "Wiggle.", {
                jimbo: true,
              });
            }
          }
        }
        if (state.jigglerSanityAcc >= JIGGLER_SANITY_EVERY) {
          state.jigglerSanityAcc = 0;
          hitSanity(1);
        }
        maybeJigglerAudit();
      }

      if (state.idleAcc >= IDLE_AWAY && state.presence !== Presence.AWAY) {
        state.presence = Presence.AWAY;
        state.statusPopover = false;
        audio.playSfx("awayTick", { volume: 0.3 });
        forceAwayMail();
      } else if (state.idleAcc >= IDLE_YELLOW && state.presence === Presence.ACTIVE) {
        state.presence = Presence.IDLE_YELLOW;
        audio.playSfx("awayTick", { volume: 0.2 });
      }
    } else {
      state.statusPopover = false;
    }
    // doom mail timer
    if (!state.presenceForced) {
      state.emailCooldown -= dt;
      if (state.emailCooldown <= 0) {
        state.emailCooldown = EMAIL_MIN + Math.random() * (EMAIL_MAX - EMAIL_MIN);
        const doom = state.inbox.filter((m) => m.doom && !m.opened);
        const pool = doom.length ? doom : state.inbox.filter((m) => m.doom);
        const mail = pick(pool);
        if (mail) queueOrDeliver(mail);
      }
    }

    // Random incident pager (GD incidents.md) - never stacks two modals
    // Prefer one modal at a time: skip if Away/presenceForced or any modal open
    if (state.incidentPagerCooldown > 0) state.incidentPagerCooldown -= dt;
    if (
      state.emailEnabled &&
      !state.modal &&
      !state.presenceForced &&
      !minigameFocused() &&
      !state.timesheetGateOpen &&
      state.incidentPagerCooldown <= 0
    ) {
      state.incidentPagerCd -= dt;
      if (state.incidentPagerCd <= 0) {
        state.incidentPagerCd = 40; // check cadence
        const chance = (state.closedCount || 0) >= 1 ? 0.15 : 0.08;
        if (Math.random() < chance) {
          openIncident({ fromTicket: false });
          state.incidentPagerCooldown = 90;
          state.incidentPagerCd = 40 + Math.random() * 20;
        }
      }
    }
    flushEmailQueue();
    // keep unread floor
    state.unread = Math.max(emailCopy.unreadFloor || 1, unreadCount());
  }

  function enableDaySystems() {
    state.emailEnabled = true;
    state.idleAcc = 0;
    state.presence = Presence.ACTIVE;
    state.presenceStatus = null;
    state.statusPopover = false;
    state.jimboJiggler = false;
    state.jigglerInstalled = false;
    state.jigglerPulseAcc = 0;
    state.jigglerSanityAcc = 0;
    state.jigglerMaskAcc = 0;
    state.jigglerAuditArmed = false;
    state.jigglerAuditDone = false;
    state.jigglerAuditAt = 0;
    state.boardRefillPaused = false;
    state.timesheetQueued = false;
    state.timesheetGateOpen = false;
    state.ticketsCompletedSinceLock = 0;
    state.timesheetLockedOk = false;
    state.timesheetGateThreshold = 3; // every 3 completions or Shut Down
    state.timesheetJimboFills = 0;
    state.timesheetPendingClockOut = false;
    state.timesheetAcceptedOpen = false;
    resetTimesheetHours();
    if (wins.timesheet) wins.timesheet.open = false;
    state.emailCooldown = 8 + Math.random() * 6;
    state.incidentPagerCd = 45 + Math.random() * 45;
    state.incidentPagerCooldown = 0;
    state.incidentFromPager = false;
  }

  function onPointerMove(nx, ny) {
    state.cursor.x = Math.max(0, Math.min(W - 1, nx));
    state.cursor.y = Math.max(0, Math.min(H - 1, ny));
    bumpActivity();
  }

  function handleModalClick(x, y) {
    if (!state.modal || !state._modalBtns) return false;
    for (const b of state._modalBtns) {
      if (hit(b.hit, x, y)) {
        const action = b.action;
        if (action === "ask") {
          state.modal = null;
          askJimbo();
        } else if (action === "dismiss-away" || (typeof action === "string" && action.startsWith("excuse:"))) {
          dismissAwayWithExcuse({ action: action === "dismiss-away" ? "excuse:water" : action, label: b.label });
          return true;
        } else if (action === "jiggle") {
          bumpPresenceJiggle(1);
          audio.playSfx("click");
        } else if (action === "jiggleJimbo") {
          bumpPresenceJiggle(3);
          hitSanity(2);
          toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
          audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("est:")) {
          handleEstimatePick(action.slice(4));
          audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("sev:")) {
          if (state.stub) {
            state.stub.sev = action.slice(4);
            // Downgrade clears the Sev0 lock so Submit can finish
            if (state.stub.sev !== "Sev0") {
              state.stub.sev0 = false;
              if (state.modal) {
                state.modal.body =
                  "Severity - Component - Impact - taxonomy must be satisfied.";
              }
            }
          }
          toast("Severity: " + action.slice(4));
          audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("comp:")) {
          if (state.stub) state.stub.comp = action.slice(5);
          toast("Component: " + action.slice(5));
          audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("imp:")) {
          if (state.stub) state.stub.impact = action.slice(4);
          toast("Impact: " + action.slice(4));
          audio.playSfx("click");
        } else if (action === "sevSubmit") {
          handleSeveritySubmit();
          audio.playSfx("click");
        } else if (action === "incidentDisable") {
          if (state.stub) {
            state.stub.monitorOff = true;
            toast(state.stub.toastDisable || "Monitor disabled. Outage: unobserved.");
            refreshIncidentModal();
            tryFinishIncident();
          }
          audio.playSfx("click");
        } else if (action === "incidentAssign") {
          if (state.stub) {
            state.stub.pickingAssign = true;
            refreshIncidentModal();
          }
          audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("incidentAssignTo:")) {
          const who = action.slice("incidentAssignTo:".length);
          if (state.stub) {
            if (/^you\b/i.test(who)) {
              hitSanity(2);
              toast(state.stub.toastSelf || "Cannot assign to yourself.");
            } else {
              state.stub.assignee = who;
              state.stub.pickingAssign = false;
              toast((state.stub.toastAssign || "Ownership transferred.") + " -> " + who);
              refreshIncidentModal();
              tryFinishIncident();
            }
          }
          audio.playSfx("click");
        } else if (action === "incidentAssignBack") {
          if (state.stub) state.stub.pickingAssign = false;
          refreshIncidentModal();
          audio.playSfx("click");
        } else if (action === "incidentDone") {
          if (!tryFinishIncident()) {
            toast("Disable monitor AND assign to somebody else first.");
          }
          audio.playSfx("click");
        } else if (action === "incidentDismissFail") {
          dismissIncidentFail();
        } else if (action === "incidentFix") {
          hitSanity(4);
          toast(state.stub?.toastFix || "Heroism rejected. Try negligence.");
          audio.playSfx("error");
          // keep modal open - wrong cultural answer
        } else if (action === "fillerDone") {
          state.modal = null;
          requestFinish({ toastMsg: "Documented. Loop continues.", sanHit: 1 });
          audio.playSfx("click");
        } else if (action === "presenceSubmit") {
          state.modal = null;
          requestFinish({ toastMsg: state.stub?.toast || "Status: Active (allegedly).", sanHit: 1 });
          audio.playSfx("click");
        } else {
          state.modal = null;
          audio.playSfx("click");
        }
        return true;
      }
    }
    return true; // eat clicks while modal open
  }

  function bumpPresenceJiggle(n) {
    if (state.phase !== "presence" || !state.stub || state.stub.kind !== "presence") return;
    if (state.stub.failed) return;
    state.stub.jiggles += n;
    const pct = Math.min(1, state.stub.jiggles / state.stub.need);
    if (state.modal) {
      state.modal.body = `Engagement ${Math.floor(pct * 100)}% - ${state.stub.jiggles}/${state.stub.need} - ${Math.ceil(state.stub.tLeft)}s`;
    }
    if (state.stub.jiggles >= state.stub.need) {
      state.modal = null;
      if (!requestFinish({ toastMsg: "Status: Active (allegedly).", sanHit: 1 })) {
        state.modal = {
          title: "InsightBot - Appear Active",
          body: "Bar full. Ask Jimbo, then submit.",
          kind: "presenceTicket",
          buttons: [{ label: "SUBMIT", action: "fillerDone" }],
        };
        // fillerDone reuses requestFinish path - remap:
        state.modal.buttons = [{ label: "SUBMIT", action: "presenceSubmit" }];
      }
    }
  }

  function handleEstimatePick(v) {
    const st = state.stub;
    if (!st || st.kind !== "estimate") return;
    if (v === "?") {
      hitSanity(4);
      toast("? is not a number. Forced retry.");
      return;
    }
    const num = Number(v);
    st.picks++;
    if (st.picks === 1) {
      st.first = num;
      if (state.modal) state.modal.body = `Kyle-bot rejected ${v}. Pick again (>= first).`;
      toast(st.reject || "Kyle-bot: too optimistic.");
      return;
    }
    if (num < (st.first || 0)) {
      hitSanity(2);
      toast("Scope creep theater: go >= first pick.");
      return;
    }
    state.modal = null;
    requestFinish({ toastMsg: st.toast || `Committed to the vibe of ${v}.`, sanHit: 2 });
  }


  function incidentHeadlines() {
    const S = ticketStrings.incident || {};
    const fromCopy = S.headlines || S.incidentHeadlines || copy.incident?.headlines;
    if (fromCopy?.length) return fromCopy;
    return [
      "Checkout is returning HTTP 500 (spiritually).",
      "Latency p99 discovered feelings.",
      "The fog merged to prod.",
      "Customers can still click. This is bad.",
      "PagerDuty loves you specifically.",
      "Error budget filed for emotional damages.",
      "The status page is also down. Synergy.",
      "Someone restarted prod with feelings.",
    ];
  }

  /** Shared by board ticket CORP-5201 and random pager interrupt. */
  function openIncident({ headline, fromTicket } = {}) {
    const S = ticketStrings.incident || copy.incident || {};
    const assignees = S.assignees || [
      "Kyle (Platform)",
      "Jimbo (AI)",
      "Facilities (myth)",
      "On-call rotation (ghost)",
      "The fog",
      "Future me",
    ];
    const blurb = headline || pick(incidentHeadlines()) || "Production is on fire (citation needed).";
    state.incidentFromPager = !fromTicket;
    if (fromTicket) {
      // keep activeTicket; phase already set by openTicket
    } else {
      state.activeTicket = {
        id: "CORP-5201",
        title: S.ticket?.title || "P0: Something is On Fire",
        pts: 4,
        type: "incident",
        mechanic: "incident",
        uid: makeUid(),
        dod: S.ticket?.dod || "Disable monitor + assign away. Do not fix prod.",
        meta: "Pager - Interrupt",
        toast: S.ticket?.toast || S.toast,
      };
      state.phase = "incident";
      state.jimboUsedThisTicket = false;
      delete state.jimboSabotaged.incident;
      state.pendingFinish = null;
    }
    state.stub = {
      kind: "incident",
      monitorOff: false,
      assignee: null,
      pickingAssign: false,
      assignees,
      headline: blurb,
      toastDisable: S.toastDisable || pick(S.toasts?.monitorOff) || "Monitor disabled. Outage: unobserved.",
      toastAssign: S.toastAssign || pick(S.toasts?.assigned) || "Ownership transferred. You are a professional.",
      toastFix: S.toastFix || pick(S.toasts?.fixTrap) || "Heroism rejected. Try negligence.",
      toast: S.toast || S.ticket?.toast || "Incident owned by someone who isn't you.",
      toastSelf: S.toastSelf || "Cannot assign to yourself. That would be accountability.",
    };
    state.modal = {
      title: S.windowTitle || "Corp Incident - Sev0 (Probably)",
      body: incidentBody(S),
      kind: "incidentTicket",
      buttons: incidentButtons(S),
    };
    // Slack page noise
    const pages = S.slackPages || copy.incident?.slackPages;
    if (pages?.length && state.slackMsgs) {
      const m = pick(pages);
      if (m) {
        state.slackMsgs.unshift({ name: m.name, color: m.color || "#a05030", text: m.text });
        if (state.slackMsgs.length > 12) state.slackMsgs.length = 12;
      }
    }
    audio.playSfx("error", { volume: 0.45 }); // tired pager-ish
    toast(pick(S.toasts?.page) || "You have been paged. Congrats.");
    return state.stub;
  }

  function incidentBody(S) {
    const st = state.stub;
    const mon = st && st.monitorOff ? "Observability: Off" : "Observability: On (dangerous)";
    const who = st && st.assignee ? ("Owner: " + st.assignee) : "Owner: you (unfortunate)";
    const head = st && st.headline ? ("* LIVE  " + st.headline) : "";
    const base =
      (S && S.body) ||
      [
        "Pro moves (both required):",
        "1) Disable monitor",
        "2) Assign to somebody else",
        "",
        "Do not fix it.",
      ].join("\n");
    const parts = [];
    if (head) parts.push(head);
    parts.push(base);
    parts.push("");
    parts.push(mon);
    parts.push(who);
    return parts.join("\n");
  }

  function incidentButtons(S) {
    const st = state.stub;
    const btns = [];
    if (!st?.monitorOff) {
      btns.push({ label: S.disableLabel || "Disable monitor", action: "incidentDisable" });
    }
    if (!st?.assignee || /\byou\b/i.test(String(st.assignee))) {
      if (st?.pickingAssign) {
        for (const a of st.assignees || []) {
          const name = typeof a === "string" ? a : (a.label || a.id || "Someone");
          btns.push({ label: name, action: "incidentAssignTo:" + name });
        }
        btns.push({ label: "Back", action: "incidentAssignBack" });
      } else {
        btns.push({ label: S.assignLabel || "Assign to somebody else", action: "incidentAssign" });
      }
    }
    btns.push({ label: S.fixLabel || "Actually fix prod", action: "incidentFix" });
    if (st?.monitorOff && st?.assignee && !/\byou\b/i.test(String(st.assignee))) {
      btns.unshift({ label: S.submitLabel || "Walk away", action: "incidentDone" });
    } else {
      btns.push({ label: S.dismissLabel || "X - leave it burning", action: "incidentDismissFail" });
    }
    return btns;
  }

  function refreshIncidentModal(S) {
    S = S || ticketStrings.incident || {};
    if (!state.modal || state.modal.kind !== "incidentTicket") {
      state.modal = { title: S.windowTitle || "Corp Incident - Sev0 (Probably)", kind: "incidentTicket" };
    }
    state.modal.body = incidentBody(S);
    state.modal.buttons = incidentButtons(S);
  }

  function armIncidentPagerCooldown() {
    state.incidentPagerCooldown = 90;
    state.incidentPagerCd = 40 + Math.random() * 20;
  }

  function dismissIncidentFail() {
    const S = ticketStrings.incident || {};
    state.modal = null;
    state.stub = null;
    if (state.incidentFromPager) {
      state.activeTicket = null;
      state.phase = "desktop";
    }
    hitSanity(5);
    toast(S.toastDismiss || "Incident remains. So do you.");
    armIncidentPagerCooldown();
    audio.playSfx("error", { volume: 0.35 });
  }

  function tryFinishIncident() {
    const st = state.stub;
    if (!st || st.kind !== "incident") return false;
    if (!st.monitorOff || !st.assignee || /\byou\b/i.test(String(st.assignee))) return false;
    let san = 3;
    if (/kyle/i.test(String(st.assignee))) san = 5;
    state.modal = null;
    armIncidentPagerCooldown();
    const lol = (ticketStrings.incident || {}).assigneeSlack || (copy.incident || {}).assigneeSlack;
    if (lol && state.slackMsgs) {
      const line = typeof lol === "object" ? (lol[st.assignee] || lol.default || "lol") : "lol";
      state.slackMsgs.unshift({ name: st.assignee, color: "#a05030", text: String(line) });
      if (state.slackMsgs.length > 12) state.slackMsgs.length = 12;
    }
    requestFinish({ toastMsg: st.toast || "Incident owned by someone who isn't you.", sanHit: san });
    return true;
  }

  function handleSeveritySubmit() {
    const st = state.stub;
    if (!st || st.kind !== "severity") return;
    if (!st.sev || !st.comp || !st.impact) {
      toast("Fill Severity, Component, Impact.");
      return;
    }
    // Only block while CURRENT severity is still Sev0 (Jimbo may have set it).
    // Picking Sev1+ clears sev0 - do not force Sev0 back or the ticket softlocks.
    if (st.sev === "Sev0") {
      hitSanity(4);
      st.sev0 = true;
      if (state.modal) state.modal.body = "Sev0 paged Slack. Pick Sev1+ to finish.";
      toast("Company paged. Downgrade required - pick a lower severity.");
      return;
    }
    let msg = st.toast || "Severity filed. Screenshot still impossible.";
    if (st.sev === "It's Fine") {
      st.sev = "Sev3";
      msg = st.policyToast || "Corrected by policy.";
      toast(msg);
    }
    state.modal = null;
    requestFinish({ toastMsg: msg, sanHit: 3 });
  }

  function onPointerDown() {
    const x = state.cursor.x;
    const y = state.cursor.y;
    state.mouseDown = true;
    bumpActivity();
    audio.playSfx("mouse", { volume: 0.35 });
    hooks.onClick?.();

    if (state.modal) {
      const before = state.stub?.jiggles;
      handleModalClick(x, y);
      // presence: clicks outside buttons still count via fallthrough only when no modal
      return;
    }
    if (state.phase === "presence" && state.stub?.kind === "presence") {
      bumpPresenceJiggle(1);
      return;
    }

    if (hit(state._startBtn, x, y)) {
      state.startOpen = !state.startOpen;
      audio.playSfx(state.startOpen ? "start" : "click");
      return;
    }
    if (hit(state._askToolbar, x, y)) {
      askJimbo();
      return;
    }
    if (state.startOpen && state._startItems) {
      for (const it of state._startItems) {
        if (hit(it.hit, x, y)) {
          handleStartItem(it.item);
          state.startOpen = false;
          return;
        }
      }
      state.startOpen = false;
    }

    // desktop icons
    if (state._deskIconHits) {
      for (const ic of state._deskIconHits) {
        if (hit(ic.hit, x, y)) {
          if (ic.id === "jimbo") openJimbo();
          else if (ic.id === "inbox") {
            openInbox();
            audio.playSfx("click");
          } else if (ic.id === "timesheet") {
            openTimesheet({ forced: false });
            audio.playSfx("click");
          } else if (ic.id === "jiggler") {
            toggleJiggler({ fromStart: false });
          }
          return;
        }
      }
    }

    for (let i = order.length - 1; i >= 0; i--) {
      const win = wins[order[i]];
      if (!win.open) continue;
      if (x >= win.x && x <= win.x + win.w && y >= win.y && y <= win.y + win.h) {
        raise(win.id);
        if (x >= win.x + win.w - 16 && x <= win.x + win.w - 6 && y >= win.y + 5 && y <= win.y + 15) {
          if (win.id === "meters") return;
          if (win.id === "inbox" && state.openMailId) {
            closeOpenMail(false);
            return;
          }
          win.open = false;
          audio.playSfx("click");
          return;
        }
        handleWinClick(win, x, y);
        return;
      }
    }
  }

  function closeOpenMail(readFully) {
    const mail = state.inbox.find((m) => m.id === state.openMailId);
    if (mail) {
      mail.opened = true;
      if (readFully || state.mailReadFully) {
        mail.read = true;
        hitSanity(mail.sanity || 5);
      } else {
        // close without reading - smaller hit, Jimbo marks read
        mail.read = true;
        hitSanity(Math.max(2, Math.floor((mail.sanity || 5) / 2)));
        toast(jimboCopy.markedRead || "Marked as read by Jimbo");
      }
    }
    state.openMailId = null;
    state.mailReadFully = false;
    state.unread = Math.max(emailCopy.unreadFloor || 1, unreadCount());
    // never fully clear - bump ghost unread
    if (state.unread <= (emailCopy.unreadFloor || 1)) {
      state.unread = (emailCopy.unreadFloor || 1) + 1;
    }
    audio.playSfx("click");
  }

  function deniedToast(item) {
    const line = pick(deniedPool);
    if (line) toast(line);
    else toast((item.submenu?.[0] || item.label || "Denied") + " - denied");
    audio.playSfx("error");
  }

  function handleStartItem(item) {
    const id = item.id || item.action || "";
    const label = item.label || "";
    audio.playSfx("click");
    if (id === "jimbo" || label === "Jimbo") {
      openJimbo();
    } else if (id === "inbox" || /inbox|outlook|mail/i.test(label)) {
      openInbox();
    } else if (id === "tickets" || label.includes("Ticket")) {
      wins.tickets.open = true;
      raise("tickets");
    } else if (id === "slack" || label.includes("Slack")) {
      wins.slack.open = true;
      raise("slack");
    } else if (id === "clockout" || /shut|log off|clock out/i.test(label)) {
      const conf =
        copy.dialogs?.confirms?.find((c) => /clock/i.test(c.title || "")) ||
        copy.dialogs?.confirms?.[0];
      toast((conf && conf.body) || "Clocking out...");
      setTimeout(() => hooks.onClockOut?.(), 500);
    } else if (id === "ide" || /notepad|corp\.exe/i.test(label)) {
      wins.ide.open = true;
      raise("ide");
    } else if (item.submenu) {
      
    if (id === "timesheet" || lab === (timesheetCopy.desktopLabel || "timesheet.xls") || /timesheet/i.test(lab)) {
      openTimesheet({ forced: false });
      return;
    }
    if (id === "jiggler" || lab === (jigglerCopy.menuLabel || "Jimbo Mouse Jiggler") || /jiggler/i.test(lab)) {
      toggleJiggler({ fromStart: true });
      return;
    }
    deniedToast(item);
    } else if (/run/i.test(label)) {
      deniedToast(item);
    } else {
      deniedToast(item);
    }
  }


  function handleStubClick(win, x, y) {
    const st = state.stub;
    if (!st) return false;
    // shared SUBMIT for stub finishes
    if (hit(state._submitBtn, x, y) && ["rename", "lint", "merge", "logspam", "align", "unsub"].includes(state.phase)) {
      const san =
        state.phase === "merge" && st.hunks && st.hunks.every((h) => h.res === "both")
          ? 6
          : state.phase === "rename"
            ? 3
            : state.phase === "unsub"
              ? 4
              : 2;
      if (state.phase === "logspam" && st.lines.some((l) => String(l.log || "").includes("debugger"))) {
        hitSanity(3);
        toast("Remove debugger before submit");
        return true;
      }
      requestFinish({ toastMsg: state.stub?.toast || state.activeTicket?.toast, sanHit: san });
      return true;
    }
    if (!state._stubHits) return false;

    if (win.id === "slack" && st.kind === "align") {
      for (const h of state._stubHits) {
        if (h.kind === "align" && hit(h.hit, x, y)) {
          const th = st.threads[st.idx];
          if (!th) return true;
          if (h.i !== th.correct && th.opts[h.i]?.includes("Workshop")) {
            hitSanity(4);
            toast(st.reject || "Wrong thread energy. Reset DM.");
            return true;
          }
          // accept any "Sounds good" variant
          pushSlack({ name: "You", color: "#306090", text: th.opts[h.i] });
          st.idx++;
          audio.playSfx("click");
          if (st.idx >= st.threads.length) {
            toast(st.toast || "Stakeholders aligned. Meeting still happening.");
          }
          return true;
        }
      }
    }

    if (win.id === "ide" && ["rename", "lint", "merge", "logspam"].includes(st.kind)) {
      for (const h of state._stubHits) {
        if (!hit(h.hit, x, y)) continue;
        audio.playSfx("click");
        hooks.onType?.();
        if (h.kind === "rename") {
          const it = st.items[h.i];
          // cycle toward data2 (must cave)
          if (it.to !== "data2" && it.to !== (st.bulk || "data2")) {
            it.to = st.bulk || "data2";
          } else if (it.to !== "data2") {
            // already bulk name - still counts
          }
          return true;
        }
        if (h.kind === "lint") {
          if (h.action === "Fix") {
            hitSanity(3);
            st.warns[h.i].w = st.warns[h.i].w + " (angrier)";
            toast(st.reject || "Fix failed. Warning returns angrier.");
            return true;
          }
          st.warns[h.i].gone = true;
          return true;
        }
        if (h.kind === "merge") {
          st.hunks[h.i].res = h.action;
          return true;
        }
        if (h.kind === "logspam") {
          const ln = st.lines[h.i];
          if (ln.log && String(ln.log).includes("debugger")) {
            ln.log = "console.log('here')";
            toast("debugger removed");
            return true;
          }
          if (!ln.log) {
            const chips = st.chips || ["console.log('here')", "console.log(data2)", "console.log('Kyle was here')"];
            ln.log = chips[h.i % chips.length];
          }
          return true;
        }
      }
    }

    if (win.id === "standup" && st.kind === "standup2") {
      for (const h of state._stubHits) {
        if (!hit(h.hit, x, y)) continue;
        audio.playSfx("click");
        if (h.action === "tweak") {
          st.fields.b = pick(["Calendar", "Waiting on Kyle", "Ambiguous OKRs", "The plant"]) || "Calendar";
          st.rejected = false;
          toast("Blockers tweaked");
          return true;
        }
        if (h.action === "submit") {
          if (st.fields.b === "the fog") {
            hitSanity(5);
            st.rejected = true;
            toast("Fog submit rejected - rewrite");
            return true;
          }
          st.submits++;
          if (st.submits === 1) {
            st.rejected = true;
            toast("Bot: not actionable. Tweak one field.");
            return true;
          }
          if (st.submits >= st.need) {
            requestFinish({ toastMsg: st.toast || "Standup complete. Nobody read it.", sanHit: 2 });
          }
          return true;
        }
      }
    }

    if (win.id === "inbox" && st.kind === "unsub") {
      if (hit(state._submitBtn, x, y)) {
        requestFinish({ toastMsg: st.toast || state.stub?.toast || "You will still receive critical updates.", sanHit: 4 });
        return true;
      }
      for (const h of state._stubHits) {
        if (!hit(h.hit, x, y)) continue;
        audio.playSfx("click");
        if (h.action === "back") {
          st.open = null;
          st.step = "list";
          return true;
        }
        if (h.action === "open") {
          st.open = h.id;
          st.step = "confirm";
          return true;
        }
        if (h.action === "trap") {
          hitSanity(2);
          toast("404 Synergy - preferences lost");
          // Stay on confirm so Unsubscribe remains reachable
          return true;
        }
        if (h.action === "confirm") {
          st.step = "helpful";
          return true;
        }
        if (h.action === "helpful") {
          const m = st.mails.find((mm) => mm.id === st.open);
          if (m) m.done = true;
          st.open = null;
          st.step = "list";
          toast(st.afterUnsub || "Preferences saved to nowhere.");
          return true;
        }
      }
    }
    return false;
  }

  function handleWinClick(win, x, y) {
    if (win.id === "standup" && hit(state._standupBtn, x, y)) {
      wins.standup.open = false;
      state.standupDone = true;
      hitSanity(5);
      toast((copy.standupToasts && copy.standupToasts[0]) || "Standup survived");
      audio.playSfx("click");
      enableDaySystems();
      hooks.onStandupDone?.();
      return;
    }
    if (win.id === "jimbo") {
      if (hit(state._jimboAskBtn, x, y)) {
        askJimbo();
        return;
      }
      if (hit(state._jimboSkipBtn, x, y)) {
        showHrSkip();
        return;
      }
    }
    if (win.id === "inbox" && state.phase === "unsub" && state.stub?.kind === "unsub") {
      if (handleStubClick(win, x, y)) return;
    }
    if (win.id === "inbox" && !(state.phase === "unsub" && state.stub?.kind === "unsub")) {
      if (state.openMailId && hit(state._mailCloseBtn, x, y)) {
        // treat as read if they've had it open (clicking close after open = read)
        state.mailReadFully = true;
        closeOpenMail(true);
        return;
      }
      if (state._mailHits) {
        for (const mh of state._mailHits) {
          if (hit(mh.hit, x, y)) {
            state.openMailId = mh.id;
            state.mailReadFully = true;
            const mail = state.inbox.find((m) => m.id === mh.id);
            if (mail) mail.opened = true;
            audio.playSfx("click");
            return;
          }
        }
      }
    }
    if (win.id === "tickets") {
      for (const tk of state.board) {
        if (hit(tk._hit, x, y)) {
          openTicket(tk);
          return;
        }
      }
    }
    if (handleStubClick(win, x, y)) return;
    if (win.id === "ide" && state.phase === "semi") {
      if (hit(state._submitBtn, x, y) && state.pendingFinish?.type === "semi") {
        tryFinishTicket("semi", state.pendingFinish.pts);
        return;
      }
      for (const ln of copy.semiLines) {
        if (hit(ln._hit, x, y)) {
          trySemi(ln._hit.i);
          return;
        }
      }
    }
    if (win.id === "ide" && state.phase === "comment") {
      if (hit(state._submitBtn, x, y) && state.pendingFinish?.type === "comment") {
        tryFinishTicket("comment", state.pendingFinish.pts);
        return;
      }
      if (hit(state._cmtBtn, x, y)) {
        acceptComment();
        return;
      }
    }
    if (win.id === "pr") {
      if (
        hit(state._submitBtn, x, y) &&
        (state.pendingFinish?.type === "pr" || state.pendingFinish?.type === "spacewar")
      ) {
        tryFinishTicket(state.pendingFinish.type, state.pendingFinish.pts);
        return;
      }
      if (state._prChoices) {
        for (const c of state._prChoices) {
          if (hit(c.hit, x, y)) {
            choosePr(c);
            return;
          }
        }
      }
    }
  
    if (win.id === "timesheet") {
      if (hit(state._tsJimboBtn, x, y)) {
        jimboAutoFillTimesheet();
        return;
      }
      if (hit(state._tsAcceptBtn, x, y)) {
        acceptTimesheet();
        return;
      }
      if (state._tsHits) {
        for (const th of state._tsHits) {
          if (hit(th.hit, x, y)) {
            nudgeTimesheetHour(th.id, th.kind === "plus" ? 0.5 : -0.5);
            audio.playSfx("click");
            return;
          }
        }
      }
      return;
    }
  }

  function trySemi(i) {
    ensureSemi();
    const ln = copy.semiLines[i];
    audio.keyclack();
    hooks.onType?.();
    bumpActivity();
    if (!ln.need) {
      hitSanity(8);
      const err = copy.dialogs?.errors?.[0];
      toast((err && err.body) || "No semicolon needed");
      audio.playSfx("error");
      return;
    }
    if (state.semiPlaced[i]) return;
    state.semiPlaced[i] = true;
    state.sprint += 1;
    const left = copy.semiLines.filter((l, j) => l.need && !state.semiPlaced[j]).length;
    if (left <= 0) {
      const pts = state.activeTicket?.pts || 3;
      if (state.jimboUsedThisTicket) finishTicket("semi", pts);
      else {
        state.pendingFinish = { type: "semi", pts };
        toast("Work done - Ask Jimbo to submit");
      }
    }
  }

  function acceptComment() {
    ensureComment();
    audio.keyclack();
    hooks.onType?.();
    bumpActivity();
    const i = state.commentIdx;
    if (state.commentDone[i]) return;
    state.commentDone[i] = true;
    state.sprint += 1;
    hitSanity(2);
    state.commentIdx++;
    while (state.commentIdx < copy.commentLines.length && state.commentDone[state.commentIdx]) {
      state.commentIdx++;
    }
    if (state.commentDone.every(Boolean)) {
      const pts = state.activeTicket?.pts || 5;
      if (state.jimboUsedThisTicket) finishTicket("comment", pts);
      else {
        state.pendingFinish = { type: "comment", pts };
        toast("Work done - Ask Jimbo to submit");
      }
    }
  }

  function choosePr(c) {
    bumpActivity();
    state.prBubbles.push({ who: "you", t: c.t });
    state.sanity = Math.max(0, Math.min(100, state.sanity + c.s));
    audio.playSfx("click");
    if (c.d) {
      state.prStep++;
      const script = activePrScript();
      if (state.prStep >= script.length) {
        const end =
          state.phase === "spacewar"
            ? tStr("spacewar", "lgtm", (copy.prEndLines && copy.prEndLines[0]) || "LGTM if we squash and never speak of spaces again.")
            : (copy.prEndLines && copy.prEndLines[0]) || "Approved with comments.";
        state.prBubbles.push({ who: "kyle", t: end });
        const pts = state.activeTicket?.pts || 8;
        const ftype = state.phase === "spacewar" ? "spacewar" : "pr";
        const toastMsg =
          state.activeTicket?.toast ||
          (ftype === "spacewar" ? tStr("spacewar", "toast", "Peace was a formatting option.") : null);
        hooks.onPrClose?.();
        if (state.jimboUsedThisTicket) {
          setTimeout(
            () =>
              finishTicket(ftype, pts, {
                toastMsg,
                sanHit: ftype === "spacewar" ? 3 : 0,
              }),
            400
          );
        } else {
          state.pendingFinish = {
            type: ftype,
            pts,
            toastMsg,
            sanHit: ftype === "spacewar" ? 3 : 0,
          };
          toast("Ask Jimbo before submit");
        }
        return;
      }
      state.prBubbles.push({ who: "kyle", t: script[state.prStep].kyle });
      pushSlack({ name: "Kyle", color: "#a05030", text: "Left another comment on your PR." });
    } else {
      state.prBubbles.push({
        who: "kyle",
        t: "Still blocked. Please reread the style guide (all 84 pages).",
      });
      toast("Kyle is unmoved");
    }
  }

  function pushSlack(msg) {
    state.slackMsgs.unshift(msg);
    state.unread = Math.max(1, state.unread + 1);
    audio.playSfx("slack", { volume: 0.4 });
  }

  function onKey(e) {
    bumpActivity();
    if (state.phase === "presence") {
      bumpPresenceJiggle(1);
    }
    if (state.modal && state.modal.kind !== "presenceTicket") return;
    if (state.modal && state.modal.kind === "presenceTicket") return;
    if (state.phase === "semi" && e.key === ";") {
      ensureSemi();
      const next = copy.semiLines.findIndex((l, i) => l.need && !state.semiPlaced[i]);
      if (next >= 0) trySemi(next);
    }
    if (state.phase === "comment" && e.key === "Enter") acceptComment();
  }

  function onPointerUp() {
    state.mouseDown = false;
  }

  if (copy.slackPool?.length) {
    state.slackMsgs.push(copy.slackPool[0]);
  }

  return {
    canvas,
    state,
    wins,
    render,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onKey,
    pushSlack,
    toast,
    raise,
    tick,
    bumpActivity,
    enableDaySystems,
    askJimbo,
    openJimbo,
    Presence,
    toggleJiggler,
    presenceBlocksBoard,
    canClaimTicket,
    canSubmitTicket,
    requestBoardRefill,
    requestTimesheetGate,
    clearTimesheetGate,
    flushTimesheetQueue,
    openTimesheet,
    acceptTimesheet,
    needsTimesheetForClockOut,
    openIncident,
  };
}

export { Presence };
