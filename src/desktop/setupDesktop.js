/** Setup phases for desktop bag `d` (parity from win95 createWin95). */
export function setupAfter_pre(d) {
  d.canvas = document.createElement("canvas");
  d.canvas.width = d.W * d.PIXEL_SCALE;
  d.canvas.height = d.H * d.PIXEL_SCALE;
  d.ctx = d.canvas.getContext("2d");
  // Smooth text at supersample; CRT texture still looks chunky at distance
  d.ctx.imageSmoothingEnabled = true;
  d.ctx.imageSmoothingQuality = "high";

  d.jimboCopy = d.copy.jimbo || {};
  d.ticketStrings = d.copy.ticketStrings || {};
  d.presenceCopy = d.copy.presence || {};
  d.jigglerCopy = d.presenceCopy.jiggler || {};
  d.awayExcuseCopy = d.presenceCopy.awayExcuses || {};
  d.hrAuditCopy = d.presenceCopy.hrAudit || {};
  d.timesheetCopy = d.copy.timesheet || {};
  d.timesheetBuckets = (d.timesheetCopy.buckets && d.timesheetCopy.buckets.length)
    ? d.timesheetCopy.buckets
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
  d.timesheetTarget = Number(d.timesheetCopy.targetHours != null ? d.timesheetCopy.targetHours : 8.0);
  d.timesheetValidation = d.timesheetCopy.validation || {};
  d.timesheetJimboFill = d.timesheetCopy.jimboFill || {};
  d.teamsCopy = d.copy.teams || {};
  d.teamsCallers = d.teamsCopy.callers || [];
  d.teamsChips = d.teamsCopy.replyChips || [];
  d.teamsFollowUps = d.teamsCopy.followUps || {};
  d.outlookCopy = d.copy.outlook || {};
  d.outlookRail = d.outlookCopy.rail || {};
  d.outlookRibbon = d.outlookCopy.ribbonToasts || {};
  d.outlookFail = d.outlookCopy.composeFail || [];

}

export function setupAfter_tStr(d) {
  d.emailCopy = d.copy.emails || { messages: [], unreadFloor: 1 };
  d.deniedPool = d.copy.startDenied || [];

  d.imgs = {
    j16: d.loadImg("assets/jimbo/jimbo_16.png"),
    j32: d.loadImg("assets/jimbo/jimbo_32.png"),
    jtb: d.loadImg("assets/jimbo/jimbo_toolbar.png"),
    jban: d.loadImg("assets/jimbo/jimbo_banner.png"),
    jig16: d.loadImg("assets/presence/jiggler_16.png"),
    jig32: d.loadImg("assets/presence/jiggler_32.png"),
    ts16: d.loadImg("assets/timesheet/timesheet_xls_16.png"),
    ts32: d.loadImg("assets/timesheet/timesheet_xls_32.png"),
    ts48: d.loadImg("assets/timesheet/timesheet_xls_48.png"),
    t16: d.loadImg("assets/teams/teams_16.png"),
    t32: d.loadImg("assets/teams/teams_32.png"),
    t48: d.loadImg("assets/teams/teams_48.png"),
    callAccept: d.loadImg("assets/teams/call_accept.png"),
    callDecline: d.loadImg("assets/teams/call_decline.png"),
    callMute: d.loadImg("assets/teams/call_mute.png"),
    callMuteOff: d.loadImg("assets/teams/call_mute_off.png"),
    callCam: d.loadImg("assets/teams/call_cam.png"),
    callCamOff: d.loadImg("assets/teams/call_cam_off.png"),
    callShare: d.loadImg("assets/teams/call_share.png"),
    callHangup: d.loadImg("assets/teams/call_hangup.png"),
    callAvatar: d.loadImg("assets/teams/avatar_caller.png"),
    callSelf: d.loadImg("assets/teams/avatar_blank.png"),
    ol16: d.loadImg("assets/outlook/outlook_16.png"),
    ol32: d.loadImg("assets/outlook/outlook_32.png"),
    ol48: d.loadImg("assets/outlook/outlook_48.png"),
    olFocused: d.loadImg("assets/outlook/focused.png"),
    olOther: d.loadImg("assets/outlook/other.png"),
    olNew: d.loadImg("assets/outlook/new_mail.png"),
    tr16: d.loadImg("assets/icons/tracker_16.png"),
    tr32: d.loadImg("assets/icons/tracker_32.png"),
    tr48: d.loadImg("assets/icons/tracker_48.png"),
    ideExplorer16: d.loadImg("assets/ide/activity_explorer_16.png"),
    ideSearch16: d.loadImg("assets/ide/activity_search_16.png"),
    ideScm16: d.loadImg("assets/ide/activity_scm_16.png"),
    ideExt16: d.loadImg("assets/ide/activity_ext_16.png"),
    ideExplorerStub: d.loadImg("assets/ide/explorer_stub.png"),
  };

}

export function setupAfter_mailBucket(d) {

  d.otherSeed = [
    {
      id: "o-digest",
      from: "AllHands Digest <digest@corp.internal>",
      subject: "Digest: Q3 vibes you already skipped",
      body: "Highlights: synergy, snacks (metaphorical), and a survey about surveys.",
      sanity: 1,
      doom: false,
      bucket: "other",
    },
    {
      id: "o-news",
      from: "Corp Newsletter <news@corp.local>",
      subject: "Newsletter: Plant of the Month is still dying",
      body: "Cubicle flora remains a metaphor. Unsubscribe is decorative.",
      sanity: 1,
      doom: false,
      bucket: "other",
    },
    {
      id: "o-fyi",
      from: "FYI Bot <fyi@corp.internal>",
      subject: "FYI: Parking lot mindfulness webinar",
      body: "Optional. Attendance is tracked. Spirits are not.",
      sanity: 2,
      doom: false,
      bucket: "other",
    },
    {
      id: "o-ext",
      from: "Vendor <noreply@external.example>",
      subject: "[External] Unlock your potential (and wallet)",
      body: "Limited offer on tools that generate more email.",
      sanity: 1,
      doom: false,
      bucket: "other",
    },
  ];

  d.inboxMails = [...(d.emailCopy.messages || []), ...d.otherSeed].map((m) => ({
    ...m,
    read: false,
    opened: false,
    bucket: d.mailBucket(m),
  }));

  // Endless ticket queue (GD tickets-extra refill)
  // Playable = core tickets + ticketPool/extraTickets (implemented types as they land)
  // Fillers = padding / never-empty fallback (1-tap stub)
  d.CORE_TYPES = ["semi", "comment", "pr", "spacewar", "dropdb"];
  d.STUB_TYPES = [
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
  d.PLAYABLE_TYPES = new Set([...d.CORE_TYPES, ...d.STUB_TYPES]);
  d.playableTemplates = [
    ...(d.copy.tickets || []),
    ...((d.copy.ticketPool && d.copy.ticketPool.length ? d.copy.ticketPool : null) ||
      d.copy.extraTickets ||
      []),
  ].filter((t) => t && d.PLAYABLE_TYPES.has(t.type));
  d.fillerTemplates = (d.copy.fillers || []).filter((t) => t && t.type === "filler");
  if (!d.playableTemplates.some((t) => t.type === "incident")) {
    d.playableTemplates.push({
      id: "CORP-5201",
      title: "PROD CRITICAL - Something is on fire",
      pts: 4,
      type: "incident",
      dod: "Disable the monitor AND assign to somebody else. Do not fix prod.",
      meta: "Sev: Critical - Owner: whoever blinks - Runbook: vibes",
    });
  }
  d.uidCounter = 0;
}

export function setupAfter_rebuildDrawBag(d) {

  d.state = {
    cursor: { x: d.W / 2, y: d.H / 2 },
    mouseDown: false,
    activeWin: "tickets",
    startOpen: false,
    startFlyoutIndex: -1,
    startFlyoutIndex: -1,
    startCascade: null, // null | { parentLabel, items, x, y, w, h }
    standupDone: false,
    dayBeat: "standup",
    dayBeatToasted: {},
    obligations: {
      tickets: { need: 3, have: 0 },
      focusedMail: { need: 1, have: 0 },
      syncChip: { need: 1, have: 0 },
      timesheet: { need: 1, have: 0 },
    },
    jimboTicketsUsed: 0,
    clockMinutes: 9 * 60,
    sanity: 100,
    sprint: 0,
    unread: Math.max(1, d.emailCopy.unreadFloor || 1),
    phase: "desktop", // desktop | ticket mechanic type
    closedCount: 0,
    forceDropDbOnce: false, // CORP-DB-01: arm on first close
    typesCompleted: {}, // type -> count this shift
    drawBag: d.rebuildDrawBag(),
    board: (d.copy.tickets || []).slice(0, 3).map(d.cloneTicket), // 2-3 active slots
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
    stickies: (d.copy.stickies || []).slice(0, 3),
    toast: null,
    toastT: 0,
    toastJimbo: false,
    // Jimbo gate
    jimboUsedThisTicket: false,
    jimboSabotaged: {}, // keyed by ticket type
    jimboLine: d.pick(d.jimboCopy.greetings) || "Jimbo online.",
    pendingFinish: null, // { type, pts }
    modal: null, // { title, body, buttons:[{label,action}], kind }
    // Email
    inbox: d.inboxMails,
    openMailId: null,
    mailReadFully: false,
    outlookTab: "focused", // focused | other
    outlookCompose: false,
    emailQueue: [],
    emailCooldown: d.EMAIL_MIN + Math.random() * (d.EMAIL_MAX - d.EMAIL_MIN),
    emailEnabled: false,
    dayGraceLeft: 0,
    incidentPagerCd: 45 + Math.random() * 45, // first soft window 45-90s
    incidentPagerCooldown: 0,
    incidentFromPager: false,
    // Appear Active / d.Presence Theater
    presence: d.Presence.ACTIVE,
    idleAcc: 0,
    presenceForced: false,
    presenceStatus: null,
    statusPopover: false,
    // GD collision: presenceForced d.wins over board + timesheet
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
    // Call Theater (Sync parody)
    callPhase: null, // null | ringing | connected
    callQueued: false,
    callCd: 25 + Math.random() * 20, // first eligible 25-45s after d.enableDaySystems
    callRingLeft: 0,
    callConnLeft: 0,
    callAttent: 1,
    callAttentEmpty: 0,
    callMute: true,
    callCam: false,
    callSharing: false,
    callShareAcc: 0,
    callSinceFeed: 0,
    callCaller: null,
    callOpener: "",
    callChipDone: false,
    callMissedBadge: false,
    callChatQueue: [],
    callChatCd: 0,
    callJimboJoined: false,
  };

  // Remove already-dealt types from the first shuffle
  {
    const dealt = new Set(d.state.board.map((t) => t.mechanic || t.type));
    d.state.drawBag = d.state.drawBag.filter((t) => !dealt.has(t));
  }

  d.kyleSlackPool = d.copy.kyleSlack || (d.copy.slackPool || []).filter((m) => /kyle/i.test(m.name || ""));
  d.kyleInterruptCd = 18 + Math.random() * 10;

  /** Full Kyle beat pools stay in d.copy; each PR run deals <=5 at random. */
  d.PR_ROUND_MAX = 5;

}

export function setupAfter_activePrScript(d) {

  d.wins = {
    tickets: { id: "tickets", title: "Tracker", x: 8, y: 12, w: 190, h: 168, open: true },
    slack: { id: "slack", title: d.teamsCopy.windowTitle || "Sync -- Corporate Chat", x: 165, y: 14, w: 145, h: 120, open: true },
    ide: { id: "ide", title: "IDE - fog.js", x: 40, y: 28, w: 240, h: 160, open: false },
    pr: { id: "pr", title: "PR #884 - Kyle", x: 30, y: 20, w: 260, h: 175, open: false },
    standup: { id: "standup", title: "Daily Standup", x: 50, y: 40, w: 220, h: 130, open: true },
    meters: { id: "meters", title: "Resource Monitor", x: 200, y: 150, w: 110, h: 55, open: true },
    jimbo: {
      id: "jimbo",
      title: d.jimboCopy.windowTitle || "Jimbo - Corporate AI",
      x: 70,
      y: 22,
      w: 190,
      h: 150,
      open: false,
      jimboChrome: true,
    },
    inbox: {
      id: "inbox",
      title: d.outlookCopy.windowTitle || d.emailCopy.inboxTitle || "Mail",
      x: 18,
      y: 10,
      w: 284,
      h: 188,
      open: false,
    },
    timesheet: {
      id: "timesheet",
      title: d.timesheetCopy.windowTitle || "timesheet.xls -- Time Entry",
      x: 36,
      y: 12,
      w: 248,
      h: 200,
      open: false,
    },
  };

  d.order = ["meters", "tickets", "slack", "standup", "ide", "pr", "jimbo", "inbox", "timesheet"];

  // Two columns so all icons sit above the taskbar (H=240, TASK_H=22).
  // Old single column put jiggler/teams under timesheet.xls — hit boxes stole clicks.
  d.deskIcons = [
    { id: "jimbo", label: "Jimbo", x: 8, y: 8, img: "j32" },
    { id: "tickets", label: "Tracker", x: 8, y: 56, img: "tr32" },
    { id: "inbox", label: d.outlookCopy.desktopLabel || d.emailCopy.desktopLabel || "Mail", x: 8, y: 104, img: null },
    {
      id: "timesheet",
      label: d.timesheetCopy.desktopLabel || "timesheet.xls",
      x: 8,
      y: 152,
      img: "ts32",
    },
    {
      id: "jiggler",
      label: d.jigglerCopy.desktopLabel || "Jiggler",
      x: 64,
      y: 8,
      img: "jig32",
    },
    {
      id: "teams",
      label: d.teamsCopy.desktopLabel || "Sync",
      x: 64,
      y: 56,
      img: "t32",
    },
  ];

}

export function setupAfter_drawStartMenu(d) {

  d.STICKY_COLS = { yellow: "#ffff80", pink: "#ffb0d0", blue: "#a0d0ff", green: "#b0ffb0" };
}

export function setupAfter_incidentHeadlines(d) {

  /** Shared by board ticket CORP-5201 and random pager interrupt. */
}
