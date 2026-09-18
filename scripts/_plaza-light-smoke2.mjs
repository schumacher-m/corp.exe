import puppeteer from "puppeteer-core";
import { writeFileSync } from "fs";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540 });
const logs=[];
page.on("console", (m) => { const t=m.text(); if (/tower|gate|corp|WebGL|error/i.test(t)) logs.push(t); });
page.on("pageerror", (e) => logs.push("PAGEERR "+e));
await page.goto("http://127.0.0.1:8766/?v=tower5", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,4000));
const info = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  // sample fog/lights if exposed - not
  return {
    cw:c.width, ch:c.height, cssW:r.width, cssH:r.height, left:r.left, top:r.top,
    prompt: document.getElementById("hud-prompt")?.textContent,
    bodyClass: document.body.className,
    activeScreen: [...document.querySelectorAll(".screen.active, .active")].map(e=>e.id).slice(0,8),
  };
});
const clip = {
  x: Math.max(0, Math.floor(info.left)),
  y: Math.max(0, Math.floor(info.top)),
  width: Math.max(32, Math.min(900, Math.floor(info.cssW || 320))),
  height: Math.max(32, Math.min(500, Math.floor(info.cssH || 240))),
};
const shot = await page.screenshot({ type: "png", clip, encoding: "binary" });
writeFileSync("/tmp/plaza-canvas.png", shot);
writeFileSync("/tmp/plaza-full.png", await page.screenshot({ type: "png", encoding: "binary" }));
console.log(JSON.stringify({ info, clip, logs: logs.slice(0,20) }, null, 2));
await browser.close();
