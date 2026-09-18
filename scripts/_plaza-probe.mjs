import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8766/?v=tower5d", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<50;i++){ if(await page.$("#btn-clock-in")) break; await new Promise(r=>setTimeout(r,300)); }
await page.click("#btn-clock-in");
await new Promise(r=>setTimeout(r,4000));
const probe = await page.evaluate(() => {
  // Walk three from module? not global.
  // Sample canvas pixels by drawing to 2d
  const c = document.getElementById("game-canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return { err: "no gl" };
  const w = c.width, h = c.height;
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  let sum=0, n=0, black=0;
  for (let i=0;i<buf.length;i+=4) {
    const y = 0.2126*buf[i]+0.7152*buf[i+1]+0.0722*buf[i+2];
    sum += y; n++; if (y < 8) black++;
  }
  // center pixel
  const cx = (Math.floor(h/2)*w + Math.floor(w/2))*4;
  return {
    avg: sum/n,
    blackPct: 100*black/n,
    center: [buf[cx], buf[cx+1], buf[cx+2]],
    corner: [buf[0], buf[1], buf[2]],
    prompt: document.getElementById("hud-prompt")?.textContent,
  };
});
console.log(JSON.stringify(probe, null, 2));
await browser.close();
