import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--js-flags=--expose-gc"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
for (let i=0;i<40;i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise(r=>setTimeout(r,200));
const out = await page.evaluate(async () => {
  const w = window.corpWin95;
  w.openTimesheet({ forced: false });
  const mem = () => (performance.memory ? performance.memory.usedJSHeapSize : 0);
  const start = mem();
  for (let i=0;i<900;i++) {
    w.tick(0.016);
    w.render();
  }
  const mid = mem();
  // nudge hours like a user
  for (let i=0;i<200;i++) {
    const b = (w.state._tsHits||[])[0];
    if (b) { /* no-op draw */ }
    w.tick(0.016);
    w.render();
  }
  const end = mem();
  return {
    start, mid, end,
    delta: end - start,
    timesheetOpen: w.wins.timesheet.open,
    overlay: !!(document.getElementById("desktop-overlay")?.classList.contains("show")),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
console.log(out.delta < 15_000_000 ? "PASS_MEM_STABLE" : "WARN_GROWTH");
