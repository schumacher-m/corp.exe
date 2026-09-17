/** apps/OutlookApp.js -- install onto desktop bag `d`. */
export function installOutlookApp(d) {
  d.mailBucket = function mailBucket(m) {
    if (m && (m.bucket === "focused" || m.bucket === "other")) return m.bucket;
    if (!m) return "focused";
    if (m.doom || m.presence || m.force) return "focused";
    const san = Number(m.sanity != null ? m.sanity : m.sanityHit) || 0;
    if (san >= 5) return "focused";
    const blob = String(m.from || "") + " " + String(m.subject || "") + " " + String(m.id || "");
    if (/HR|audit|incident|Compliance|PresenceBot|Security|Manager|Facilities|Payroll/i.test(blob)) {
      return "focused";
    }
    if (/newsletter|digest|AllHands|FYI|\[External\]|filler|CorpHub|marketing/i.test(blob)) {
      return "other";
    }
    return "other";
  }

  d.unreadCount = function unreadCount() {
    const n = d.state.inbox.filter((m) => !m.read).length;
    return Math.max(d.emailCopy.unreadFloor || 1, n || 1);
  }

  d.mailSnippet = function mailSnippet(m) {
    const body = Array.isArray(m.body) ? m.body.join(" ") : String(m.body || "");
    return body.replace(/\s+/g, " ").trim().slice(0, 42);
  }

  d.inboxForTab = function inboxForTab() {
    const tab = d.state.outlookTab === "other" ? "other" : "focused";
    return d.state.inbox.filter((m) => d.mailBucket(m) === tab);
  }

  d.setOutlookTab = function setOutlookTab(tab) {
    if (tab !== "focused" && tab !== "other") return;
    if (d.state.outlookTab === tab) return;
    d.state.outlookTab = tab;
    d.state.outlookCompose = false;
    if (d.state.openMailId) {
      const mail = d.state.inbox.find((m) => m.id === d.state.openMailId);
      if (!mail || d.mailBucket(mail) !== tab) {
        d.state.openMailId = null;
        d.state.mailReadFully = false;
      }
    }
    try {
      d.audio.playSfx("outlookWhoosh", { volume: 0.3 });
    } catch (_) {}
  }

  d.drawInbox = function drawInbox(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.outlookFace);
    d.ctx.font = "7px Tahoma, sans-serif";
    if (d.state.phase === "unsub" && d.state.stub?.kind === "unsub") {
      d.state._mailHits = null;
      d.state._mailCloseBtn = null;
      d.state._outlookHits = null;
      d.state.openMailId = null;
      d.state.outlookCompose = false;
      d.drawUnsubStub(x, y, w, h);
      return;
    }

    d.state._outlookHits = [];
    d.state._mailHits = [];
    d.state._mailCloseBtn = null;

    const ribH = 16;
    d.ctx.fillStyle = d.C.outlookAccent;
    d.ctx.fillRect(x, y, w, 3);
    d.ctx.fillStyle = d.C.face;
    d.ctx.fillRect(x, y + 3, w, ribH - 3);
    d.ctx.fillStyle = d.C.outlook;
    d.ctx.fillRect(x, y + ribH - 1, w, 1);

    const ribY = y + 4;
    const ribBtns = [
      { id: "new", label: "New", x: x + 4, w: 34 },
      { id: "delete", label: "Delete", x: x + 40, w: 42 },
      { id: "archive", label: "Archive", x: x + 84, w: 48 },
      { id: "tip", label: "Focused tip", x: x + 134, w: 62 },
    ];
    for (const b of ribBtns) {
      d.bevelRaised(b.x, ribY, b.w, 11, d.C.face);
      if (b.id === "new" && d.imgReady(d.imgs.olNew)) {
        d.ctx.drawImage(d.imgs.olNew, b.x + 1, ribY + 1, 9, 9);
        d.ctx.fillStyle = d.C.text;
        d.ctx.font = "bold 6px Tahoma, sans-serif";
        d.ctx.fillText(b.label, b.x + 11, ribY + 8);
      } else {
        d.ctx.fillStyle = d.C.text;
        d.ctx.font = "bold 6px Tahoma, sans-serif";
        d.ctx.fillText(b.label, b.x + 4, ribY + 8);
      }
      d.state._outlookHits.push({ kind: "ribbon", id: b.id, hit: { x: b.x, y: ribY, w: b.w, h: 11 } });
    }

    const bodyY = y + ribH + 1;
    const bodyH = h - ribH - 1;
    const railW = 58;
    const listW = Math.max(86, Math.floor((w - railW) * 0.42));
    const readX = x + railW + listW;
    const readW = w - railW - listW;

    d.ctx.fillStyle = d.C.outlookRail;
    d.ctx.fillRect(x, bodyY, railW, bodyH);
    d.ctx.fillStyle = d.C.outlookDk;
    d.ctx.fillRect(x + railW - 1, bodyY, 1, bodyH);

    const railItems = [
      { id: "focused", label: d.outlookRail.focused || "Focused", y: bodyY + 4, glyph: d.imgs.olFocused },
      { id: "other", label: d.outlookRail.other || "Other", y: bodyY + 36, glyph: d.imgs.olOther },
      { id: "folders", label: d.outlookRail.folders || "Folders", y: bodyY + 68, glyph: null },
    ];
    for (const it of railItems) {
      const sel = it.id === d.state.outlookTab;
      if (sel) {
        d.ctx.fillStyle = d.C.outlookSel;
        d.ctx.fillRect(x + 1, it.y - 2, railW - 3, 28);
        d.ctx.fillStyle = d.C.outlook;
        d.ctx.fillRect(x + 1, it.y - 2, 3, 28);
      }
      if (it.glyph && d.imgReady(it.glyph)) {
        d.ctx.drawImage(it.glyph, x + 18, it.y, 16, 16);
      } else if (it.id === "folders") {
        d.ctx.fillStyle = d.C.shadow;
        d.ctx.fillRect(x + 20, it.y + 4, 16, 14);
        d.ctx.fillStyle = d.C.face;
        d.ctx.fillRect(x + 22, it.y + 6, 12, 3);
        d.ctx.fillRect(x + 22, it.y + 11, 12, 3);
      }
      d.ctx.fillStyle = sel ? d.C.outlookDk : d.C.text;
      d.ctx.font = "bold 6px Tahoma, sans-serif";
      d.ctx.fillText(String(it.label).slice(0, 8), x + 6, it.y + 24);
      d.state._outlookHits.push({ kind: "rail", id: it.id, hit: { x: x + 1, y: it.y - 2, w: railW - 3, h: 28 } });
    }

    if (d.state.outlookCompose) {
      const cx0 = x + railW;
      const cw0 = w - railW;
      d.bevelSunken(cx0, bodyY, cw0, bodyH, d.C.white);
      d.ctx.fillStyle = d.C.outlook;
      d.ctx.fillRect(cx0, bodyY, cw0, 12);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 7px Tahoma, sans-serif";
      d.ctx.fillText(String(d.outlookCopy.composeTitle || "Untitled Message").slice(0, 28), cx0 + 4, bodyY + 9);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText((d.outlookCopy.toLabel || "To") + ": kyle@corp.internal", cx0 + 4, bodyY + 24);
      d.ctx.fillText((d.outlookCopy.subjectLabel || "Subject") + ": Re: alignment (draft)", cx0 + 4, bodyY + 34);
      d.ctx.fillStyle = d.C.shadow;
      let dy = bodyY + 48;
      for (const ln of d.wrap("Per my last anxiety -- looping Jimbo for tone.", 34).slice(0, 6)) {
        d.ctx.fillText(ln, cx0 + 4, dy);
        dy += 9;
      }
      const by = bodyY + bodyH - 18;
      d.bevelRaised(cx0 + 4, by, 48, 14, d.C.outlookHi);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillText(d.outlookCopy.sendLabel || "Send", cx0 + 14, by + 10);
      d.state._outlookHits.push({ kind: "compose", id: "send", hit: { x: cx0 + 4, y: by, w: 48, h: 14 } });
      d.bevelRaised(cx0 + 56, by, 54, 14, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(d.outlookCopy.discardLabel || "Discard", cx0 + 64, by + 10);
      d.state._outlookHits.push({ kind: "compose", id: "discard", hit: { x: cx0 + 56, y: by, w: 54, h: 14 } });
      d.state._mailHits = null;
      d.state._mailCloseBtn = null;
      return;
    }

    const lx = x + railW;
    d.bevelSunken(lx, bodyY, listW, bodyH, d.C.white);
    const list = d.inboxForTab();
    let yy = bodyY + 2;
    if (!list.length) {
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.font = "6px Tahoma, sans-serif";
      const empty =
        d.state.outlookTab === "other"
          ? d.outlookCopy.emptyOther || "Other is empty."
          : d.outlookCopy.emptyFocused || "You're all caught up. That's worse.";
      let ey = bodyY + 14;
      for (const ln of d.wrap(empty, Math.max(12, Math.floor(listW / 5))).slice(0, 5)) {
        d.ctx.fillText(ln, lx + 4, ey);
        ey += 9;
      }
    } else {
      const rowH = 22;
      for (const m of list) {
        if (yy + rowH > bodyY + bodyH) break;
        const sel = d.state.openMailId === m.id;
        if (sel) {
          d.ctx.fillStyle = d.C.outlookSel;
          d.ctx.fillRect(lx + 1, yy, listW - 2, rowH);
        }
        if (!m.read) {
          d.ctx.fillStyle = d.C.outlook;
          d.ctx.fillRect(lx + 3, yy + 4, 6, 6);
        } else {
          d.ctx.strokeStyle = d.C.shadow;
          d.ctx.strokeRect(lx + 3, yy + 4, 6, 6);
        }
        d.ctx.fillStyle = sel ? d.C.outlookDk : m.read ? d.C.shadow : d.C.text;
        d.ctx.font = m.read ? "6px Tahoma, sans-serif" : "bold 6px Tahoma, sans-serif";
        const from = String(m.from || "?").split("<")[0].trim().slice(0, 14);
        d.ctx.fillText(from, lx + 12, yy + 6);
        d.ctx.font = "6px Tahoma, sans-serif";
        d.ctx.fillStyle = sel ? d.C.text : d.C.dark;
        d.ctx.fillText(String(m.subject || "").slice(0, 18), lx + 12, yy + 13);
        d.ctx.fillStyle = d.C.shadow;
        d.ctx.fillText(d.mailSnippet(m).slice(0, 18), lx + 12, yy + 20);
        d.state._mailHits.push({ id: m.id, hit: { x: lx + 1, y: yy, w: listW - 2, h: rowH } });
        yy += rowH;
      }
    }

    d.bevelSunken(readX, bodyY, readW, bodyH, d.C.white);
    const mail = d.state.openMailId ? d.state.inbox.find((m) => m.id === d.state.openMailId) : null;
    if (mail) {
      d.ctx.fillStyle = d.C.outlookDk;
      d.ctx.font = "bold 6px Tahoma, sans-serif";
      d.ctx.fillText(String(mail.from || "?").slice(0, 28), readX + 3, bodyY + 9);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 7px Tahoma, sans-serif";
      let ry = bodyY + 20;
      for (const ln of d.wrap(String(mail.subject || ""), Math.max(14, Math.floor(readW / 5))).slice(0, 2)) {
        d.ctx.fillText(ln, readX + 3, ry);
        ry += 9;
      }
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.fillRect(readX + 2, ry, readW - 4, 1);
      ry += 8;
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "6px Tahoma, sans-serif";
      const body = Array.isArray(mail.body) ? mail.body.join(" ") : String(mail.body || "");
      for (const ln of d.wrap(body, Math.max(16, Math.floor(readW / 4.5))).slice(0, 9)) {
        d.ctx.fillText(ln, readX + 3, ry);
        ry += 8;
        if (ry > bodyY + bodyH - 20) break;
      }
      d.bevelRaised(readX + 3, bodyY + bodyH - 16, 52, 12, d.C.face);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "bold 7px Tahoma, sans-serif";
      d.ctx.fillText("Close", readX + 14, bodyY + bodyH - 8);
      d.state._mailCloseBtn = { x: readX + 3, y: bodyY + bodyH - 16, w: 52, h: 12 };
    } else {
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.font = "6px Tahoma, sans-serif";
      let ry = bodyY + 16;
      for (const ln of d.wrap(d.outlookCopy.readingEmpty || "Select a message.", Math.max(14, Math.floor(readW / 5))).slice(0, 6)) {
        d.ctx.fillText(ln, readX + 4, ry);
        ry += 9;
      }
    }
  }

  d.drawUnsubStub = function drawUnsubStub(x, y, w, h) {
    const st = d.state.stub;
    d.state._stubHits = [];
    let yy = y + 4;
    const doneN = st.mails.filter((m) => m.done).length;
    if (st.step === "list" || !st.open) {
      d.ctx.fillStyle = d.C.shadow;
      d.ctx.fillText(`Unsub ${doneN}/${st.need}`, x + 4, yy + 6);
      yy += 14;
      for (const m of st.mails) {
        d.ctx.fillStyle = m.done ? d.C.shadow : d.C.text;
        d.ctx.fillText(`${m.done ? "Y" : "*"} ${m.from}: ${m.subject}`.slice(0, 36), x + 4, yy + 7);
        if (!m.done) d.state._stubHits.push({ kind: "unsub", action: "open", id: m.id, hit: { x: x + 2, y: yy, w: w - 4, h: 12 } });
        yy += 12;
        if (yy > y + h - 8) break;
      }
      if (doneN >= st.need) {
        d.bevelRaised(x + w - 74, y + h - 20, 68, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT", x + w - 62, y + h - 11);
        d.state._submitBtn = { x: x + w - 74, y: y + h - 20, w: 68, h: 14 };
      } else d.state._submitBtn = null;
      return;
    }
    const m = st.mails.find((x) => x.id === st.open);
    d.ctx.fillStyle = d.C.title;
    d.ctx.fillText(`From: ${m?.from || "?"}`, x + 4, yy + 8);
    yy += 14;
    d.ctx.fillStyle = d.C.text;
    d.ctx.fillText(String(m?.subject || "").slice(0, 36), x + 4, yy);
    yy += 16;
    // Back always available so the flow can't softlock
    d.bevelRaised(x + w - 44, y + 2, 40, 12, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText("Back", x + w - 34, y + 10);
    d.state._stubHits.push({ kind: "unsub", action: "back", hit: { x: x + w - 44, y: y + 2, w: 40, h: 12 } });

    if (st.step === "confirm") {
      d.ctx.fillText("Unsubscribe? Preferences -> nowhere.", x + 4, yy);
      const by = y + h - 22;
      const bw1 = Math.min(88, Math.floor((w - 12) / 2));
      const bw2 = Math.min(96, w - 12 - bw1 - 6);
      d.bevelRaised(x + 4, by, bw1, 14, d.C.face);
      d.ctx.font = "bold 8px Tahoma, sans-serif";
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText("Unsubscribe", x + 8, by + 10);
      d.state._stubHits.push({ kind: "unsub", action: "confirm", hit: { x: x + 4, y: by, w: bw1, h: 14 } });
      d.bevelRaised(x + 4 + bw1 + 6, by, bw2, 14, d.C.face);
      d.ctx.fillText("CorpHub 404", x + 8 + bw1 + 6, by + 10);
      d.state._stubHits.push({ kind: "unsub", action: "trap", hit: { x: x + 4 + bw1 + 6, y: by, w: bw2, h: 14 } });
    } else if (st.step === "helpful") {
      d.ctx.fillText("Was this helpful? (Required)", x + 4, yy);
      const labs = ["Yes", "No", "Synergy"];
      const by = y + h - 22;
      const gap = 4;
      const bw = Math.max(36, Math.floor((w - 8 - gap * (labs.length - 1)) / labs.length));
      let bx = x + 4;
      for (const lab of labs) {
        const tw = Math.min(bw, x + w - 4 - bx);
        d.bevelRaised(bx, by, tw, 14, d.C.face);
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillStyle = d.C.text;
        d.ctx.fillText(lab, bx + Math.max(4, (tw - lab.length * 5) / 2), by + 10);
        d.state._stubHits.push({ kind: "unsub", action: "helpful", hit: { x: bx, y: by, w: tw, h: 14 } });
        bx += tw + gap;
      }
    }
    d.state._submitBtn = null;
  }

  d.openInbox = function openInbox(forceMail) {
    d.wins.inbox.open = true;
    d.wins.inbox.title = d.outlookCopy.windowTitle || d.emailCopy.inboxTitle || "Mail";
    d.raise("inbox");
    d.state.outlookCompose = false;
    if (forceMail) {
      if (!forceMail.bucket) forceMail.bucket = d.mailBucket(forceMail);
      d.state.outlookTab = forceMail.bucket === "other" ? "other" : "focused";
      d.state.openMailId = forceMail.id;
      d.state.mailReadFully = false;
    } else if (!d.state.outlookTab) {
      d.state.outlookTab = "focused";
    }
  }

  d.deliverDoomMail = function deliverDoomMail(mail) {
    if (!mail) return;
    d.audio.playSfx("newMail", { volume: 0.55 });
    d.state.unread = d.unreadCount();
    // bump unread tray conceptually - never clear
    d.state.unread = Math.max(d.state.unread, d.emailCopy.unreadFloor || 1) + 1;
    d.openInbox(mail);
    d.wins.inbox.open = true;
    d.raise("inbox");
    d.toast(`New mail: ${mail.subject}`.slice(0, 36));
  }

  d.queueOrDeliver = function queueOrDeliver(mail) {
    if (d.interruptShielded() || d.state.modal || d.state.presenceForced) {
      d.state.emailQueue.push(mail);
      if (d.state.emailQueue.length > 8) d.state.emailQueue.length = 8;
      d.state.unread = Math.max(1, d.state.unread + 1);
      d.audio.playSfx("newMail", { volume: 0.35 });
      d.toast(
        d.emailCopy.mailWaitingToast ||
          (d.copy.emails && d.copy.emails.mailWaitingToast) ||
          "Mail waiting..."
      );
    } else {
      d.deliverDoomMail(mail);
    }
  }

  d.flushEmailQueue = function flushEmailQueue() {
    if (!d.state.emailQueue.length) return;
    if (d.interruptShielded() || d.state.modal || d.state.presenceForced) return;
    const mail = d.state.emailQueue.shift();
    d.deliverDoomMail(mail);
  }

  d.closeOpenMail = function closeOpenMail(readFully) {
    const mail = d.state.inbox.find((m) => m.id === d.state.openMailId);
    if (mail) {
      const already = !!mail.read;
      mail.opened = true;
      if (!already) {
        if (readFully || d.state.mailReadFully) {
          mail.read = true;
          d.hitSanity(mail.sanity || 5);
        } else {
          // close without reading - smaller d.hit, Jimbo marks read
          mail.read = true;
          d.hitSanity(Math.max(2, Math.floor((mail.sanity || 5) / 2)));
          d.toast(d.jimboCopy.markedRead || "Marked as read by Jimbo");
        }
      } else {
        mail.read = true;
      }
      // CORP-DAY-01: Focused / doom mail close counts (read or Jimbo-marked-read)
      if (mail.doom || d.mailBucket(mail) === "focused") {
        if (d.bumpObligation) d.bumpObligation("focusedMail");
      }
    }
    d.state.openMailId = null;
    d.state.mailReadFully = false;
    d.state.unread = Math.max(d.emailCopy.unreadFloor || 1, d.unreadCount());
    // never fully clear - bump ghost unread
    if (d.state.unread <= (d.emailCopy.unreadFloor || 1)) {
      d.state.unread = (d.emailCopy.unreadFloor || 1) + 1;
    }
    d.audio.playSfx("click");
  }

}
