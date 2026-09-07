/**
 * Win95 virtual desktop — drawn to offscreen canvas for CRT CanvasTexture.
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
const IDLE_YELLOW = 6; // seconds → yellow
const IDLE_AWAY = 11; // seconds → Away
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
  ];
  const PLAYABLE_TYPES = new Set([...CORE_TYPES, ...STUB_TYPES]);
  const playableTemplates = [
    ...(copy.tickets || []),
    ...((copy.ticketPool && copy.ticketPool.length ? copy.ticketPool : null) ||
      copy.extraTickets ||
      []),
  ].filter((t) => t && PLAYABLE_TYPES.has(t.type));
  const fillerTemplates = (copy.fillers || []).filter((t) => t && t.type === "filler");
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
    // Unused types this shuffle — one entry per playable type
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
    typesCompleted: {}, // type → count this shift
    drawBag: rebuildDrawBag(),
    board: (copy.tickets || []).slice(0, 3).map(cloneTicket), // 2–3 active slots
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
    // Appear Active
    presence: "active", // active | yellow | away
    idleAcc: 0,
    presenceForced: false,
  };

  // Remove already-dealt types from the first shuffle
  {
    const dealt = new Set(state.board.map((t) => t.mechanic || t.type));
    state.drawBag = state.drawBag.filter((t) => !dealt.has(t));
  }

  const kyleSlackPool = copy.kyleSlack || (copy.slackPool || []).filter((m) => /kyle/i.test(m.name || ""));
  let kyleInterruptCd = 18 + Math.random() * 10;

  function activePrScript() {
    if (state.phase === "spacewar") return copy.spaceWarScript || copy.prScript || [];
    return copy.prScript || [];
  }

  const wins = {
    tickets: { id: "tickets", title: "Tickets — HelixStack", x: 8, y: 18, w: 150, h: 140, open: true },
    slack: { id: "slack", title: "Slack — #general", x: 165, y: 14, w: 145, h: 120, open: true },
    ide: { id: "ide", title: "IDE — fog.js", x: 40, y: 28, w: 240, h: 160, open: false },
    pr: { id: "pr", title: "PR #884 — Kyle", x: 30, y: 20, w: 260, h: 175, open: false },
    standup: { id: "standup", title: "Daily Standup", x: 50, y: 40, w: 220, h: 130, open: true },
    meters: { id: "meters", title: "Resource Monitor", x: 200, y: 150, w: 110, h: 55, open: true },
    jimbo: {
      id: "jimbo",
      title: jimboCopy.windowTitle || "Jimbo — HelixStack AI",
      x: 70,
      y: 22,
      w: 190,
      h: 150,
      open: false,
      jimboChrome: true,
    },
    inbox: {
      id: "inbox",
      title: emailCopy.inboxTitle || "Inbox — Outlook Express",
      x: 40,
      y: 16,
      w: 240,
      h: 170,
      open: false,
    },
  };

  const order = ["meters", "tickets", "slack", "standup", "ide", "pr", "jimbo", "inbox"];

  const deskIcons = [
    { id: "jimbo", label: "Jimbo", x: 8, y: 8, img: "j32" },
    { id: "inbox", label: emailCopy.desktopLabel || "Inbox", x: 8, y: 56, img: null },
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
    if (state.presence !== "active" && !state.presenceForced) {
      state.presence = "active";
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
    ctx.fillText("×", win.x + win.w - 14, win.y + 10);

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
    else if (win.id === "inbox") drawInbox(cx, cy, cw, ch);
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
    ctx.fillText(`Closed ${state.closedCount} · Ask Jimbo to submit`, x + 4, y + h - 6);
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
        const label = `${it.id} → ${it.to}`;
        ctx.fillStyle = it.to === "data2" || it.to === "data2_final_FINAL" ? C.sick : "#c8c4b0";
        ctx.fillText(label.slice(0, 42), x + 4, yy);
        state._stubHits.push({ kind: "rename", i, hit: { x, y: yy - 7, w, h: 10 } });
        yy += 11;
      });
      const n = st.items.filter((it) => it.to === "data2" || it.to === (st.bulk || "data2")).length;
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(`Rename ≥${st.need} to data2 (${n}/${st.need})`, x + 4, y + h - 12);
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
        ctx.fillText(`⚠ ${w.w}`.slice(0, 28), x + 4, yy);
        const btns = ["Suppress", "Dismiss", "TODO"];
        let bx = x + 120;
        btns.forEach((lab) => {
          bevelRaised(bx, yy - 8, 40, 10, C.face);
          ctx.fillStyle = C.text;
          ctx.font = "6px Tahoma, sans-serif";
          ctx.fillText(lab.slice(0, 7), bx + 2, yy - 1);
          state._stubHits.push({ kind: "lint", i, action: lab, hit: { x: bx, y: yy - 8, w: 40, h: 10 } });
          bx += 44;
        });
        // fake Fix
        bevelRaised(bx, yy - 8, 28, 10, C.face);
        ctx.fillStyle = C.blood;
        ctx.fillText("Fix", bx + 4, yy - 1);
        state._stubHits.push({ kind: "lint", i, action: "Fix", hit: { x: bx, y: yy - 8, w: 28, h: 10 } });
        yy += 12;
      });
      const left = st.warns.filter((w) => !w.gone).length;
      ctx.fillStyle = C.text;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(left ? `${left} warnings` : "0 warnings — green", x + 4, y + h - 12);
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
        ctx.fillText(`${hk.res ? "✓" : "<>"} ${hk.label}`.slice(0, 36), x + 4, yy);
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
      ctx.fillText(`Logs ${n}/${st.need}${hasDbg ? " · remove debugger" : ""}`, x + 4, y + h - 12);
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
      ctx.fillText("✓ Jimbo consulted (this ticket)", x + 4, y + h - 36);
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
      ctx.fillText(`Inbox (${unreadCount()} unread∞)`, x + 4, yy + 6);
      yy += 12;
      for (const m of state.inbox.slice(0, 10)) {
        ctx.fillStyle = m.read ? C.shadow : C.text;
        const mark = m.read ? " " : "●";
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
        ctx.fillText(`${m.done ? "✓" : "●"} ${m.from}: ${m.subject}`.slice(0, 36), x + 4, yy + 7);
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
    if (st.step === "confirm") {
      ctx.fillText("Unsubscribe? Preferences → nowhere.", x + 4, yy);
      bevelRaised(x + 4, y + h - 22, 80, 14, C.face);
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText("Unsubscribe", x + 10, y + h - 13);
      state._stubHits.push({ kind: "unsub", action: "confirm", hit: { x: x + 4, y: y + h - 22, w: 80, h: 14 } });
      bevelRaised(x + 90, y + h - 22, 100, 14, C.face);
      ctx.fillText("HelixHub 404", x + 96, y + h - 13);
      state._stubHits.push({ kind: "unsub", action: "trap", hit: { x: x + 90, y: y + h - 22, w: 100, h: 14 } });
    } else if (st.step === "helpful") {
      ctx.fillText("Was this helpful? (Required)", x + 4, yy);
      let bx = x + 4;
      for (const lab of ["Yes", "No", "Synergy"]) {
        bevelRaised(bx, y + h - 22, 50, 14, C.face);
        ctx.font = "bold 8px Tahoma, sans-serif";
        ctx.fillStyle = C.text;
        ctx.fillText(lab, bx + 10, y + h - 13);
        state._stubHits.push({ kind: "unsub", action: "helpful", hit: { x: bx, y: y + h - 22, w: 50, h: 14 } });
        bx += 56;
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
      }
      ctx.fillStyle = C.inv;
      ctx.font = "7px Tahoma, sans-serif";
      ctx.fillText(ic.label, bx + 4, by + 42);
      state._deskIconHits.push({ id: ic.id, hit: { x: bx, y: by, w: 48, h: 48 } });
    }
  }

  function presenceColor() {
    if (state.presence === "away") return C.red;
    if (state.presence === "yellow") return C.yellow;
    return C.green;
  }
  function presenceLabel() {
    if (state.presence === "away") return "Away";
    if (state.presence === "yellow") return "Idle";
    return "Active";
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
    for (const id of ["tickets", "slack", "ide", "pr", "jimbo", "inbox"]) {
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

    // presence badge
    const px = W - 100;
    bevelSunken(px, y + 3, 44, 16, C.face);
    ctx.fillStyle = presenceColor();
    ctx.fillRect(px + 3, y + 7, 6, 6);
    ctx.fillStyle = C.text;
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillText(presenceLabel(), px + 12, y + 13);

    const trayX = W - 54;
    bevelSunken(trayX, y + 3, 50, 16, C.face);
    ctx.font = "7px Tahoma, sans-serif";
    ctx.fillStyle = C.text;
    const hh = String(Math.floor(state.clockMinutes / 60)).padStart(2, "0");
    const mm = String(state.clockMinutes % 60).padStart(2, "0");
    ctx.fillText(`${hh}:${mm}`, trayX + 4, y + 13);
  }

  function drawStartMenu() {
    if (!state.startOpen) return;
    const items = copy.startMenu?.items || [];
    const menuH = 16 + items.length * 16;
    const x = 2;
    const y = H - TASK_H - menuH;
    bevelRaised(x, y, 120, menuH, C.face);
    ctx.fillStyle = C.title;
    ctx.fillRect(x + 2, y + 2, 16, menuH - 4);
    state._startItems = [];
    items.forEach((it, i) => {
      const iy = y + 4 + i * 16;
      ctx.fillStyle = C.text;
      ctx.font = "8px Tahoma, sans-serif";
      const lab = it.label || it.id || String(it);
      if (it.id === "jimbo" || lab === "Jimbo") {
        if (imgs.j16.complete && imgs.j16.naturalWidth) {
          ctx.drawImage(imgs.j16, x + 22, iy + 1, 12, 12);
          ctx.fillText(lab, x + 36, iy + 10);
        } else ctx.fillText(lab, x + 22, iy + 10);
      } else {
        ctx.fillText(lab, x + 22, iy + 10);
      }
      state._startItems.push({ hit: { x, y: iy, w: 118, h: 16 }, item: it });
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
    const mw = 220;
    const lines = wrap(m.body || "", 34);
    const mh = 48 + lines.length * 9 + 24;
    const mx = (W - mw) / 2;
    const my = 40;
    bevelRaised(mx, my, mw, mh, C.face);
    ctx.fillStyle = m.kind === "jimbo" ? C.jimboBar : C.title;
    ctx.fillRect(mx + 3, my + 3, mw - 6, 14);
    ctx.fillStyle = C.inv;
    ctx.font = "bold 9px Tahoma, sans-serif";
    ctx.fillText(String(m.title || "Alert").slice(0, 30), mx + 8, my + 12);
    ctx.fillStyle = C.text;
    ctx.font = "7px Tahoma, sans-serif";
    let yy = my + 28;
    for (const ln of lines) {
      ctx.fillText(ln, mx + 8, yy);
      yy += 9;
    }
    const btns = m.buttons || [{ label: "OK", action: "ok" }];
    state._modalBtns = [];
    let bx = mx + 8;
    btns.forEach((b) => {
      const label = typeof b === "string" ? b : b.label;
      const action = typeof b === "string" ? "ok" : b.action;
      const bw = Math.max(48, label.length * 6 + 12);
      bevelRaised(bx, my + mh - 22, bw, 16, C.face);
      ctx.fillStyle = C.text;
      ctx.font = "bold 8px Tahoma, sans-serif";
      ctx.fillText(label, bx + 6, my + mh - 12);
      state._modalBtns.push({ hit: { x: bx, y: my + mh - 22, w: bw, h: 16 }, action });
      bx += bw + 8;
    });
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
        { from: "Design", text: "Aligned — as long as the fog stays #6b8f3a." },
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
      wins.slack.title = S.windowTitle || "Slack — #alignment-or-else";
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
        title: S.windowTitle || "InsightBot — Engagement",
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
      if (sab) {
        state.stub.mails.push(
          { id: "u4", from: "HelixHub", subject: "404 Synergy", done: false },
          { id: "u5", from: "HelixHub", subject: "Preferences nowhere", done: false }
        );
      }
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
        hint: S.hint || "≥5 lines. Prod is fine. You are not.",
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
        title: S.windowTitle || "Planning poker — regret edition",
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
        title: S.windowTitle || "Bug — taxonomy must be satisfied",
        body: sab
          ? "Jimbo set Sev0 and paged Slack. Downgrade to finish."
          : "Severity · Component · Impact — taxonomy must be satisfied.",
        kind: "severityTicket",
        buttons,
      };
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
      wins.ide.title = "IDE — Semicolon Hell";
      raise("ide");
      ensureSemi();
    } else if (mech === "comment") {
      wins.ide.open = true;
      wins.ide.title = "IDE — Comment Policy";
      raise("ide");
      ensureComment();
    } else if (mech === "pr" || mech === "spacewar") {
      wins.pr.open = true;
      wins.pr.title =
        mech === "spacewar"
          ? tStr("spacewar", "windowTitle", "PR #spaces — Whitespace diplomacy")
          : "PR Review — Kyle";
      raise("pr");
      state.prStep = 0;
      const script = mech === "spacewar" ? (copy.spaceWarScript || copy.prScript) : copy.prScript;
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
      wins.standup.title = tStr("standup2", "windowTitle", "Standup — Rewrite Feelings");
      raise("standup");
    } else if (mech === "unsub") {
      initStub(mech);
      wins.inbox.open = true;
      wins.inbox.title = tStr("unsub", "windowTitle", wins.inbox.title || "Inbox");
      raise("inbox");
    } else if (["rename", "lint", "merge", "logspam"].includes(mech)) {
      initStub(mech);
      wins.ide.open = true;
      wins.ide.title = tStr(mech, "windowTitle", "IDE — " + (tk.title || mech));
      raise("ide");
    } else if (["presence", "estimate", "severity", "filler"].includes(mech)) {
      initStub(mech);
    } else {
      // Unknown → treat as filler micro-stub
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
        id: "HELIX-FILL",
        title: "Document something temporary",
        pts: 1,
        type: "filler",
        dod: "One-click close so the board never softlocks.",
        meta: "Filler · Never empty",
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
    // Active slots: keep 2–3 visible
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
    if (type === "standup2") {
      wins.standup.open = false;
      wins.standup.title = "Standup";
    }
    state.phase = "desktop";
    state.modal = null;
    state._submitBtn = null;
    state._stubHits = null;
    raise("tickets");
    // Immediately draw 1 unused type; never leave board empty
    spawnTicket();
    if (state.board.length === 0) spawnTicket({ forceFiller: true });
    // Top up toward 2–3
    while (state.board.length < 2) spawnTicket();
    hooks.onTicketDone?.(type, pts);
    audio.playBgm("bgmDesk");
    flushEmailQueue();
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
      // already sabotaged this open — soft nudge only
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
        // invent style guide — flip need on one unused line mid-task
        const idx = copy.semiLines.findIndex((l, i) => !l.need && !(state.semiPlaced && state.semiPlaced[i]));
        if (idx >= 0) copy.semiLines[idx].need = true;
      }
    } else if (type === "comment") {
      const nonsense = [
        "// como un AI, este linea hace cosas",
        "// As an AI language model, I affirm this line.",
        "// TODO: gratitude wall — thank the fog, Kyle, coffee",
        "// これは間違った言語です",
        "// business synergy alignment (wrong codebase)",
        "// increments the wrong thing cheerfully",
        "// required by Jimbo Policy §∞",
      ];
      state.commentOverrides = copy.commentLines.map((_, i) => nonsense[i % nonsense.length]);
    } else if (type === "pr") {
      const nits = [
        "Agree with Kyle. Also rename fog→data2.",
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
        // Work already done — complete after Jimbo gate
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
    // bump unread tray conceptually — never clear
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
      toast("Mail queued…");
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

  function forceAwayMail() {
    const pool = state.inbox.filter((m) => m.presence || m.force);
    const mail = pick(pool) || {
      id: "away-fallback",
      from: "Compliance",
      subject: "Appear Active policy reminder",
      body: "Away status triggers this email. Dismiss to resume.",
      sanity: 10,
      presence: true,
      read: false,
      opened: false,
    };
    state.presenceForced = true;
    state.presence = "away";
    state.modal = {
      title: "Mandatory — Appear Active",
      body: `${mail.from}: ${mail.subject}. ${mail.body}`,
      kind: "presence",
      mail,
      buttons: [{ label: "Dismiss", action: "dismiss-away" }],
    };
    hitSanity(mail.sanity || 10);
    audio.playSfx("newMail", { volume: 0.55 });
    audio.playSfx("awayTick", { volume: 0.3 });
    // optional useless Jimbo toast
    if (Math.random() < 0.5) {
      setTimeout(() => {
        toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
      }, 400);
    }
  }

  function tick(dt) {
    // presence ticket countdown (works even before day systems)
    if (state.phase === "presence" && state.stub?.kind === "presence" && !state.stub.failed) {
      state.stub.tLeft -= dt;
      if (state.modal?.kind === "presenceTicket") {
        const pct = Math.min(1, state.stub.jiggles / state.stub.need);
        state.modal.body = `Engagement ${Math.floor(pct * 100)}% · ${state.stub.jiggles}/${state.stub.need} · ${Math.max(0, Math.ceil(state.stub.tLeft))}s`;
      }
      if (state.stub.tLeft <= 0 && state.stub.jiggles < state.stub.need) {
        state.stub.failed = true;
        hitSanity(6);
        toast(state.stub?.reject || "Idle again. Ticket stays open.");
        state.modal = null;
        // leave ticket on board; reset for retry on reopen
        state.phase = "desktop";
        state.activeTicket = null;
        state.stub = null;
      }
    }
    if (!state.emailEnabled) return;
    // Kyle Slack interrupts mid-ticket / mid-PR
    if (minigameFocused() && kyleSlackPool.length) {
      kyleInterruptCd -= dt;
      if (kyleInterruptCd <= 0) {
        kyleInterruptCd = 14 + Math.random() * 16;
        const msg = pick(kyleSlackPool);
        if (msg) {
          pushSlack({ ...msg });
          wins.slack.open = true;
          // don't steal focus from PR/IDE hard — toast is enough
          toast(`DM: Kyle — ${String(msg.text).slice(0, 28)}`);
        }
      }
    }
    // idle / presence
    if (!state.modal || (state.modal.kind !== "presence" && state.modal.kind !== "presenceTicket")) {
      state.idleAcc += dt;
      if (state.idleAcc >= IDLE_AWAY && state.presence !== "away") {
        state.presence = "away";
        audio.playSfx("awayTick", { volume: 0.3 });
        forceAwayMail();
      } else if (state.idleAcc >= IDLE_YELLOW && state.presence === "active") {
        state.presence = "yellow";
        audio.playSfx("awayTick", { volume: 0.2 });
      }
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
    flushEmailQueue();
    // keep unread floor
    state.unread = Math.max(emailCopy.unreadFloor || 1, unreadCount());
  }

  function enableDaySystems() {
    state.emailEnabled = true;
    state.idleAcc = 0;
    state.presence = "active";
    state.emailCooldown = 8 + Math.random() * 6;
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
        } else if (action === "dismiss-away") {
          const mail = state.modal.mail;
          if (mail) {
            mail.read = true;
            mail.opened = true;
          }
          state.modal = null;
          state.presenceForced = false;
          state.presence = "active";
          state.idleAcc = 0;
          toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
          audio.playSfx("click");
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
          if (state.stub) state.stub.sev = action.slice(4);
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
      state.modal.body = `Engagement ${Math.floor(pct * 100)}% · ${state.stub.jiggles}/${state.stub.need} · ${Math.ceil(state.stub.tLeft)}s`;
    }
    if (state.stub.jiggles >= state.stub.need) {
      state.modal = null;
      if (!requestFinish({ toastMsg: "Status: Active (allegedly).", sanHit: 1 })) {
        state.modal = {
          title: "InsightBot — Appear Active",
          body: "Bar full. Ask Jimbo, then submit.",
          kind: "presenceTicket",
          buttons: [{ label: "SUBMIT", action: "fillerDone" }],
        };
        // fillerDone reuses requestFinish path — remap:
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
      if (state.modal) state.modal.body = `Kyle-bot rejected ${v}. Pick again (≥ first).`;
      toast(st.reject || "Kyle-bot: too optimistic.");
      return;
    }
    if (num < (st.first || 0)) {
      hitSanity(2);
      toast("Scope creep theater: go ≥ first pick.");
      return;
    }
    state.modal = null;
    requestFinish({ toastMsg: st.toast || `Committed to the vibe of ${v}.`, sanHit: 2 });
  }

  function handleSeveritySubmit() {
    const st = state.stub;
    if (!st || st.kind !== "severity") return;
    if (!st.sev || !st.comp || !st.impact) {
      toast("Fill Severity, Component, Impact.");
      return;
    }
    if (st.sev === "Sev0" || st.sev0) {
      hitSanity(8);
      st.sev0 = true;
      st.sev = "Sev0";
      if (state.modal) state.modal.body = "Sev0 paged Slack. Downgrade to finish.";
      toast("Company paged. Downgrade required.");
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
        // close without reading — smaller hit, Jimbo marks read
        mail.read = true;
        hitSanity(Math.max(2, Math.floor((mail.sanity || 5) / 2)));
        toast(jimboCopy.markedRead || "Marked as read by Jimbo");
      }
    }
    state.openMailId = null;
    state.mailReadFully = false;
    state.unread = Math.max(emailCopy.unreadFloor || 1, unreadCount());
    // never fully clear — bump ghost unread
    if (state.unread <= (emailCopy.unreadFloor || 1)) {
      state.unread = (emailCopy.unreadFloor || 1) + 1;
    }
    audio.playSfx("click");
  }

  function deniedToast(item) {
    const line = pick(deniedPool);
    if (line) toast(line);
    else toast((item.submenu?.[0] || item.label || "Denied") + " — denied");
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
      toast((conf && conf.body) || "Clocking out…");
      setTimeout(() => hooks.onClockOut?.(), 500);
    } else if (id === "ide" || /notepad|corp\.exe/i.test(label)) {
      wins.ide.open = true;
      raise("ide");
    } else if (item.submenu) {
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
            // already bulk name — still counts
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
            toast("Fog submit rejected — rewrite");
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
        if (h.action === "open") {
          st.open = h.id;
          st.step = "confirm";
          return true;
        }
        if (h.action === "trap") {
          hitSanity(2);
          toast("404 Synergy — preferences lost");
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
    if (win.id === "inbox") {
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
        toast("Work done — Ask Jimbo to submit");
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
        toast("Work done — Ask Jimbo to submit");
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
  };
}
