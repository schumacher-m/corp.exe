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
  ],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i = 0; i < 50; i++) {
  if (await page.evaluate(() => typeof window.corpForceDesk === "function")) break;
  await new Promise((r) => setTimeout(r, 400));
}
await page.evaluate(() => window.corpForceDesk());
await new Promise((r) => setTimeout(r, 500));

const result = await page.evaluate(() => {
  const w = window.corpWin95;
  const log = [];

  const opening = (w.state.board || []).map((t) => ({ type: t.type, id: t.id }));
  log.push({
    step: "opening_board",
    types: opening.map((t) => t.type),
    hasDropdb: opening.some((t) => t.type === "dropdb"),
  });

  // Force dropdb onto board via cloneTicket + openTicket (internal bag)
  const d = w.__d;
  w.state.closedCount = Math.max(1, w.state.closedCount || 0);
  const tmpl =
    (d.playableTemplates || []).find((t) => t.type === "dropdb") || {
      id: "CORP-5201",
      title: "Urgent prod data cleanup",
      pts: 2,
      type: "dropdb",
      dod: "Run the approved migration. The approved migration is DROP DATABASE corp;",
      meta: "Sev: P0",
    };
  const tk = d.cloneTicket(tmpl);
  tk.uid = "tk-smoke-dropdb";
  w.state.board = [tk, ...w.state.board.filter((t) => t.type !== "dropdb")].slice(0, 3);
  w.wins.tickets.open = true;
  w.raise("tickets");
  d.openTicket(tk);
  w.render();
  log.push({
    step: "opened",
    phase: w.state.phase,
    ide: w.wins.ide.open,
    title: w.wins.ide.title,
    sqlBuffer: w.state.sqlBuffer,
    chipCount: (w.state._sqlChipHits || []).length,
    chips: (w.state._sqlChipHits || []).map((c) => c.chip),
    hasRun: !!w.state._sqlRunBtn,
  });

  // Wrong SQL via typing into buffer + Run click
  w.state.sqlBuffer = "DROP TABLE corp;";
  w.render();
  const runWrong = w.state._sqlRunBtn;
  if (runWrong) {
    w.state.cursor = { x: runWrong.x + 4, y: runWrong.y + 4 };
    w.onPointerDown();
  }
  w.render();
  log.push({
    step: "wrong_sql",
    phase: w.state.phase,
    ideOpen: w.wins.ide.open,
    bufferKept: w.state.sqlBuffer,
    toast: w.state.toast,
  });

  // Chip assemble
  w.state.sqlBuffer = "";
  const clickChip = (name) => {
    w.render();
    const hit = (w.state._sqlChipHits || []).find((c) => c.chip === name);
    if (!hit) return { name, missing: true, chips: (w.state._sqlChipHits || []).map((c) => c.chip) };
    w.state.cursor = { x: hit.hit.x + 4, y: hit.hit.y + 4 };
    w.onPointerDown();
    w.render();
    return { name, buffer: w.state.sqlBuffer };
  };
  log.push(clickChip("DROP"));
  log.push(clickChip("DATABASE"));
  log.push(clickChip("corp"));
  log.push(clickChip(";"));

  const beforeClose = w.state.closedCount;
  const beforeSprint = w.state.sprint;
  const beforeSan = w.state.sanity;
  w.render();
  const runOk = w.state._sqlRunBtn;
  if (runOk) {
    w.state.cursor = { x: runOk.x + 4, y: runOk.y + 4 };
    w.onPointerDown();
  }
  for (let i = 0; i < 30; i++) {
    w.tick(0.016);
    w.render();
  }
  log.push({
    step: "success_run",
    phase: w.state.phase,
    ideOpen: w.wins.ide.open,
    closedDelta: w.state.closedCount - beforeClose,
    sprintDelta: w.state.sprint - beforeSprint,
    sanDelta: beforeSan - w.state.sanity,
    toast: w.state.toast,
    boardHasDropdb: w.state.board.some((t) => t.uid === "tk-smoke-dropdb"),
  });

  // Jimbo autofill on fresh dropdb
  const tk2 = d.cloneTicket(tmpl);
  tk2.uid = "tk-smoke-dropdb-2";
  w.state.board.push(tk2);
  w.wins.tickets.open = true;
  w.raise("tickets");
  d.openTicket(tk2);
  w.render();
  w.state.sqlBuffer = "garbage";
  w.askJimbo();
  w.render();
  log.push({
    step: "jimbo_autofill",
    phase: w.state.phase,
    buffer: w.state.sqlBuffer,
    jimboUsed: w.state.jimboUsedThisTicket,
    sabotaged: !!(w.state.jimboSabotaged && w.state.jimboSabotaged.dropdb),
    toast: w.state.toast,
  });

  return log;
});

console.log(JSON.stringify(result, null, 2));
console.log("errors", errors);
const alive = await page.evaluate(() => ({
  ok: !!window.corpWin95,
  phase: window.corpWin95?.state?.phase,
}));
await browser.close();
console.log("alive", alive);

// Source-level PLAYABLE check (not on facade)
import { readFileSync } from "fs";
const setup = readFileSync("/workspace/corp-html/src/desktop/setupDesktop.js", "utf8");
const coreOk = /CORE_TYPES = \[[^\]]*\"dropdb\"/.test(setup);
console.log("CORE_TYPES includes dropdb:", coreOk);
