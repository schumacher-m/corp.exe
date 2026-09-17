/**
 * Win95 virtual desktop -- feature modules installed onto bag `d`.
 * Public API matches former createWin95(copy, hooks).
 */
import * as audio from "../audio/Audio.js";
import { C } from "../util/colors.js";
import { pick } from "../util/pick.js";
import { loadImg } from "../util/loadImg.js";
import {
  W,
  H,
  PIXEL_SCALE,
  TASK_H,
  IDLE_YELLOW,
  IDLE_AWAY,
  JIGGLER_PULSE,
  JIGGLER_SANITY_EVERY,
  JIGGLER_MAX_MASK,
  JIGGLER_AUDIT_MIN,
  JIGGLER_AUDIT_SPAN,
  EMAIL_MIN,
  EMAIL_MAX,
  DAY_GRACE,
  DAY_BEAT_WEIGHTS,
  DAY_BEAT_EDGES,
  DAY_OBLIGATIONS,
  Presence,
} from "../util/constants.js";

import {
  setupAfter_pre,
  setupAfter_tStr,
  setupAfter_mailBucket,
  setupAfter_rebuildDrawBag,
  setupAfter_activePrScript,
  setupAfter_drawStartMenu,
  setupAfter_incidentHeadlines,
} from "./setupDesktop.js";
import { installWindow } from "./Window.js";
import { installModal } from "./Modal.js";
import { installDesktopShell } from "./DesktopShell.js";
import { installTeamsApp } from "../apps/TeamsApp.js";
import { installTimesheetApp } from "../apps/TimesheetApp.js";
import { installPresence } from "../apps/Presence.js";
import { installOutlookApp } from "../apps/OutlookApp.js";
import { installJimboApp } from "../apps/JimboApp.js";
import { installTicketsApp } from "../apps/TicketsApp.js";
import { installPrApp } from "../apps/PrApp.js";
import { installIdeApp } from "../apps/IdeApp.js";
import { installIncident } from "../apps/Incident.js";

export { W, H, PIXEL_SCALE, Presence };

export function createDesktop(copy, hooks) {
  const d = {
    copy,
    hooks,
    audio,
    C,
    W,
    H,
    PIXEL_SCALE,
    TASK_H,
    IDLE_YELLOW,
    IDLE_AWAY,
    JIGGLER_PULSE,
    JIGGLER_SANITY_EVERY,
    JIGGLER_MAX_MASK,
    JIGGLER_AUDIT_MIN,
    JIGGLER_AUDIT_SPAN,
    EMAIL_MIN,
    EMAIL_MAX,
    DAY_GRACE,
    DAY_BEAT_WEIGHTS,
    DAY_BEAT_EDGES,
    DAY_OBLIGATIONS,
    Presence,
    pick,
    loadImg,
  };

  setupAfter_pre(d);

  installWindow(d);
  installModal(d);
  installDesktopShell(d);
  installTeamsApp(d);
  installTimesheetApp(d);
  installPresence(d);
  installOutlookApp(d);
  installJimboApp(d);
  installTicketsApp(d);
  installPrApp(d);
  installIdeApp(d);
  installIncident(d);

  setupAfter_tStr(d);
  setupAfter_mailBucket(d);
  setupAfter_rebuildDrawBag(d);
  setupAfter_activePrScript(d);
  setupAfter_drawStartMenu(d);
  setupAfter_incidentHeadlines(d);

  if (d.copy.slackPool?.length) {
    d.state.slackMsgs.push(d.copy.slackPool[0]);
  }

  return {
    canvas: d.canvas,
    state: d.state,
    wins: d.wins,
    /** Internal bag for smoke/devtools (Start crash hardening). Not a player API. */
    __d: d,
    render: d.render,
    onPointerMove: d.onPointerMove,
    onPointerDown: d.onPointerDown,
    onPointerUp: d.onPointerUp,
    onKey: d.onKey,
    pushSlack: d.pushSlack,
    toast: d.toast,
    raise: d.raise,
    tick: d.tick,
    bumpActivity: d.bumpActivity,
    enableDaySystems: d.enableDaySystems,
    askJimbo: d.askJimbo,
    openJimbo: d.openJimbo,
    Presence: d.Presence,
    toggleJiggler: d.toggleJiggler,
    presenceBlocksBoard: d.presenceBlocksBoard,
    callBlocksBoard: d.callBlocksBoard,
    canClaimTicket: d.canClaimTicket,
    canSubmitTicket: d.canSubmitTicket,
    requestBoardRefill: d.requestBoardRefill,
    requestTimesheetGate: d.requestTimesheetGate,
    clearTimesheetGate: d.clearTimesheetGate,
    flushTimesheetQueue: d.flushTimesheetQueue,
    openTimesheet: d.openTimesheet,
    acceptTimesheet: d.acceptTimesheet,
    needsTimesheetForClockOut: d.needsTimesheetForClockOut,
    openIncident: d.openIncident,
    forceCall: d.forceCall,
    startCallRing: d.startCallRing,
    acceptCall: d.acceptCall,
    declineCall: d.declineCall,
  };
}

/** @deprecated alias -- former win95.js export */
export function createWin95(copy, hooks) {
  return createDesktop(copy, hooks);
}
