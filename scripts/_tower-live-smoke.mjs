import puppeteer from "puppeteer-core";
const URL = "https://schumacher-m.github.io/corp.exe/?v=tower2confirm";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const logs = [];
const errs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => errs.push(String(e)));
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
for (let i = 0; i < 60; i++) {
  if (await page.$("#btn-clock-in")) break;
  await new Promise((r) => setTimeout(r, 400));
}
// wait assets / tower init
await new Promise((r) => setTimeout(r, 2000));
const softFail = logs.filter((l) => /tower init soft-fail/i.test(l));
const gate = logs.filter((l) => /tower-gate/i.test(l));
const towerOk = logs.filter((l) => /\[tower\]/.test(l));
await page.click("#btn-clock-in").catch((e) => errs.push("click: " + e));
await new Promise((r) => setTimeout(r, 3000));
const after = {
  prompt: await page.evaluate(() => (document.body.innerText || "").includes("walk to the tower") || (document.getElementById("hud-prompt")?.textContent || "")),
  bodyHint: await page.evaluate(() => {
    const p = document.getElementById("hud-prompt") || document.querySelector("[id*=prompt]");
    return (p?.textContent || document.body.innerText || "").slice(0, 120);
  }),
  softFail,
  gate: logs.filter((l) => /tower-gate/i.test(l)),
  towerLines: logs.filter((l) => /\[tower\]|tower-gate|soft-fail|refusing silent/i.test(l)).slice(0, 40),
  errs: errs.slice(0, 10),
};
console.log(JSON.stringify(after, null, 2));
await browser.close();
