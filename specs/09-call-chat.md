# Call chat thread (Sync)

**Status:** Michael ask · Writer bake in · Designer chrome in WIN95.md  
**Owner:** Developer · Writer (`callChatPool` / `callThreads`)

## Behavior
1. **Ringing:** call overlay only.
2. **Accept:** open/raise Sync behind/beside overlay (overlay topmost). Drip funny thread ~1–2s while connected.
3. **Hang up / end:** leave Sync open with thread visible.
4. Chips/attentiveness stay on overlay -- do not steal focus.

## Writer copy (baked)
- `teams.callChatPool`: `[{name,color,text}, ...]` side lines
- `teams.callThreads`: `[{ callerId, beats:[{name,color,text}] }, ...]` for each caller
- Optional: `callers[].chatLines`

Priority: chatLines → callThreads beats for callerId → opener + callChatPool stitch.

## Do not touch
Attentiveness, chip gate, board freeze, Jimbo silent-join toast.
