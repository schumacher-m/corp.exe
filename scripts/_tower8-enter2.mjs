import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const logs=[];
page.on("console", m => { if (/tower|gate/i.test(m.text())) logs.push(m.text()); });
await page.goto("http://127.0.0.1:8766/?v=tower8b", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,3000));
await page.click("canvas").catch(()=>{});
await page.evaluate(async () => { try { await document.querySelector("canvas")?.requestPointerLock(); } catch(_){} });
// tap W repeatedly like successful earlier smoke
for (let i=0;i<80;i++) {
  await page.keyboard.down("w");
  await new Promise(r=>setTimeout(r,100));
  await page.keyboard.up("w");
}
const mid = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
await page.keyboard.press("KeyE");
await new Promise(r=>setTimeout(r,900));
const after = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent || "");
console.log(JSON.stringify({ mid, after, logs: logs.slice(0,8) }, null, 2));
await browser.close();
