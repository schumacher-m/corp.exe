class Ctx {
  constructor(){ this.fillStyle=""; this.font=""; this.strokeStyle=""; this.imageSmoothingEnabled=true; }
  fillRect(){} fillText(){} strokeRect(){} beginPath(){} moveTo(){} lineTo(){} stroke(){}
  save(){} restore(){} translate(){} scale(){} drawImage(){
    if (arguments[0] == null) throw new TypeError("drawImage null img");
  } clearRect(){} fill(){} closePath(){} clip(){}
  setTransform(){} measureText(t){ return { width: String(t).length*5 }; }
  getImageData(){ return { data: new Uint8ClampedArray(4) }; } putImageData(){}
  createLinearGradient(){ return { addColorStop(){} }; }
}
globalThis.document = {
  createElement(tag){
    if(tag==="canvas") return { width:640, height:480, style:{}, getContext(){ return new Ctx(); }, toDataURL(){ return ""; } };
    if(tag==="img") return { complete:false, naturalWidth:0, src:"", addEventListener(){}, onload:null, onerror:null };
    return { style:{}, appendChild(){}, addEventListener(){} };
  },
  body: { appendChild(){} }, getElementById(){ return null; },
};
globalThis.Image = class {
  constructor(){ this.complete=false; this.naturalWidth=0; this.src=""; }
  addEventListener(){}
};
globalThis.Audio = class {
  constructor(){ this._missing=false; this.volume=1; this.loop=false; this.preload=""; this.currentTime=0; }
  play(){return Promise.resolve()} pause(){} cloneNode(){return new Audio()} addEventListener(){}
};
globalThis.performance = { now: () => Date.now() };
globalThis.window = globalThis;
globalThis.HTMLImageElement = globalThis.Image;

import * as audio from "../src/audio/Audio.js";
import { C } from "../src/util/colors.js";
import { pick } from "../src/util/pick.js";
import { loadImg } from "../src/util/loadImg.js";
import * as constants from "../src/util/constants.js";
import {
  setupAfter_pre, setupAfter_tStr, setupAfter_mailBucket, setupAfter_rebuildDrawBag,
  setupAfter_activePrScript, setupAfter_drawStartMenu, setupAfter_incidentHeadlines,
} from "../src/desktop/setupDesktop.js";
import { installWindow } from "../src/desktop/Window.js";
import { installModal } from "../src/desktop/Modal.js";
import { installDesktopShell } from "../src/desktop/DesktopShell.js";
import { installTeamsApp } from "../src/apps/TeamsApp.js";
import { installTimesheetApp } from "../src/apps/TimesheetApp.js";
import { installPresence } from "../src/apps/Presence.js";
import { installOutlookApp } from "../src/apps/OutlookApp.js";
import { installJimboApp } from "../src/apps/JimboApp.js";
import { installTicketsApp } from "../src/apps/TicketsApp.js";
import { installPrApp } from "../src/apps/PrApp.js";
import { installIdeApp } from "../src/apps/IdeApp.js";
import { installIncident } from "../src/apps/Incident.js";
import copy from "../src/copy/copy-data.js";

function makeBag() {
  const d = { copy: structuredClone(copy), hooks: {}, audio, C, pick, loadImg, ...constants };
  setupAfter_pre(d);
  installWindow(d); installModal(d); installDesktopShell(d); installTeamsApp(d);
  installTimesheetApp(d); installPresence(d); installOutlookApp(d); installJimboApp(d);
  installTicketsApp(d); installPrApp(d); installIdeApp(d); installIncident(d);
  setupAfter_tStr(d); setupAfter_mailBucket(d); setupAfter_rebuildDrawBag(d);
  setupAfter_activePrScript(d); setupAfter_drawStartMenu(d); setupAfter_incidentHeadlines(d);
  d.enableDaySystems();
  d.state.standupDone = true;
  return d;
}

function run(name, fn) {
  try { fn(); console.log("OK", name); return true; }
  catch (e) { console.log("FAIL", name, String(e && e.stack || e)); return false; }
}

let fails = 0;

// Path A: timesheet open/close then start spam
fails += !run("pathA", () => {
  const d = makeBag();
  d.requestTimesheetGate("test");
  d.render();
  d.jimboAutoFillTimesheet();
  d.render();
  // X-close path (does not call closeTimesheetWindow)
  d.wins.timesheet.open = false;
  d.render();
  for (let i = 0; i < 40; i++) {
    d.state.startOpen = !d.state.startOpen;
    d.state.startFlyoutIndex = d.state.startOpen ? 0 : -1;
    d.audio.playSfx(d.state.startOpen ? "start" : "click");
    d.render();
    if (d.state.startOpen) {
      const items = d.state._startItems || [];
      if (items[0]) {
        d.onPointerMove(items[0].hit.x + 1, items[0].hit.y + 1);
        d.render();
      }
      const fhits = d.state._startFlyoutHits || [];
      if (fhits[0]) {
        d.onPointerMove(fhits[0].hit.x + 1, fhits[0].hit.y + 1);
        d.render();
      }
    }
  }
  // click Start button
  const btn = d.state._startBtn;
  d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
  for (let i = 0; i < 20; i++) {
    d.onPointerDown(); d.onPointerUp(); d.render();
  }
});

// Path B: dirty imgs + weird flags + null submenu
fails += !run("pathB-null-imgs", () => {
  const d = makeBag();
  for (const k of Object.keys(d.imgs)) d.imgs[k] = null;
  d.state.timesheetGateOpen = true;
  d.state.timesheetQueued = true;
  d.wins.timesheet.open = false;
  d.state.startOpen = true;
  d.state.startFlyoutIndex = 0;
  d.render();
  d.audio.playSfx("start");
  const btn = d.state._startBtn;
  d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
  d.onPointerDown(); d.render();
});

fails += !run("pathB-null-menu-items", () => {
  const d = makeBag();
  d.copy.startMenu.items.push(null, undefined);
  d.copy.startMenu.items[0].submenu.push(null, undefined, { label: null });
  d.state.startOpen = true;
  d.state.startFlyoutIndex = 0;
  d.render();
});

fails += !run("pathB-broken-audio", () => {
  const d = makeBag();
  // break Audio.prototype.cloneNode
  const orig = Audio.prototype.cloneNode;
  Audio.prototype.cloneNode = function() { throw new Error("clone boom"); };
  try {
    d.state.startOpen = true;
    d.audio.playSfx("start");
    d.render();
    const btn = d.state._startBtn;
    d.state.cursor = { x: btn.x + 2, y: btn.y + 2 };
    d.onPointerDown();
  } finally {
    Audio.prototype.cloneNode = orig;
  }
});

fails += !run("pathB-missing-copy", () => {
  const d = makeBag();
  d.copy.startMenu = null;
  d.state.startOpen = true;
  d.render();
});

console.log(fails === 0 ? "ALL_PASS" : `FAILS_${fails}`);
process.exit(fails === 0 ? 0 : 1);
