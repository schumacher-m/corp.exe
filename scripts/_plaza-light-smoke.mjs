import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540 });
await page.goto("http://127.0.0.1:8765/?v=tower5", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,3000));
const stats = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (!c) return { err: "no canvas" };
  // read from display canvas - may be CSS scaled; use WebGL read via copy
  // fallback: screenshot-like draw to 2d
  const w = c.width, h = c.height;
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  // can't easily read WebGL from here if context is owned. Use Offscreen by drawing?
  return { w, h, prompt: document.getElementById("hud-prompt")?.textContent || "" };
});
const shot = await page.screenshot({ encoding: "binary", type: "png", clip: { x: 0, y: 40, width: 960, height: 400 } });
import { writeFileSync } from "fs";
writeFileSync("/tmp/plaza-tower5.png", shot);
// avg luminance via sharp or pure decode - use bun canvas? python PIL
console.log(JSON.stringify(stats));
await browser.close();
