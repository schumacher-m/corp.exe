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
for (let i = 0; i < 30; i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise((r) => setTimeout(r, 400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise((r) => setTimeout(r, 200));

const out = await page.evaluate(() => {
  const w = window.corpWin95;
  w.render();
  const hits = w.state._deskIconHits || [];
  const hit = (r, x, y) => r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
  const who = (x, y) => {
    for (const ic of hits) if (hit(ic.hit, x, y)) return ic.id;
    return null;
  };
  const ts = hits.find((h) => h.id === "timesheet");
  const jig = hits.find((h) => h.id === "jiggler");
  if (!ts) return { error: "no timesheet hit", hits };
  w.state.cursor = { x: ts.hit.x + 20, y: ts.hit.y + 20 };
  w.state.jimboJiggler = false;
  w.state.toast = null;
  w.wins.timesheet.open = false;
  w.onPointerDown();
  return {
    hits: hits.map((h) => ({ id: h.id, ...h.hit })),
    whoTs: who(ts.hit.x + 20, ts.hit.y + 20),
    whoJig: jig ? who(jig.hit.x + 20, jig.hit.y + 20) : null,
    afterClick: {
      jiggler: w.state.jimboJiggler,
      timesheetOpen: !!w.wins.timesheet.open,
      toast: w.state.toast,
    },
  };
});
console.log(JSON.stringify(out, null, 2));
if (errors.length) console.log("errors", errors.slice(0, 5));
const ok = out.afterClick && out.afterClick.timesheetOpen && !out.afterClick.jiggler && out.whoTs === "timesheet";
await browser.close();
console.log(ok ? "PASS_TIMESHEET_HIT" : "FAIL");
process.exit(ok ? 0 : 1);
