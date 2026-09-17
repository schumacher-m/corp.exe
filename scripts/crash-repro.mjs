class Ctx {
  constructor(){ this.fillStyle=""; this.font=""; }
  fillRect(){} fillText(){} strokeRect(){} beginPath(){} moveTo(){} lineTo(){} stroke(){}
  save(){} restore(){} translate(){} scale(){} drawImage(){} clearRect(){} fill(){} closePath(){} clip(){}
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
  constructor(){ this._missing=true; this.volume=1; this.loop=false; this.preload=""; }
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

const d = { copy: structuredClone(copy), hooks: {}, audio, C, pick, loadImg, ...constants };
setupAfter_pre(d);
installWindow(d); installModal(d); installDesktopShell(d); installTeamsApp(d);
installTimesheetApp(d); installPresence(d); installOutlookApp(d); installJimboApp(d);
installTicketsApp(d); installPrApp(d); installIdeApp(d); installIncident(d);
setupAfter_tStr(d); setupAfter_mailBucket(d); setupAfter_rebuildDrawBag(d);
setupAfter_activePrScript(d); setupAfter_drawStartMenu(d); setupAfter_incidentHeadlines(d);

console.log("bag ok board", d.state.board.length);

const semi = d.cloneTicket(d.playableTemplates.find(t=>t.type==="semi"));
d.state.board = [semi];
d.openTicket(semi);
console.log("opened phase", d.state.phase);

for (const i of [0,2,4,5]) { d.trySemi(i); }
console.log("clicks ok placed", d.state.semiPlaced.filter(Boolean).length, "pending", d.state.pendingFinish);

for (let n=0;n<50;n++) d.askJimbo();
console.log("ask spam ok sanity", d.state.sanity, "active", !!d.state.activeTicket, "semiStyle", d.state.semiStyle?.mode);

// guide mode mutation stress
d.state.jimboSabotaged = {};
d.state.jimboUsedThisTicket = false;
for (let n=0;n<20;n++) {
  d.state.jimboSabotaged = {};
  d.state.jimboUsedThisTicket = false;
  d.applySabotage("semi");
}
console.log("semi needs after sabotage spam", d.copy.semiLines.map(l=>l.need));

d.state.semiPlaced = d.copy.semiLines.map(()=>false);
d.state.jimboUsedThisTicket = false;
d.state.pendingFinish = null;
d.state.jimboSabotaged = {};
for (let i=0;i<d.copy.semiLines.length;i++) if (d.copy.semiLines[i].need) d.trySemi(i);
console.log("all need pending", d.state.pendingFinish);
d.askJimbo();
console.log("after complete+jimbo board", d.state.board.length, "active", d.state.activeTicket, "closed", d.state.closedCount);

const savedP = d.playableTemplates;
const savedF = d.fillerTemplates;
d.playableTemplates = [];
d.fillerTemplates = [];
d.state.drawBag = [];
d.state.board = [];
d.state.activeTicket = null;
const t0 = Date.now();
d.spawnTicket();
d.spawnTicket({forceFiller:true});
let guard=0; while(d.state.board.length<2 && guard++<20) d.spawnTicket({forceFiller:true});
console.log("empty templates board", d.state.board.length, "ms", Date.now()-t0);
d.playableTemplates = savedP;
d.fillerTemplates = savedF;

d.state.board = [d.cloneTicket({id:"x",type:"filler",pts:1,title:"x"})];
d.openTicket(d.state.board[0]);
d.state.jimboUsedThisTicket = true;
let reenter = 0;
const orig = d._finishTicketBody;
d._finishTicketBody = function(...a){ reenter++; if(reenter===1) d.finishTicket("filler",1); return orig.apply(this,a); };
d.finishTicket("filler",1);
console.log("reenter count", reenter, "flag", d.state._finishingTicket);

// OLD infinite while simulation: spawn that no-ops
console.log("PASS");
