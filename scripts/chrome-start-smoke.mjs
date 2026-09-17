/**
 * Headless smoke: desk → Timesheet open/close → Start ×20 + Programs flyout → ALIVE
 * Also dirties imgs/flags/menu rows and re-opens Start (must not throw / kill tab).
 */
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

let disconnected = false;
browser.on("disconnected", () => { disconnected = true; });

const page = await browser.newPage();
page.setDefaultTimeout(90000);
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));
page.on("close", () => console.log("PAGE_CLOSED_EVENT"));

await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
for (let i = 0; i < 50; i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise((r) => setTimeout(r, 400));
}
if (!(await page.evaluate(() => typeof window.corpForceDesk === "function"))) {
  console.log("NOT_READY");
  await browser.close();
  process.exit(2);
}

await page.evaluate(() => window.corpForceDesk());
await new Promise((r) => setTimeout(r, 500));

const result = await page.evaluate(async () => {
  const w = window.corpWin95;
  const d = w.__d;
  const out = { steps: [], errors: [] };
  const step = (name, fn) => {
    try {
      fn();
      out.steps.push({ name, ok: true });
    } catch (e) {
      out.steps.push({ name, ok: false, error: String(e && e.stack || e) });
      out.errors.push(String(e));
    }
  };

  // 1) Timesheet open / interact / close
  step("openTimesheet", () => {
    w.openTimesheet({ forced: true });
    w.render();
  });
  step("nudgeHours", () => {
    const hits = d.state._tsHits || [];
    for (let i = 0; i < 20; i++) {
      const h = hits[i % Math.max(1, hits.length)];
      if (h) d.nudgeTimesheetHour(h.id, h.kind === "plus" ? 0.5 : -0.5);
      w.render();
    }
    d.jimboAutoFillTimesheet();
    w.render();
  });
  step("closeTimesheet", () => {
    d.closeTimesheetWindow();
    w.render();
  });

  // 2) Start toggle ×20 + Programs flyout
  step("startToggleFlyout", () => {
    for (let i = 0; i < 20; i++) {
      const btn = d.state._startBtn || { x: 5, y: d.H - d.TASK_H + 5 };
      d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
      d.onPointerDown();
      d.onPointerUp();
      w.render();
      if (d.state.startOpen) {
        d.openStartFlyout(0);
        w.render();
        const items = d.state._startItems || [];
        if (items[0]?.hit) {
          d.onPointerMove(items[0].hit.x + 2, items[0].hit.y + 2);
          w.render();
        }
        const fhits = d.state._startFlyoutHits || [];
        if (fhits[0]?.hit) {
          d.onPointerMove(fhits[0].hit.x + 2, fhits[0].hit.y + 2);
          w.render();
        }
        // close again
        d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
        d.onPointerDown();
        d.onPointerUp();
        w.render();
      }
    }
  });

  // 3) Dirty state
  step("dirtyState", () => {
    for (const k of Object.keys(d.imgs || {})) d.imgs[k] = null;
    d.state.timesheetGateOpen = true;
    d.state.timesheetQueued = true;
    d.state.timesheetAcceptedOpen = false;
    if (d.wins.timesheet) d.wins.timesheet.open = false;
    const items = d.copy.startMenu.items;
    items.push(null, undefined);
    if (items[0]?.submenu) items[0].submenu.push(null, { label: null });
    d.state.startOpen = true;
    d.state.startFlyoutIndex = 0;
    for (let i = 0; i < 15; i++) {
      w.render();
      d.audio.playSfx("start");
      d.openStartFlyout(0);
      const btn = d.state._startBtn;
      if (btn) {
        d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
        d.onPointerDown();
        d.onPointerUp();
      }
    }
  });

  out.alive = out.errors.length === 0;
  out.phase = d.state.phase;
  out.startOpen = d.state.startOpen;
  out.overlay = !!(document.getElementById("desktop-overlay")?.classList.contains("show"));
  return out;
});

const pages = (await browser.pages()).length;
const alive =
  result.alive &&
  !disconnected &&
  pages > 0 &&
  pageErrors.length === 0;

console.log(JSON.stringify({ result, pages, disconnected, pageErrors: pageErrors.slice(0, 10) }, null, 2));
console.log(alive ? "ALIVE" : "DEAD");

await browser.close().catch(() => {});
process.exit(alive ? 0 : 1);
