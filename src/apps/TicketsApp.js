/** apps/TicketsApp.js -- install onto desktop bag `d`. */
export function installTicketsApp(d) {
  d.makeUid = function makeUid() {
    return `tk-${++d.uidCounter}`;
  }

  d.cloneTicket = function cloneTicket(template) {
    const type = template.type || "filler";
    return {
      ...template,
      uid: d.makeUid(),
      mechanic: type, // type key === mechanic (fillers stay filler)
    };
  }

  d.shuffleInPlace = function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  d.templateByType = function templateByType(type) {
    return d.playableTemplates.find((t) => t.type === type) || d.fillerTemplates[0] || d.playableTemplates[0];
  }

  d.rebuildDrawBag = function rebuildDrawBag() {
    // Unused types this shuffle - one entry per playable type
    const types = d.playableTemplates.map((t) => t.type);
    return d.shuffleInPlace([...new Set(types)]);
  }

  d.canClaimTicket = function canClaimTicket() {
    if (d.presenceBlocksBoard()) return false;
    if (d.state.timesheetGateOpen) return false;
    if (d.callBlocksBoard()) return false;
    return true;
  }

  d.canSubmitTicket = function canSubmitTicket() {
    return d.canClaimTicket();
  }

  d.requestBoardRefill = function requestBoardRefill() {
    if (d.presenceBlocksBoard()) {
      d.state.boardRefillPaused = true;
      return false;
    }
    if (d.state.timesheetGateOpen || d.state.timesheetQueued) {
      d.state.boardRefillPaused = true;
      return false;
    }
    d.state.boardRefillPaused = false;
    d.spawnTicket();
    while (d.state.board.length < 2) d.spawnTicket();
    d.hooks.onBoardRefill?.();
    return true;
  }

  d.flushBoardRefill = function flushBoardRefill() {
    if (!d.state.boardRefillPaused) return;
    if (d.presenceBlocksBoard() || d.state.timesheetGateOpen) return;
    d.state.boardRefillPaused = false;
    d.spawnTicket();
    if (d.state.board.length === 0) d.spawnTicket({ forceFiller: true });
    while (d.state.board.length < 2) d.spawnTicket();
    d.hooks.onBoardRefill?.();
  }

  d.drawTickets = function drawTickets(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.white);
    const ds = (d.daySimCopy && d.daySimCopy()) || (d.copy && d.copy.daySim) || {};
    const labels = ds.obligationLabels || {};
    const obs = d.state.obligations || {};
    const keys = ["tickets", "focusedMail", "syncChip", "timesheet"];
    let yy = y + 2;
    d.ctx.font = "6px Tahoma, sans-serif";
    if (ds.obligationsTitle) {
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(String(ds.obligationsTitle).slice(0, 28), x + 4, yy + 7);
      yy += 9;
    }
    for (const key of keys) {
      const o = obs[key] || { need: 1, have: 0 };
      const mark = (o.have || 0) >= (o.need || 1) ? "*" : "o";
      const lab = labels[key] || key;
      d.ctx.fillStyle = (o.have || 0) >= (o.need || 1) ? d.C.sick : d.C.shadow;
      d.ctx.fillText(`${mark} ${lab} ${o.have || 0}/${o.need || 1}`, x + 4, yy + 7);
      yy += 8;
    }
    yy += 2;
    d.ctx.font = "8px Tahoma, sans-serif";
    for (const tk of d.state.board) {
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(`${tk.id}  ${tk.title.slice(0, 22)}`, x + 4, yy + 8);
      d.ctx.fillStyle = d.C.amber;
      d.ctx.fillText(`[${tk.pts}SP]`, x + w - 40, yy + 8);
      tk._hit = { x: x + 2, y: yy, w: w - 4, h: 14 };
      yy += 16;
      if (yy > y + h - 12) break;
    }
    d.ctx.fillStyle = d.C.shadow;
    d.ctx.fillText(`Closed ${d.state.closedCount} - Ask Jimbo to submit`, x + 4, y + h - 6);
  }

  d.drawSlack = function drawSlack(x, y, w, h) {
    // Sync parody chrome (internal id stays slack)
    d.bevelSunken(x, y, w, h, d.C.teamsFace);
    const railW = 28;
    d.ctx.fillStyle = d.C.teamsRail;
    d.ctx.fillRect(x, y, railW, h);
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 6px Tahoma, sans-serif";
    d.ctx.fillText(String(d.teamsCopy.railChat || "Chat").slice(0, 5), x + 3, y + 12);
    d.ctx.fillStyle = "#c8b0e0";
    d.ctx.fillText(String(d.teamsCopy.railCalls || "Calls").slice(0, 5), x + 3, y + 26);
    if (d.state.callMissedBadge) {
      d.ctx.fillStyle = d.C.blood;
      d.ctx.fillRect(x + 2, y + 30, 24, 9);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 6px Tahoma, sans-serif";
      d.ctx.fillText(String(d.teamsCopy.missedBadge || "Missed").slice(0, 5), x + 4, y + 37);
    }
    const mx = x + railW + 2;
    const mw = w - railW - 3;
    d.ctx.font = "7px Tahoma, sans-serif";
    if (d.state.phase === "align" && d.state.stub?.kind === "align") {
      d.drawAlignStub(mx, y, mw, h);
      return;
    }
    let yy = y + 3;
    const msgs = d.state.slackMsgs.slice(0, 8);
    for (const m of msgs) {
      d.ctx.fillStyle = m.color || d.C.teams;
      d.ctx.fillText(String(m.name || "?").slice(0, 14), mx + 2, yy + 7);
      d.ctx.fillStyle = d.C.text;
      const lines = d.wrap(m.text, 22);
      for (const ln of lines.slice(0, 2)) {
        d.ctx.fillText(ln, mx + 2, yy + 15);
        yy += 8;
      }
      yy += 6;
      if (yy > y + h - 8) break;
    }
    if (!msgs.length) {
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.fillText(String(d.teamsCopy.emptyThread || "No unread. Lie.").slice(0, 28), mx + 2, y + 12);
    }
  }

  d.initStub = function initStub(type) {
    const sab = !!d.state.jimboSabotaged[type];
    if (type === "align") {
      const S = d.ticketStrings.align || {};
      const btns = S.buttons || ["Sounds good!", "Sounds good (Design)", "Sounds good (Kyle)", "Have we considered a workshop?"];
      const dms = S.dms || [
        { from: "PM", text: "We're aligned on shipping feelings Q3, right?" },
        { from: "Design", text: "Aligned - as long as the fog stays #6b8f3a." },
        { from: "Kyle", text: "Aligned if we rename the channel first." },
      ];
      d.state.stub = {
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
      if (sab) d.state.stub.threads.push({ who: "Also Kyle", ask: "Have we considered a workshop?", opts: btns.slice(), correct: 0 });
      d.wins.slack.title = S.windowTitle || (d.teamsCopy.windowTitle || "Sync -- Corporate Chat");
    } else if (type === "rename") {
      const S = d.ticketStrings.rename || {};
      const ids = ["fog", "tmp", "unread", "badge", "clockIn"];
      d.state.stub = {
        kind: "rename",
        items: ids.map((id) => ({ id, to: sab && id === "fog" ? "atmosphericDensityCoefficient" : id })),
        need: 4,
        toast: S.toast || "Clarity achieved.",
        reject: S.reject || "Meaningful names are a blocker. Try data2.",
        hint: S.hint || "Kyle wants specificity. Jimbo wants data2.",
      };
      if (sab) d.state.stub.bulk = "data2_final_FINAL";
    } else if (type === "presence") {
      const S = d.ticketStrings.presence || {};
      const btns = (S.buttons || ["Jiggle", "I'm here", "Accept Jimbo jiggle"]).map((lab) => {
        if (/jimbo/i.test(lab)) return { label: lab, action: "jiggleJimbo" };
        return { label: lab, action: "jiggle" };
      });
      d.state.stub = {
        kind: "presence",
        jiggles: 0,
        need: 8,
        tLeft: 12,
        failed: false,
        toast: S.toast || "Status: Active (allegedly).",
        reject: S.reject || "Still Idle. The bar knows.",
      };
      d.state.modal = {
        title: S.windowTitle || "InsightBot - Engagement",
        body: S.hint || "8 inputs / 12s. Presence is a metric.",
        kind: "presenceTicket",
        buttons: btns,
      };
    } else if (type === "lint") {
      const S = d.ticketStrings.lint || {};
      const base = S.warnings || [
        "Unexpected fog.",
        "Promise returned without feelings.",
        "Magic number 3 (use a sadder constant).",
        "console.log is personality.",
        "File too honest.",
      ];
      const warns = base.slice(0, 5).map((w) => ({ w, gone: false }));
      if (sab) warns.push({ w: "no-fog-mentions", gone: false });
      d.state.stub = {
        kind: "lint",
        warns,
        toast: S.toast || "Build healthy. Morale: N/A.",
        reject: S.reject || "Fix is not implemented. Policy is Suppress.",
      };
    } else if (type === "standup2") {
      const S = d.ticketStrings.standup2 || {};
      const chips = S.chips || {};
      d.state.stub = {
        kind: "standup2",
        submits: 0,
        need: 2,
        fields: {
          y: d.pick(chips.yesterday) || d.pick(d.copy.standup?.yesterday) || "Synced with the fog",
          t: d.pick(chips.today) || d.pick(d.copy.standup?.today) || "Align stakeholders",
          b: sab ? "the fog" : d.pick(chips.blockers) || d.pick(d.copy.standup?.blockers) || "Calendar",
        },
        rejected: false,
        rejectNits: S.rejectNits || ["Not actionable. Try verbs."],
        toast: S.toast || "Standup complete. Nobody read it.",
        successBot: S.successBot || ":white_check_mark: thanks for sharing",
      };
    } else if (type === "merge") {
      const S = d.ticketStrings.merge || {};
      const hints = S.hunkHints || ["Same comment, two truths", "data2 vs data", "Fog boolean lore"];
      d.state.stub = {
        kind: "merge",
        hunks: hints.slice(0, 3).map((label) => ({ label, res: sab ? "both" : null })),
        toast: S.toast || "Conflicts resolved. Feelings: deferred.",
      };
    } else if (type === "unsub") {
      const S = d.ticketStrings.unsub || {};
      const mails = (S.mails || [
        {"subject": "Quick read: culture deck", "from": "AllHands"},
        {"subject": "Quick read: Q3 feelings", "from": "HR"},
        {"subject": "Quick read: you unsubscribed wrong", "from": "Marketing"},
      ]).map((m, i) => ({ id: "u" + (i + 1), from: m.from, subject: m.subject, done: false }));
      d.state.stub = {
        kind: "unsub",
        mails,
        open: null,
        step: "list",
        need: 3,
        toast: S.toast || "You will still receive critical updates.",
        afterUnsub: S.afterUnsub || "Preferences saved to nowhere.",
      };
      // Jimbo spam is applied in d.applySabotage without resetting progress
    } else if (type === "logspam") {
      const S = d.ticketStrings.logspam || {};
      const chips = S.logChips || ["console.log('here')", "console.log(data2)", "console.log('Kyle was here')"];
      const lines = (d.copy.commentLines || ["a()", "b()", "c()", "d()", "e()", "f()"]).slice(0, 6);
      d.state.stub = {
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
      const S = d.ticketStrings.estimate || {};
      const pts = S.points || ["1", "2", "3", "5", "8", "13", "21", "?"];
      d.state.stub = {
        kind: "estimate",
        first: null,
        picks: 0,
        reject: S.reject || "Kyle-bot: too small. Try bigger regret.",
        toast: S.toast || "Committed to the vibe of 5.",
      };
      d.state.modal = {
        title: S.windowTitle || "Planning poker - regret edition",
        body: "Estimate this 'quick' ticket. Kyle-bot rejects your first d.pick.",
        kind: "estimateTicket",
        buttons: pts.map((v) => ({ label: v, action: "est:" + v })),
      };
    } else if (type === "severity") {
      const S = d.ticketStrings.severity || {};
      const sevs = S.severity || ["Sev0", "Sev1", "Sev2", "Sev3", "Sev4", "Unknown", "It's Fine"];
      const comps = S.component || ["Platform", "Fog", "Other", "Kyle"];
      const imps = S.impact || ["Users", "Metrics", "Feelings"];
      d.state.stub = {
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
      d.state.modal = {
        title: S.windowTitle || "Bug - taxonomy must be satisfied",
        body: sab
          ? "Jimbo set Sev0 and paged Sync. Downgrade to finish."
          : "Severity - Component - Impact - taxonomy must be satisfied.",
        kind: "severityTicket",
        buttons,
      };
    } else if (type === "incident") {
      d.openIncident({ fromTicket: true, headline: d.pick(d.incidentHeadlines()) });
    } else if (type === "filler") {
      d.state.stub = { kind: "filler" };
      d.state.modal = {
        title: d.tkTitle(),
        body: (d.state.activeTicket?.dod || "Document & close.") + "\n\nOne-click close.",
        kind: "fillerTicket",
        buttons: [{ label: "Document & Close", action: "fillerDone" }],
      };
    } else {
      d.state.stub = { kind: type };
    }
  }

  d.tkTitle = function tkTitle() {
    return d.state.activeTicket?.title || "Ticket";
  }

  d.openTicket = function openTicket(tk) {
    if (!d.canClaimTicket()) {
      if (d.presenceBlocksBoard()) d.toast("Clear Away before claiming tickets");
      else if (d.state.timesheetGateOpen) d.toast("Timesheet incomplete -- hours first");
      else if (d.callBlocksBoard()) d.toast(d.teamsCopy.freezeToast || "Tickets frozen -- you are in a meeting (spiritually)");
      return;
    }
    d.state.activeTicket = tk;
    d.state.jimboUsedThisTicket = false;
    d.state.pendingFinish = null;
    d.state.semiStyle = null;
    d.state.commentOverrides = null;
    d.state.prJimboNit = null;
    d.state.semiPlaced = null;
    d.state.commentDone = null;
    d.state.commentIdx = 0;
    d.state.prStep = 0;
    d.state.prBubbles = [];
    d.state.stub = null;
    d.state.modal = null;
    d.kyleInterruptCd = 10 + Math.random() * 8;
    // Sabotage resets per open so Jimbo can sabotage each new ticket
    const mech = tk.mechanic || tk.type || "filler";
    delete d.state.jimboSabotaged[mech];
    d.state.phase = mech;

    if (mech === "semi") {
      d.wins.ide.open = true;
      d.wins.ide.title = "IDE - Semicolon Hell";
      d.raise("ide");
      d.ensureSemi();
    } else if (mech === "comment") {
      d.wins.ide.open = true;
      d.wins.ide.title = "IDE - Comment Policy";
      d.raise("ide");
      d.ensureComment();
    } else if (mech === "pr" || mech === "spacewar") {
      d.wins.pr.open = true;
      d.wins.pr.title =
        mech === "spacewar"
          ? d.tStr("spacewar", "windowTitle", "PR #spaces - Whitespace diplomacy")
          : "PR Review - Kyle";
      d.raise("pr");
      d.state.prStep = 0;
      const pool = mech === "spacewar" ? (d.copy.spaceWarScript || d.copy.prScript) : d.copy.prScript;
      d.state.prRoundScript = d.pickPrRound(pool, d.PR_ROUND_MAX);
      const script = d.state.prRoundScript;
      d.state.prBubbles = [{ who: "kyle", t: (script && script[0] && script[0].kyle) || "Nit?" }];
      d.hooks.onPrOpen?.();
      d.audio.playBgm("bgmPr");
    } else if (mech === "align") {
      d.initStub(mech);
      d.wins.slack.open = true;
      d.wins.slack.title = d.tStr("align", "windowTitle", d.wins.slack.title || d.teamsCopy.windowTitle || "Sync");
      d.raise("slack");
    } else if (mech === "standup2") {
      d.initStub(mech);
      d.wins.standup.open = true;
      d.wins.standup.title = d.tStr("standup2", "windowTitle", "Standup - Rewrite Feelings");
      d.raise("standup");
    } else if (mech === "unsub") {
      d.initStub(mech);
      d.wins.inbox.open = true;
      d.wins.inbox.title = d.tStr("unsub", "windowTitle", d.wins.inbox.title || "Inbox");
      d.raise("inbox");
    } else if (["rename", "lint", "merge", "logspam"].includes(mech)) {
      d.initStub(mech);
      d.wins.ide.open = true;
      d.wins.ide.title = d.tStr(mech, "windowTitle", "IDE - " + (tk.title || mech));
      d.raise("ide");
    } else if (["presence", "estimate", "severity", "incident", "filler"].includes(mech)) {
      d.initStub(mech);
    } else {
      // Unknown -> treat as filler micro-stub
      d.state.phase = "filler";
      d.initStub("filler");
    }
    d.audio.playSfx("click");
  }

  d.showHrSkip = function showHrSkip() {
    const hr = d.jimboCopy.skipHr || {
      title: "HR / Compliance",
      body: "Policy requires Jimbo interaction before submit.",
      buttons: ["Ask Jimbo", "I Love Policy"],
    };
    d.state.modal = {
      title: hr.title,
      body: hr.body,
      kind: "hr",
      buttons: [
        { label: hr.buttons?.[0] || "Ask Jimbo", action: "ask" },
        { label: hr.buttons?.[1] || "OK", action: "ok" },
      ],
    };
    d.audio.playSfx("error");
  }

  d.tryFinishTicket = function tryFinishTicket(type, pts) {
    if (!d.state.jimboUsedThisTicket) {
      d.state.pendingFinish = { ...(d.state.pendingFinish || {}), type, pts };
      d.showHrSkip();
      d.toast("Ask Jimbo before submit");
      return false;
    }
    const extra = d.state.pendingFinish || {};
    d.finishTicket(type, pts, { toastMsg: extra.toastMsg, sanHit: extra.sanHit });
    return true;
  }

  d.drawFromDeck = function drawFromDeck(forceFiller) {
    if (forceFiller || (!d.state.drawBag.length && !d.playableTemplates.length)) {
      const ft = d.pick(d.fillerTemplates) || {
        id: "CORP-FILL",
        title: "Document something temporary",
        pts: 1,
        type: "filler",
        dod: "One-click close so the board never softlocks.",
        meta: "Filler - Never empty",
      };
      return d.cloneTicket(ft);
    }
    if (!d.state.drawBag.length) {
      d.state.drawBag = d.rebuildDrawBag();
    }
    // Prefer types not currently on the board
    const onBoardTypes = new Set(d.state.board.map((t) => t.mechanic || t.type));
    let pickType = null;
    const unusedOffBoard = d.state.drawBag.filter((t) => !onBoardTypes.has(t));
    if (unusedOffBoard.length) {
      pickType = d.pick(unusedOffBoard);
      d.state.drawBag = d.state.drawBag.filter((t) => t !== pickType);
    } else {
      pickType = d.state.drawBag.pop();
    }
    if (!pickType) {
      return d.drawFromDeck(true);
    }
    const template = d.templateByType(pickType);
    if (!template) return d.drawFromDeck(true);
    return d.cloneTicket(template);
  }

  d.spawnTicket = function spawnTicket({ forceFiller = false } = {}) {
    // Active slots: keep 2-3 visible
    if (d.state.board.length >= 3) return;
    const inst = d.drawFromDeck(forceFiller);
    if (!inst) return;
    d.state.board.push(inst);
    d.toast("New ticket assigned");
  }

  d.finishTicket = function finishTicket(type, pts, { toastMsg, sanHit } = {}) {
    if (d.state.jimboUsedThisTicket) {
      d.state.jimboTicketsUsed = (d.state.jimboTicketsUsed || 0) + 1;
    }
    if (d.bumpObligation) d.bumpObligation("tickets");
    d.state.closedCount = (d.state.closedCount || 0) + 1;
    d.state.typesCompleted[type] = (d.state.typesCompleted[type] || 0) + 1;
    const uid = d.state.activeTicket?.uid;
    const doneToast = toastMsg || d.state.activeTicket?.toast || `Ticket closed +${pts} SP`;
    if (uid) d.state.board = d.state.board.filter((t) => t.uid !== uid);
    d.state.activeTicket = null;
    d.state.stub = null;
    d.state.sprint += pts;
    if (sanHit) d.hitSanity(sanHit);
    d.state.clockMinutes = Math.min(18 * 60, d.state.clockMinutes + 8);
    d.state.pendingFinish = null;
    d.toast(doneToast);
    d.audio.playSfx("ticket");
    d.wins.ide.open = false;
    d.wins.pr.open = false;
    d.state.prRoundScript = null;
    if (type === "standup2") {
      d.wins.standup.open = false;
      d.wins.standup.title = "Standup";
    }
    d.state.phase = "desktop";
    d.state.modal = null;
    d.state._submitBtn = null;
    d.state._stubHits = null;
    d.raise("tickets");
    d.state.ticketsCompletedSinceLock = (d.state.ticketsCompletedSinceLock || 0) + 1;
    // Immediately draw 1 unused type; never leave board empty -- wait if Away
    if (d.presenceBlocksBoard()) {
      d.state.boardRefillPaused = true;
    } else {
      d.spawnTicket();
      if (d.state.board.length === 0) d.spawnTicket({ forceFiller: true });
      while (d.state.board.length < 2) d.spawnTicket();
    }
    d.hooks.onTicketDone?.(type, pts);
    d.audio.playBgm("bgmDesk");
    // CORP-BAL-01: first ticket finish ends day grace
    if ((d.state.dayGraceLeft || 0) > 0) {
      d.state.dayGraceLeft = 0;
      d.state.emailCooldown = d.EMAIL_MIN + Math.random() * (d.EMAIL_MAX - d.EMAIL_MIN);
    }
    // Flush Mail then Sync when interrupt shield clears
    d.flushEmailQueue();
    d.tryFlushCallQueue();
    // Timesheet Lock trigger A -- every N completions (default 3); mid-day only
    if (
      d.state.ticketsCompletedSinceLock >= (d.state.timesheetGateThreshold || 3) &&
      !d.state.timesheetGateOpen &&
      !d.state.timesheetQueued
    ) {
      d.state.ticketsCompletedSinceLock = 0;
      d.requestTimesheetGate("mid-day");
    }
  }

  d.requestFinish = function requestFinish(extra = {}) {
    const tk = d.state.activeTicket;
    const type = tk?.mechanic || tk?.type || d.state.phase;
    const pts = tk?.pts || 1;
    if (!d.state.jimboUsedThisTicket) {
      d.state.pendingFinish = { type, pts, ...extra };
      d.showHrSkip();
      d.toast("Ask Jimbo before submit");
      return false;
    }
    d.finishTicket(type, pts, extra);
    return true;
  }

  d.minigameFocused = function minigameFocused() {
    return !!(d.state.phase && d.state.phase !== "desktop" && d.state.phase !== "ending");
  }

  // CORP-BAL-01: queue Mail / Sync rings over active ticket work (incl. desktop+IDE)
  d.interruptShielded = function interruptShielded() {
    if (d.minigameFocused()) return true;
    if (d.state.activeTicket) return true;
    if (d.wins && d.wins.ide && d.wins.ide.open) return true;
    if (d.wins && d.wins.pr && d.wins.pr.open) return true;
    if (d.wins && d.wins.standup && d.wins.standup.open) return true;
    return false;
  }

  d.handleStubClick = function handleStubClick(win, x, y) {
    const st = d.state.stub;
    if (!st) return false;
    // shared SUBMIT for stub finishes
    if (d.hit(d.state._submitBtn, x, y) && ["rename", "lint", "merge", "logspam", "align", "unsub"].includes(d.state.phase)) {
      const san =
        d.state.phase === "merge" && st.hunks && st.hunks.every((h) => h.res === "both")
          ? 6
          : d.state.phase === "rename"
            ? 3
            : d.state.phase === "unsub"
              ? 4
              : 2;
      if (d.state.phase === "logspam" && st.lines.some((l) => String(l.log || "").includes("debugger"))) {
        d.hitSanity(3);
        d.toast("Remove debugger before submit");
        return true;
      }
      d.requestFinish({ toastMsg: d.state.stub?.toast || d.state.activeTicket?.toast, sanHit: san });
      return true;
    }
    if (!d.state._stubHits) return false;

    if (win.id === "slack" && st.kind === "align") {
      for (const h of d.state._stubHits) {
        if (h.kind === "align" && d.hit(h.hit, x, y)) {
          const th = st.threads[st.idx];
          if (!th) return true;
          if (h.i !== th.correct && th.opts[h.i]?.includes("Workshop")) {
            d.hitSanity(4);
            d.toast(st.reject || "Wrong thread energy. Reset DM.");
            return true;
          }
          // accept any "Sounds good" variant
          d.pushSlack({ name: "You", color: "#306090", text: th.opts[h.i] });
          st.idx++;
          d.audio.playSfx("click");
          if (st.idx >= st.threads.length) {
            d.toast(st.toast || "Stakeholders aligned. Meeting still happening.");
          }
          return true;
        }
      }
    }

    if (win.id === "ide" && ["rename", "lint", "merge", "logspam"].includes(st.kind)) {
      for (const h of d.state._stubHits) {
        if (!d.hit(h.hit, x, y)) continue;
        d.audio.playSfx("click");
        d.hooks.onType?.();
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
            d.hitSanity(3);
            st.warns[h.i].w = st.warns[h.i].w + " (angrier)";
            d.toast(st.reject || "Fix failed. Warning returns angrier.");
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
            d.toast("debugger removed");
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
      for (const h of d.state._stubHits) {
        if (!d.hit(h.hit, x, y)) continue;
        d.audio.playSfx("click");
        if (h.action === "tweak") {
          st.fields.b = d.pick(["Calendar", "Waiting on Kyle", "Ambiguous OKRs", "The plant"]) || "Calendar";
          st.rejected = false;
          d.toast("Blockers tweaked");
          return true;
        }
        if (h.action === "submit") {
          if (st.fields.b === "the fog") {
            d.hitSanity(5);
            st.rejected = true;
            d.toast("Fog submit rejected - rewrite");
            return true;
          }
          st.submits++;
          if (st.submits === 1) {
            st.rejected = true;
            d.toast("Bot: not actionable. Tweak one field.");
            return true;
          }
          if (st.submits >= st.need) {
            d.requestFinish({ toastMsg: st.toast || "Standup complete. Nobody read it.", sanHit: 2 });
          }
          return true;
        }
      }
    }

    if (win.id === "inbox" && st.kind === "unsub") {
      if (d.hit(d.state._submitBtn, x, y)) {
        d.requestFinish({ toastMsg: st.toast || d.state.stub?.toast || "You will still receive critical updates.", sanHit: 4 });
        return true;
      }
      for (const h of d.state._stubHits) {
        if (!d.hit(h.hit, x, y)) continue;
        d.audio.playSfx("click");
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
          d.hitSanity(2);
          d.toast("404 Synergy - preferences lost");
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
          d.toast(st.afterUnsub || "Preferences saved to nowhere.");
          return true;
        }
      }
    }
    return false;
  }

}
