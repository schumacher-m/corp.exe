import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise(r=>setTimeout(r,500));

const result = await page.evaluate(() => {
  const d = window.corpWin95.__d;
  const types = () => (d.state.board || []).map(t => t.mechanic || t.type);
  const log = [];
  log.push({ step: "opener", types: types(), force: !!d.state.forceDropDbOnce });

  // Path A: Away blocked — must still inject inline
  const first = d.state.board.find(t => (t.mechanic||t.type) !== "dropdb");
  d.state.presenceForced = true;
  d.state.presence = d.Presence?.AWAY || "away";
  d.state.activeTicket = first;
  d.state.jimboUsedThisTicket = true;
  d.finishTicket(first.mechanic || first.type, first.pts || 2, { toastMsg: "closed", sanHit: 0 });
  log.push({
    step: "afterCloseWhileAway",
    types: types(),
    force: !!d.state.forceDropDbOnce,
    paused: !!d.state.boardRefillPaused,
    hasDrop: types().includes("dropdb"),
    toast: d.state.toast,
  });

  // Clear Away and flush — force should already be spent
  d.state.presenceForced = false;
  d.state.presence = d.Presence?.ACTIVE || "active";
  if (d.state.boardRefillPaused) d.flushBoardRefill();
  log.push({
    step: "afterFlush",
    types: types(),
    force: !!d.state.forceDropDbOnce,
    hasDrop: types().includes("dropdb"),
  });

  return {
    log,
    openerClean: log[0].types.every(t => t !== "dropdb"),
    dropAfterAwayClose: log[1].hasDrop,
    toastNamesDrop: /drop|DROP|hygiene|migration|cleanup|truncate|storage|DB/i.test(String(log[1].toast||"")),
  };
});
console.log(JSON.stringify(result, null, 2));
const ok = result.openerClean && result.dropAfterAwayClose;
console.log(ok ? "FORCE_PASS" : "FORCE_FAIL");
await browser.close();
process.exit(ok ? 0 : 1);
