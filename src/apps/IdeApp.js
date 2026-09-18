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
    // Per-ticket working copy so Jimbo guide cannot permanently mutate shared bake
    if (!d.state.semiLines || !d.state.semiLines.length) {
      const src = Array.isArray(d.copy?.semiLines) ? d.copy.semiLines : [];
      d.state.semiLines = src.map((l) => ({
        code: String(l && l.code != null ? l.code : ""),
        need: !!(l && l.need),
      }));
    }
    if (!d.state.semiPlaced || d.state.semiPlaced.length !== d.state.semiLines.length) {
      d.state.semiPlaced = d.state.semiLines.map(() => false);
    }
  }

  d.getSemiLines = function getSemiLines() {
    d.ensureSemi();
    return d.state.semiLines || [];
  }

  d.ensureComment = function ensureComment() {
    if (!d.state.commentDone) {
      d.state.commentDone = d.copy.commentLines.map(() => false);
      d.state.commentIdx = 0;
    }
  }


  d.dropDbCopy = function dropDbCopy() {
    return d.copy.dropDb || {};
  }

  d.normalizeSql = function normalizeSql(s) {
    const raw = String(s ?? "").trim().replace(/\s+/g, " ");
    if (!raw.endsWith(";")) return "";
    const body = raw.slice(0, -1).trim().replace(/\s+/g, " ");
    const m = /^DROP\s+DATABASE\s+([A-Za-z_][\w]*)$/i.exec(body);
    if (!m) return "";
    if (String(m[1]).toLowerCase() !== "corp") return "";
    return "DROP DATABASE corp;";
  }

  d.appendSqlChip = function appendSqlChip(chip) {
    const c = String(chip ?? "");
    let buf = d.state.sqlBuffer || "";
    if (c === ";") {
      buf = buf + ";";
    } else if (!buf) {
      buf = c;
    } else {
      buf = buf + " " + c;
    }
    if (buf.length > 80) buf = buf.slice(0, 80);
    d.state.sqlBuffer = buf;
    d.audio.playSfx("click");
    d.state._uiDirty = true;
  }

  d.runSql = function runSql() {
    if (d.state._runningSql) return;
    d.state._runningSql = true;
    try {
      if (d.state.phase !== "dropdb") return;
      const db = d.dropDbCopy();
      const norm = d.normalizeSql(d.state.sqlBuffer || "");
      if (norm === "DROP DATABASE corp;") {
        d.state.sqlResult = db.successResult || "DROP DATABASE -- Query OK -- 0 relations";
        const toastMsg = db.successToast || "Prod cleaned. Permanently. Ticket closes.";
        d.audio.playSfx("click");
        d.state._uiDirty = true;
        const pts = d.state.activeTicket?.pts || 2;
        // Catharsis: no Jimbo gate on success
        d.finishTicket("dropdb", pts, { toastMsg, sanHit: 0 });
      } else {
        const toasts = db.wrongSqlToasts || [];
        d.toast(d.pick(toasts) || "Wrong SQL.");
        d.audio.playSfx("error");
      }
    } finally {
      d.state._runningSql = false;
    }
  }

  d.IDE_P = {
    activity_bg: "#333333",
    sidebar_bg: "#252526",
    tab_bg: "#2d2d2d",
    tab_active: "#1e1e1e",
    editor_bg: "#1e1e1e",
    gutter: "#858585",
    fg: "#d4d4d4",
    fg_dim: "#808080",
    accent: "#007acc",
    selection: "#264f78",
    keyword: "#569cd6",
    string: "#ce9178",
    comment: "#6a9955",
    sick: "#7aaa9a",
  };

  /** Shared VS Code parody chrome. Returns editor rect (content hitbox region).
   *  Adaptive: reserve ~160px editor for controls; collapse sidebar then thin activity.
   *  opts.reserveFoot: footer band above status (excluded from ed.h). */
  d.drawIdeChrome = function drawIdeChrome(x, y, w, h, opts) {
    const P = d.IDE_P;
    const o = opts || {};
    const MIN_ED_W = 160; // ACCEPT(70)+SUBMIT(68)+pad ≈154
    const preferAct = 26;
    const preferSide = 78;
    const tabH = 16;
    const statusH = 18;
    const gutterW = 14;
    const reserveFoot = Math.max(0, o.reserveFoot | 0);

    // Prefer full chrome; shrink/collapse sidebar first, then thin activity.
    let actW = preferAct;
    let sideW = preferSide;
    const room = Math.max(0, w - MIN_ED_W);
    if (actW + sideW > room) {
      sideW = Math.max(0, room - actW);
      if (sideW > 0 && sideW < 40) sideW = 0; // too thin to read as Explorer
    }
    if (actW + sideW > room) {
      actW = Math.max(0, room - sideW);
      if (actW > 0 && actW < 16) actW = 0; // cannot fit glyphs
    }

    d.ctx.fillStyle = P.editor_bg;
    d.ctx.fillRect(x, y, w, h);

    // Activity bar (collapsed → actW 0)
    if (actW > 0) {
      d.ctx.fillStyle = P.activity_bg;
      d.ctx.fillRect(x, y, actW, h - statusH);
      if (actW >= 16) {
        const glyphs = [
          d.imgs?.ideExplorer16,
          d.imgs?.ideSearch16,
          d.imgs?.ideScm16,
          d.imgs?.ideExt16,
        ];
        let gy = y + 6;
        for (let gi = 0; gi < glyphs.length; gi++) {
          const im = glyphs[gi];
          const gx = x + ((actW - 16) >> 1);
          if (!d.drawImgOr(im, gx, gy, 16, 16, null)) {
            d.ctx.fillStyle = gi === 0 ? "#c8c4b0" : P.fg_dim;
            d.ctx.fillRect(gx + 3, gy + 3, 10, 10);
          }
          gy += 22;
        }
      }
    }

    // Side bar + Explorer stub art (collapsed → sideW 0)
    if (sideW > 0) {
      d.ctx.fillStyle = P.sidebar_bg;
      d.ctx.fillRect(x + actW, y, sideW, h - statusH);
      const stub = d.imgs?.ideExplorerStub;
      const stubH = Math.min(64, h - statusH - 4);
      const stubW = Math.min(80, Math.max(0, sideW - 2));
      if (!d.drawImgOr(stub, x + actW + 1, y + 2, stubW, stubH, null)) {
        d.ctx.font = "6px Tahoma, sans-serif";
        d.ctx.fillStyle = P.fg_dim;
        d.ctx.fillText("EXPLORER", x + actW + 4, y + 10);
        d.ctx.fillStyle = P.fg;
        d.ctx.fillText("> src", x + actW + 4, y + 22);
        d.ctx.fillText("  ticket.js", x + actW + 4, y + 32);
        d.ctx.fillText("  query.sql", x + actW + 4, y + 42);
      }
    }

    const edX = x + actW + sideW;
    const edW = Math.max(40, w - actW - sideW);
    const edY = y + tabH;
    // Content height excludes reserved footer so status/tabs never steal button strip
    const edH = Math.max(16, h - tabH - statusH - reserveFoot);

    // Tab bar
    d.ctx.fillStyle = P.tab_bg;
    d.ctx.fillRect(edX, y, edW, tabH);
    const activeTab = o.tab || "ticket.js";
    const inactiveTab = o.inactiveTab || null;
    d.ctx.font = "7px Tahoma, sans-serif";
    const tabLabW = Math.min(72, Math.max(48, activeTab.length * 5 + 12));
    d.ctx.fillStyle = P.tab_active;
    d.ctx.fillRect(edX, y, tabLabW, tabH);
    d.ctx.fillStyle = P.accent;
    d.ctx.fillRect(edX, y + tabH - 2, tabLabW, 2);
    d.ctx.fillStyle = P.fg;
    d.ctx.fillText(String(activeTab).slice(0, 14), edX + 6, y + 11);
    if (inactiveTab) {
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.fillText(String(inactiveTab).slice(0, 12), edX + tabLabW + 8, y + 11);
    }

    // Editor content fill (footer band painted by ideEditorFooter)
    d.ctx.fillStyle = P.editor_bg;
    d.ctx.fillRect(edX, edY, edW, edH);

    // Status bar
    d.ctx.fillStyle = P.accent;
    d.ctx.fillRect(x, y + h - statusH, w, statusH);
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = "#ffffff";
    const ln = o.ln != null ? o.ln : 1;
    const col = o.col != null ? o.col : 1;
    const lang = o.lang || "JavaScript";
    const status = `Ln ${ln}, Col ${col}   ${lang}   UTF-8   corp`;
    d.ctx.fillText(status.slice(0, Math.max(8, Math.floor(w / 5))), x + 6, y + h - 6);

    const ed = {
      x: edX,
      y: edY,
      w: edW,
      h: edH,
      gutterW,
      actW,
      sideW,
      tabH,
      statusH,
      reserveFoot,
    };
    d.state._ideEditor = ed;
    return ed;
  };

  /** Footer strip in reserved band above status (hitboxes stay in editor column). */
  d.ideEditorFooter = function ideEditorFooter(ed, footH) {
    const fh = footH == null ? ed.reserveFoot || 24 : footH;
    // When chrome reserved a band, footer sits below content; else steal from ed.h
    const fy = ed.reserveFoot ? ed.y + ed.h : ed.y + ed.h - fh;
    const contentH = ed.reserveFoot ? ed.h : Math.max(0, ed.h - fh);
    d.ctx.fillStyle = "#252526";
    d.ctx.fillRect(ed.x, fy, ed.w, fh);
    return { x: ed.x, y: fy, w: ed.w, h: fh, contentH };
  };

  d.drawIde = function drawIde(x, y, w, h) {
    if (d.state.phase === "dropdb") {
      d.drawIdeDropDb(x, y, w, h);
      return;
    }
    const P = d.IDE_P;
    let tab = "ticket.js";
    let inactive = "query.sql";
    let ln = 1;
    let lang = "JavaScript";
    if (d.state.phase === "comment") {
      ln = (d.state.commentIdx | 0) + 1;
    } else if (d.state.phase === "semi") {
      const placed = d.state.semiPlaced || [];
      ln = Math.max(1, placed.findIndex((p) => !p) + 1) || 1;
    } else if (d.state.stub && ["rename", "lint", "merge", "logspam"].includes(d.state.phase)) {
      tab = "ticket.js";
    } else {
      inactive = null;
    }

    let reserveFoot = 0;
    if (d.state.phase === "comment") reserveFoot = 28;
    else if (d.state.phase === "semi") reserveFoot = 24;
    else if (d.state.stub && ["rename", "lint", "merge", "logspam"].includes(d.state.phase))
      reserveFoot = 24;

    const ed = d.drawIdeChrome(x, y, w, h, {
      tab,
      inactiveTab: inactive,
      ln,
      col: 1,
      lang,
      reserveFoot,
    });

    if (d.state.phase === "semi") {
      d.ensureSemi();
      const foot = d.ideEditorFooter(ed, reserveFoot);
      const gw = ed.gutterW;
      d.ctx.font = "7px 'Courier New', monospace";
      let yy = ed.y + 8;
      const lines = d.getSemiLines();
      const maxLines = Math.min(lines.length, 24);
      if (!d.state._semiHits) d.state._semiHits = [];
      d.state._semiHits.length = 0;
      for (let i = 0; i < maxLines; i++) {
        const lnRow = lines[i];
        if (!lnRow) continue;
        const placed = !!d.state.semiPlaced[i];
        let semi = "";
        if (lnRow.need && placed) {
          if (d.state.semiStyle?.mode === "double" && i % 2 === 1) semi = ";;";
          else if (d.state.semiStyle?.mode === "strip") semi = "";
          else semi = ";";
        }
        if (d.state.semiStyle?.mode === "strip" && placed && lnRow.need && i % 2 === 0) semi = "";
        if (d.state.semiStyle?.mode === "double" && placed && lnRow.need && i % 2 === 0) semi = ";";
        // Gutter
        d.ctx.fillStyle = P.gutter;
        d.ctx.fillText(String(i + 1).padStart(2, " "), ed.x + 2, yy);
        // Code
        d.ctx.fillStyle = placed && lnRow.need ? P.sick : P.fg;
        const code = String(lnRow.code || "").slice(0, 36) + semi;
        d.ctx.fillText(code, ed.x + gw + 2, yy);
        // Hitboxes mapped to editor rows only (not activity/sidebar)
        let hit = d.state._semiHits[i];
        if (!hit) hit = { x: 0, y: 0, w: 0, h: 0, i: 0 };
        hit.x = ed.x + 2;
        hit.y = yy - 6;
        hit.w = Math.min(ed.w - 4, 200);
        hit.h = 8;
        hit.i = i;
        d.state._semiHits[i] = hit;
        d.state._semiHits.length = i + 1;
        yy += 9;
        if (yy > ed.y + foot.contentH - 2) break;
      }
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px Tahoma, sans-serif";
      const hint = d.state.semiStyle?.note
        ? String(d.state.semiStyle.note).slice(0, 36)
        : "Click lines missing ;  or press ;";
      d.ctx.fillText(hint, foot.x + 4, foot.y + 15);
      if (d.state.pendingFinish?.type === "semi") {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT", foot.x + foot.w - 62, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (d.state.phase === "comment") {
      d.ensureComment();
      const foot = d.ideEditorFooter(ed, reserveFoot);
      const gw = ed.gutterW;
      d.ctx.font = "7px 'Courier New', monospace";
      let yy = ed.y + 8;
      d.copy.commentLines.forEach((code, i) => {
        if (yy > ed.y + foot.contentH - 4) return;
        const done = d.state.commentDone[i];
        d.ctx.fillStyle = P.gutter;
        d.ctx.fillText(String(i + 1), ed.x + 2, yy);
        d.ctx.fillStyle = i === d.state.commentIdx ? "#ffff80" : P.fg;
        d.ctx.fillText(String(code).slice(0, 36), ed.x + gw + 2, yy);
        if (done) {
          d.ctx.fillStyle = P.comment;
          const sug =
            (d.state.commentOverrides && d.state.commentOverrides[i]) ||
            d.copy.commentSuggestions[i % d.copy.commentSuggestions.length];
          d.ctx.fillText(String(sug).slice(0, 34), ed.x + gw + 2, yy + 8);
          yy += 8;
        }
        yy += 10;
      });
      d.bevelRaised(foot.x + 4, foot.y + 5, 70, 14, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText("ACCEPT //", foot.x + 10, foot.y + 14);
      d.state._cmtBtn = { x: foot.x + 4, y: foot.y + 5, w: 70, h: 14 };
      if (d.state.pendingFinish?.type === "comment") {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.fillText("SUBMIT", foot.x + foot.w - 62, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (d.state.stub && ["rename", "lint", "merge", "logspam"].includes(d.state.phase)) {
      d.drawIdeStub(x, y, w, h);
    } else {
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px 'Courier New', monospace";
      d.ctx.fillText("// open a ticket from Tickets", ed.x + ed.gutterW + 4, ed.y + 14);
      d.state._submitBtn = null;
      d.state._cmtBtn = null;
    }
  };


  d.drawIdeDropDb = function drawIdeDropDb(x, y, w, h) {
    const db = d.dropDbCopy();
    d.state._sqlChipHits = [];
    d.state._sqlRunBtn = null;
    d.state._submitBtn = null;
    d.state._cmtBtn = null;

    const P = d.IDE_P;
    const chipH = 16;
    const runH = 16;
    const resultH = 14;
    const chromeH = chipH + runH + resultH + 10; // ~56 chips+Run+result
    const ed = d.drawIdeChrome(x, y, w, h, {
      tab: "query.sql",
      inactiveTab: "ticket.js",
      ln: 1,
      col: Math.max(1, (d.state.sqlBuffer || "").length + 1),
      lang: "SQL",
      reserveFoot: chromeH,
    });

    const foot = d.ideEditorFooter(ed, chromeH);
    const bufH = foot.contentH;

    // SQL buffer on dark editor (caret blink)
    d.ctx.font = "8px 'Courier New', monospace";
    d.ctx.fillStyle = P.gutter;
    d.ctx.fillText("1", ed.x + 2, ed.y + 12);
    d.ctx.fillStyle = P.keyword;
    const buf = d.state.sqlBuffer || "";
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    const shown = buf + (blink ? "|" : " ");
    // Soft highlight: DROP/DATABASE keywords if present
    d.ctx.fillText(shown.slice(0, 38), ed.x + ed.gutterW + 2, ed.y + 12);
    if (shown.length > 38) {
      d.ctx.fillStyle = P.fg;
      d.ctx.fillText(shown.slice(38, 76), ed.x + ed.gutterW + 2, ed.y + 22);
    }

    let yy = foot.y + 2;
    // Chip row — compact VS-dark buttons
    const chips = Array.isArray(db.chips) ? db.chips : ["DROP", "DATABASE", "corp", ";"];
    let bx = foot.x + 4;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    for (let i = 0; i < chips.length; i++) {
      const lab = String(chips[i]);
      const bw = Math.max(28, lab.length * 7 + 10);
      if (bx + bw > foot.x + foot.w - 4) break;
      d.ctx.fillStyle = "#3c3c3c";
      d.ctx.fillRect(bx, yy, bw, chipH);
      d.ctx.strokeStyle = "#5a5a5a";
      d.ctx.strokeRect(bx + 0.5, yy + 0.5, bw - 1, chipH - 1);
      d.ctx.fillStyle = P.fg;
      d.ctx.fillText(lab, bx + 5, yy + 11);
      d.state._sqlChipHits.push({ chip: lab, hit: { x: bx, y: yy, w: bw, h: chipH } });
      bx += bw + 4;
    }
    yy += chipH + 3;

    // VS-style primary Run
    const runLab = db.runLabel || "Run";
    const runW = 48;
    d.ctx.fillStyle = P.accent;
    d.ctx.fillRect(foot.x + 4, yy, runW, runH);
    d.ctx.fillStyle = "#ffffff";
    d.ctx.font = "bold 8px Tahoma, sans-serif";
    d.ctx.fillText(runLab, foot.x + 14, yy + 11);
    d.state._sqlRunBtn = { x: foot.x + 4, y: yy, w: runW, h: runH };
    yy += runH + 2;

    // Result strip
    d.ctx.fillStyle = "#111111";
    d.ctx.fillRect(foot.x, yy, foot.w, resultH);
    if (d.state.sqlResult) {
      d.ctx.fillStyle = P.sick;
      d.ctx.font = "7px 'Courier New', monospace";
      d.ctx.fillText(String(d.state.sqlResult).slice(0, 42), foot.x + 4, yy + 10);
    }
  };

  d.drawIdeStub = function drawIdeStub(x, y, w, h) {
    const st = d.state.stub;
    d.state._stubHits = [];
    const P = d.IDE_P;
    // Chrome already drawn by drawIde; reuse stored editor rect
    let ed = d.state._ideEditor;
    if (!ed || ed.w < 20 || !ed.reserveFoot) {
      ed = d.drawIdeChrome(x, y, w, h, {
        tab: "ticket.js",
        inactiveTab: "query.sql",
        ln: 1,
        col: 1,
        lang: "JavaScript",
        reserveFoot: 24,
      });
    }
    const foot = d.ideEditorFooter(ed, ed.reserveFoot || 24);
    let yy = ed.y + 8;
    d.ctx.font = "7px 'Courier New', monospace";
    if (st.kind === "rename") {
      st.items.forEach((it, i) => {
        if (yy > ed.y + foot.contentH - 2) return;
        const label = `${it.id} -> ${it.to}`;
        d.ctx.fillStyle = it.to === "data2" || it.to === "data2_final_FINAL" ? P.sick : P.fg;
        d.ctx.fillText(label.slice(0, 42), ed.x + 4, yy);
        d.state._stubHits.push({ kind: "rename", i, hit: { x: ed.x, y: yy - 7, w: ed.w, h: 10 } });
        yy += 11;
      });
      const n = st.items.filter((it) => it.to === "data2" || it.to === (st.bulk || "data2")).length;
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(`Rename >=${st.need} to data2 (${n}/${st.need})`, foot.x + 4, foot.y + 15);
      if (n >= st.need) {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", foot.x + foot.w - 58, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "lint") {
      st.warns.forEach((wrow, i) => {
        if (wrow.gone) return;
        if (yy > ed.y + foot.contentH - 20) return;
        d.ctx.fillStyle = P.fg;
        d.ctx.fillText(`! ${wrow.w}`.slice(0, Math.max(8, Math.floor((ed.w - 8) / 5))), ed.x + 4, yy);
        yy += 11;
        const labs = ["Suppress", "Dismiss", "TODO", "Fix"];
        let bx = ed.x + 4;
        const right = ed.x + ed.w - 4;
        for (const lab of labs) {
          const bw = lab === "Fix" ? 28 : 40;
          if (bx + bw > right) {
            bx = ed.x + 4;
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
      const left = st.warns.filter((wr) => !wr.gone).length;
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(left ? `${left} warnings` : "0 warnings - green", foot.x + 4, foot.y + 15);
      if (left === 0) {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT", foot.x + foot.w - 62, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "merge") {
      st.hunks.forEach((hk, i) => {
        if (yy > ed.y + foot.contentH - 20) return;
        d.ctx.fillStyle = hk.res ? P.sick : P.fg;
        d.ctx.fillText(`${hk.res ? "Y" : "<>"} ${hk.label}`.slice(0, 36), ed.x + 4, yy);
        if (!hk.res) {
          let bx = ed.x + 4;
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
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(left ? "Resolve hunks" : "No conflict markers", foot.x + 4, foot.y + 15);
      if (left === 0) {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", foot.x + foot.w - 58, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    } else if (st.kind === "logspam") {
      st.lines.forEach((lnRow, i) => {
        if (yy > ed.y + foot.contentH - 2) return;
        d.ctx.fillStyle = lnRow.log ? P.sick : P.fg;
        d.ctx.fillText(String(lnRow.code).slice(0, 28), ed.x + 4, yy);
        if (lnRow.log) {
          d.ctx.fillStyle = lnRow.log.includes("debugger") ? d.C.blood : P.comment;
          d.ctx.fillText(String(lnRow.log).slice(0, 28), ed.x + 4, yy + 8);
          yy += 8;
        }
        d.state._stubHits.push({ kind: "logspam", i, hit: { x: ed.x, y: yy - 7, w: ed.w, h: 10 } });
        yy += 11;
      });
      const n = st.lines.filter((l) => l.log && !String(l.log).includes("debugger")).length;
      const hasDbg = st.lines.some((l) => String(l.log || "").includes("debugger"));
      d.ctx.fillStyle = P.fg_dim;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(`Logs ${n}/${st.need}${hasDbg ? " - remove debugger" : ""}`, foot.x + 4, foot.y + 15);
      if (n >= st.need && !hasDbg) {
        d.bevelRaised(foot.x + foot.w - 74, foot.y + 5, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SAVE", foot.x + foot.w - 58, foot.y + 14);
        d.state._submitBtn = { x: foot.x + foot.w - 74, y: foot.y + 5, w: 68, h: 14 };
      } else d.state._submitBtn = null;
    }
  };

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
    if (d.state._tryingSemi) return;
    d.state._tryingSemi = true;
    try {
      d.ensureSemi();
      const lines = d.getSemiLines();
      const idx = i | 0;
      const ln = lines[idx];
      if (!ln) return;
      // Already placed: silent no-op (no SFX / hand anim / GPU churn)
      if (d.state.semiPlaced && d.state.semiPlaced[idx]) return;
      d.bumpActivity();
      if (!ln.need) {
        d.audio.keyclack();
        d.hitSanity(8);
        const err = d.copy.dialogs?.errors?.[0];
        d.toast((err && err.body) || "No semicolon needed");
        d.audio.playSfx("error");
        return;
      }
      d.audio.keyclack();
      d.hooks.onType?.();
      d.state.semiPlaced[idx] = true;
      d.state.sprint += 1;
      d.state._uiDirty = true;
      let left = 0;
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].need && !d.state.semiPlaced[j]) left++;
      }
      if (left <= 0) {
        const pts = d.state.activeTicket?.pts || 3;
        if (d.state.jimboUsedThisTicket) d.finishTicket("semi", pts);
        else {
          d.state.pendingFinish = { type: "semi", pts };
          d.toast("Work done - Ask Jimbo to submit");
        }
      }
    } finally {
      d.state._tryingSemi = false;
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
