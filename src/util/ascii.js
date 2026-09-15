/** Strip non-ASCII from desktop-facing strings (lint gate helper). */
export function asciiSafe(s) {
  return String(s == null ? "" : s).replace(/[^\x00-\x7F]/g, "?");
}
