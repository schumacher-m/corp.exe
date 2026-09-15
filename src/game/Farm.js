/**
 * Cubicle farm -- neighbor fidget + shared worker list (FARM.md).
 * Bay construction stays in Game.loadOffice for GLTF/context wiring.
 */
export const farmWorkers = [];

export function updateFarmFidget(farmWorkers, time) {
  if (!farmWorkers.length) return;
  const deg1 = Math.PI / 180;
  const deg2 = 2 * Math.PI / 180;
  for (let i = 0; i < farmWorkers.length; i++) {
    const w = farmWorkers[i];
    const t = time + (w.seed || 0) * 0.17;
    if (w.designer) {
      // Exact FARM.md loop on empties
      if (w.torso) w.torso.rotation.x = Math.sin(t * 0.7) * deg1;
      if (w.head) w.head.rotation.x = Math.sin(t * 1.3) * deg2;
      if (w.armL) w.armL.rotation.x = Math.sin(t * 8.0) * 0.08;
      if (w.armR) w.armR.rotation.x = Math.sin(t * 8.0 + 0.9) * 0.08;
    } else {
      // Fallback proxy fidget (kyle/blocky)
      const ph = w.phase || 0;
      if (w.head) {
        w.head.position.y = w.headBaseY + Math.sin(t * 1.6 + ph) * 0.014;
        w.head.rotation.x = Math.sin(t * 1.3) * deg2;
        w.head.rotation.y = Math.sin(t * 0.65 + ph) * 0.09;
      }
      if (w.torso) w.torso.rotation.x = 0.12 + Math.sin(t * 0.7) * deg1;
      if (w.armL) w.armL.rotation.x = -0.5 + Math.sin(t * 8.0 + ph) * 0.08;
      if (w.armR) w.armR.rotation.x = -0.48 + Math.sin(t * 8.0 + 0.9 + ph) * 0.08;
    }
  }
}
