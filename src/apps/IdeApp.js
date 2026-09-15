/** apps/IdeApp.js -- install onto desktop bag `d`. */
export function installIdeApp(d) {
  d.drawAlignStub = function drawAlignStub(x, y, w, h) {
    const st = d.state.stub;
    d.state._stubHits = [];
    let yy = y + 4;
    const th = st.threads[st.idx];
    if (!th) {
      d.ctx.fillStyle = d.C.sick;
      d.ctx.fillText("All threads aligned.", x + 4, yy + 8);
      d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
      d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      return;
    }
    d.ctx.fillStyle = "#000080";
    d.ctx.fillText(`${th.who} DM (${st.idx + 1}/${st.threads.length})`, x + 4, yy + 7);
    yy += 12;
    d.ctx.fillStyle = d.C.text;
    for (const ln of d.wrap(th.ask, 32)) {
      d.ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    yy += 4;
    th.opts.forEach((opt, i) => {
      d.bevelRaised(x + 4, yy, w - 8, 14, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(opt.slice(0, 36), x + 8, yy + 10);
      d.state._stubHits.push({ kind: "align", i, hit: { x: x + 4, y: yy, w: w - 8, h: 14 } });
      yy += 18;
    });
    d.state._submitBtn = null;
  }

  d.drawMeters = function drawMeters(x, y, w, h) {
    d.ctx.font = "7px Tahoma, sans-serif";
    const rows = [
      ["SAN", d.state.sanity / 100, d.state.sanity < 30 ? d.C.blood : d.C.sick],
      ["SP", Math.min(1, d.state.sprint / 20), d.C.amber],
      ["UNR", Math.min(1, d.state.unread / 20), d.C.blood],
    ];
    let yy = y + 2;
    for (const [lab, pct, col] of rows) {
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(lab, x + 2, yy + 7);
      d.bevelSunken(x + 28, yy + 1, w - 32, 8, d.C.white);
      d.ctx.fillStyle = col;
      d.ctx.fillRect(x + 29, yy + 2, Math.max(1, (w - 34) * pct), 6);
      yy += 12;
    }
  }

  d.drawStandup = function drawStandup(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.white);
    if (d.state.phase === "standup2" && d.state.stub?.kind === "standup2") {
      d.drawStandup2Stub(x, y, w, h);
      return;
    }
    const s = d.copy.standup;
    if (!d.state._standupPick) {
      d.state._standupPick = { y: d.pick(s.yesterday), t: d.pick(s.today), b: d.pick(s.blockers) };
    }
    const yest = d.state._standupPick.y;
    const tod = d.state._standupPick.t;
    const blk = d.state._standupPick.b;
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = d.C.text;
    const lines = ["Yesterday: " + yest, "Today: " + tod, "Blockers: " + blk];
    let yy = y + 10;
    for (const ln of lines) {
      for (const wln of d.wrap(ln, 36)) {
        d.ctx.fillText(wln, x + 4, yy);
        yy += 9;
      }
      yy += 2;
    }
    d.bevelRaised(x + w / 2 - 40, y + h - 18, 80, 14, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    d.ctx.fillText("ACKNOWLEDGE", x + w / 2 - 32, y + h - 9);
    d.state._standupBtn = { x: x + w / 2 - 40, y: y + h - 18, w: 80, h: 14 };
  }

  d.drawStandup2Stub = function drawStandup2Stub(x, y, w, h) {
    const st = d.state.stub;
    d.state._stubHits = [];
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = d.C.text;
    let yy = y + 8;
    d.ctx.fillText(`Yesterday: ${st.fields.y}`.slice(0, 40), x + 4, yy); yy += 10;
    d.ctx.fillText(`Today: ${st.fields.t}`.slice(0, 40), x + 4, yy); yy += 10;
    d.ctx.fillStyle = st.fields.b === "the fog" ? d.C.blood : d.C.text;
    d.ctx.fillText(`Blockers: ${st.fields.b}`.slice(0, 40), x + 4, yy); yy += 14;
    if (st.rejected) {
      d.ctx.fillStyle = d.C.blood;
      d.ctx.fillText("Bot: not actionable. Tweak & resubmit.", x + 4, yy);
      yy += 12;
    }
    d.ctx.fillStyle = d.C.shadow;
    d.ctx.fillText(`Submits ${st.submits}/${st.need}`, x + 4, yy);
    // chip to clear fog
    d.bevelRaised(x + 4, y + h - 40, 90, 14, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText("Tweak Blockers", x + 10, y + h - 31);
    d.state._stubHits.push({ kind: "standup2", action: "tweak", hit: { x: x + 4, y: y + h - 40, w: 90, h: 14 } });
    d.bevelRaised(x + w / 2 - 40, y + h - 20, 80, 14, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    d.ctx.fillText("SUBMIT", x + w / 2 - 20, y + h - 11);
    d.state._stubHits.push({ kind: "standup2", action: "submit", hit: { x: x + w / 2 - 40, y: y + h - 20, w: 80, h: 14 } });
    d.state._standupBtn = null;
  }

  d.ensureSemi = function ensureSemi() {
    if (!d.state.semiPlaced) d.state.semiPlaced = d.copy.semiLines.map(() => false);
  }

  d.ensureComment = function ensureComment() {
    if (!d.state.commentDone) {
      d.state.commentDone = d.copy.commentLines.map(() => false);
      d.state.commentIdx = 0;
    }
  }

  d.drawIde = function drawIde(x, y, w, h) {
    d.bevelSunken(x, y, w, h - 28, "#000000");
    d.ctx.font = "7px 'Courier New', monospace";
    if (d.state.phase === "semi") {
      d.ensureSemi();
      let yy = y + 8;
      d.copy.semiLines.forEach((ln, i) => {
        const placed = d.state.semiPlaced[i];
        let semi = "";
        if (ln.need && placed) {
          if (d.state.semiStyle?.mode === "double" && i % 2 === 1) semi = ";;";
          else if (d.state.semiStyle?.mode === "strip") semi = "";
          else semi = ";";
        }
        // Jimbo strip: even placed lines lose ;
        if (d.state.semiStyle?.mode === "strip" && placed && ln.need && i % 2 === 0) semi = "";
        if (d.state.semiStyle?.mode === "double" && placed && ln.need && i % 2 === 0) semi = ";";
        d.ctx.fillStyle = placed && ln.need ? d.C.sick : "#c8c4b0";
        d.ctx.fillText(`${String(i + 1).padStart(2)} ${ln.code}${semi}`, x + 4, yy);
        ln._hit = { x, y: yy - 7, w, h: 9, i };
        yy += 9;
      });
      d.ctx.fillStyle = d.C.face;
      d.ctx.fillRect(x, y + h - 28, w, 28);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      const hint = d.state.semiStyle?.note
        ? String(d.state.semiStyle.note).slice(0, 42)
        : "Click lines missing ;  or press ;";
      d.ctx.fillText(hint, x + 4, y + h - 12);
      if (d.state.pendingFinish?.type === "semi") {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (d.state.phase === "comment") {
      d.ensureComment();
      let yy = y + 8;
      d.copy.commentLines.forEach((code, i) => {
        const done = d.state.commentDone[i];
        d.ctx.fillStyle = i === d.state.commentIdx ? "#ffff80" : "#c8c4b0";
        d.ctx.fillText(`${i + 1} ${code}`, x + 4, yy);
        if (done) {
          d.ctx.fillStyle = "#7aaa9a";
          const sug =
            (d.state.commentOverrides && d.state.commentOverrides[i]) ||
            d.copy.commentSuggestions[i % d.copy.commentSuggestions.length];
          d.ctx.fillText(String(sug).slice(0, 40), x + 4, yy + 8);
          yy += 8;
        }
        yy += 10;
      });
      d.ctx.fillStyle = d.C.face;
      d.ctx.fillRect(x, y + h - 28, w, 28);
      d.bevelRaised(x + 4, y + h - 22, 70, 14, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText("ACCEPT //", x + 10, y + h - 13);
      d.state._cmtBtn = { x: x + 4, y: y + h - 22, w: 70, h: 14 };
      if (d.state.pendingFinish?.type === "comment") {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (d.state.stub && ["rename", "lint", "merge", "logspam"].includes(d.state.phase)) {
      d.drawIdeStub(x, y, w, h);
    } else {
      d.ctx.fillStyle = "#c8c4b0";
      d.ctx.fillText("// open a ticket from Tickets", x + 6, y + 14);
      d.state._submitBtn = null;
    }
  }

  d.drawIdeStub = function drawIdeStub(x, y, w, h) {
    const st = d.state.stub;
    d.state._stubHits = [];
    d.ctx.fillStyle = d.C.face;
    d.ctx.fillRect(x, y + h - 28, w, 28);
    let yy = y + 8;
    d.ctx.font = "7px 'Courier New', monospace";
    if (st.kind === "rename") {
      st.items.forEach((it, i) => {
        const label = `${it.id} -> ${it.to}`;
        d.ctx.fillStyle = it.to === "data2" || it.to === "data2_final_FINAL" ? d.C.sick : "#c8c4b0";
        d.ctx.fillText(label.slice(0, 42), x + 4, yy);
        d.state._stubHits.push({ kind: "rename", i, hit: { x, y: yy - 7, w, h: 10 } });
        yy += 11;
      });
      const n = st.items.filter((it) => it.to === "data2" || it.to === (st.bulk || "data2")).length;
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(`Rename >=${st.need} to data2 (${n}/${st.need})`, x + 4, y + h - 12);
      if (n >= st.need) {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", x + w - 58, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "lint") {
      st.warns.forEach((w, i) => {
        if (w.gone) return;
        d.ctx.fillStyle = "#c8c4b0";
        d.ctx.fillText(`! ${w.w}`.slice(0, Math.max(8, Math.floor((w - 8) / 5))), x + 4, yy);
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
          d.bevelRaised(bx, yy - 8, bw, 10, d.C.face);
          d.ctx.fillStyle = lab === "Fix" ? d.C.blood : d.C.text;
          d.ctx.font = "6px Tahoma, sans-serif";
          d.ctx.fillText(lab.slice(0, 7), bx + 2, yy - 1);
          d.state._stubHits.push({ kind: "lint", i, action: lab, hit: { x: bx, y: yy - 8, w: bw, h: 10 } });
          bx += bw + 4;
        }
        yy += 12;
      });
      const left = st.warns.filter((w) => !w.gone).length;
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(left ? `${left} warnings` : "0 warnings - green", x + 4, y + h - 12);
      if (left === 0) {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT", x + w - 62, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "merge") {
      st.hunks.forEach((hk, i) => {
        d.ctx.fillStyle = hk.res ? d.C.sick : "#c8c4b0";
        d.ctx.fillText(`${hk.res ? "Y" : "<>"} ${hk.label}`.slice(0, 36), x + 4, yy);
        if (!hk.res) {
          let bx = x + 4;
          yy += 10;
          for (const lab of ["Ours", "Theirs", "Both"]) {
            d.bevelRaised(bx, yy - 8, 40, 10, d.C.face);
            d.ctx.fillStyle = d.C.text;
            d.ctx.font = "6px Tahoma, sans-serif";
            d.ctx.fillText(lab, bx + 6, yy - 1);
            d.state._stubHits.push({ kind: "merge", i, action: lab.toLowerCase(), hit: { x: bx, y: yy - 8, w: 40, h: 10 } });
            bx += 46;
          }
        }
        yy += 12;
      });
      const left = st.hunks.filter((hk) => !hk.res).length;
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(left ? "Resolve hunks" : "No conflict markers", x + 4, y + h - 12);
      if (left === 0) {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", x + w - 58, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "logspam") {
      st.lines.forEach((ln, i) => {
        d.ctx.fillStyle = ln.log ? d.C.sick : "#c8c4b0";
        d.ctx.fillText(String(ln.code).slice(0, 28), x + 4, yy);
        if (ln.log) {
          d.ctx.fillStyle = ln.log.includes("debugger") ? d.C.blood : "#7aaa9a";
          d.ctx.fillText(String(ln.log).slice(0, 28), x + 4, yy + 8);
          yy += 8;
        }
        d.state._stubHits.push({ kind: "logspam", i, hit: { x, y: yy - 7, w, h: 10 } });
        yy += 11;
      });
      const n = st.lines.filter((l) => l.log && !String(l.log).includes("debugger")).length;
      const hasDbg = st.lines.some((l) => String(l.log || "").includes("debugger"));
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(`Logs ${n}/${st.need}${hasDbg ? " - remove debugger" : ""}`, x + 4, y + h - 12);
      if (n >= st.need && !hasDbg) {
        d.bevelRaised(x + w - 74, y + h - 22, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", x + w - 58, y + h - 13);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 22, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    }
  }

  d.handleEstimatePick = function handleEstimatePick(v) {
    const st = d.state.stub;
    if (!st || st.kind !== "estimate") return;
    if (v === "?") {
      d.hitSanity(4);
      d.toast("? is not a number. Forced retry.");
      return;
    }
    const num = Number(v);
    st.picks++;
    if (st.picks === 1) {
      st.first = num;
      if (d.state.modal) d.state.modal.body = `Kyle-bot rejected ${v}. Pick again (>= first).`;
      d.toast(st.reject || "Kyle-bot: too optimistic.");
      return;
    }
    if (num < (st.first || 0)) {
      d.hitSanity(2);
      d.toast("Scope creep theater: go >= first d.pick.");
      return;
    }
    d.state.modal = null;
    d.requestFinish({ toastMsg: st.toast || `Committed to the vibe of ${v}.`, sanHit: 2 });
  }

  d.handleSeveritySubmit = function handleSeveritySubmit() {
    const st = d.state.stub;
    if (!st || st.kind !== "severity") return;
    if (!st.sev || !st.comp || !st.impact) {
      d.toast("Fill Severity, Component, Impact.");
      return;
    }
    // Only block while CURRENT severity is still Sev0 (Jimbo may have set it).
    // Picking Sev1+ clears sev0 - do not force Sev0 back or the ticket softlocks.
    if (st.sev === "Sev0") {
      d.hitSanity(4);
      st.sev0 = true;
      if (d.state.modal) d.state.modal.body = "Sev0 paged Sync. Pick Sev1+ to finish.";
      d.toast("Company paged. Downgrade required - d.pick a lower severity.");
      return;
    }
    let msg = st.toast || "Severity filed. Screenshot still impossible.";
    if (st.sev === "It's Fine") {
      st.sev = "Sev3";
      msg = st.policyToast || "Corrected by policy.";
      d.toast(msg);
    }
    d.state.modal = null;
    d.requestFinish({ toastMsg: msg, sanHit: 3 });
  }

  d.trySemi = function trySemi(i) {
    d.ensureSemi();
    const ln = d.copy.semiLines[i];
    d.audio.keyclack();
    d.hooks.onType?.();
    d.bumpActivity();
    if (!ln.need) {
      d.hitSanity(8);
      const err = d.copy.dialogs?.errors?.[0];
      d.toast((err && err.body) || "No semicolon needed");
      d.audio.playSfx("error");
      return;
    }
    if (d.state.semiPlaced[i]) return;
    d.state.semiPlaced[i] = true;
    d.state.sprint += 1;
    const left = d.copy.semiLines.filter((l, j) => l.need && !d.state.semiPlaced[j]).length;
    if (left <= 0) {
      const pts = d.state.activeTicket?.pts || 3;
      if (d.state.jimboUsedThisTicket) d.finishTicket("semi", pts);
      else {
        d.state.pendingFinish = { type: "semi", pts };
        d.toast("Work done - Ask Jimbo to submit");
      }
    }
  }

  d.acceptComment = function acceptComment() {
    d.ensureComment();
    d.audio.keyclack();
    d.hooks.onType?.();
    d.bumpActivity();
    const i = d.state.commentIdx;
    if (d.state.commentDone[i]) return;
    d.state.commentDone[i] = true;
    d.state.sprint += 1;
    d.hitSanity(2);
    d.state.commentIdx++;
    while (d.state.commentIdx < d.copy.commentLines.length && d.state.commentDone[d.state.commentIdx]) {
      d.state.commentIdx++;
    }
    if (d.state.commentDone.every(Boolean)) {
      const pts = d.state.activeTicket?.pts || 5;
      if (d.state.jimboUsedThisTicket) d.finishTicket("comment", pts);
      else {
        d.state.pendingFinish = { type: "comment", pts };
        d.toast("Work done - Ask Jimbo to submit");
      }
    }
  }

}
