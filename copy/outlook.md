# mail-theater copy -- Mail app on the CRT desktop
# Player-facing: Mail (docs/GENERIC_NAMES.md). Bake key: outlook.

Spec: `specs/04-outlook-theater.md`. Bake via `bake_copy.py` -> `copy-data.js` key `outlook` (player label: Mail).
ASCII-only. CORP branding. Dark humor. No ableist jokes.

## chrome + rail

```json
{
  "windowTitle": "Mail",
  "desktopLabel": "Mail",
  "ribbonAccent": "modern",
  "composeTitle": "Untitled Message",
  "sendLabel": "Send",
  "discardLabel": "Discard",
  "toLabel": "To",
  "subjectLabel": "Subject",
  "readingEmpty": "Select a message. Or don't. Unread will wait.",
  "foldersToast": "Folders syncing...",
  "rail": {
    "focused": "Focused",
    "other": "Other",
    "folders": "Folders"
  },
  "emptyFocused": "You're all caught up. That's worse.",
  "emptyOther": "Other is empty. The newsletters are plotting.",
  "emptyFocusedAlt": [
    "Focused Inbox: nothing important. Everything is.",
    "No Focused mail. Enjoy the silence (temporary).",
    "All caught up. HR will fix that."
  ],
  "emptyOtherAlt": [
    "No spam here. Suspicious.",
    "Other folder: spiritually archived.",
    "Newsletters are on a break. You aren't."
  ],
  "otherPrefixes": [
    "Newsletter:",
    "Digest:",
    "AllHands:",
    "FYI:",
    "[External]"
  ]
}
```

## ribbonToasts

```json
{
  "delete": [
    "Moved to Deleted (synced to Jimbo)",
    "Deleted. Jimbo kept a copy for culture.",
    "Gone from the list. Not from your mind."
  ],
  "archive": [
    "Archived for impact",
    "Archived. Impact unchanged.",
    "Filed under 'later' (never)."
  ],
  "tip": [
    "Focused Inbox shows what matters. Other hides what HR sent twice.",
    "Focused means painful. Other means delayed pain.",
    "Tip: sorting email is not a career.",
    "Focused Inbox: corporate triage with worse lighting."
  ],
  "new": [
    "Compose opened. Ambition detected.",
    "New Mail: a draft that will not survive Jimbo."
  ]
}
```

## composeFail

```json
[
  "Jimbo rewrote your tone. Draft discarded for culture.",
  "Send blocked: empathy score too low for outbound.",
  "Jimbo says this email needs more alignment. Draft gone.",
  "Your message was optimized into silence.",
  "Corporate AI rejected the vibe. Try Sync (also doomed).",
  "Draft discarded. Unread remains. Peace denied."
]
```
