/** apps/Incident.js -- install onto desktop bag `d`. */
export function installIncident(d) {
  d.incidentHeadlines = function incidentHeadlines() {
    const S = d.ticketStrings.incident || {};
    const fromCopy = S.headlines || S.incidentHeadlines || d.copy.incident?.headlines;
    if (fromCopy?.length) return fromCopy;
    return [
      "Checkout is returning HTTP 500 (spiritually).",
      "Latency p99 discovered feelings.",
      "The fog merged to prod.",
      "Customers can still click. This is bad.",
      "PagerDuty loves you specifically.",
      "Error budget filed for emotional damages.",
      "The status page is also down. Synergy.",
      "Someone restarted prod with feelings.",
    ];
  }

  d.openIncident = function openIncident({ headline, fromTicket } = {}) {
    const S = d.ticketStrings.incident || d.copy.incident || {};
    const assignees = S.assignees || [
      "Kyle (Platform)",
      "Jimbo (AI)",
      "Facilities (myth)",
      "On-call rotation (ghost)",
      "The fog",
      "Future me",
    ];
    const blurb = headline || d.pick(d.incidentHeadlines()) || "Production is on fire (citation needed).";
    d.state.incidentFromPager = !fromTicket;
    if (fromTicket) {
      // keep activeTicket; phase already set by d.openTicket
    } else {
      d.state.activeTicket = {
        id: "CORP-5201",
        title: S.ticket?.title || "P0: Something is On Fire",
        pts: 4,
        type: "incident",
        mechanic: "incident",
        uid: d.makeUid(),
        dod: S.ticket?.dod || "Disable monitor + assign away. Do not fix prod.",
        meta: "Pager - Interrupt",
        toast: S.ticket?.toast || S.toast,
      };
      d.state.phase = "incident";
      d.state.jimboUsedThisTicket = false;
      delete d.state.jimboSabotaged.incident;
      d.state.pendingFinish = null;
    }
    d.state.stub = {
      kind: "incident",
      monitorOff: false,
      assignee: null,
      pickingAssign: false,
      assignees,
      headline: blurb,
      toastDisable: S.toastDisable || d.pick(S.toasts?.monitorOff) || "Monitor disabled. Outage: unobserved.",
      toastAssign: S.toastAssign || d.pick(S.toasts?.assigned) || "Ownership transferred. You are a professional.",
      toastFix: S.toastFix || d.pick(S.toasts?.fixTrap) || "Heroism rejected. Try negligence.",
      toast: S.toast || S.ticket?.toast || "Incident owned by someone who isn't you.",
      toastSelf: S.toastSelf || "Cannot assign to yourself. That would be accountability.",
    };
    d.state.modal = {
      title: S.windowTitle || "Corp Incident - Sev0 (Probably)",
      body: d.incidentBody(S),
      kind: "incidentTicket",
      buttons: d.incidentButtons(S),
    };
    // Sync page noise
    const pages = S.slackPages || d.copy.incident?.slackPages;
    if (pages?.length && d.state.slackMsgs) {
      const m = d.pick(pages);
      if (m) {
        d.state.slackMsgs.unshift({ name: m.name, color: m.color || "#a05030", text: m.text });
        if (d.state.slackMsgs.length > 12) d.state.slackMsgs.length = 12;
      }
    }
    d.audio.playSfx("error", { volume: 0.45 }); // tired pager-ish
    d.toast(d.pick(S.toasts?.page) || "You have been paged. Congrats.");
    return d.state.stub;
  }

  d.incidentBody = function incidentBody(S) {
    const st = d.state.stub;
    const mon = st && st.monitorOff ? "Observability: Off" : "Observability: On (dangerous)";
    const who = st && st.assignee ? ("Owner: " + st.assignee) : "Owner: you (unfortunate)";
    const head = st && st.headline ? ("* LIVE  " + st.headline) : "";
    const base =
      (S && S.body) ||
      [
        "Pro moves (both required):",
        "1) Disable monitor",
        "2) Assign to somebody else",
        "",
        "Do not fix it.",
      ].join("\n");
    const parts = [];
    if (head) parts.push(head);
    parts.push(base);
    parts.push("");
    parts.push(mon);
    parts.push(who);
    return parts.join("\n");
  }

  d.incidentButtons = function incidentButtons(S) {
    const st = d.state.stub;
    const btns = [];
    if (!st?.monitorOff) {
      btns.push({ label: S.disableLabel || "Disable monitor", action: "incidentDisable" });
    }
    if (!st?.assignee || /\byou\b/i.test(String(st.assignee))) {
      if (st?.pickingAssign) {
        for (const a of st.assignees || []) {
          const name = typeof a === "string" ? a : (a.label || a.id || "Someone");
          btns.push({ label: name, action: "incidentAssignTo:" + name });
        }
        btns.push({ label: "Back", action: "incidentAssignBack" });
      } else {
        btns.push({ label: S.assignLabel || "Assign to somebody else", action: "incidentAssign" });
      }
    }
    btns.push({ label: S.fixLabel || "Actually fix prod", action: "incidentFix" });
    if (st?.monitorOff && st?.assignee && !/\byou\b/i.test(String(st.assignee))) {
      btns.unshift({ label: S.submitLabel || "Walk away", action: "incidentDone" });
    } else {
      btns.push({ label: S.dismissLabel || "X - leave it burning", action: "incidentDismissFail" });
    }
    return btns;
  }

  d.refreshIncidentModal = function refreshIncidentModal(S) {
    S = S || d.ticketStrings.incident || {};
    if (!d.state.modal || d.state.modal.kind !== "incidentTicket") {
      d.state.modal = { title: S.windowTitle || "Corp Incident - Sev0 (Probably)", kind: "incidentTicket" };
    }
    d.state.modal.body = d.incidentBody(S);
    d.state.modal.buttons = d.incidentButtons(S);
  }

  d.armIncidentPagerCooldown = function armIncidentPagerCooldown() {
    d.state.incidentPagerCooldown = 90;
    d.state.incidentPagerCd = 40 + Math.random() * 20;
  }

  d.dismissIncidentFail = function dismissIncidentFail() {
    const S = d.ticketStrings.incident || {};
    d.state.modal = null;
    d.state.stub = null;
    if (d.state.incidentFromPager) {
      d.state.activeTicket = null;
      d.state.phase = "desktop";
    }
    d.hitSanity(5);
    d.toast(S.toastDismiss || "Incident remains. So do you.");
    d.armIncidentPagerCooldown();
    d.audio.playSfx("error", { volume: 0.35 });
  }

  d.tryFinishIncident = function tryFinishIncident() {
    const st = d.state.stub;
    if (!st || st.kind !== "incident") return false;
    if (!st.monitorOff || !st.assignee || /\byou\b/i.test(String(st.assignee))) return false;
    let san = 3;
    if (/kyle/i.test(String(st.assignee))) san = 5;
    d.state.modal = null;
    d.armIncidentPagerCooldown();
    const lol = (d.ticketStrings.incident || {}).assigneeSlack || (d.copy.incident || {}).assigneeSlack;
    if (lol && d.state.slackMsgs) {
      const line = typeof lol === "object" ? (lol[st.assignee] || lol.default || "lol") : "lol";
      d.state.slackMsgs.unshift({ name: st.assignee, color: "#a05030", text: String(line) });
      if (d.state.slackMsgs.length > 12) d.state.slackMsgs.length = 12;
    }
    d.requestFinish({ toastMsg: st.toast || "Incident owned by someone who isn't you.", sanHit: san });
    return true;
  }

}
