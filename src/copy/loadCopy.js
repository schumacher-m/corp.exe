/** Load baked copy (copy-data.js). */
export async function loadCopy() {
  const mod = await import("./copy-data.js");
  return mod.default;
}
