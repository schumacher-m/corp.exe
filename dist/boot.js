/* corp.exe — integer scale #stage to fill #viewport (Designer pipeline) */
(function () {
  const STAGE_W = 320;
  const STAGE_H = 240;
  const stage = document.getElementById("stage");
  if (!stage) return;

  function fit() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const n = Math.max(1, Math.floor(Math.min(vw / STAGE_W, vh / STAGE_H)));
    stage.style.transform = "scale(" + n + ")";
  }

  fit();
  window.addEventListener("resize", fit);
})();
