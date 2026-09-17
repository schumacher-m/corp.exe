import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--window-size=1280,800",
  ],
});

let crashed = false;
browser.on("disconnected", () => { crashed = true; });

const page = await browser.newPage();
page.setDefaultTimeout(90000);
const errors = [];
const logs = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") logs.push(m.text()); });
page.on("close", () => { console.log("PAGE_CLOSED"); });

await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
for (let i = 0; i < 50; i++) {
  const ready = await page.evaluate(() => typeof window.corpForceDesk === "function");
  if (ready) break;
  await new Promise((r) => setTimeout(r, 400));
}
if (!(await page.evaluate(() => typeof window.corpForceDesk === "function"))) {
  console.log("NOT_READY");
  await browser.close();
  process.exit(2);
}

await page.evaluate(() => window.corpForceDesk());
await new Promise((r) => setTimeout(r, 400));

// Path 1: timesheet open/interact/close then Start spam
const path1 = await page.evaluate(async () => {
  const w = window.corpWin95;
  const out = { steps: [] };
  try {
    w.openTimesheet({ forced: true });
    w.render();
    out.steps.push({ open: w.wins.timesheet.open, gate: w.state.timesheetGateOpen });
    // fill via jimbo + accept path attempt + nudges
    for (let i = 0; i < 30; i++) {
      const hits = w.state._tsHits || [];
      if (hits[0]) w.nudgeTimesheetHour(hits[0].id, 0.5);
      w.render();
    }
    w.jimboAutoFillTimesheet();
    w.render();
    // close via X path (not accept)
    w.wins.timesheet.open = false;
    w.render();
    out.steps.push({ closed: true, gate: w.state.timesheetGateOpen, queued: w.state.timesheetQueued });

    // Start toggle x20 + Programs flyout
    for (let i = 0; i < 20; i++) {
      w.state.startOpen = !w.state.startOpen;
      if (w.state.startOpen) {
        w.audio.playSfx("start");
        w.openStartFlyout(0); // Programs
      } else {
        w.state.startFlyoutIndex = -1;
        w.audio.playSfx("click");
      }
      w.render();
      // simulate hover over programs
      if (w.state.startOpen && w.state._startItems?.[0]) {
        const h = w.state._startItems[0].hit;
        w.onPointerMove(h.x + 2, h.y + 2);
        w.render();
        if (w.state._startFlyoutHits?.[0]) {
          const fh = w.state._startFlyoutHits[0].hit;
          w.onPointerMove(fh.x + 2, fh.y + 2);
          w.render();
        }
      }
    }
    out.alive = true;
    out.startOpen = w.state.startOpen;
    out.phase = w.state.phase;
  } catch (e) {
    out.alive = false;
    out.error = String(e && e.stack || e);
  }
  return out;
});
console.log("PATH1", JSON.stringify(path1, null, 2));

// Path 2: dirty state
const path2 = await page.evaluate(() => {
  const w = window.corpWin95;
  const out = { steps: [] };
  try {
    // null out some imgs
    const keys = Object.keys(w.imgs || {});
    for (const k of keys.slice(0, 8)) w.imgs[k] = null;
    // break audio elements by replacing playSfx? mutate cache via broken Audio
    // leave weird flags
    w.state.timesheetGateOpen = true;
    w.state.timesheetQueued = true;
    w.state.timesheetAcceptedOpen = false;
    w.wins.timesheet.open = false;
    // corrupt start menu items
    const items = w.copy.startMenu.items;
    items.push(null);
    items.push(undefined);
    items[0].submenu.push(null);
    items[0].submenu.push({ label: null, id: null });
    // Start open + draw
    w.state.startOpen = true;
    w.state.startFlyoutIndex = 0;
    for (let i = 0; i < 10; i++) {
      w.render();
      w.audio.playSfx("start");
      w.onPointerMove(20, w.H - 80);
      w.openStartFlyout(0);
    }
    // click start btn path
    const btn = w.state._startBtn;
    if (btn) {
      w.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
      w.onPointerDown();
      w.onPointerUp();
      w.render();
    }
    out.alive = true;
    out.phase = w.state.phase;
  } catch (e) {
    out.alive = false;
    out.error = String(e && e.stack || e);
  }
  return out;
});
console.log("PATH2", JSON.stringify(path2, null, 2));

const pages = (await browser.pages()).length;
console.log("pages", pages, "crashed", crashed, "errors", errors.slice(0, 10), "logs", logs.slice(0, 10));
const alive = path1.alive && path2.alive && !crashed && pages > 0;
console.log(alive ? "ALIVE" : "DEAD");
await browser.close().catch(() => {});
process.exit(alive ? 0 : 1);
