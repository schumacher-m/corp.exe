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
await new Promise(r=>setTimeout(r,400));

const result = await page.evaluate(() => {
  const d = window.corpWin95.__d;
  const log = [];
  // Force Away
  d.forceAwayMail();
  log.push({
    step: "forced",
    presenceForced: !!d.state.presenceForced,
    blocks: d.presenceBlocksBoard(),
    canClaim: d.canClaimTicket(),
    modalKind: d.state.modal?.kind,
    btnActions: (d.state._modalBtns||[]).map(b=>b.action), // may be empty until render
  });
  d.render();
  log.push({
    step: "afterRender",
    btnActions: (d.state._modalBtns||[]).map(b => ({ action: b.action, excuseId: b.excuseId, hasSanity: b.sanityHit!=null })),
  });

  // Simulate clicking first excuse button via handleModalClick at hit center
  const btn = (d.state._modalBtns||[])[0];
  if (!btn) return { err: "no modal btns", log };
  d.state.cursor = { x: btn.hit.x + btn.hit.w/2, y: btn.hit.y + btn.hit.h/2 };
  d.handleModalClick(d.state.cursor.x, d.state.cursor.y);
  log.push({
    step: "afterExcuseClick",
    presenceForced: !!d.state.presenceForced,
    blocks: d.presenceBlocksBoard(),
    canClaim: d.canClaimTicket(),
    modal: !!d.state.modal,
    toast: d.state.toast,
  });

  // Claim opener ticket
  const tk = d.state.board[0];
  d.openTicket(tk);
  log.push({
    step: "afterOpen",
    phase: d.state.phase,
    active: d.state.activeTicket?.id,
    toast: d.state.toast,
  });

  return {
    log,
    cleared: !log[2].presenceForced && log[2].canClaim,
    claimed: !!log[3].active && log[3].phase !== "desktop",
  };
});
console.log(JSON.stringify(result, null, 2));
const ok = result.cleared && result.claimed;
console.log(ok ? "AWAY_CLAIM_PASS" : "AWAY_CLAIM_FAIL");
await browser.close();
process.exit(ok ? 0 : 1);
