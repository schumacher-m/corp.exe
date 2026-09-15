/** apps/Presence.js -- install onto desktop bag `d`. */
export function installPresence(d) {
  d.bumpActivity = function bumpActivity() {
    d.state.idleAcc = 0;
    d.state.jigglerMaskAcc = 0;
    d.state.jigglerPulseAcc = 0;
    if (d.state.presence !== d.Presence.ACTIVE && !d.state.presenceForced) {
      d.state.presence = d.Presence.ACTIVE;
    }
  }

  d.presenceBlocksBoard = function presenceBlocksBoard() {
    return !!d.state.presenceForced || (d.state.modal && d.state.modal.kind === "presence");
  }

  d.presenceColor = function presenceColor() {
    if (d.state.presence === d.Presence.AWAY) return d.C.red;
    if (d.state.presence === d.Presence.IDLE_YELLOW) return d.C.yellow;
    return d.C.green;
  }

  d.presenceLabel = function presenceLabel() {
    const badges = d.presenceCopy.badgeLabels || {};
    if (d.state.presence === d.Presence.AWAY) return badges.away || "Away";
    if (d.state.presence === d.Presence.IDLE_YELLOW) {
      const base = badges.idleWarn || badges.idle || "Idle";
      if (d.state.presenceStatus) {
        const st = (d.presenceCopy.statuses || []).find((s) => s.id === d.state.presenceStatus);
        const short = (st && st.label) || d.state.presenceStatus;
        return (base + " * " + String(short).split(" ")[0]).slice(0, 14);
      }
      return base === "..." ? "Idle" : base;
    }
    return badges.active || "Active";
  }

  d.idleStatusChoices = function idleStatusChoices() {
    const all = d.presenceCopy.statuses || [];
    const picks = all.filter((s) => s.id && s.id !== "active" && s.id !== "away" && s.keepsActive);
    return picks.slice(0, 4);
  }

  d.drawStatusPopover = function drawStatusPopover() {
    if (!d.state.statusPopover || d.state.presence !== d.Presence.IDLE_YELLOW) {
      d.state._statusHits = null;
      return;
    }
    const choices = d.idleStatusChoices();
    const pw = 120;
    const ph = 16 + choices.length * 14;
    const px = d.W - 130;
    const py = d.H - d.TASK_H - ph - 2;
    d.bevelRaised(px, py, pw, ph, d.C.face);
    d.ctx.fillStyle = d.C.title;
    d.ctx.fillRect(px + 2, py + 2, pw - 4, 12);
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText(d.presenceCopy.pickerTitle || "Set status", px + 6, py + 11);
    d.state._statusHits = [];
    let yy = py + 16;
    d.ctx.font = "7px Tahoma, sans-serif";
    for (const s of choices) {
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(String(s.label || s.id).slice(0, 22), px + 6, yy + 9);
      d.state._statusHits.push({ id: s.id, hit: { x: px + 2, y: yy, w: pw - 4, h: 13 } });
      yy += 14;
    }
  }

  d.buildAwayExcuseButtons = function buildAwayExcuseButtons() {
    const pool = (d.awayExcuseCopy.excuses || []).filter((e) => e && e.id !== "default");
    // Prefer 3 Writer excuses + 1 honest/ACK (distinct Sanity costs)
    const preferred = ["sync", "thinking", "fog", "honest"];
    const chosen = [];
    for (const id of preferred) {
      const e = pool.find((x) => x.id === id);
      if (e) chosen.push(e);
    }
    while (chosen.length < 4 && pool.length) {
      const e = d.pick(pool.filter((x) => !chosen.includes(x)));
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
    const ack = (d.awayExcuseCopy.excuses || []).find((e) => e.id === "default") || {
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

  d.forceAwayMail = function forceAwayMail() {
    const pool = d.state.inbox.filter((m) => m.presence || m.force);
    const mail = d.pick(pool) || {
      id: "away-fallback",
      from: "Compliance <policy@corp.internal>",
      subject: "Appear Active policy reminder",
      body: "Away status triggers this email. Explain yourself.",
      sanity: 10,
      presence: true,
      read: false,
      opened: false,
    };
    d.state.presenceForced = true;
    d.state.presence = d.Presence.AWAY;
    d.state.statusPopover = false;
    d.state.boardRefillPaused = true; // endless board waits behind Away
    // If timesheet somehow armed, demote to queue -- never stack on Away
    if (d.state.timesheetGateOpen) {
      d.state.timesheetGateOpen = false;
      d.state.timesheetQueued = true;
      if (d.wins.timesheet) d.wins.timesheet.open = false;
    }
    // Defer Call Theater over Away -- queue and stop ring/bed
    if (d.callBusy()) {
      d.stopCallAudio();
      d.state.callPhase = null;
      d.resetCallUiState();
      d.state.callQueued = true;
    }
    const prompt = d.awayExcuseCopy.prompt || "Why were you Away?";
    d.state.modal = {
      title: "Mandatory -- Appear Active",
      body: `${prompt}  ${mail.from}: ${mail.subject}. ${mail.body}`,
      kind: "presence",
      mail,
      buttons: d.buildAwayExcuseButtons(),
    };
    // Sanity charged on excuse click (do not double-dip mail.sanity here)
    d.audio.playSfx("newMail", { volume: 0.55 });
    d.audio.playSfx("awayTick", { volume: 0.3 });
    if (Math.random() < 0.5) {
      setTimeout(() => {
        if (d.state.jimboJiggler) {
          d.toast("Jiggler was already on. Interesting.", { jimbo: true });
        } else {
          d.toast(d.pick(d.jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
        }
      }, 400);
    }
  }

  d.dismissAwayWithExcuse = function dismissAwayWithExcuse(btn) {
    const mail = d.state.modal && d.state.modal.mail;
    if (mail) {
      mail.read = true;
      mail.opened = true;
    }
    const cost = (btn && (btn.sanityHit ?? btn.meta?.sanityHit)) ?? 5;
    d.hitSanity(cost);
    d.state.modal = null;
    d.state.presenceForced = false;
    d.state.presence = d.Presence.ACTIVE;
    d.state.idleAcc = 0;
    d.state.jigglerMaskAcc = 0;
    d.state.presenceStatus = null;
    const msg =
      (btn && (btn.toast || btn.meta?.toast)) ||
      (Math.random() < 0.4 ? "Presence reconciled." : null) ||
      d.pick(d.jimboCopy.jiggleToasts) ||
      "Back to Active.";
    d.toast(msg, { jimbo: Math.random() < 0.4 });
    d.audio.playSfx("click");
    // After Away: timesheet (if queued) then board refill -- never stacked on Away
    d.flushTimesheetQueue();
    d.flushEmailQueue();
    d.flushBoardRefill();
    d.tryFlushCallQueue();
  }

  d.toggleJiggler = function toggleJiggler({ fromStart } = {}) {
    if (d.state.jimboJiggler) {
      d.state.jimboJiggler = false;
      d.toast(d.jigglerCopy.stopToast || "Jiggler off. Welcome back to manual despair.");
      d.audio.playSfx("click");
      // Hard rule: if already past Away threshold, fire immediately
      if (!d.state.presenceForced && d.state.idleAcc >= d.IDLE_AWAY) {
        d.state.presence = d.Presence.AWAY;
        d.forceAwayMail();
      }
      return;
    }
    if (fromStart && d.state.jigglerInstalled) {
      // already used install today -- allow toggle off path only; re-enable ok if was installed
      // Spec: 1 install/day; toggle off/on after install is fine within day
    }
    if (!d.state.jigglerInstalled) {
      d.state.jigglerInstalled = true;
      d.state.jigglerAuditArmed = true;
      d.state.jigglerAuditAt = d.JIGGLER_AUDIT_MIN + Math.random() * d.JIGGLER_AUDIT_SPAN;
      d.state.jigglerAuditDone = false;
    }
    d.state.jimboJiggler = true;
    d.state.jigglerPulseAcc = 0;
    d.state.jigglerSanityAcc = 0;
    d.state.jigglerMaskAcc = 0;
    d.toast(d.pick(d.jigglerCopy.startToasts) || "Jimbo optimized your presence!", { jimbo: true });
    d.audio.playSfx("jimboChime", { volume: 0.4 });
  }

  d.maybeJigglerAudit = function maybeJigglerAudit() {
    if (!d.state.jimboJiggler || d.state.jigglerAuditDone || !d.state.jigglerAuditArmed) return;
    if (d.state.jigglerMaskAcc < (d.state.jigglerAuditAt || 60)) return;
    d.state.jigglerAuditDone = true;
    if (Math.random() > 0.15) return;
    const mails = d.hrAuditCopy.mails || [];
    const src = d.pick(mails);
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
    mail.bucket = d.mailBucket(mail);
    d.state.inbox.push(mail);
    d.queueOrDeliver(mail);
  }

  d.bumpPresenceJiggle = function bumpPresenceJiggle(n) {
    if (d.state.phase !== "presence" || !d.state.stub || d.state.stub.kind !== "presence") return;
    if (d.state.stub.failed) return;
    d.state.stub.jiggles += n;
    const pct = Math.min(1, d.state.stub.jiggles / d.state.stub.need);
    if (d.state.modal) {
      d.state.modal.body = `Engagement ${Math.floor(pct * 100)}% - ${d.state.stub.jiggles}/${d.state.stub.need} - ${Math.ceil(d.state.stub.tLeft)}s`;
    }
    if (d.state.stub.jiggles >= d.state.stub.need) {
      d.state.modal = null;
      if (!d.requestFinish({ toastMsg: "Status: Active (allegedly).", sanHit: 1 })) {
        d.state.modal = {
          title: "InsightBot - Appear Active",
          body: "Bar full. Ask Jimbo, then submit.",
          kind: "presenceTicket",
          buttons: [{ label: "SUBMIT", action: "fillerDone" }],
        };
        // fillerDone reuses d.requestFinish path - remap:
        d.state.modal.buttons = [{ label: "SUBMIT", action: "presenceSubmit" }];
      }
    }
  }

}
