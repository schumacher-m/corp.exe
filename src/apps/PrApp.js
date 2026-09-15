/** apps/PrApp.js -- install onto desktop bag `d`. */
export function installPrApp(d) {
  d.pickPrRound = function pickPrRound(pool, max = d.PR_ROUND_MAX) {
    const src = Array.isArray(pool) ? pool.slice() : [];
    if (src.length <= max) return src;
    // Fisher-Yates partial shuffle
    for (let i = src.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = src[i];
      src[i] = src[j];
      src[j] = tmp;
    }
    return src.slice(0, max);
  }

  d.activePrScript = function activePrScript() {
    if (d.state.prRoundScript && d.state.prRoundScript.length) return d.state.prRoundScript;
    if (d.state.phase === "spacewar") return d.copy.spaceWarScript || d.copy.prScript || [];
    return d.copy.prScript || [];
  }

  d.drawPr = function drawPr(x, y, w, h) {
    d.bevelSunken(x, y, w, h, d.C.white);
    const step = d.state.prStep;
    const script = d.activePrScript();
    d.ctx.font = "7px Tahoma, sans-serif";
    let yy = y + 10;
    d.ctx.fillStyle = "#800000";
    d.ctx.fillText("Kyle:", x + 4, yy);
    yy += 10;
    const kyleLine = d.state.prBubbles.length
      ? d.state.prBubbles.filter((b) => b.who === "kyle").slice(-1)[0]?.t
      : script[0]?.kyle;
    d.ctx.fillStyle = d.C.text;
    for (const ln of d.wrap(kyleLine || "", 42)) {
      d.ctx.fillText(ln, x + 4, yy);
      yy += 9;
    }
    if (d.state.prJimboNit) {
      yy += 2;
      d.ctx.fillStyle = d.C.jimbo;
      d.ctx.fillText("Jimbo:", x + 4, yy);
      yy += 9;
      d.ctx.fillStyle = d.C.text;
      for (const ln of d.wrap(d.state.prJimboNit, 42).slice(0, 2)) {
        d.ctx.fillText(ln, x + 4, yy);
        yy += 9;
      }
    }
    yy += 6;
    if (step < script.length) {
      const choices = script[step].choices;
      d.state._prChoices = [];
      choices.forEach((c) => {
        d.bevelRaised(x + 4, yy, w - 8, 16, d.C.face);
        d.ctx.fillStyle = d.C.text;
        d.ctx.fillText(c.t.slice(0, 44), x + 8, yy + 11);
        d.state._prChoices.push({ ...c, hit: { x: x + 4, y: yy, w: w - 8, h: 16 } });
        yy += 20;
      });
    } else {
      d.ctx.fillStyle = d.C.sick;
      const end = (d.copy.prEndLines && d.copy.prEndLines[0]) || "LGTM (reluctantly)";
      d.ctx.fillText(end, x + 4, yy);
      if (d.state.pendingFinish?.type === "pr" || d.state.pendingFinish?.type === "spacewar") {
        yy += 12;
        d.bevelRaised(x + 4, yy, 80, 14, d.C.jimbo);
        d.ctx.fillStyle = d.C.inv;
        d.ctx.font = "bold 8px Tahoma, sans-serif";
        d.ctx.fillText("SUBMIT PR", x + 12, yy + 10);
        d.state._submitBtn = { x: x + 4, y: yy, w: 80, h: 14 };
      }
    }
  }

  d.choosePr = function choosePr(c) {
    d.bumpActivity();
    d.state.prBubbles.push({ who: "you", t: c.t });
    d.state.sanity = Math.max(0, Math.min(100, d.state.sanity + c.s));
    d.audio.playSfx("click");
    if (c.d) {
      d.state.prStep++;
      const script = d.activePrScript();
      if (d.state.prStep >= script.length) {
        const end =
          d.state.phase === "spacewar"
            ? d.tStr("spacewar", "lgtm", (d.copy.prEndLines && d.copy.prEndLines[0]) || "LGTM if we squash and never speak of spaces again.")
            : (d.copy.prEndLines && d.copy.prEndLines[0]) || "Approved with comments.";
        d.state.prBubbles.push({ who: "kyle", t: end });
        const pts = d.state.activeTicket?.pts || 8;
        const ftype = d.state.phase === "spacewar" ? "spacewar" : "pr";
        const toastMsg =
          d.state.activeTicket?.toast ||
          (ftype === "spacewar" ? d.tStr("spacewar", "toast", "Peace was a formatting option.") : null);
        d.hooks.onPrClose?.();
        if (d.state.jimboUsedThisTicket) {
          setTimeout(
            () =>
              d.finishTicket(ftype, pts, {
                toastMsg,
                sanHit: ftype === "spacewar" ? 3 : 0,
              }),
            400
          );
        } else {
          d.state.pendingFinish = {
            type: ftype,
            pts,
            toastMsg,
            sanHit: ftype === "spacewar" ? 3 : 0,
          };
          d.toast("Ask Jimbo before submit");
        }
        return;
      }
      d.state.prBubbles.push({ who: "kyle", t: script[d.state.prStep].kyle });
      d.pushSlack({ name: "Kyle", color: "#a05030", text: "Left another comment on your PR." });
    } else {
      d.state.prBubbles.push({
        who: "kyle",
        t: "Still blocked. Please reread the style guide (all 84 pages).",
      });
      d.toast("Kyle is unmoved");
    }
  }

}
