import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const logs=[];
page.on("console", m => logs.push(m.text()));
await page.goto("http://127.0.0.1:8765/?v=tower3", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,2000));
// walk toward door: hold W
await page.keyboard.down("KeyW");
await new Promise(r=>setTimeout(r,3500));
await page.keyboard.up("KeyW");
const mid = await page.evaluate(() => ({
  prompt: document.getElementById("hud-prompt")?.textContent || "",
  body: (document.body.innerText||"").includes("Enter tower") || (document.body.innerText||"").includes("E —"),
}));
await page.keyboard.press("KeyE");
await new Promise(r=>setTimeout(r,800));
const after = await page.evaluate(() => ({
  prompt: document.getElementById("hud-prompt")?.textContent || (document.body.innerText||"").slice(0,160),
  phaseHint: (document.body.innerText||"").slice(0,200),
}));
console.log(JSON.stringify({mid, after, tower: logs.filter(l=>/tower|plaza|lobby|gate/i.test(l)).slice(0,15)}, null, 2));
await browser.close();
