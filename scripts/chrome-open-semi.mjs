import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
for (let i=0;i<40;i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise(r=>setTimeout(r,300));

const result = await page.evaluate(() => {
  const w = window.corpWin95;
  w.wins.tickets.open = true;
  w.raise("tickets");
  w.render();
  const row = (w.state.board || []).find(t => t.id === "CORP-401" || t.type === "semi");
  const hit = row._hit;
  const trials = [];
  for (const [name, cx] of [["leftish", hit.x + 30], ["mid", hit.x + 80], ["sp", hit.x + hit.w - 20]]) {
    w.state.phase = "desktop";
    w.state.activeTicket = null;
    w.state.semiLines = null;
    w.state.semiPlaced = null;
    w.wins.ide.open = false;
    w.wins.ide.title = "IDE - fog.js";
    w.wins.slack.open = true;
    w.state.jimboJiggler = false;
    w.render();
    w.state.cursor = { x: cx, y: hit.y + 6 };
    w.onPointerDown();
    for (let i=0;i<60;i++) { w.tick(0.016); w.render(); }
    trials.push({
      name, cx,
      phase: w.state.phase,
      ide: w.wins.ide.open,
      active: w.state.activeTicket && w.state.activeTicket.id,
      jiggler: w.state.jimboJiggler,
      title: w.wins.ide.title,
    });
  }
  return trials;
});
console.log(JSON.stringify(result, null, 2));
console.log("errors", errors);
const ok = result.every(t => t.phase === "semi" && t.active === "CORP-401" && t.ide);
await browser.close();
console.log(ok ? "PASS_ALL_CLICKS_OPEN_SEMI" : "FAIL");
process.exit(ok ? 0 : 1);
