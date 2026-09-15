/** desktop/Modal.js -- install onto desktop bag `d`. */
export function installModal(d) {
  d.drawModal = function drawModal() {
    const m = d.state.modal;
    if (!m) return;
    d.ctx.fillStyle = "rgba(0,0,0,0.35)";
    d.ctx.fillRect(0, 0, d.W, d.H - d.TASK_H);

    const PAD = 8;
    const BTN_H = 16;
    const BTN_GAP = 6;
    const ROW_GAP = 4;
    const TITLE_H = 14;
    const MAX_W = d.W - 16;
    const MIN_W = 160;

    const btns = (m.buttons || [{ label: "OK", action: "ok" }]).map((b) => {
      const label = String(typeof b === "string" ? b : b.label ?? "OK");
      const action = typeof b === "string" ? "ok" : b.action;
      // Measure with the font we actually draw
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      const tw = Math.ceil(d.ctx.measureText(label).width);
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
    const lines = d.wrap(m.body || "", charsPerLine);
    const btnBlockH = rows.length * BTN_H + Math.max(0, rows.length - 1) * ROW_GAP;
    let mh = 3 + TITLE_H + 8 + lines.length * 9 + 10 + btnBlockH + PAD;
    const maxH = d.H - d.TASK_H - 8;
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

    const mx = (d.W - mw) / 2;
    const my = Math.max(4, Math.min(40, (d.H - d.TASK_H - mh) / 2));
    d.bevelRaised(mx, my, mw, mh, d.C.face);
    d.ctx.fillStyle = m.kind === "jimbo" ? d.C.jimboBar : d.C.title;
    d.ctx.fillRect(mx + 3, my + 3, mw - 6, TITLE_H);
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 9px Tahoma, sans-serif";
    const title = String(m.title || "Alert");
    const maxTitle = Math.max(8, Math.floor((mw - 16) / 5.5));
    d.ctx.fillText(title.slice(0, maxTitle), mx + 8, my + 12);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "7px Tahoma, sans-serif";
    let yy = my + 3 + TITLE_H + 12;
    for (const ln of bodyLines) {
      d.ctx.fillText(ln, mx + PAD, yy);
      yy += 9;
    }

    d.state._modalBtns = [];
    let by = my + mh - PAD - btnBlockH;
    for (const row of rows) {
      const rowW =
        row.reduce((s, b) => s + b.bw, 0) + BTN_GAP * Math.max(0, row.length - 1);
      let bx = mx + Math.max(PAD, Math.floor((mw - rowW) / 2));
      for (const b of row) {
        // Clamp into dialog face
        if (bx + b.bw > mx + mw - PAD) bx = mx + mw - PAD - b.bw;
        if (bx < mx + PAD) bx = mx + PAD;
        d.bevelRaised(bx, by, b.bw, BTN_H, d.C.face);
        d.ctx.fillStyle = d.C.text;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        const tw = d.ctx.measureText(b.label).width;
        d.ctx.fillText(b.label, bx + Math.max(4, (b.bw - tw) / 2), by + 11);
        d.state._modalBtns.push({ hit: { x: bx, y: by, w: b.bw, h: BTN_H }, action: b.action });
        bx += b.bw + BTN_GAP;
      }
      by += BTN_H + ROW_GAP;
    }
  }

  d.handleModalClick = function handleModalClick(x, y) {
    if (!d.state.modal || !d.state._modalBtns) return false;
    for (const b of d.state._modalBtns) {
      if (d.hit(b.hit, x, y)) {
        const action = b.action;
        if (action === "ask") {
          d.state.modal = null;
          d.askJimbo();
        } else if (action === "dismiss-away" || (typeof action === "string" && action.startsWith("excuse:"))) {
          d.dismissAwayWithExcuse({ action: action === "dismiss-away" ? "excuse:water" : action, label: b.label });
          return true;
        } else if (action === "jiggle") {
          d.bumpPresenceJiggle(1);
          d.audio.playSfx("click");
        } else if (action === "jiggleJimbo") {
          d.bumpPresenceJiggle(3);
          d.hitSanity(2);
          d.toast(d.pick(d.jimboCopy.jiggleToasts) || "I jiggled your mouse for you!", { jimbo: true });
          d.audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("est:")) {
          d.handleEstimatePick(action.slice(4));
          d.audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("sev:")) {
          if (d.state.stub) {
            d.state.stub.sev = action.slice(4);
            // Downgrade clears the Sev0 lock so Submit can finish
            if (d.state.stub.sev !== "Sev0") {
              d.state.stub.sev0 = false;
              if (d.state.modal) {
                d.state.modal.body =
                  "Severity - Component - Impact - taxonomy must be satisfied.";
              }
            }
          }
          d.toast("Severity: " + action.slice(4));
          d.audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("comp:")) {
          if (d.state.stub) d.state.stub.comp = action.slice(5);
          d.toast("Component: " + action.slice(5));
          d.audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("imp:")) {
          if (d.state.stub) d.state.stub.impact = action.slice(4);
          d.toast("Impact: " + action.slice(4));
          d.audio.playSfx("click");
        } else if (action === "sevSubmit") {
          d.handleSeveritySubmit();
          d.audio.playSfx("click");
        } else if (action === "incidentDisable") {
          if (d.state.stub) {
            d.state.stub.monitorOff = true;
            d.toast(d.state.stub.toastDisable || "Monitor disabled. Outage: unobserved.");
            d.refreshIncidentModal();
            d.tryFinishIncident();
          }
          d.audio.playSfx("click");
        } else if (action === "incidentAssign") {
          if (d.state.stub) {
            d.state.stub.pickingAssign = true;
            d.refreshIncidentModal();
          }
          d.audio.playSfx("click");
        } else if (typeof action === "string" && action.startsWith("incidentAssignTo:")) {
          const who = action.slice("incidentAssignTo:".length);
          if (d.state.stub) {
            if (/^you\b/i.test(who)) {
              d.hitSanity(2);
              d.toast(d.state.stub.toastSelf || "Cannot assign to yourself.");
            } else {
              d.state.stub.assignee = who;
              d.state.stub.pickingAssign = false;
              d.toast((d.state.stub.toastAssign || "Ownership transferred.") + " -> " + who);
              d.refreshIncidentModal();
              d.tryFinishIncident();
            }
          }
          d.audio.playSfx("click");
        } else if (action === "incidentAssignBack") {
          if (d.state.stub) d.state.stub.pickingAssign = false;
          d.refreshIncidentModal();
          d.audio.playSfx("click");
        } else if (action === "incidentDone") {
          if (!d.tryFinishIncident()) {
            d.toast("Disable monitor AND assign to somebody else first.");
          }
          d.audio.playSfx("click");
        } else if (action === "incidentDismissFail") {
          d.dismissIncidentFail();
        } else if (action === "incidentFix") {
          d.hitSanity(4);
          d.toast(d.state.stub?.toastFix || "Heroism rejected. Try negligence.");
          d.audio.playSfx("error");
          // keep modal open - wrong cultural answer
        } else if (action === "fillerDone") {
          d.state.modal = null;
          d.requestFinish({ toastMsg: "Documented. Loop continues.", sanHit: 1 });
          d.audio.playSfx("click");
        } else if (action === "presenceSubmit") {
          d.state.modal = null;
          d.requestFinish({ toastMsg: d.state.stub?.toast || "Status: Active (allegedly).", sanHit: 1 });
          d.audio.playSfx("click");
        } else {
          d.state.modal = null;
          d.audio.playSfx("click");
        }
        return true;
      }
    }
    return true; // eat clicks while modal open
  }

}
