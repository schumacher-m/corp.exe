/** apps/TeamsApp.js -- install onto desktop bag `d`. */
export function installTeamsApp(d) {
  d.callBlocksBoard = function callBlocksBoard() {
    return d.state.callPhase === "connected";
  }

  d.callBusy = function callBusy() {
    return d.state.callPhase === "ringing" || d.state.callPhase === "connected";
  }

  d.canOpenCall = function canOpenCall() {
    if (!d.state.emailEnabled) return false;
    if (d.callBusy()) return false;
    if (d.state.presenceForced) return false;
    if (d.state.timesheetGateOpen) return false;
    if (d.interruptShielded()) return false;
    if (d.state.modal && d.state.modal.kind === "presence") return false;
    if (d.state.modal && d.state.modal.kind === "hr") return false;
    const w = d.beatWeights ? d.beatWeights() : {};
    if ((w.syncRing || 0) <= 0) return false;
    if (d.syncSuppressedByTimesheet && d.syncSuppressedByTimesheet()) return false;
    return true;
  }

  d.pickCallFollowUp = function pickCallFollowUp(kind) {
    const pool = d.teamsFollowUps[kind] || d.teamsFollowUps.decline || ["tried calling..."];
    return d.pick(pool) || "tried calling...";
  }

  d.pushTeamsFollowUp = function pushTeamsFollowUp(callerName, kind) {
    const text = d.pickCallFollowUp(kind);
    const name = callerName || (d.state.callCaller && d.state.callCaller.name) || "Sync";
    const color = (d.state.callCaller && d.state.callCaller.color) || "#6a5080";
    d.pushSlack({ name, color, text });
  }

  d.feedCallAttentiveness = function feedCallAttentiveness(amount) {
    if (d.state.callPhase !== "connected") return;
    d.state.callAttent = Math.min(1, d.state.callAttent + (amount == null ? 0.35 : amount));
    d.state.callSinceFeed = 0;
    if (d.state.callSharing) d.state.callShareAcc = 0;
  }

  d.stopCallAudio = function stopCallAudio() {
    d.audio.stopLoop("teamsRing");
    d.audio.stopLoop("muffledCall");
  }

  d.scheduleNextCall = function scheduleNextCall() {
    const w = d.beatWeights ? d.beatWeights() : {};
    const min = w.syncCdMin != null ? w.syncCdMin : 45;
    const span = w.syncCdSpan != null ? w.syncCdSpan : 45;
    // afternoon higher sync weight -> slightly shorter rolls already via syncCd*
    let cd = min + Math.random() * span;
    if ((w.syncRing || 1) > 1) cd = cd / w.syncRing;
    d.state.callCd = Math.max(8, cd);
    d.state.callQueued = false;
  }

  d.resetCallUiState = function resetCallUiState() {
    d.state.callRingLeft = 0;
    d.state.callConnLeft = 0;
    d.state.callAttent = 1;
    d.state.callAttentEmpty = 0;
    d.state.callMute = true;
    d.state.callCam = false;
    d.state.callSharing = false;
    d.state.callShareAcc = 0;
    d.state.callSinceFeed = 0;
    d.state.callChipDone = false;
    d.state.callJimboJoined = false;
    d.state.callChatQueue = [];
    d.state.callChatCd = 0;
    d.state._callHits = null;
  }

  d.endCall = function endCall({ reason } = {}) {
    d.stopCallAudio();
    const wasConnected = d.state.callPhase === "connected";
    d.state.callPhase = null;
    d.state.callChatQueue = [];
    d.state.callChatCd = 0;
    d.resetCallUiState();
    d.scheduleNextCall();
    if (wasConnected) {
      // Leave Sync open with thread visible -- do not auto-close chat
      d.wins.slack.open = true;
      d.toast(d.teamsCopy.unfreezeToast || "Call ended. Back to the board.");
      d.flushBoardRefill();
    }
  }

  d.failCallMissedChip = function failCallMissedChip() {
    d.hitSanity(6);
    d.state.sprint = Math.max(0, d.state.sprint);
    d.pushTeamsFollowUp(null, "freeze");
    d.toast(d.pickCallFollowUp("freeze") || "you froze");
    d.endCall({ reason: "missed-chip" });
  }

  d.startCallRing = function startCallRing(forceCaller) {
    if (!d.canOpenCall() && !forceCaller) {
      d.state.callQueued = true;
      return false;
    }
    const caller = forceCaller || d.pick(d.teamsCallers) || {
      id: "brad",
      name: "Brad from Synergy",
      color: "#6a5080",
      openers: ["Do you have a minute?"],
    };
    d.state.callPhase = "ringing";
    d.state.callQueued = false;
    d.resetCallUiState();
    d.state.callCaller = caller;
    d.state.callOpener = d.pick(caller.openers) || "Do you have a minute?";
    d.state.callRingLeft = 8 + Math.random() * 4; // 8-12s
    d.state.callMissedBadge = false;
    // Ringing: overlay only -- Sync chat waits until Accept (specs/09)
    d.audio.playLoop("teamsRing", { volume: 0.4 });
    return true;
  }

  d.declineCall = function declineCall({ timedOut } = {}) {
    if (d.state.callPhase !== "ringing") return;
    d.stopCallAudio();
    d.audio.playSfx("callDecline", { volume: 0.55 });
    if (timedOut) {
      d.hitSanity(5);
      d.state.callMissedBadge = true;
      d.pushTeamsFollowUp(null, "timeout");
    } else {
      d.hitSanity(4);
      d.pushTeamsFollowUp(null, "decline");
    }
    d.state.unread = Math.max(1, d.state.unread + 1);
    d.state.callPhase = null;
    d.resetCallUiState();
    d.scheduleNextCall();
  }


  d.normalizeCallBeat = function normalizeCallBeat(ln, fallbackName, fallbackColor) {
    if (ln == null) return null;
    if (typeof ln === "string") {
      return { name: fallbackName || "Sync", color: fallbackColor || "#706890", text: ln };
    }
    return {
      name: ln.name || fallbackName || "Sync",
      color: ln.color || fallbackColor || "#706890",
      text: ln.text || "",
    };
  }

  d.pickCallChatThread = function pickCallChatThread(caller) {
    const c = caller || d.state.callCaller || {};
    const opener = d.state.callOpener || d.pick(c.openers) || "Do you have a minute?";
    const openerLine = {
      name: c.name || "Caller",
      color: c.color || "#6a5080",
      text: opener,
    };

    // 1) per-caller chatLines
    if (Array.isArray(c.chatLines) && c.chatLines.length) {
      return c.chatLines
        .map((ln) => d.normalizeCallBeat(ln, c.name, c.color))
        .filter(Boolean)
        .slice(0, 8);
    }

    // 2) Writer bake: callThreads = [{ callerId, beats:[{name,color,text}] }, ...]
    //    also accept map shape callThreads[id] = beats[]
    const threads = d.teamsCopy.callThreads;
    let beats = null;
    if (Array.isArray(threads) && c.id) {
      const entry = threads.find((th) => th && th.callerId === c.id);
      if (entry && Array.isArray(entry.beats) && entry.beats.length) beats = entry.beats;
    } else if (threads && typeof threads === "object" && c.id && Array.isArray(threads[c.id])) {
      beats = threads[c.id];
    }
    if (beats && beats.length) {
      // Scripted thread already has opener energy -- use beats as full drip
      return beats.map((ln) => d.normalizeCallBeat(ln, c.name, c.color)).filter(Boolean).slice(0, 8);
    }

    // 3) Stitch opener + callChatPool side lines
    const pool = d.teamsCopy.callChatPool || d.FALLBACK_CALL_CHAT_POOL || [];
    const picks = [];
    const used = new Set();
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n && pool.length; i++) {
      let ln = d.pick(pool);
      let guard = 0;
      while (ln && used.has((ln && ln.text) || ln) && guard++ < 8) ln = d.pick(pool);
      if (!ln) break;
      const norm = d.normalizeCallBeat(ln, "Sync", "#706890");
      if (!norm || !norm.text) break;
      used.add(norm.text);
      picks.push(norm);
    }
    return [openerLine].concat(picks).slice(0, 8);
  }

  d.startCallChatThread = function startCallChatThread() {
    const lines = d.pickCallChatThread(d.state.callCaller);
    d.state.callChatQueue = lines.slice();
    d.state.callChatCd = 0.35; // first line soon after Accept
    d.wins.slack.open = true;
    d.wins.slack.title = d.teamsCopy.windowTitle || "Sync -- Corporate Chat";
    // Park Sync lower-left so drip is readable while call overlay stays topmost (WIN95.md)
    if (d.wins.slack.y > 40) d.wins.slack.y = 18;
    if (d.wins.slack.x < 8) d.wins.slack.x = 8;
    d.raise("slack");
  }

  d.tickCallChat = function tickCallChat(dt) {
    if (!d.state.callChatQueue || !d.state.callChatQueue.length) return;
    if (d.state.callPhase !== "connected") {
      // Leave remaining lines unflushed so hang-up does not dump; clear queue
      d.state.callChatQueue = [];
      d.state.callChatCd = 0;
      return;
    }
    d.state.callChatCd -= dt;
    if (d.state.callChatCd > 0) return;
    const msg = d.state.callChatQueue.shift();
    if (msg) {
      d.pushSlack({
        name: msg.name,
        color: msg.color,
        text: msg.text,
      });
      d.audio.playSfx("teamsPing", { volume: 0.28 });
    }
    d.state.callChatCd = 1.1 + Math.random() * 0.9; // ~1-2s
  }

  d.FALLBACK_CALL_CHAT_POOL = [
    { name: "Dana", color: "#4a7080", text: "You're on mute. Spiritually." },
    { name: "Jess", color: "#5a6a8a", text: "Can everyone see my slides? I see despair." },
    { name: "Jimbo", color: "#705898", text: "Notetaking: [people made sounds]." },
    { name: "Kyle", color: "#a05030", text: "Quick question before we start. And after." },
    { name: "Ops", color: "#6b8f3a", text: "Bandwidth is fine. Courage is not." },
    { name: "Skip", color: "#8b6a3a", text: "Let's take this offline. We are offline." },
    { name: "Maya", color: "#4a6070", text: "I joined late on purpose." },
    { name: "HR", color: "#8b3a2a", text: "Reminder: cameras optional, vibes mandatory." },
  ];

  d.acceptCall = function acceptCall() {
    if (d.state.callPhase !== "ringing") return;
    d.audio.stopLoop("teamsRing");
    d.audio.playSfx("callAccept", { volume: 0.55 });
    d.state.callPhase = "connected";
    d.state.callMute = true;
    d.state.callCam = false;
    d.state.callAttent = 1;
    d.state.callAttentEmpty = 0;
    d.state.callSinceFeed = 0;
    d.state.callSharing = false;
    d.state.callShareAcc = 0;
    d.state.callChipDone = false;
    d.state.callConnLeft = 12 + Math.random() * 8; // 12-20s
    d.audio.playLoop("muffledCall", { volume: 0.3 });
    d.toast(d.teamsCopy.freezeToast || "Tickets frozen -- you are in a meeting (spiritually)");
    if (Math.random() < 0.25) {
      d.state.callJimboJoined = true;
      d.toast(d.teamsCopy.jimboJoinedToast || "Jimbo joined as a silent stakeholder!", { jimbo: true });
    }
    d.startCallChatThread();
  }

  d.landCallChip = function landCallChip(chip) {
    if (d.state.callPhase !== "connected" || d.state.callChipDone) return;
    d.state.callChipDone = true;
    if (d.bumpObligation) d.bumpObligation("syncChip");
    const sprint = Number(chip.sprint || 0);
    const san = Number(chip.sanity || 0);
    if (sprint) d.state.sprint += sprint;
    if (san < 0) d.hitSanity(-san);
    else if (san > 0) d.state.sanity = Math.min(100, d.state.sanity + san);
    d.feedCallAttentiveness(0.5);
    d.audio.playSfx("click");
    d.toast(d.pickCallFollowUp("thanks") || "Cool thanks bye");
    if (d.state.callJimboJoined && Math.random() < 0.5) {
      d.pushSlack({
        name: "Jimbo",
        color: "#705898",
        text: d.pickCallFollowUp("jimboDm") || "Jimbo: Call summary: people spoke.",
      });
    }
    d.endCall({ reason: "chip" });
  }

  d.hangUpCall = function hangUpCall() {
    if (d.state.callPhase !== "connected") return;
    if (!d.state.callChipDone) {
      d.failCallMissedChip();
      return;
    }
    d.endCall({ reason: "hangup" });
  }

  d.forceCall = function forceCall(opts) {
    // Debug: window.corpForceCall() -- bypass deferral gates
    if (d.callBusy()) {
      d.stopCallAudio();
      d.state.callPhase = null;
      d.resetCallUiState();
    }
    d.state.callQueued = false;
    d.state.emailEnabled = true;
    const caller = (opts && opts.caller) || d.pick(d.teamsCallers) || {
      id: "debug",
      name: "Brad from Synergy",
      color: "#6a5080",
      openers: ["Do you have a minute?"],
    };
    // d.startCallRing treats truthy forceCaller as bypass for d.canOpenCall
    return d.startCallRing(caller);
  }

  d.tryFlushCallQueue = function tryFlushCallQueue() {
    if (!d.state.callQueued || d.callBusy()) return;
    if (!d.canOpenCall()) return;
    d.startCallRing();
  }

  d.drawCallOverlay = function drawCallOverlay() {
    if (!d.state.callPhase) {
      d.state._callHits = null;
      return;
    }
    d.state._callHits = [];
    d.ctx.fillStyle = "rgba(40,20,60,0.45)";
    d.ctx.fillRect(0, 0, d.W, d.H - d.TASK_H);

    if (d.state.callPhase === "ringing") {
      const mw = 210;
      const mh = 96;
      const mx = (d.W - mw) / 2;
      const my = 44;
      d.bevelRaised(mx, my, mw, mh, d.C.face);
      d.ctx.fillStyle = d.C.teams;
      d.ctx.fillRect(mx + 3, my + 3, mw - 6, 14);
      if (d.imgReady(d.imgs.t16)) d.ctx.drawImage(d.imgs.t16, mx + 5, my + 4, 12, 12);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText("Incoming call", mx + 20, my + 13);
      const caller = d.state.callCaller || {};
      d.drawImgOr(d.imgs.callAvatar, mx + 10, my + 24, 32, 32, () => {
        d.ctx.fillStyle = caller.color || "#4A6A8A";
        d.ctx.fillRect(mx + 10, my + 24, 32, 32);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 10px Tahoma, sans-serif";
        const ini = String(caller.name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2);
        d.ctx.fillText(ini, mx + 16, my + 44);
      });
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText(String(caller.name || "Caller").slice(0, 26), mx + 48, my + 34);
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.fillText(String(d.state.callOpener || "Do you have a minute?").slice(0, 30), mx + 48, my + 46);
      d.ctx.fillText("Ring " + Math.ceil(d.state.callRingLeft) + "s", mx + 48, my + 56);

      const ay = my + mh - 24;
      d.bevelRaised(mx + 18, ay, 80, 16, d.C.face);
      d.drawImgOr(d.imgs.callAccept, mx + 22, ay + 0, 16, 16, null);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText(d.teamsCopy.acceptLabel || "Accept", mx + 40, ay + 11);
      d.state._callHits.push({ kind: "accept", hit: { x: mx + 18, y: ay, w: 80, h: 16 } });

      d.bevelRaised(mx + 112, ay, 80, 16, d.C.face);
      d.drawImgOr(d.imgs.callDecline, mx + 116, ay + 0, 16, 16, null);
      d.ctx.fillText(d.teamsCopy.declineLabel || "Decline", mx + 134, ay + 11);
      d.state._callHits.push({ kind: "decline", hit: { x: mx + 112, y: ay, w: 80, h: 16 } });
      return;
    }

    // connected
    const mw = 268;
    const mh = 172;
    const mx = (d.W - mw) / 2;
    const my = 14;
    d.bevelRaised(mx, my, mw, mh, d.C.face);
    d.ctx.fillStyle = d.C.teams;
    d.ctx.fillRect(mx + 3, my + 3, mw - 6, 14);
    if (d.imgReady(d.imgs.t16)) d.ctx.drawImage(d.imgs.t16, mx + 5, my + 4, 12, 12);
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    const caller = d.state.callCaller || {};
    d.ctx.fillText(("Call: " + (caller.name || "Meeting")).slice(0, 34), mx + 20, my + 13);

    // caller tile
    d.ctx.fillStyle = "#2a2848";
    d.ctx.fillRect(mx + 10, my + 22, 76, 52);
    d.drawImgOr(d.imgs.callAvatar, mx + 14, my + 26, 32, 32, () => {
      d.ctx.fillStyle = caller.color || "#4A6A8A";
      d.ctx.fillRect(mx + 14, my + 26, 32, 32);
    });
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillText(String(caller.name || "Them").slice(0, 10), mx + 50, my + 40);
    d.ctx.fillText("muffled...", mx + 50, my + 52);

    // self tile
    d.ctx.fillStyle = "#1a1a1a";
    d.ctx.fillRect(mx + 96, my + 22, 76, 52);
    if (d.state.callCam) {
      d.drawImgOr(d.imgs.callCam, mx + 118, my + 34, 16, 16, () => {
        d.ctx.fillStyle = "#606060";
        d.ctx.fillRect(mx + 118, my + 34, 28, 28);
      });
    } else {
      d.drawImgOr(d.imgs.callSelf, mx + 110, my + 28, 32, 32, () => {
        d.ctx.fillStyle = "#505050";
        d.ctx.fillRect(mx + 118, my + 34, 28, 28);
      });
    }
    d.ctx.fillStyle = "#a0a0a0";
    d.ctx.font = "6px Tahoma, sans-serif";
    d.ctx.fillText(d.state.callCam ? "You" : "You (cam off)", mx + 100, my + 68);

    // attentiveness
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "6px Tahoma, sans-serif";
    d.ctx.fillText(d.teamsCopy.attentivenessLabel || "Attentiveness", mx + 180, my + 28);
    d.bevelSunken(mx + 180, my + 32, 74, 8, d.C.white);
    const ap = Math.max(0, Math.min(1, d.state.callAttent));
    d.ctx.fillStyle = ap < 0.3 ? d.C.blood : d.C.sick;
    d.ctx.fillRect(mx + 181, my + 33, Math.max(1, 72 * ap), 6);
    d.ctx.fillStyle = d.C.shadow;
    d.ctx.fillText("Reply " + Math.ceil(Math.max(0, d.state.callConnLeft)) + "s", mx + 180, my + 50);

    const btnY = my + 82;
    function controlBtn(kind, bx, glyph, label) {
      d.bevelRaised(bx, btnY, 48, 16, d.C.face);
      d.drawImgOr(glyph, bx + 2, btnY, 16, 16, null);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 6px Tahoma, sans-serif";
      d.ctx.fillText(String(label).slice(0, 6), bx + 18, btnY + 11);
      d.state._callHits.push({ kind, hit: { x: bx, y: btnY, w: 48, h: 16 } });
    }
    // Mute ON default => crossed mic (callMuteOff). Unmuted => callMute.
    controlBtn("mute", mx + 10, d.state.callMute ? d.imgs.callMuteOff : d.imgs.callMute, d.state.callMute ? "Mute" : "Unmute");
    controlBtn("cam", mx + 62, d.state.callCam ? d.imgs.callCam : d.imgs.callCamOff, d.state.callCam ? "Cam" : "CamOff");
    controlBtn("share", mx + 114, d.imgs.callShare, d.teamsCopy.shareLabel || "Share");
    d.bevelRaised(mx + 200, btnY, 54, 16, d.C.face);
    d.drawImgOr(d.imgs.callHangup, mx + 202, btnY, 16, 16, null);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 6px Tahoma, sans-serif";
    d.ctx.fillText(String(d.teamsCopy.hangUpLabel || "Hang up").slice(0, 7), mx + 218, btnY + 11);
    d.state._callHits.push({ kind: "hangup", hit: { x: mx + 200, y: btnY, w: 54, h: 16 } });

    const chips = d.teamsChips.length
      ? d.teamsChips.slice(0, 4)
      : [
          { id: "uh_huh", label: "Uh-huh", sprint: 1, sanity: -1 },
          { id: "send_chat", label: "Can you send that in chat?", sprint: 2, sanity: -2 },
          { id: "on_mute", label: "Sorry -- on mute", sprint: 1, sanity: -2 },
          { id: "circle_back", label: "I'll circle back", sprint: 1, sanity: -3 },
        ];
    let cy = my + 106;
    chips.forEach((chip) => {
      const cw = mw - 20;
      d.bevelRaised(mx + 10, cy, cw, 13, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(String(chip.label || chip.id).slice(0, 36), mx + 14, cy + 9);
      d.state._callHits.push({ kind: "chip", chip, hit: { x: mx + 10, y: cy, w: cw, h: 13 } });
      cy += 15;
    });
  }

  d.tickCallTheater = function tickCallTheater(dt) {
    if (!d.state.emailEnabled) return;

    if (d.state.callPhase === "ringing") {
      d.state.callRingLeft -= dt;
      if (d.state.callRingLeft <= 0) {
        d.declineCall({ timedOut: true });
      }
      return;
    }

    if (d.state.callPhase === "connected") {
      d.state.callConnLeft -= dt;
      d.state.callSinceFeed += dt;
      // attentiveness drains ~12s full bar
      d.state.callAttent = Math.max(0, d.state.callAttent - dt / 12);
      if (d.state.callSharing) {
        d.state.callShareAcc += dt;
        if (d.state.callShareAcc >= 8 && d.state.callSinceFeed >= 8) {
          d.state.callShareAcc = 0;
          d.hitSanity(2);
          d.toast(d.pickCallFollowUp("noCursor") || d.teamsCopy.noCursorToast || "I can't see your cursor moving");
        }
      }
      if (d.state.callAttent <= 0) {
        d.state.callAttentEmpty += 1;
        if (d.state.callAttentEmpty >= 2) {
          d.failCallMissedChip();
          return;
        }
        d.hitSanity(3);
        d.toast(d.pickCallFollowUp("stillThere") || d.teamsCopy.stillThereToast || "Are you still there?");
        d.state.callAttent = 0.45;
        d.state.callSinceFeed = 0;
      }
      if (d.state.callConnLeft <= 0 && !d.state.callChipDone) {
        d.failCallMissedChip();
      }
      d.tickCallChat(dt);
      return;
    }

    // idle: countdown / queue
    if (d.state.callCd > 0) d.state.callCd -= dt;
    if (d.state.callQueued || d.state.callCd <= 0) {
      if (d.canOpenCall()) {
        d.startCallRing();
      } else {
        d.state.callQueued = true;
        if (d.state.callCd <= 0) d.state.callCd = 2 + Math.random() * 3;
      }
    }
  }

  d.handleCallClick = function handleCallClick(x, y) {
    if (!d.state.callPhase || !d.state._callHits) return false;
    for (const h of d.state._callHits) {
      if (!d.hit(h.hit, x, y)) continue;
      d.feedCallAttentiveness(0.4);
      if (h.kind === "accept") {
        d.acceptCall();
        return true;
      }
      if (h.kind === "decline") {
        d.declineCall({ timedOut: false });
        return true;
      }
      if (h.kind === "mute") {
        const was = d.state.callMute;
        d.state.callMute = !d.state.callMute;
        // briefly unmuted counts as feed
        if (was && !d.state.callMute) d.feedCallAttentiveness(0.5);
        d.audio.playSfx("click");
        return true;
      }
      if (h.kind === "cam") {
        d.state.callCam = !d.state.callCam;
        d.audio.playSfx("click");
        return true;
      }
      if (h.kind === "share") {
        d.state.callSharing = !d.state.callSharing;
        if (d.state.callSharing) {
          d.state.callShareAcc = 0;
          d.feedCallAttentiveness(0.25);
        }
        d.audio.playSfx("click");
        return true;
      }
      if (h.kind === "hangup") {
        d.hangUpCall();
        return true;
      }
      if (h.kind === "chip" && h.chip) {
        d.landCallChip(h.chip);
        return true;
      }
    }
    // any click on overlay while connected feeds a little
    if (d.state.callPhase === "connected") d.feedCallAttentiveness(0.15);
    return d.state.callPhase === "ringing" || d.state.callPhase === "connected";
  }

}
