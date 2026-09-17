import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise(r=>setTimeout(r,400));

const result = await page.evaluate(() => {
  const w = window.corpWin95;
  const log = [];
  w.wins.tickets.open = true;
  w.raise("tickets");
  w.render();
  const row = w.state.board.find(t => t.id === "CORP-401" || t.type === "semi");
  if (!row || !row._hit) return [{ err: "no row", board: w.state.board.map(t=>t.id) }];
  w.state.cursor = { x: row._hit.x + row._hit.w - 20, y: row._hit.y + 6 };
  w.onPointerDown();
  w.render();
  log.push({
    step: "opened",
    phase: w.state.phase,
    ide: w.wins.ide.open,
    hitCount: (w.state._semiHits || []).length,
    sample: (w.state._semiHits || [])[0],
  });

  const clickLine = (n1) => {
    w.render();
    const hit = (w.state._semiHits || [])[n1 - 1];
    if (!hit) return { n1, missing: true, hitCount: (w.state._semiHits||[]).length };
    w.state.cursor = { x: hit.x + 20, y: hit.y + 3 };
    w.onPointerDown();
    for (let i=0;i<45;i++) { w.tick(0.016); w.render(); }
    return {
      n1,
      placed: !!(w.state.semiPlaced && w.state.semiPlaced[n1-1]),
      phase: w.state.phase,
      sanity: w.state.sanity,
      sprint: w.state.sprint,
      pending: w.state.pendingFinish,
      ide: w.wins.ide.open,
    };
  };

  log.push(clickLine(1));
  log.push(clickLine(3));
  log.push(clickLine(3)); // re-click placed
  for (const n of [5, 6, 7, 8, 10]) log.push(clickLine(n));
  return log;
});
console.log(JSON.stringify(result, null, 2));
console.log("errors", errors);
const alive = await page.evaluate(() => ({ ok: !!window.corpWin95, phase: window.corpWin95?.state?.phase, pending: window.corpWin95?.state?.pendingFinish }));
await browser.close();
console.log("alive", alive);
