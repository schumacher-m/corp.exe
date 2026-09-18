import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8766/?v=tower8", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(async () => { try { await document.querySelector("canvas")?.requestPointerLock(); } catch(_){} });
await page.keyboard.down("KeyW");
await new Promise(r=>setTimeout(r,7000));
await page.keyboard.up("KeyW");
const near = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
await page.keyboard.press("KeyE");
await new Promise(r=>setTimeout(r,1000));
const lobby = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
console.log(JSON.stringify({ near, lobby }, null, 2));
await browser.close();
