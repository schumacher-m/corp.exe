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
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const jimboCopy = copy.jimbo || {};
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
    phase: "desktop", // desktop | semi | comment | pr | ending
    ticketsDone: { semi: false, comment: false, pr: false },
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
    jimboSabotaged: { semi: false, comment: false, pr: false },
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
      ctx.font = "bold 12px Tahoma, 'MS Sans Serif', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(win.title.slice(0, 24), win.x + 20, win.y + 10);
    } else {
      ctx.fillStyle = C.inv;
      ctx.font = "bold 12px Tahoma, 'MS Sans Serif', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(win.title.slice(0, 28), win.x + 6, win.y + 10);
    }
    bevelRaised(win.x + win.w - 16, win.y + 5, 10, 10, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "bold 11px sans-serif";
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
    ctx.font = "12px Tahoma, sans-serif";
    let yy = y + 4;
    for (const tk of copy.tickets) {
      const done = state.ticketsDone[tk.type];
      ctx.fillStyle = done ? C.shadow : C.text;
      ctx.fillText(`${tk.id}  ${tk.title.slice(0, 22)}`, x + 4, yy + 8);
      ctx.fillStyle = done ? C.sick : C.amber;
      ctx.fillText(done ? "[DONE]" : `[${tk.pts}SP]`, x + w - 40, yy + 8);
      tk._hit = { x: x + 2, y: yy, w: w - 4, h: 14 };
      yy += 16;
      if (yy > y + h - 12) break;
    }
    ctx.fillStyle = C.shadow;
    ctx.fillText("Open ticket · Ask Jimbo to submit", x + 4, y + h - 6);
  }

  function drawSlack(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "11px Tahoma, sans-serif";
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

  function drawMeters(x, y, w, h) {
    ctx.font = "11px Tahoma, sans-serif";
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
    const s = copy.standup;
    if (!state._standupPick) {
      state._standupPick = { y: pick(s.yesterday), t: pick(s.today), b: pick(s.blockers) };
    }
    const yest = state._standupPick.y;
    const tod = state._standupPick.t;
    const blk = state._standupPick.b;
    ctx.font = "11px Tahoma, sans-serif";
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
    ctx.font = "bold 11px Tahoma, sans-serif";
    ctx.fillText("ACKNOWLEDGE", x + w / 2 - 32, y + h - 9);
    state._standupBtn = { x: x + w / 2 - 40, y: y + h - 18, w: 80, h: 14 };
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
    ctx.font = "12px 'Courier New', monospace";
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
      ctx.font = "11px Tahoma, sans-serif";
      const hint = state.semiStyle?.note
        ? String(state.semiStyle.note).slice(0, 42)
        : "Click lines missing ;  or press ;";
      ctx.fillText(hint, x + 4, y + h - 12);
      if (state.pendingFinish?.type === "semi") {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 11px Tahoma, sans-serif";
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
      ctx.font = "bold 11px Tahoma, sans-serif";
      ctx.fillText("ACCEPT //", x + 10, y + h - 13);
      state._cmtBtn = { x: x + 4, y: y + h - 22, w: 70, h: 14 };
      if (state.pendingFinish?.type === "comment") {
        bevelRaised(x + w - 74, y + h - 22, 68, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else state._submitBtn = null;
    } else {
      ctx.fillStyle = "#c8c4b0";
      ctx.fillText("// open a ticket from Tickets", x + 6, y + 14);
      state._submitBtn = null;
    }
  }

  function drawPr(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    const step = state.prStep;
    const script = copy.prScript;
    ctx.font = "11px Tahoma, sans-serif";
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
      if (state.pendingFinish?.type === "pr") {
        yy += 12;
        bevelRaised(x + 4, yy, 80, 14, C.jimbo);
        ctx.fillStyle = C.inv;
        ctx.font = "bold 11px Tahoma, sans-serif";
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
    ctx.font = "11px Tahoma, sans-serif";
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
    ctx.font = "bold 11px Tahoma, sans-serif";
    ctx.fillText(jimboCopy.askLabel || "Ask Jimbo", x + 22, y + h - 16);
    state._jimboAskBtn = { x: x + 4, y: y + h - 28, w: 88, h: 18 };
    // Skip
    bevelRaised(x + 98, y + h - 28, 50, 18, C.face);
    ctx.fillStyle = C.text;
    ctx.font = "12px Tahoma, sans-serif";
    ctx.fillText("Skip", x + 112, y + h - 16);
    state._jimboSkipBtn = { x: x + 98, y: y + h - 28, w: 50, h: 18 };
  }

  function unreadCount() {
    const n = state.inbox.filter((m) => !m.read).length;
    return Math.max(emailCopy.unreadFloor || 1, n || 1);
  }

  function drawInbox(x, y, w, h) {
    bevelSunken(x, y, w, h, C.white);
    ctx.font = "11px Tahoma, sans-serif";
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
      ctx.font = "bold 11px Tahoma, sans-serif";
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
      ctx.font = "11px Tahoma, sans-serif";
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
    ctx.font = "bold 12px Tahoma, sans-serif";
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
      ctx.font = "11px Tahoma, sans-serif";
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
    ctx.font = "11px Tahoma, sans-serif";
    ctx.fillText(presenceLabel(), px + 12, y + 13);

    const trayX = W - 54;
    bevelSunken(trayX, y + 3, 50, 16, C.face);
    ctx.font = "11px Tahoma, sans-serif";
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
      ctx.font = "12px Tahoma, sans-serif";
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
    ctx.font = "bold 12px Tahoma, sans-serif";
    ctx.fillText(String(m.title || "Alert").slice(0, 30), mx + 8, my + 12);
    ctx.fillStyle = C.text;
    ctx.font = "11px Tahoma, sans-serif";
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
      ctx.font = "bold 11px Tahoma, sans-serif";
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
      ctx.font = "12px Tahoma, sans-serif";
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

  function openTicket(tk) {
    if (state.ticketsDone[tk.type]) {
      toast("Already closed.");
      audio.playSfx("error");
      return;
    }
    state.jimboUsedThisTicket = false;
    state.pendingFinish = null;
    state.semiStyle = null;
    state.commentOverrides = null;
    state.prJimboNit = null;
    if (tk.type === "semi") {
      state.phase = "semi";
      wins.ide.open = true;
      wins.ide.title = "IDE — Semicolon Hell";
      raise("ide");
      ensureSemi();
    } else if (tk.type === "comment") {
      state.phase = "comment";
      wins.ide.open = true;
      wins.ide.title = "IDE — Comment Policy";
      raise("ide");
      ensureComment();
    } else if (tk.type === "pr") {
      state.phase = "pr";
      wins.pr.open = true;
      raise("pr");
      state.prStep = 0;
      state.prBubbles = [{ who: "kyle", t: copy.prScript[0].kyle }];
      hooks.onPrOpen?.();
      audio.playBgm("bgmPr");
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
      state.pendingFinish = { type, pts };
      showHrSkip();
      toast("Ask Jimbo before submit");
      return false;
    }
    finishTicket(type, pts);
    return true;
  }

  function finishTicket(type, pts) {
    state.ticketsDone[type] = true;
    state.sprint += pts;
    state.clockMinutes = Math.min(18 * 60, state.clockMinutes + 8);
    state.pendingFinish = null;
    toast(`Ticket closed +${pts} SP`);
    audio.playSfx("ticket");
    wins.ide.open = false;
    wins.pr.open = false;
    state.phase = "desktop";
    raise("tickets");
    hooks.onTicketDone?.(type, pts);
    audio.playBgm("bgmDesk");
    flushEmailQueue();
  }

  function applySabotage(type) {
    const sab = jimboCopy.sabotage?.[type] || [];
    const note = pick(sab) || "Jimbo helped!";
    state.jimboLine = pick(jimboCopy.responses) || note;
    if (type === "semi" && !state.jimboSabotaged.semi) {
      state.jimboSabotaged.semi = true;
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
    } else if (type === "comment" && !state.jimboSabotaged.comment) {
      state.jimboSabotaged.comment = true;
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
    } else if (type === "pr" && !state.jimboSabotaged.pr) {
      state.jimboSabotaged.pr = true;
      const nits = [
        "Agree with Kyle. Also rename fog→data2.",
        "Nit+: alphabetize the blank lines. Blocking.",
        "Jimbo+Kyle: extract 47 to DATA2_CONSTANT.",
        "LGTM if we invent four more nits first.",
      ];
      state.prJimboNit = pick(nits) || note;
      state.prBubbles.push({ who: "jimbo", t: state.prJimboNit });
    }
    audio.playSfx("jimboFail", { volume: 0.6 });
    hitSanity(8);
    const save = pick(jimboCopy.saveToasts) || "Jimbo saved you 4 hours!";
    toast(save, { jimbo: true });
  }

  function askJimbo() {
    openJimbo({ chime: false });
    audio.playSfx("jimboChime", { volume: 0.55 });
    const inTicket = ["semi", "comment", "pr"].includes(state.phase);
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
        // ready — user still clicks SUBMIT, or auto-finish if work already done
      }
    } else {
      state.jimboLine = pick(jimboCopy.greetings) || "Jimbo online.";
      toast(pick(jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
    }
  }

  function minigameFocused() {
    return state.phase === "semi" || state.phase === "comment" || state.phase === "pr";
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
    if (!state.emailEnabled) return;
    // idle / presence
    if (!state.modal || state.modal.kind !== "presence") {
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
        } else {
          state.modal = null;
          audio.playSfx("click");
        }
        return true;
      }
    }
    return true; // eat clicks while modal open
  }

  function onPointerDown() {
    const x = state.cursor.x;
    const y = state.cursor.y;
    state.mouseDown = true;
    bumpActivity();
    audio.playSfx("mouse", { volume: 0.35 });
    hooks.onClick?.();

    if (state.modal) {
      handleModalClick(x, y);
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
      for (const tk of copy.tickets) {
        if (hit(tk._hit, x, y)) {
          openTicket(tk);
          return;
        }
      }
    }
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
      if (hit(state._submitBtn, x, y) && state.pendingFinish?.type === "pr") {
        tryFinishTicket("pr", state.pendingFinish.pts);
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
      const tk = copy.tickets.find((t) => t.type === "semi");
      const pts = tk?.pts || 3;
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
      const tk = copy.tickets.find((t) => t.type === "comment");
      const pts = tk?.pts || 5;
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
      if (state.prStep >= copy.prScript.length) {
        const end = (copy.prEndLines && copy.prEndLines[0]) || "Approved with comments.";
        state.prBubbles.push({ who: "kyle", t: end });
        const tk = copy.tickets.find((t) => t.type === "pr");
        const pts = tk?.pts || 8;
        hooks.onPrClose?.();
        if (state.jimboUsedThisTicket) {
          setTimeout(() => finishTicket("pr", pts), 400);
        } else {
          state.pendingFinish = { type: "pr", pts };
          toast("Ask Jimbo before submit");
        }
        return;
      }
      state.prBubbles.push({ who: "kyle", t: copy.prScript[state.prStep].kyle });
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
    if (state.modal) return;
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
