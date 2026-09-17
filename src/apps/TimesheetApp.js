/** apps/TimesheetApp.js -- install onto desktop bag `d`. */
export function installTimesheetApp(d) {
  d.resetTimesheetHours = function resetTimesheetHours() {
    const hours = {};
    for (const b of d.timesheetBuckets) {
      hours[b.id] = Number(b.default != null ? b.default : 0);
    }
    d.state.timesheetHours = hours;
  }

  d.timesheetSum = function timesheetSum() {
    let s = 0;
    for (const b of d.timesheetBuckets) {
      s += Number(d.state.timesheetHours[b.id] || 0);
    }
    return Math.round(s * 10) / 10;
  }

  d.timesheetSumExact = function timesheetSumExact() {
    return Math.abs(d.timesheetSum() - d.timesheetTarget) < 0.05;
  }

  d.needsTimesheetForClockOut = function needsTimesheetForClockOut() {
    return (
      d.state.timesheetGateOpen ||
      d.state.timesheetQueued ||
      d.state.ticketsCompletedSinceLock > 0 ||
      !d.state.timesheetLockedOk
    );
  }

  d.openTimesheet = function openTimesheet({ forced } = {}) {
    if (!Object.keys(d.state.timesheetHours || {}).length) d.resetTimesheetHours();
    d.state.timesheetAcceptedOpen = false;
    d.wins.timesheet.open = true;
    d.wins.timesheet.title = d.timesheetCopy.windowTitle || "timesheet.xls -- Time Entry";
    d.raise("timesheet");
    if (forced) {
      // gate already set by d.requestTimesheetGate
    }
  }

  d.requestTimesheetGate = function requestTimesheetGate(reason) {
    if (d.presenceBlocksBoard()) {
      d.state.timesheetQueued = true;
      d.toast(d.timesheetCopy.waitingAway || "Timesheet waiting -- clear Away first");
      return false;
    }
    // Never stack timesheet over an active call -- queue call and clear overlay
    if (d.callBusy()) {
      d.stopCallAudio();
      d.state.callPhase = null;
      d.resetCallUiState();
      d.state.callQueued = true;
    }
    d.state.timesheetQueued = false;
    d.state.timesheetGateOpen = true;
    d.state.timesheetLockedOk = false;
    d.openTimesheet({ forced: true });
    d.hooks.onTimesheetGate?.(reason || "gate");
    return true;
  }

  d.flushTimesheetQueue = function flushTimesheetQueue() {
    if (!d.state.timesheetQueued) return;
    if (d.presenceBlocksBoard()) return;
    d.state.timesheetQueued = false;
    d.requestTimesheetGate("queued-after-away");
  }

  d.clearTimesheetGate = function clearTimesheetGate() {
    d.state.timesheetGateOpen = false;
    d.state.timesheetQueued = false;
    d.flushBoardRefill();
    d.tryFlushCallQueue();
  }

  d.nudgeTimesheetHour = function nudgeTimesheetHour(id, delta) {
    const cur = Number(d.state.timesheetHours[id] || 0);
    let next = Math.round((cur + delta) * 10) / 10;
    if (next < 0) next = 0;
    if (next > 16) next = 16;
    d.state.timesheetHours[id] = next;
  }

  d.jimboAutoFillTimesheet = function jimboAutoFillTimesheet() {
    const fills = d.state.timesheetJimboFills || 0;
    let preset = null;
    if (fills <= 0) {
      preset = d.timesheetJimboFill.firstFill || {
        hours: { jimbo: 6, core: 1, sync: 0.5 },
        toast: "Jimbo reconciled your day!",
      };
    } else {
      preset = d.timesheetJimboFill.secondFill || {
        hours: { jimbo: 6, hope: 2 },
        toast: "Jimbo fixed the math. Spiritually worse.",
      };
    }
    d.resetTimesheetHours();
    const src = preset.hours || {};
    for (const b of d.timesheetBuckets) {
      if (src[b.id] != null) d.state.timesheetHours[b.id] = Number(src[b.id]);
    }
    d.state.timesheetJimboFills = fills + 1;
    const msg =
      preset.toast ||
      d.timesheetCopy.jimboReconciled ||
      "Jimbo reconciled your day!";
    d.toast(msg, { jimbo: true });
    // Sabotage help: Fail chime on Auto-Fill (Save beep only on Accept)
    d.audio.playSfx("jimboFail", { volume: 0.6 });
  }

  d.acceptTimesheet = function acceptTimesheet() {
    const sum = d.timesheetSum();
    if (!d.timesheetSumExact()) {
      const v = d.timesheetValidation;
      let msg = d.timesheetCopy.failExact || v.failExact || "Hours must equal core commitment (8.0).";
      if (sum < d.timesheetTarget && v.under?.length) {
        msg = d.pick(v.under).replace(/\{\{total\}\}/g, String(sum));
      } else if (sum > d.timesheetTarget && v.over?.length) {
        msg = d.pick(v.over).replace(/\{\{total\}\}/g, String(sum));
      } else if (sum === 0 && v.empty?.length) {
        msg = d.pick(v.empty);
      }
      // Prefer Spec fail line for Accept miss
      msg = d.timesheetCopy.failExact || v.failExact || msg;
      d.toast(msg);
      d.hitSanity(4);
      d.audio.playSfx("error");
      return false;
    }
    d.state.sprint += 2;
    d.hitSanity(2);
    d.state.ticketsCompletedSinceLock = 0;
    d.state.timesheetLockedOk = true;
    d.state.timesheetAcceptedOpen = true;
    if (d.bumpObligation) d.bumpObligation("timesheet");
    d.clearTimesheetGate();
    d.toast(
      d.timesheetCopy.hoursReconciled ||
        d.timesheetValidation.hoursReconciled ||
        "Hours reconciled."
    );
    d.audio.playSfx("timesheetSave", { volume: 0.45 });
    d.wins.timesheet.open = false;
    const pendingOut = d.state.timesheetPendingClockOut;
    d.state.timesheetPendingClockOut = false;
    d.hooks.onTimesheetAccept?.();
    if (pendingOut) {
      setTimeout(() => d.hooks.onClockOut?.(), 400);
    }
    return true;
  }

  d.closeTimesheetWindow = function closeTimesheetWindow() {
    d.wins.timesheet.open = false;
    if (d.state.timesheetGateOpen && !d.state.timesheetAcceptedOpen) {
      d.toast(
        d.timesheetCopy.incompleteToast ||
          d.timesheetValidation.incomplete ||
          "Timesheet incomplete"
      );
      d.audio.playSfx("error");
    }
  }

  d.drawTimesheet = function drawTimesheet(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.white);
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = d.C.shadow;
    const sub = d.timesheetCopy.subtitle || "Time Entry";
    d.ctx.fillText(String(sub).slice(0, 42), x + 3, y + 8);
    const doneN = d.state.ticketsCompletedSinceLock;
    d.ctx.fillText("CORP tickets since lock: " + doneN, x + 3, y + 17);

    d.state._tsHits = [];
    let yy = y + 22;
    const rowH = 14;
    for (const b of d.timesheetBuckets) {
      const hours = Number(d.state.timesheetHours[b.id] || 0);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(String(b.label).slice(0, 22), x + 3, yy + 9);
      // value box
      d.bevelSunken(x + w - 70, yy + 1, 28, 11, d.C.white);
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(hours.toFixed(1), x + w - 66, yy + 9);
      // minus
      d.bevelRaised(x + w - 40, yy + 1, 14, 11, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText("-", x + w - 36, yy + 9);
      d.state._tsHits.push({ kind: "minus", id: b.id, hit: { x: x + w - 40, y: yy + 1, w: 14, h: 11 } });
      // plus
      d.bevelRaised(x + w - 24, yy + 1, 14, 11, d.C.face);
      d.ctx.fillText("+", x + w - 20, yy + 9);
      d.state._tsHits.push({ kind: "plus", id: b.id, hit: { x: x + w - 24, y: yy + 1, w: 14, h: 11 } });
      yy += rowH;
      if (yy > y + h - 36) break;
    }

    const sum = d.timesheetSum();
    const ok = d.timesheetSumExact();
    d.ctx.fillStyle = ok ? d.C.sick : d.C.blood;
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    d.ctx.fillText("Total " + sum.toFixed(1) + " / " + d.timesheetTarget.toFixed(1), x + 3, y + h - 28);
    d.ctx.fillStyle = d.C.shadow;
    d.ctx.font = "6px Tahoma, sans-serif";
    d.ctx.fillText(String(d.timesheetCopy.footerHint || "Total must equal 8.0").slice(0, 48), x + 3, y + h - 18);

    // Jimbo Auto-Fill
    const jl = d.timesheetCopy.jimboFillLabel || d.timesheetJimboFill.buttonLabel || "Jimbo Auto-Fill";
    d.bevelRaised(x + 3, y + h - 14, 88, 12, d.C.jimbo);
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText(String(jl).slice(0, 16), x + 6, y + h - 5);
    d.state._tsJimboBtn = { x: x + 3, y: y + h - 14, w: 88, h: 12 };

    // Accept
    const al = d.timesheetCopy.submitLabel || "Accept";
    if (ok) d.bevelRaised(x + w - 64, y + h - 14, 60, 12, d.C.face);
    else d.bevelSunken(x + w - 64, y + h - 14, 60, 12, d.C.face);
    d.ctx.fillStyle = ok ? d.C.text : d.C.shadow;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText(String(al).slice(0, 10), x + w - 52, y + h - 5);
    d.state._tsAcceptBtn = { x: x + w - 64, y: y + h - 14, w: 60, h: 12 };
  }

}
