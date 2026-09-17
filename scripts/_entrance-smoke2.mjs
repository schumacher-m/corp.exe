import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
page.on("console", m => { if (/tower|plaza|lobby|gate|corp/i.test(m.text())) console.log("LOG", m.text()); });
await page.goto("http://127.0.0.1:8765/?v=tower3b", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,2500));
// teleport near entrance and probe radii via internals if exposed
const probe = await page.evaluate(() => {
  // find player via window if any
  const g = window;
  // scrape from scene? expose via corpForceDesk existence
  return {
    hasForce: typeof g.corpForceDesk,
    keys: Object.keys(g).filter(k=>/corp|tower|G\b/i.test(k)).slice(0,30),
  };
});
console.log("probe", probe);
// Dispatch keydown through page focus on canvas
await page.click("canvas").catch(()=>{});
// Move player by injecting into G if we can find it
const moved = await page.evaluate(() => {
  // Hack: Tower player is closed over; try walking via synthetic events long enough
  return null;
});
// Use CDP Input for longer walk
for (let i=0;i<40;i++) {
  await page.keyboard.down("w");
  await new Promise(r=>setTimeout(r,100));
  await page.keyboard.up("w");
}
const mid = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
console.log("after short w taps", mid);
// Try teleport by calling enterLobby if exposed - check return API
// Force position: look at Game.js for window exposes
const force = await page.evaluate(() => {
  // last resort: dispatch many keydowns with G
  const c = document.querySelector("canvas");
  c && c.focus();
  return !!c;
});
// Hold W 8s with pointer lock request
await page.evaluate(async () => {
  const c = document.querySelector("canvas");
  if (c) { try { await c.requestPointerLock(); } catch(_){} }
});
await page.keyboard.down("KeyW");
await new Promise(r=>setTimeout(r,8000));
await page.keyboard.up("KeyW");
const afterWalk = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
console.log("after long W", afterWalk);
await page.keyboard.press("KeyE");
await new Promise(r=>setTimeout(r,1000));
console.log("after E", await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || document.body.innerText.slice(0,200)));
await browser.close();
