/** apps/JimboApp.js -- install onto desktop bag `d`. */
export function installJimboApp(d) {
  d.drawJimbo = function drawJimbo(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.white);
    if (d.imgs.jban.complete && d.imgs.jban.naturalWidth) {
      d.ctx.drawImage(d.imgs.jban, x + w - 100, y + 4, 96, 48);
    }
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = d.C.text;
    let yy = y + 12;
    for (const ln of d.wrap(d.state.jimboLine || "", 28).slice(0, 5)) {
      d.ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    if (d.state.jimboUsedThisTicket) {
      d.ctx.fillStyle = d.C.sick;
      d.ctx.fillText("Y Jimbo consulted (this ticket)", x + 4, y + h - 36);
    } else if (["semi", "comment", "pr"].includes(d.state.phase)) {
      d.ctx.fillStyle = d.C.blood;
      d.ctx.fillText("Required before submit", x + 4, y + h - 36);
    }
    // Ask Jimbo
    d.bevelRaised(x + 4, y + h - 28, 88, 18, d.C.jimbo);
    if (d.imgs.jtb.complete && d.imgs.jtb.naturalWidth) {
      d.ctx.drawImage(d.imgs.jtb, x + 8, y + h - 25, 12, 12);
    }
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    d.ctx.fillText(d.jimboCopy.askLabel || "Ask Jimbo", x + 22, y + h - 16);
    d.state._jimboAskBtn = { x: x + 4, y: y + h - 28, w: 88, h: 18 };
    // Skip
    d.bevelRaised(x + 98, y + h - 28, 50, 18, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "8px Tahoma, sans-serif";
    d.ctx.fillText("Skip", x + 112, y + h - 16);
    d.state._jimboSkipBtn = { x: x + 98, y: y + h - 28, w: 50, h: 18 };
  }

  d.openJimbo = function openJimbo({ chime = true } = {}) {
    d.wins.jimbo.open = true;
    d.raise("jimbo");
    if (!d.state.jimboLine) d.state.jimboLine = d.pick(d.jimboCopy.greetings) || "Jimbo online.";
    if (chime) d.audio.playSfx("jimboChime", { volume: 0.55 });
  }

  d.applySabotage = function applySabotage(type) {
    const sab = d.jimboCopy.sabotage?.[type] || [];
    const note = d.pick(sab) || "Jimbo helped!";
    d.state.jimboLine = d.pick(d.jimboCopy.responses) || note;
    if (d.state.jimboSabotaged[type]) {
      // already sabotaged this open - soft nudge only
      d.toast(note, { jimbo: true });
      d.hitSanity(3);
      return;
    }
    d.state.jimboSabotaged[type] = true;
    if (type === "semi") {
      const modes = ["strip", "double", "guide"];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      d.state.semiStyle = { mode, note };
      if (mode === "strip" && d.state.semiPlaced) {
        // wipe alternate placed semis visually (logic still counts placed)
      }
      if (mode === "guide") {
        // invent style guide - flip need on one unused line mid-task
        const idx = d.copy.semiLines.findIndex((l, i) => !l.need && !(d.state.semiPlaced && d.state.semiPlaced[i]));
        if (idx >= 0) d.copy.semiLines[idx].need = true;
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
      d.state.commentOverrides = d.copy.commentLines.map((_, i) => nonsense[i % nonsense.length]);
    } else if (type === "pr") {
      const nits = [
        "Agree with Kyle. Also rename fog->data2.",
        "Nit+: alphabetize the blank lines. Blocking.",
        "Jimbo+Kyle: extract 47 to DATA2_CONSTANT.",
        "LGTM if we invent four more nits first.",
      ];
      d.state.prJimboNit = d.pick(nits) || note;
      d.state.prBubbles.push({ who: "jimbo", t: d.state.prJimboNit });
    } else if (type === "spacewar") {
      const nits = d.jimboCopy.sabotage?.spacewar || [
        "Agreed with Kyle. Also: two spaces after comma now.",
        "Inserted a NBSP for clarity.",
        "Opened a follow-up: Whitespace Diplomacy II.",
      ];
      d.state.prJimboNit = d.pick(nits) || note;
      d.state.prBubbles.push({ who: "jimbo", t: d.state.prJimboNit });
      // Optionally inject an extra beat by repeating current kyle line flavor
      d.hitSanity(5);
    } else if (type === "incident" && d.state.stub?.kind === "incident") {
      if (Math.random() < 0.5) {
        d.state.stub.monitorOff = false;
        d.toast("Jimbo re-enabled the monitor. Graphs are back. Sorry!");
      } else {
        d.state.stub.assignee = "You (again)";
        d.state.stub.pickingAssign = false;
        d.toast("Jimbo assigned it back to you. Synergy!");
      }
      d.refreshIncidentModal();
      d.hitSanity(4);
    } else if (type === "unsub" && d.state.stub?.kind === "unsub") {
      // Comedy spam - do NOT wipe completed unsubs (that softlocked the ticket)
      const extra = [
        { id: "u" + (d.state.stub.mails.length + 1), from: "CorpHub", subject: "404 Synergy", done: false },
        { id: "u" + (d.state.stub.mails.length + 2), from: "Marketing", subject: "You unsubscribed wrong", done: false },
      ];
      d.state.stub.mails.push(...extra);
      d.state.stub.need = Math.min(d.state.stub.need || 3, 3); // still only need 3 done
      d.state.stub.step = "list";
      d.state.stub.open = null;
      d.hitSanity(4);
    } else if (d.STUB_TYPES.includes(type) || type === "filler") {
      // Re-init stub with sabotage flavor (keys ready for Writer strings)
      d.initStub(type);
      d.hitSanity(4);
    }
    d.audio.playSfx("jimboFail", { volume: 0.6 });
    d.hitSanity(type === "semi" || type === "comment" || type === "pr" ? 8 : 2);
    const save = d.pick(d.jimboCopy.saveToasts) || "Jimbo saved you 4 hours!";
    d.toast(save, { jimbo: true });
  }

  d.askJimbo = function askJimbo() {
    d.openJimbo({ chime: false });
    d.audio.playSfx("jimboChime", { volume: 0.55 });
    const inTicket = d.state.phase && d.state.phase !== "desktop" && d.state.phase !== "ending";
    if (inTicket) {
      if (!d.state.jimboUsedThisTicket) {
        d.state.jimboUsedThisTicket = true;
        d.applySabotage(d.state.phase);
      } else {
        d.state.jimboLine = d.pick(d.jimboCopy.responses) || "Still helping!";
        d.toast(d.pick(d.jimboCopy.saveToasts) || "Jimbo saved you 4 hours!", { jimbo: true });
        d.hitSanity(3);
      }
      if (d.state.pendingFinish && d.state.jimboUsedThisTicket) {
        // Work already done - complete after Jimbo gate
        const pf = d.state.pendingFinish;
        d.finishTicket(pf.type, pf.pts, { toastMsg: pf.toastMsg, sanHit: pf.sanHit });
      }
    } else {
      d.state.jimboLine = d.pick(d.jimboCopy.greetings) || "Jimbo online.";
      d.toast(d.pick(d.jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
    }
  }

}
