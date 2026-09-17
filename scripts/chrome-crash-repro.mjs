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
const page = await browser.newPage();
page.setDefaultTimeout(90000);
const errors = [];
const logs = [];
page.on("pageerror", (e) => errors.push("pageerror:" + String(e)));
page.on("console", (m) => logs.push(m.type() + ":" + m.text()));

await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
for (let i = 0; i < 40; i++) {
  const st = await page.evaluate(() => ({
    win95: typeof window.corpWin95,
    force: typeof window.corpForceDesk,
    phase: window.corpWin95?.state?.phase,
  }));
  console.log("poll", i, st);
  if (st.force === "function") break;
  await new Promise((r) => setTimeout(r, 500));
}
console.log("errors so far", errors.slice(0, 15));
console.log("logs", logs.filter((l) => /error|Error|fail/i.test(l)).slice(0, 20));

const ready = await page.evaluate(() => typeof window.corpForceDesk === "function");
if (!ready) {
  console.log("NOT READY");
  await browser.close();
  process.exit(2);
}

await page.evaluate(() => window.corpForceDesk());
await new Promise((r) => setTimeout(r, 300));

const run = await page.evaluate(() => {
  const w = window.corpWin95;
  const out = { steps: [] };
  const openSemi = () => {
    const tk = {
      id: "CORP-401",
      title: "Semicolon Hell",
      pts: 3,
      type: "semi",
      mechanic: "semi",
      uid: "tk-" + Math.random().toString(16).slice(2),
      dod: "x",
      meta: "x",
    };
    w.state.board = [tk, ...(w.state.board || [])].slice(0, 3);
    w.state.activeTicket = tk;
    w.state.jimboUsedThisTicket = false;
    w.state.pendingFinish = null;
    w.state.semiStyle = null;
    w.state.semiLines = null;
    w.state.semiPlaced = null;
    w.state.jimboSabotaged = {};
    w.state.phase = "semi";
    w.wins.ide.open = true;
    w.raise("ide");
    w.render();
    return tk;
  };

  // Path A: clicks 1,3,5,6 equivalent via ; for first 4 needs? Better: place indices 0,2,4,5
  openSemi();
  // ensure lines exist
  w.render();
  const lines = w.state.semiLines || [];
  out.steps.push({ step: "opened", needs: lines.filter((l) => l.need).length, n: lines.length });

  // Simulate trySemi via onKey only places next need — instead place by mutating then calling onKey won't work.
  // Use public onKey ';' for all needs
  for (let n = 0; n < 4; n++) w.onKey({ key: ";" });
  out.steps.push({
    step: "fourSemi",
    placed: (w.state.semiPlaced || []).filter(Boolean).length,
    pending: w.state.pendingFinish,
    phase: w.state.phase,
  });

  // Ask Jimbo spam while mid-puzzle
  for (let i = 0; i < 12; i++) w.askJimbo();
  out.steps.push({
    step: "jimboSpam",
    sanity: w.state.sanity,
    active: !!w.state.activeTicket,
    phase: w.state.phase,
    closed: w.state.closedCount,
    board: w.state.board.length,
  });

  // Complete remaining ; then ask once to finish
  for (let n = 0; n < 20; n++) w.onKey({ key: ";" });
  out.steps.push({
    step: "allSemi",
    placed: (w.state.semiPlaced || []).filter(Boolean).length,
    pending: w.state.pendingFinish,
    jimboUsed: w.state.jimboUsedThisTicket,
  });
  if (w.state.pendingFinish) w.askJimbo();
  else if (w.state.jimboUsedThisTicket && w.state.activeTicket) {
    // already used jimbo mid-puzzle; finishing should have auto-fired on last ;
    // if still active, force finish
  }
  out.steps.push({
    step: "afterFinish",
    active: w.state.activeTicket,
    phase: w.state.phase,
    closed: w.state.closedCount,
    board: w.state.board.length,
  });

  // Path B: pendingFinish then ask many times
  openSemi();
  for (let n = 0; n < 20; n++) w.onKey({ key: ";" });
  const beforeAsk = { pending: !!w.state.pendingFinish, placed: (w.state.semiPlaced || []).filter(Boolean).length };
  for (let i = 0; i < 8; i++) w.askJimbo();
  out.steps.push({
    step: "pendingThenAskSpam",
    beforeAsk,
    active: !!w.state.activeTicket,
    closed: w.state.closedCount,
    board: w.state.board.length,
    phase: w.state.phase,
  });

  out.alive = true;
  out.phase = w.state.phase;
  return out;
});

console.log(JSON.stringify(run, null, 2));
console.log("final errors", errors.slice(0, 20));
await browser.close();
console.log(errors.some((e) => /pageerror/.test(e)) ? "HAD_PAGEERRORS" : "PASS_CHROME");
