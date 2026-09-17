import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const logs=[];
page.on('console', m => logs.push(m.text()));
await page.goto("http://127.0.0.1:8765/?v=tower1", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i=0;i<40;i++) {
  if (await page.evaluate(() => !!document.getElementById('btn-clock-in'))) break;
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(async () => {
  // wait assets
  for (let i=0;i<50;i++) {
    if (window.corpForceDesk || document.getElementById('btn-clock-in')) break;
    await new Promise(r=>setTimeout(r,200));
  }
});
await page.click('#btn-clock-in').catch(()=>{});
await new Promise(r=>setTimeout(r,2500));
const state = await page.evaluate(() => {
  const g = window.__G || null;
  // try find phase via corp internals
  return {
    phaseHint: (document.body.innerText||'').slice(0,80),
    hasForceDesk: typeof window.corpForceDesk === 'function',
  };
});
const towerLog = logs.filter(l => /tower-gate|plaza|Tower/i.test(l));
console.log(JSON.stringify({state, towerLog: towerLog.slice(0,10), logs: logs.filter(l=>/corp|tower|plaza|farm/i.test(l)).slice(0,20)}, null, 2));
await browser.close();
