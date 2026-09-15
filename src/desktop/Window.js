/** desktop/Window.js -- install onto desktop bag `d`. */
export function installWindow(d) {
  d.raise = function raise(id) {
    d.state.activeWin = id;
    const i = d.order.indexOf(id);
    if (i >= 0) {
      d.order.splice(i, 1);
      d.order.push(id);
    }
  }

  d.bevelRaised = function bevelRaised(x, y, w, h, fill = d.C.face) {
    d.ctx.fillStyle = fill;
    d.ctx.fillRect(x, y, w, h);
    d.ctx.fillStyle = d.C.light;
    d.ctx.fillRect(x, y, w, 1);
    d.ctx.fillRect(x, y, 1, h);
    d.ctx.fillStyle = d.C.dark;
    d.ctx.fillRect(x, y + h - 1, w, 1);
    d.ctx.fillRect(x + w - 1, y, 1, h);
    d.ctx.fillStyle = d.C.shadow;
    d.ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    d.ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
  }

  d.bevelSunken = function bevelSunken(x, y, w, h, fill = d.C.white) {
    d.ctx.fillStyle = fill;
    d.ctx.fillRect(x, y, w, h);
    d.ctx.fillStyle = d.C.dark;
    d.ctx.fillRect(x, y, w, 1);
    d.ctx.fillRect(x, y, 1, h);
    d.ctx.fillStyle = d.C.light;
    d.ctx.fillRect(x, y + h - 1, w, 1);
    d.ctx.fillRect(x + w - 1, y, 1, h);
  }

  d.wrap = function wrap(s, n) {
    const words = String(s).split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > n) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
  }

  d.drawWindow = function drawWindow(win) {
    if (!win.open) return;
    const active = d.state.activeWin === win.id;
    d.bevelRaised(win.x, win.y, win.w, win.h, d.C.face);
    const bar = win.jimboChrome ? d.C.jimboBar : active ? d.C.title : d.C.titleIn;
    d.ctx.fillStyle = bar;
    d.ctx.fillRect(win.x + 3, win.y + 3, win.w - 6, 14);
    if (win.jimboChrome && d.imgReady(d.imgs.j16)) {
      d.ctx.drawImage(d.imgs.j16, win.x + 5, win.y + 4, 12, 12);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      d.ctx.textBaseline = "middle";
      d.ctx.fillText(win.title.slice(0, 24), win.x + 20, win.y + 10);
    } else if (win.id === "slack" && d.imgReady(d.imgs.t16)) {
      // optional purple title for Sync
      d.ctx.fillStyle = d.C.teams;
      d.ctx.fillRect(win.x + 3, win.y + 3, win.w - 6, 14);
      d.ctx.drawImage(d.imgs.t16, win.x + 5, win.y + 4, 12, 12);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      d.ctx.textBaseline = "middle";
      d.ctx.fillText(win.title.slice(0, 24), win.x + 20, win.y + 10);
    } else if (win.id === "inbox" && d.imgReady(d.imgs.ol16)) {
      d.ctx.fillStyle = d.C.outlookDk;
      d.ctx.fillRect(win.x + 3, win.y + 3, win.w - 6, 14);
      d.ctx.drawImage(d.imgs.ol16, win.x + 5, win.y + 4, 12, 12);
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      d.ctx.textBaseline = "middle";
      d.ctx.fillText(win.title.slice(0, 24), win.x + 20, win.y + 10);
    } else {
      d.ctx.fillStyle = d.C.inv;
      d.ctx.font = "bold 9px Tahoma, 'MS Sans Serif', sans-serif";
      d.ctx.textBaseline = "middle";
      d.ctx.fillText(win.title.slice(0, 28), win.x + 6, win.y + 10);
    }
    d.bevelRaised(win.x + win.w - 16, win.y + 5, 10, 10, d.C.face);
    d.ctx.fillStyle = d.C.text;
    d.ctx.font = "bold 8px sans-serif";
    d.ctx.fillText("x", win.x + win.w - 14, win.y + 10);

    const cx = win.x + 4;
    const cy = win.y + 20;
    const cw = win.w - 8;
    const ch = win.h - 24;
    if (win.id === "tickets") d.drawTickets(cx, cy, cw, ch);
    else if (win.id === "slack") d.drawSlack(cx, cy, cw, ch);
    else if (win.id === "ide") d.drawIde(cx, cy, cw, ch);
    else if (win.id === "pr") d.drawPr(cx, cy, cw, ch);
    else if (win.id === "standup") d.drawStandup(cx, cy, cw, ch);
    else if (win.id === "meters") d.drawMeters(cx, cy, cw, ch);
    else if (win.id === "jimbo") d.drawJimbo(cx, cy, cw, ch);
    else if (win.id === "timesheet") d.drawTimesheet(cx, cy, cw, ch);
    else if (win.id === "inbox") d.drawInbox(cx, cy, cw, ch);
  }

  d.hit = function hit(r, x, y) {
    return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

}
