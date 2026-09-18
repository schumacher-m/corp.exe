import puppeteer from "puppeteer-core";
import { writeFileSync } from "fs";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome", headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540 });
const logs=[];
page.on("console", m => logs.push(m.text()));
await page.goto("http://127.0.0.1:8766/?v=tower9", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,3500));
const prompt = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent);
const clip = await page.evaluate(() => {
  const c=document.querySelector("canvas"); const r=c.getBoundingClientRect();
  return {x:r.left,y:r.top,width:r.width,height:r.height};
});
writeFileSync("/tmp/plaza-tower9.png", await page.screenshot({type:"png", clip: {x:Math.max(0,clip.x),y:Math.max(0,clip.y),width:Math.min(900,clip.width),height:Math.min(500,clip.height)}, encoding:"binary"}));
// walk to door
for (let i=0;i<100;i++){ await page.keyboard.down("w"); await new Promise(r=>setTimeout(r,70)); await page.keyboard.up("w"); }
const mid = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent);
await page.keyboard.press("e");
await new Promise(r=>setTimeout(r,600));
await page.mouse.click(480, 270);
await new Promise(r=>setTimeout(r,800));
const after = await page.evaluate(() => document.getElementById("hud-prompt")?.textContent);
console.log(JSON.stringify({
  prompt, mid, after,
  tower: logs.filter(l=>/tower|prop|gate|farm/i.test(l)).slice(0,20)
}, null, 2));
await browser.close();
