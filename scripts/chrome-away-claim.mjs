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

  // 1) Excuse button via handleModalClick
  d.forceAwayMail();
  d.render();
  const btn = (d.state._modalBtns||[])[0];
  if (!btn) return { err: "no modal btns", log };
  d.handleModalClick(btn.hit.x + btn.hit.w/2, btn.hit.y + btn.hit.h/2);
  log.push({
    step: "excuseBtn",
    presenceForced: !!d.state.presenceForced,
    canClaim: d.canClaimTicket(),
    modal: !!d.state.modal,
  });

  // 2) Backdrop click must clear Away (body pretend-OK)
  d.forceAwayMail();
  d.render();
  d.onPointerDown(); // cursor may be elsewhere — set body click
  d.state.cursor = { x: d.W / 2, y: 72 };
  d.handleModalClick(d.state.cursor.x, d.state.cursor.y);
  log.push({
    step: "backdrop",
    presenceForced: !!d.state.presenceForced,
    canClaim: d.canClaimTicket(),
    modal: !!d.state.modal,
    presence: d.state.presence,
  });

  // 3) Orphan forced (modal cleared wrongly) must heal on claim check
  d.state.presenceForced = true;
  d.state.presence = d.Presence.AWAY;
  d.state.modal = null;
  const blocks = d.presenceBlocksBoard();
  log.push({
    step: "orphanHeal",
    blocks,
    presenceForced: !!d.state.presenceForced,
    presence: d.state.presence,
    canClaim: d.canClaimTicket(),
  });

  // 4) Stale fillerDone hits must not softlock (Away path ignores non-excuse)
  d.forceAwayMail();
  d.state._modalBtns = [{
    hit: { x: 0, y: 0, w: d.W, h: d.H },
    action: "fillerDone",
    label: "STALE",
  }];
  d.handleModalClick(d.W / 2, d.H / 2);
  log.push({
    step: "staleFiller",
    presenceForced: !!d.state.presenceForced,
    modal: d.state.modal?.kind || null,
    canClaim: d.canClaimTicket(),
    presence: d.state.presence,
  });

  // Claim opener
  const tk = d.state.board[0];
  d.openTicket(tk);
  log.push({
    step: "afterOpen",
    phase: d.state.phase,
    active: d.state.activeTicket?.id,
  });

  const ok =
    log[0].canClaim && !log[0].presenceForced &&
    log[1].canClaim && !log[1].presenceForced &&
    !log[2].blocks && !log[2].presenceForced &&
    log[3].canClaim && !log[3].presenceForced &&
    !!log[4].active;

  return { log, ok };
});
console.log(JSON.stringify(result, null, 2));
console.log(result.ok ? "AWAY_CLAIM_PASS" : "AWAY_CLAIM_FAIL");
await browser.close();
process.exit(result.ok ? 0 : 1);
