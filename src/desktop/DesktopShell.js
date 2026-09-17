/** desktop/DesktopShell.js -- install onto desktop bag `d`. */
export function installDesktopShell(d) {
  d.tStr = function tStr(type, key, fallback) {
    const block = d.ticketStrings[type] || {};
    const v = block[key];
    return v == null || v === "" ? fallback : v;
  }

  d.imgReady = function imgReady(im) {
    return !!(im && im.complete && im.naturalWidth);
  }

  d.drawImgOr = function drawImgOr(im, x, y, w, h, fallback) {
    if (d.imgReady(im)) {
      d.ctx.drawImage(im, x, y, w, h);
      return true;
    }
    if (fallback) fallback();
    return false;
  }

  d.toast = function toast(msg, { jimbo } = {}) {
    d.state.toast = msg;
    d.state.toastT = 100;
    d.state.toastJimbo = !!jimbo;
  }

  d.hitSanity = function hitSanity(n) {
    d.state.sanity = Math.max(0, d.state.sanity - n);
    if (d.state.sanity < 25) {
      const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      if (!d.state._sanitySfxAt || now - d.state._sanitySfxAt > 800) {
        d.state._sanitySfxAt = now;
        d.audio.playSfx("sanityLow", { volume: 0.35 });
      }
    }
  }

  d.drawDeskIcons = function drawDeskIcons() {
    d.state._deskIconHits = [];
    for (const ic of d.deskIcons) {
      const bx = ic.x;
      const by = ic.y;
      if (ic.id === "jimbo" && d.imgs.j32.complete && d.imgs.j32.naturalWidth) {
        d.ctx.drawImage(d.imgs.j32, bx + 8, by, 32, 32);
      } else if (ic.id === "inbox") {
        if (d.imgReady(d.imgs.ol32)) {
          d.ctx.drawImage(d.imgs.ol32, bx + 8, by, 32, 32);
        } else if (d.imgReady(d.imgs.ol48)) {
          d.ctx.drawImage(d.imgs.ol48, bx + 4, by, 40, 40);
        } else {
          d.bevelRaised(bx + 8, by + 4, 28, 22, d.C.face);
          d.ctx.fillStyle = d.C.outlook;
          d.ctx.fillRect(bx + 10, by + 8, 24, 14);
          d.ctx.fillStyle = d.C.outlookHi;
          d.ctx.beginPath();
          d.ctx.moveTo(bx + 10, by + 8);
          d.ctx.lineTo(bx + 22, by + 16);
          d.ctx.lineTo(bx + 34, by + 8);
          d.ctx.closePath();
          d.ctx.fill();
        }
        const u = d.unreadCount();
        d.ctx.fillStyle = d.C.blood;
        d.ctx.fillRect(bx + 30, by + 2, 12, 10);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 7px Tahoma, sans-serif";
        d.ctx.fillText(String(Math.min(99, u)), bx + 32, by + 10);
      } else if (ic.id === "timesheet") {
        const im = d.imgs.ts32;
        if (d.imgReady(im)) {
          d.ctx.drawImage(im, bx + 8, by, 32, 32);
        } else {
          d.bevelRaised(bx + 8, by + 2, 28, 30, "#e8e0c8");
          d.ctx.fillStyle = "#2a7a3a";
          d.ctx.fillRect(bx + 10, by + 4, 24, 6);
        }
      } else if (ic.id === "tickets") {
        if (d.imgReady(d.imgs.tr32)) {
          d.ctx.drawImage(d.imgs.tr32, bx + 8, by, 32, 32);
        } else if (d.imgReady(d.imgs.tr48)) {
          d.ctx.drawImage(d.imgs.tr48, bx + 4, by, 40, 40);
        } else {
          // Amber clipboard/board fallback until PNGs load
          d.bevelRaised(bx + 8, by + 2, 28, 30, "#a89030");
          d.ctx.fillStyle = "#f4e8b0";
          d.ctx.fillRect(bx + 12, by + 8, 20, 18);
          d.ctx.fillStyle = "#6a5820";
          d.ctx.fillRect(bx + 14, by + 11, 16, 2);
          d.ctx.fillRect(bx + 14, by + 15, 16, 2);
          d.ctx.fillRect(bx + 14, by + 19, 12, 2);
          d.ctx.fillStyle = "#c8b050";
          d.ctx.fillRect(bx + 18, by + 4, 8, 5);
        }
      } else if (ic.id === "teams") {
        if (d.imgReady(d.imgs.t32)) {
          d.ctx.drawImage(d.imgs.t32, bx + 8, by, 32, 32);
        } else if (d.imgReady(d.imgs.t48)) {
          d.ctx.drawImage(d.imgs.t48, bx + 4, by, 40, 40);
        } else {
          // Unbranded Sync tile: chat bubble + handset cue (no letter T)
          d.bevelRaised(bx + 8, by + 2, 28, 30, d.C.teams);
          d.ctx.fillStyle = d.C.inv;
          d.ctx.fillRect(bx + 12, by + 8, 16, 12);
          d.ctx.beginPath();
          d.ctx.moveTo(bx + 14, by + 20);
          d.ctx.lineTo(bx + 18, by + 20);
          d.ctx.lineTo(bx + 12, by + 26);
          d.ctx.closePath();
          d.ctx.fill();
          d.ctx.fillStyle = d.C.teamsHi;
          d.ctx.fillRect(bx + 26, by + 22, 6, 3);
          d.ctx.fillRect(bx + 28, by + 25, 6, 3);
        }
      } else if (ic.id === "jiggler") {
        if (d.imgReady(d.imgs.jig32)) d.ctx.drawImage(d.imgs.jig32, bx + 8, by, 32, 32);
      }
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillText(ic.label, bx + 4, by + 42);
      // Never let desk hits bleed into the taskbar (stole timesheet.xls → Jiggler)
      const deskBottom = d.H - d.TASK_H;
      if (by >= deskBottom) continue;
      const hitH = Math.min(48, deskBottom - by);
      if (hitH > 8) d.state._deskIconHits.push({ id: ic.id, hit: { x: bx, y: by, w: 48, h: hitH } });
    }
  }

  d.drawTaskbar = function drawTaskbar() {
    const y = d.H - d.TASK_H;
    d.bevelRaised(0, y, d.W, d.TASK_H, d.C.face);
    const pressed = d.state.startOpen;
    if (pressed) d.bevelSunken(3, y + 3, 42, 16, d.C.face);
    else d.bevelRaised(3, y + 3, 42, 16, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 9px Tahoma, sans-serif";
    d.ctx.fillText(d.copy.startMenu?.startLabel || "Start", 8, y + 14);
    d.state._startBtn = { x: 3, y: y + 3, w: 42, h: 16 };

    // Ask Jimbo toolbar
    d.bevelRaised(48, y + 3, 72, 16, d.C.jimbo);
    if (d.imgs.jtb.complete && d.imgs.jtb.naturalWidth) {
      d.ctx.drawImage(d.imgs.jtb, 52, y + 5, 12, 12);
    }
    d.ctx.fillStyle = d.C.inv;
    d.ctx.font = "bold 7px Tahoma, sans-serif";
    d.ctx.fillText("Ask Jimbo", 66, y + 13);
    d.state._askToolbar = { x: 48, y: y + 3, w: 72, h: 16 };

    let tx = 124;
    for (const id of ["tickets", "slack", "ide", "pr", "jimbo", "inbox", "timesheet"]) {
      const win = d.wins[id];
      if (!win.open) continue;
      d.bevelRaised(tx, y + 3, 36, 16, d.C.face);
      d.ctx.font = "7px Tahoma, sans-serif";
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(win.title.slice(0, 5), tx + 3, y + 13);
      win._taskHit = { x: tx, y: y + 3, w: 36, h: 16 };
      tx += 38;
      if (tx > d.W - 100) break;
    }

    // presence badge (Idle chip clickable for status theater)
    const px = d.W - 100;
    d.bevelSunken(px, y + 3, 44, 16, d.C.face);
    d.ctx.fillStyle = d.presenceColor();
    d.ctx.fillRect(px + 3, y + 7, 6, 6);
    if (d.state.jimboJiggler && d.imgs.jig16.complete && d.imgs.jig16.naturalWidth) {
      d.ctx.drawImage(d.imgs.jig16, px + 2, y + 4, 12, 12);
    }
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillText(d.presenceLabel(), px + 12, y + 13);
    d.state._presenceBadge = { x: px, y: y + 3, w: 44, h: 16 };

    const trayX = d.W - 54;
    d.bevelSunken(trayX, y + 3, 50, 16, d.C.face);
    d.ctx.font = "7px Tahoma, sans-serif";
    d.ctx.fillStyle = d.C.text;
    const hh = String(Math.floor(d.state.clockMinutes / 60)).padStart(2, "0");
    const mm = String(d.state.clockMinutes % 60).padStart(2, "0");
    d.ctx.fillText(`${hh}:${mm}`, trayX + 4, y + 13);

    d.drawStatusPopover();
  }

  d.normalizeStartChild = function normalizeStartChild(raw) {
    if (raw == null) return { label: "" };
    if (typeof raw === "string") return { label: raw };
    return raw;
  }

  d.startItemHasFlyout = function startItemHasFlyout(it) {
    return !!(it && Array.isArray(it.submenu) && it.submenu.length);
  }

  d.openStartFlyout = function openStartFlyout(index) {
    const items = d.copy.startMenu?.items || [];
    const it = items[index];
    if (!d.startItemHasFlyout(it)) {
      d.state.startFlyoutIndex = -1;
      return;
    }
    d.state.startFlyoutIndex = index;
  }

  d.drawStartMenuRowGlyph = function drawStartMenuRowGlyph(id, label, x, iy) {
    const lab = label || "";
    let glyph = null;
    if (id === "jimbo" || lab === "Jimbo") glyph = d.imgs.j16;
    else if (id === "jiggler" || /mouse jiggler/i.test(lab)) glyph = d.imgs.jig16;
    else if (id === "tickets" || /tracker/i.test(lab)) glyph = d.imgs.tr16;
    else if (id === "teams" || id === "slack" || /sync/i.test(lab)) glyph = d.imgs.t16;
    else if (id === "inbox" || /mail|inbox/i.test(lab)) glyph = d.imgs.ol16;
    else if (id === "timesheet" || /timesheet/i.test(lab)) glyph = d.imgs.ts16;
    if (glyph && d.imgReady(glyph)) {
      d.ctx.drawImage(glyph, x, iy + 1, 12, 12);
      return 16;
    }
    return 0;
  }

  d.drawStartMenu = function drawStartMenu() {
    if (!d.state.startOpen) {
      d.state.startFlyoutIndex = -1;
      d.state._startItems = null;
      d.state._startFlyoutHits = null;
      d.state._startRootHit = null;
      return;
    }
    const items = d.copy.startMenu?.items || [];
    const rowH = 16;
    const padTop = 4;
    let sepExtra = 0;
    for (const it of items) {
      if (it && it.separatorBefore) sepExtra += 5;
    }
    const menuH = padTop + items.length * rowH + 4 + sepExtra;
    const menuW = 148;
    const x = 2;
    const y = d.H - d.TASK_H - menuH;
    d.state._startRootHit = { x, y, w: menuW, h: menuH };
    d.bevelRaised(x, y, menuW, menuH, d.C.face);
    d.ctx.fillStyle = d.C.title;
    d.ctx.fillRect(x + 2, y + 2, 16, menuH - 4);
    d.state._startItems = [];
    let iy = y + padTop;
    items.forEach((it, i) => {
      if (it && it.separatorBefore) {
        d.bevelSunken(x + 22, iy + 1, menuW - 28, 2, d.C.face);
        iy += 5;
      }
      const lab = it.label || it.id || String(it);
      const open = d.state.startFlyoutIndex === i;
      const hasFly = d.startItemHasFlyout(it);
      if (open) {
        d.ctx.fillStyle = d.C.title;
        d.ctx.fillRect(x + 20, iy, menuW - 22, rowH);
        d.ctx.fillStyle = d.C.inv;
      } else {
        d.ctx.fillStyle = d.C.text;
      }
      d.ctx.font = "8px Tahoma, sans-serif";
      d.ctx.fillText(lab.slice(0, 18), x + 22, iy + 10);
      if (hasFly) {
        d.ctx.fillText(">", x + menuW - 14, iy + 10);
      }
      d.state._startItems.push({
        hit: { x: x + 18, y: iy, w: menuW - 20, h: rowH },
        item: it,
        index: i,
        hasFlyout: hasFly,
      });
      iy += rowH;
    });

    // Cascade flyout
    d.state._startFlyoutHits = null;
    const fi = d.state.startFlyoutIndex;
    if (fi < 0 || fi >= items.length) return;
    const parent = items[fi];
    if (!d.startItemHasFlyout(parent)) return;
    const kids = parent.submenu.map((c) => d.normalizeStartChild(c));
    const flyW = 158;
    const flyH = 4 + kids.length * rowH + 4;
    const parentRow = d.state._startItems.find((r) => r.index === fi);
    const flyX = x + menuW - 2;
    let flyY = parentRow ? parentRow.hit.y - 2 : y;
    if (flyY + flyH > d.H - d.TASK_H - 2) flyY = d.H - d.TASK_H - flyH - 2;
    if (flyY < 2) flyY = 2;
    d.state._startFlyoutHit = { x: flyX, y: flyY, w: flyW, h: flyH };
    d.bevelRaised(flyX, flyY, flyW, flyH, d.C.face);
    d.state._startFlyoutHits = [];
    kids.forEach((child, ci) => {
      const cy = flyY + 4 + ci * rowH;
      const lab = child.label || child.id || "";
      const id = child.id || "";
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "8px Tahoma, sans-serif";
      const gOff = d.drawStartMenuRowGlyph(id, lab, flyX + 6, cy);
      let text = lab;
      if (id === "jiggler" && d.state.jimboJiggler) text = "[on] " + lab;
      d.ctx.fillStyle = d.C.text;
      d.ctx.fillText(String(text).slice(0, 22), flyX + 6 + (gOff ? gOff : 0), cy + 10);
      d.state._startFlyoutHits.push({
        hit: { x: flyX + 2, y: cy, w: flyW - 4, h: rowH },
        item: child,
      });
    });
  }

  d.drawStickies = function drawStickies() {
    d.state.stickies.forEach((s, i) => {
      const x = 260 + i * 2;
      const y = 8 + i * 6;
      d.ctx.fillStyle = d.STICKY_COLS[s.color] || s.color || "#ffff80";
      d.ctx.fillRect(x, y, 54, 36);
      d.ctx.strokeStyle = d.C.shadow;
      d.ctx.strokeRect(x, y, 54, 36);
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "6px Tahoma, sans-serif";
      d.wrap(s.text, 12).slice(0, 4).forEach((ln, j) => {
        d.ctx.fillText(ln, x + 2, y + 9 + j * 7);
      });
    });
  }

  d.drawCursor = function drawCursor() {
    const { x, y } = d.state.cursor;
    d.ctx.fillStyle = "#000";
    d.ctx.beginPath();
    d.ctx.moveTo(x, y);
    d.ctx.lineTo(x, y + 12);
    d.ctx.lineTo(x + 3, y + 9);
    d.ctx.lineTo(x + 7, y + 14);
    d.ctx.lineTo(x + 9, y + 13);
    d.ctx.lineTo(x + 5, y + 8);
    d.ctx.lineTo(x + 10, y + 8);
    d.ctx.closePath();
    d.ctx.fill();
    d.ctx.fillStyle = "#fff";
    d.ctx.fillRect(x + 1, y + 2, 1, 6);
  }

  d.render = function render() {
    d.ctx.setTransform(d.PIXEL_SCALE, 0, 0, d.PIXEL_SCALE, 0, 0);
    d.ctx.imageSmoothingEnabled = true;
    d.ctx.fillStyle = d.C.desktop;
    d.ctx.fillRect(0, 0, d.W, d.H);
    d.drawDeskIcons();
    d.drawStickies();
    for (const id of d.order) d.drawWindow(d.wins[id]);
    d.drawTaskbar();
    d.drawStartMenu();
    if (d.state.toastT > 0) {
      d.state.toastT--;
      if (d.state.toastJimbo) {
        d.ctx.fillStyle = "#C0FFC0";
        d.ctx.fillRect(d.W / 2 - 90, 4, 180, 20);
        d.ctx.strokeStyle = "#000";
        d.ctx.strokeRect(d.W / 2 - 90, 4, 180, 20);
      } else {
        d.bevelRaised(d.W / 2 - 90, 4, 180, 18, d.C.face);
      }
      d.ctx.fillStyle = d.C.text;
      d.ctx.font = "8px Tahoma, sans-serif";
      d.ctx.fillText(String(d.state.toast).slice(0, 40), d.W / 2 - 84, 16);
    }
    d.drawCallOverlay();
    d.drawModal();
    d.drawCursor();
  }


  d.daySimCopy = function daySimCopy() {
    return (d.copy && d.copy.daySim) || {};
  }

  d.beatWeights = function beatWeights() {
    const id = d.state.dayBeat || "morning";
    const table = d.DAY_BEAT_WEIGHTS || {};
    return table[id] || table.morning || {};
  }

  d.resetObligations = function resetObligations() {
    const cfg = d.DAY_OBLIGATIONS || {
      tickets: { need: 3 },
      focusedMail: { need: 1 },
      syncChip: { need: 1 },
      timesheet: { need: 1 },
    };
    const next = {};
    for (const key of Object.keys(cfg)) {
      next[key] = { need: cfg[key].need || 1, have: 0 };
    }
    d.state.obligations = next;
  }

  d.bumpObligation = function bumpObligation(key) {
    const o = d.state.obligations && d.state.obligations[key];
    if (!o) return false;
    if (o.have >= o.need) return false;
    o.have = Math.min(o.need, (o.have || 0) + 1);
    if (o.have >= o.need) {
      const ds = d.daySimCopy();
      const labels = ds.obligationLabels || {};
      const label = labels[key] || key;
      const tpl = ds.obligationMetToast || "";
      if (tpl) {
        d.toast(
          String(tpl)
            .replace(/\{\{label\}\}/g, label)
            .replace(/\{\{have\}\}/g, String(o.have))
            .replace(/\{\{need\}\}/g, String(o.need))
        );
      }
    }
    return true;
  }

  d.desiredDayBeat = function desiredDayBeat() {
    if (!d.state.standupDone || (d.wins && d.wins.standup && d.wins.standup.open)) {
      return "standup";
    }
    const cm = d.state.clockMinutes || 0;
    const e = d.DAY_BEAT_EDGES || {};
    if (cm >= (e.quittin != null ? e.quittin : 1020)) return "quittin";
    if (cm >= (e.winddown != null ? e.winddown : 900)) return "winddown";
    if (cm >= (e.afternoon != null ? e.afternoon : 750)) return "afternoon";
    if (cm >= (e.lunch != null ? e.lunch : 690)) return "lunch";
    return "morning";
  }

  d.updateDayBeat = function updateDayBeat() {
    const next = d.desiredDayBeat();
    const prev = d.state.dayBeat;
    if (next === prev) return false;
    d.state.dayBeat = next;
    if (!d.state.dayBeatToasted) d.state.dayBeatToasted = {};
    if (!d.state.dayBeatToasted[next]) {
      d.state.dayBeatToasted[next] = true;
      const toasts = (d.daySimCopy().beatEnterToasts) || {};
      const msg = toasts[next];
      if (msg) d.toast(msg);
    }
    return true;
  }

  d.syncSuppressedByTimesheet = function syncSuppressedByTimesheet() {
    const w = d.beatWeights();
    if (!w.preferTimesheet) return false;
    if (d.state.timesheetLockedOk) return false;
    const tk = d.state.obligations && d.state.obligations.tickets;
    const have = tk ? tk.have || 0 : d.state.ticketsCompletedSinceLock || 0;
    return have >= 3;
  }

  d.tick = function tick(dt) {
    if (!d.state.emailEnabled) return;
    // idle / presence (+ Jimbo jiggler delay)
    if (!d.state.modal || d.state.modal.kind !== "presence") {
      d.state.idleAcc += dt;

      if (d.state.jimboJiggler && !d.state.presenceForced) {
        d.state.jigglerMaskAcc += dt;
        d.state.jigglerPulseAcc += dt;
        d.state.jigglerSanityAcc += dt;
        // Soft bump: keep badge Active for a while (DELAY Away, do not delete)
        if (d.state.jigglerMaskAcc < d.JIGGLER_MAX_MASK) {
          if (d.state.jigglerPulseAcc >= d.JIGGLER_PULSE && d.state.idleAcc >= d.IDLE_YELLOW - 1) {
            d.state.jigglerPulseAcc = 0;
            d.state.idleAcc = Math.min(d.state.idleAcc, d.IDLE_YELLOW - 0.5);
            if (d.state.presence !== d.Presence.AWAY) d.state.presence = d.Presence.ACTIVE;
            d.audio.playSfx("jigglerTick", { volume: 0.2 });
            if (Math.random() < 0.35) {
              d.toast(d.pick(d.jigglerCopy.tickToasts) || d.pick(d.jimboCopy.jiggleToasts) || "Wiggle.", {
                jimbo: true,
              });
            }
          }
        }
        if (d.state.jigglerSanityAcc >= d.JIGGLER_SANITY_EVERY) {
          d.state.jigglerSanityAcc = 0;
          d.hitSanity(1);
        }
        d.maybeJigglerAudit();
      }

      if (d.state.idleAcc >= d.IDLE_AWAY && d.state.presence !== d.Presence.AWAY) {
        d.state.presence = d.Presence.AWAY;
        d.state.statusPopover = false;
        d.audio.playSfx("awayTick", { volume: 0.3 });
        d.forceAwayMail();
      } else if (d.state.idleAcc >= d.IDLE_YELLOW && d.state.presence === d.Presence.ACTIVE) {
        d.state.presence = d.Presence.IDLE_YELLOW;
        d.audio.playSfx("awayTick", { volume: 0.2 });
        d.toast(d.presenceCopy.presenceYellowToast || "Still there?");
      }
    } else {
      d.state.statusPopover = false;
    }
    // CORP-BAL-01 grace: countdown; Mail + incident frozen until done
    if (d.state.dayGraceLeft > 0) {
      d.state.dayGraceLeft -= dt;
      if (d.state.dayGraceLeft <= 0) {
        d.state.dayGraceLeft = 0;
        d.state.emailCooldown = d.EMAIL_MIN + Math.random() * (d.EMAIL_MAX - d.EMAIL_MIN);
      }
    }

    // CORP-DAY-01: advance named beat from clock thresholds
    d.updateDayBeat();
    const beatW = d.beatWeights();

    // doom mail timer (frozen during day grace); beat weight 0 = skip
    if (!d.state.presenceForced && !d.inDayGrace() && (beatW.doomMail || 0) > 0) {
      const mailRate = beatW.mailLight ? 0.55 : 1;
      d.state.emailCooldown -= dt * mailRate;
      if (d.state.emailCooldown <= 0) {
        let cd = d.EMAIL_MIN + Math.random() * (d.EMAIL_MAX - d.EMAIL_MIN);
        if (beatW.mailLight) cd *= 1.35;
        d.state.emailCooldown = cd;
        if (Math.random() < beatW.doomMail) {
          const doom = d.state.inbox.filter((m) => m.doom && !m.opened);
          const pool = doom.length ? doom : d.state.inbox.filter((m) => m.doom);
          const mail = d.pick(pool);
          if (mail) d.queueOrDeliver(mail);
        }
      }
    }

    // Random incident pager (GD incidents.md) - never stacks two modals
    // Prefer one modal at a time: skip if Away/presenceForced or any modal open
    // Frozen during day grace (CORP-BAL-01); beat weight 0 = no rolls (lunch/quittin/standup)
    if (d.state.incidentPagerCooldown > 0) d.state.incidentPagerCooldown -= dt;
    if (
      d.state.emailEnabled &&
      !d.inDayGrace() &&
      !d.state.modal &&
      !d.state.presenceForced &&
      !d.interruptShielded() &&
      !d.state.timesheetGateOpen &&
      !d.callBusy() &&
      d.state.incidentPagerCooldown <= 0 &&
      (beatW.incident || 0) > 0
    ) {
      d.state.incidentPagerCd -= dt;
      if (d.state.incidentPagerCd <= 0) {
        d.state.incidentPagerCd = 40; // check cadence
        const chance = ((d.state.closedCount || 0) >= 1 ? 0.15 : 0.08) * beatW.incident;
        if (Math.random() < chance) {
          d.openIncident({ fromTicket: false });
          d.state.incidentPagerCooldown = 90;
          d.state.incidentPagerCd = 40 + Math.random() * 20;
        }
      }
    }


    d.flushEmailQueue();
    d.tickCallTheater(dt);
    // keep unread floor
    d.state.unread = Math.max(d.emailCopy.unreadFloor || 1, d.unreadCount());
  }


  d.inDayGrace = function inDayGrace() {
    return (d.state.dayGraceLeft || 0) > 0;
  }

  d.enableDaySystems = function enableDaySystems() {
    d.state.emailEnabled = true;
    d.state.dayBeat = "standup";
    d.state.dayBeatToasted = {};
    d.state.jimboTicketsUsed = 0;
    d.resetObligations();
    d.updateDayBeat();
    d.state.idleAcc = 0;
    d.state.presence = d.Presence.ACTIVE;
    d.state.presenceStatus = null;
    d.state.statusPopover = false;
    d.state.jimboJiggler = false;
    d.state.jigglerInstalled = false;
    d.state.jigglerPulseAcc = 0;
    d.state.jigglerSanityAcc = 0;
    d.state.jigglerMaskAcc = 0;
    d.state.jigglerAuditArmed = false;
    d.state.jigglerAuditDone = false;
    d.state.jigglerAuditAt = 0;
    d.state.boardRefillPaused = false;
    d.state.timesheetQueued = false;
    d.state.timesheetGateOpen = false;
    d.state.ticketsCompletedSinceLock = 0;
    d.state.timesheetLockedOk = false;
    d.state.timesheetGateThreshold = 3; // every 3 completions or Shut Down
    d.state.timesheetJimboFills = 0;
    d.state.timesheetPendingClockOut = false;
    d.state.timesheetAcceptedOpen = false;
    d.resetTimesheetHours();
    if (d.wins.timesheet) d.wins.timesheet.open = false;
    // CORP-BAL-01: grace band -- no early Mail slap (was 8+rand*6)
    d.state.dayGraceLeft = d.DAY_GRACE || 60;
    d.state.emailCooldown = d.EMAIL_MIN + Math.random() * (d.EMAIL_MAX - d.EMAIL_MIN);
    d.state.incidentPagerCd = 45 + Math.random() * 45;
    d.state.incidentPagerCooldown = 0;
    d.state.incidentFromPager = false;
    d.stopCallAudio();
    d.state.callPhase = null;
    d.state.callQueued = false;
    d.state.callCd = 25 + Math.random() * 20;
    d.resetCallUiState();
    d.state.callMissedBadge = false;
    d.state.callCaller = null;
    d.state.callOpener = "";
    d.wins.slack.title = d.teamsCopy.windowTitle || "Sync -- Corporate Chat";
  }

  d.onPointerMove = function onPointerMove(nx, ny) {
    d.state.cursor.x = Math.max(0, Math.min(d.W - 1, nx));
    d.state.cursor.y = Math.max(0, Math.min(d.H - 1, ny));
    d.bumpActivity();
    if (d.state.callPhase === "connected") {
      // feed only from call-UI motion (whole overlay is call UI while connected)
      d.feedCallAttentiveness(0.08);
    }
    if (d.state.startOpen && d.state._startItems) {
      const x = d.state.cursor.x;
      const y = d.state.cursor.y;
      let overFly = false;
      if (d.state._startFlyoutHit && d.hit(d.state._startFlyoutHit, x, y)) overFly = true;
      if (d.state._startFlyoutHits) {
        for (const fh of d.state._startFlyoutHits) {
          if (d.hit(fh.hit, x, y)) overFly = true;
        }
      }
      let hovered = -1;
      for (const it of d.state._startItems) {
        if (d.hit(it.hit, x, y)) {
          hovered = it.index;
          if (it.hasFlyout) d.openStartFlyout(it.index);
          else d.state.startFlyoutIndex = -1;
          break;
        }
      }
      if (hovered < 0 && !overFly && d.state._startRootHit && !d.hit(d.state._startRootHit, x, y)) {
        // leave open until click-outside; keep current flyout
      } else if (hovered < 0 && !overFly) {
        // over root but not a flyout row -- close flyout unless still on parent
        const cur = d.state.startFlyoutIndex;
        const parent = (d.state._startItems || []).find((r) => r.index === cur);
        if (!(parent && d.hit(parent.hit, x, y))) {
          // stay if moving within root non-flyout? close flyout when hovering Run/Shut Down
          if (hovered < 0) {
            const onRoot = d.state._startRootHit && d.hit(d.state._startRootHit, x, y);
            if (onRoot) d.state.startFlyoutIndex = -1;
          }
        }
      }
    }
  }

  d.onPointerDown = function onPointerDown() {
    const x = d.state.cursor.x;
    const y = d.state.cursor.y;
    d.state.mouseDown = true;
    d.bumpActivity();
    d.audio.playSfx("mouse", { volume: 0.35 });
    d.hooks.onClick?.();

    if (d.state.callPhase) {
      d.handleCallClick(x, y);
      return;
    }

    if (d.state.modal) {
      const before = d.state.stub?.jiggles;
      d.handleModalClick(x, y);
      // presence: clicks outside buttons still count via fallthrough only when no modal
      return;
    }
    if (d.state.phase === "presence" && d.state.stub?.kind === "presence") {
      d.bumpPresenceJiggle(1);
      return;
    }

    if (d.hit(d.state._startBtn, x, y)) {
      d.state.startOpen = !d.state.startOpen;
      d.state.startFlyoutIndex = -1;
      d.audio.playSfx(d.state.startOpen ? "start" : "click");
      return;
    }
    if (d.hit(d.state._askToolbar, x, y)) {
      d.askJimbo();
      return;
    }
    if (d.state.startOpen) {
      // Flyout children first
      if (d.state._startFlyoutHits) {
        for (const fh of d.state._startFlyoutHits) {
          if (d.hit(fh.hit, x, y)) {
            d.handleStartItem(fh.item);
            d.state.startOpen = false;
            d.state.startFlyoutIndex = -1;
            return;
          }
        }
      }
      if (d.state._startItems) {
        for (const it of d.state._startItems) {
          if (d.hit(it.hit, x, y)) {
            if (it.hasFlyout) {
              d.openStartFlyout(it.index);
              d.audio.playSfx("click");
              return;
            }
            d.handleStartItem(it.item);
            d.state.startOpen = false;
            d.state.startFlyoutIndex = -1;
            return;
          }
        }
      }
      d.state.startOpen = false;
      d.state.startFlyoutIndex = -1;
    }

    // desktop icons
    if (d.state._deskIconHits) {
      for (const ic of d.state._deskIconHits) {
        if (d.hit(ic.hit, x, y)) {
          if (ic.id === "jimbo") d.openJimbo();
          else if (ic.id === "inbox") {
            d.openInbox();
            d.audio.playSfx("click");
          } else if (ic.id === "timesheet") {
            d.openTimesheet({ forced: false });
            d.audio.playSfx("click");
          } else if (ic.id === "jiggler") {
            d.toggleJiggler({ fromStart: false });
          } else if (ic.id === "tickets") {
            d.wins.tickets.open = true;
            d.raise("tickets");
            d.audio.playSfx("click");
          } else if (ic.id === "teams" || ic.id === "slack") {
            d.wins.slack.open = true;
            d.wins.slack.title = d.teamsCopy.windowTitle || d.wins.slack.title;
            d.raise("slack");
            d.audio.playSfx("click");
          }
          return;
        }
      }
    }

    for (let i = d.order.length - 1; i >= 0; i--) {
      const win = d.wins[d.order[i]];
      if (!win.open) continue;
      if (x >= win.x && x <= win.x + win.w && y >= win.y && y <= win.y + win.h) {
        d.raise(win.id);
        if (x >= win.x + win.w - 16 && x <= win.x + win.w - 6 && y >= win.y + 5 && y <= win.y + 15) {
          if (win.id === "meters") return;
          if (win.id === "inbox" && d.state.openMailId) {
            d.closeOpenMail(false);
            return;
          }
          win.open = false;
          d.audio.playSfx("click");
          return;
        }
        d.handleWinClick(win, x, y);
        return;
      }
    }
  }

  d.deniedToast = function deniedToast(item) {
    const line = d.pick(d.deniedPool);
    if (line) d.toast(line);
    else {
      const sub0 = item.submenu?.[0];
      const tip = (sub0 && typeof sub0 === "object" ? sub0.label : sub0) || item.label || "Denied";
      d.toast(String(tip) + " - denied");
    }
    d.audio.playSfx("error");
  }

  d.handleStartItem = function handleStartItem(item) {
    const id = item.id || item.action || "";
    const label = item.label || "";
    d.audio.playSfx("click");
    if (id === "jimbo" || label === "Jimbo") {
      d.openJimbo();
    } else if (id === "inbox" || /inbox|outlook|mail/i.test(label)) {
      d.openInbox();
    } else if (id === "tickets" || /ticket|tracker/i.test(label)) {
      d.wins.tickets.open = true;
      d.raise("tickets");
    } else if (id === "slack" || id === "teams" || /slack|teams|sync/i.test(label)) {
      d.wins.slack.open = true;
      d.wins.slack.title = d.teamsCopy.windowTitle || d.wins.slack.title;
      d.raise("slack");
    } else if (id === "timesheet" || label === (d.timesheetCopy.desktopLabel || "timesheet.xls") || /timesheet/i.test(label)) {
      d.openTimesheet({ forced: false });
    } else if (id === "jiggler" || label === (d.jigglerCopy.menuLabel || "Jimbo Mouse Jiggler") || /jiggler/i.test(label)) {
      d.toggleJiggler({ fromStart: true });
    } else if (id === "clockout" || /shut|log off|clock out/i.test(label)) {
      if (d.needsTimesheetForClockOut()) {
        d.state.timesheetPendingClockOut = true;
        d.toast(
          d.timesheetCopy.blockClockOut ||
            "Cannot Shut Down until timesheet.xls equals 8.0."
        );
        d.requestTimesheetGate("shut-down");
      } else {
        const conf =
          d.copy.dialogs?.confirms?.find((c) => /clock/i.test(c.title || "")) ||
          d.copy.dialogs?.confirms?.[0];
        d.toast((conf && conf.body) || "Clocking out...");
        setTimeout(() => d.hooks.onClockOut?.(), 500);
      }
    } else if (id === "ide") {
      d.wins.ide.open = true;
      d.raise("ide");
    } else if (item.submenu) {
      // Folder roots open via flyout UI; joke string/object kids without id deny
      d.deniedToast(item);
    } else if (/run/i.test(label)) {
      d.deniedToast(item);
    } else {
      d.deniedToast(item);
    }
  }

  d.handleWinClick = function handleWinClick(win, x, y) {
    if (d.callBlocksBoard() && (win.id === "tickets" || win.id === "ide" || win.id === "pr")) {
      d.toast(d.teamsCopy.freezeToast || "Tickets frozen -- you are in a meeting (spiritually)");
      return;
    }
    if (win.id === "standup" && d.hit(d.state._standupBtn, x, y)) {
      d.wins.standup.open = false;
      d.state.standupDone = true;
      d.hitSanity(5);
      d.toast((d.copy.standupToasts && d.copy.standupToasts[0]) || "Standup survived");
      d.audio.playSfx("click");
      d.enableDaySystems();
      d.hooks.onStandupDone?.();
      return;
    }
    if (win.id === "jimbo") {
      if (d.hit(d.state._jimboAskBtn, x, y)) {
        d.askJimbo();
        return;
      }
      if (d.hit(d.state._jimboSkipBtn, x, y)) {
        d.showHrSkip();
        return;
      }
    }
    if (win.id === "inbox" && d.state.phase === "unsub" && d.state.stub?.kind === "unsub") {
      if (d.handleStubClick(win, x, y)) return;
    }
    if (win.id === "inbox" && !(d.state.phase === "unsub" && d.state.stub?.kind === "unsub")) {
      if (d.state._outlookHits) {
        for (const oh of d.state._outlookHits) {
          if (!d.hit(oh.hit, x, y)) continue;
          d.audio.playSfx("click");
          if (oh.kind === "rail") {
            if (oh.id === "folders") {
              d.toast(d.outlookCopy.foldersToast || "Folders syncing...");
              return;
            }
            d.setOutlookTab(oh.id);
            return;
          }
          if (oh.kind === "ribbon") {
            if (oh.id === "new") {
              d.state.outlookCompose = true;
              d.toast(d.pick(d.outlookRibbon.new) || "Compose opened.", { jimbo: true });
              return;
            }
            if (oh.id === "delete") {
              if (d.state.openMailId) {
                const mail = d.state.inbox.find((m) => m.id === d.state.openMailId);
                if (mail) {
                  mail.read = true;
                  mail.opened = true;
                }
                d.state.openMailId = null;
                d.state.mailReadFully = false;
                d.state.unread = Math.max(d.emailCopy.unreadFloor || 1, d.unreadCount());
                d.toast(d.pick(d.outlookRibbon.delete) || "Moved to Deleted (synced to Jimbo)");
              } else {
                d.toast(d.pick(d.outlookRibbon.delete) || "Moved to Deleted (synced to Jimbo)");
              }
              return;
            }
            if (oh.id === "archive") {
              d.toast(d.pick(d.outlookRibbon.archive) || "Archived for impact");
              return;
            }
            if (oh.id === "tip") {
              d.toast(d.pick(d.outlookRibbon.tip) || "Focused Inbox shows what matters.");
              return;
            }
          }
          if (oh.kind === "compose") {
            if (oh.id === "send") {
              d.state.outlookCompose = false;
              d.hitSanity(1);
              d.toast(d.pick(d.outlookFail) || "Jimbo rewrote your tone. Draft discarded for culture.", {
                jimbo: true,
              });
              d.audio.playSfx("jimboFail", { volume: 0.45 });
              return;
            }
            if (oh.id === "discard") {
              d.state.outlookCompose = false;
              return;
            }
          }
        }
      }
      if (d.state.openMailId && d.hit(d.state._mailCloseBtn, x, y)) {
        // treat as read if they've had it open (clicking close after open = read)
        d.state.mailReadFully = true;
        d.closeOpenMail(true);
        return;
      }
      if (d.state._mailHits) {
        for (const mh of d.state._mailHits) {
          if (d.hit(mh.hit, x, y)) {
            if (d.state.openMailId && d.state.openMailId !== mh.id) {
              const prev = d.state.inbox.find((m) => m.id === d.state.openMailId);
              if (prev && !prev.read) {
                d.closeOpenMail(true);
              } else {
                d.state.openMailId = null;
                d.state.mailReadFully = false;
              }
            }
            d.state.openMailId = mh.id;
            d.state.mailReadFully = true;
            const mail = d.state.inbox.find((m) => m.id === mh.id);
            if (mail) mail.opened = true;
            d.audio.playSfx("click");
            return;
          }
        }
      }
    }
    if (win.id === "tickets") {
      for (const tk of d.state.board) {
        if (d.hit(tk._hit, x, y)) {
          d.openTicket(tk);
          return;
        }
      }
    }
    if (d.handleStubClick(win, x, y)) return;
    if (win.id === "ide" && d.state.phase === "semi") {
      if (d.hit(d.state._submitBtn, x, y) && d.state.pendingFinish?.type === "semi") {
        d.tryFinishTicket("semi", d.state.pendingFinish.pts);
        return;
      }
      const semis = (d.semiLines && d.semiLines()) || d.state.semiLines || d.copy.semiLines || [];
      for (const ln of semis) {
        if (ln && ln._hit && d.hit(ln._hit, x, y)) {
          d.trySemi(ln._hit.i);
          return;
        }
      }
    }
    if (win.id === "ide" && d.state.phase === "comment") {
      if (d.hit(d.state._submitBtn, x, y) && d.state.pendingFinish?.type === "comment") {
        d.tryFinishTicket("comment", d.state.pendingFinish.pts);
        return;
      }
      if (d.hit(d.state._cmtBtn, x, y)) {
        d.acceptComment();
        return;
      }
    }
    if (win.id === "pr") {
      if (
        d.hit(d.state._submitBtn, x, y) &&
        (d.state.pendingFinish?.type === "pr" || d.state.pendingFinish?.type === "spacewar")
      ) {
        d.tryFinishTicket(d.state.pendingFinish.type, d.state.pendingFinish.pts);
        return;
      }
      if (d.state._prChoices) {
        for (const c of d.state._prChoices) {
          if (d.hit(c.hit, x, y)) {
            d.choosePr(c);
            return;
          }
        }
      }
    }
  
    if (win.id === "timesheet") {
      if (d.hit(d.state._tsJimboBtn, x, y)) {
        d.jimboAutoFillTimesheet();
        return;
      }
      if (d.hit(d.state._tsAcceptBtn, x, y)) {
        d.acceptTimesheet();
        return;
      }
      if (d.state._tsHits) {
        for (const th of d.state._tsHits) {
          if (d.hit(th.hit, x, y)) {
            d.nudgeTimesheetHour(th.id, th.kind === "plus" ? 0.5 : -0.5);
            d.audio.playSfx("click");
            return;
          }
        }
      }
      return;
    }
  }

  d.pushSlack = function pushSlack(msg) {
    d.state.slackMsgs.unshift(msg);
    if (d.state.slackMsgs.length > 24) d.state.slackMsgs.length = 24;
    d.state.unread = Math.max(1, d.state.unread + 1);
    d.audio.playSfx("teamsPing", { volume: 0.4 });
  }

  d.onKey = function onKey(e) {
    d.bumpActivity();
    if (d.state.phase === "presence") {
      d.bumpPresenceJiggle(1);
    }
    if (d.state.modal && d.state.modal.kind !== "presenceTicket") return;
    if (d.state.modal && d.state.modal.kind === "presenceTicket") return;
    if (d.state.phase === "semi" && e.key === ";") {
      d.ensureSemi();
      const lines = (d.semiLines && d.semiLines()) || d.state.semiLines || [];
      const next = lines.findIndex((l, i) => l.need && !d.state.semiPlaced[i]);
      if (next >= 0) d.trySemi(next);
    }
    if (d.state.phase === "comment" && e.key === "Enter") d.acceptComment();
  }

  d.onPointerUp = function onPointerUp() {
    d.state.mouseDown = false;
  }

}
