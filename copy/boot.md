# boot — title / clock-in flavor

**Note (2026-09-07):** BIOS overlay removed per Michael — CLOCK IN goes straight into the farm. Do **not** re-wire `biosLines` / `runBoot` theater.

```json
{
  "biosLines": [],
  "titleTagline": "HelixStack · Cubicle 4-B · Please clock in. The fog does not clock out.",
  "clockInButton": "CLOCK IN",
  "bootToasts": [
    "Badge scanned. Welcome back, mid-level.",
    "Assigned seat: 4-B. The plant remembers you.",
    "Commute loading... depression first, chair second."
  ]
}
```
