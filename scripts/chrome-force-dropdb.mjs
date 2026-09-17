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
  const api = window.corpWin95;
  const d = api.__d;
  if (!d?.finishTicket) return { err: "no __d.finishTicket" };
  const types = () => (d.state.board || []).map(t => t.mechanic || t.type);
  const log = [];
  log.push({ step: "opener", types: types(), force: !!d.state.forceDropDbOnce, closed: d.state.closedCount });

  const first = d.state.board.find(t => (t.mechanic||t.type) !== "dropdb") || d.state.board[0];
  d.state.activeTicket = first;
  d.state.jimboUsedThisTicket = true;
  d.state.pendingFinish = null;
  // Clear Away so refill isn't paused
  if (d.state.presence) d.state.presence = d.Presence?.ACTIVE || d.state.presence;
  d.state.presenceForced = false;
  d.finishTicket(first.mechanic || first.type, first.pts || 2, { toastMsg: "closed", sanHit: 0 });
  if (d.state.boardRefillPaused) d.flushBoardRefill();
  log.push({
    step: "afterFirstClose",
    types: types(),
    force: !!d.state.forceDropDbOnce,
    closed: d.state.closedCount,
    hasDrop: types().includes("dropdb"),
  });

  // Second close should not leave force stuck true without drop already dealt
  return {
    log,
    dropTitle: (d.state.board.find(t => (t.mechanic||t.type)==="dropdb")||{}).title,
    openerClean: log[0].types.every(t => t !== "dropdb"),
  };
});
console.log(JSON.stringify(result, null, 2));
const ok = result.openerClean && result.log?.some(l => l.hasDrop);
console.log(ok ? "FORCE_PASS" : "FORCE_FAIL");
await browser.close();
process.exit(ok ? 0 : 1);
