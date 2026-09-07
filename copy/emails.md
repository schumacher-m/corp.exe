# emails — Outlook Express / Inbox copy (bleak funny)
# Writer: doom mails popup on timer; presence/force mails force-open on Away.

```json
{
  "inboxTitle": "Inbox — Outlook Express",
  "desktopLabel": "Inbox",
  "unreadFloor": 1,
  "messages": [
    {
      "id": "e1",
      "from": "Facilities",
      "subject": "The plant filed a ticket about you",
      "body": "Cubicle 4-B flora reports neglect. Water it or accept a peer review from chlorophyll.",
      "sanity": 6,
      "doom": true
    },
    {
      "id": "e2",
      "from": "HR",
      "subject": "Mandatory joy survey (5 min → 45)",
      "body": "Rate your burnout 1–5 where 5 means 'engaged'. Leaving blank counts as 5.",
      "sanity": 8,
      "doom": true
    },
    {
      "id": "e3",
      "from": "Kyle",
      "subject": "Nit on the email you're reading",
      "body": "Subject line should be Title Case. Also trailing whitespace in your soul.",
      "sanity": 7,
      "doom": true
    },
    {
      "id": "e4",
      "from": "InsightBot",
      "subject": "You have been productive (lie)",
      "body": "Our model detected focus. Or a frozen cursor. Either way: great job.",
      "sanity": 5,
      "doom": true
    },
    {
      "id": "e5",
      "from": "All-Hands",
      "subject": "Town hall moved into the fog",
      "body": "Bring questions. Do not bring hope. Snacks are metaphorical.",
      "sanity": 4,
      "doom": true
    },
    {
      "id": "e6",
      "from": "Security",
      "subject": "Phish test you already failed",
      "body": "Clicking this counts as training complete. Congratulations on the vulnerability.",
      "sanity": 9,
      "doom": true
    },
    {
      "id": "e7",
      "from": "Dana",
      "subject": "Poison o'clock?",
      "body": "Lobby. Badge optional. Dignity not required.",
      "sanity": 3,
      "doom": true
    },
    {
      "id": "e8",
      "from": "Jira",
      "subject": "HELIX-2201 still emotionally open",
      "body": "This ticket cannot be closed. Neither can you. Have a metrics-driven day.",
      "sanity": 6,
      "doom": true
    },
    {
      "id": "e9",
      "from": "IT",
      "subject": "Password expires in −3 days",
      "body": "Please change password1 to password2. History remembers everything except kindness.",
      "sanity": 5,
      "doom": true
    },
    {
      "id": "e10",
      "from": "Manager",
      "subject": "Quick sync that is neither",
      "body": "Can you walk me through the thing while also doing the thing? Thx.",
      "sanity": 8,
      "doom": true
    },
    {
      "id": "e11",
      "from": "Payroll",
      "subject": "Direct deposit of vibes",
      "body": "Your compensation includes exposure and a free fluorescent headache.",
      "sanity": 4,
      "doom": true
    },
    {
      "id": "e12",
      "from": "Compliance",
      "subject": "Appear Active policy reminder",
      "body": "Away status triggers this email. Move the mouse. Love, Policy.",
      "sanity": 10,
      "presence": true,
      "doom": false,
      "force": true
    },
    {
      "id": "e13",
      "from": "Ops",
      "subject": "Coffee machine still HTTP 418",
      "body": "Do not fix. Document the teapot. Escalate to myth.",
      "sanity": 3,
      "doom": true
    },
    {
      "id": "e14",
      "from": "Jimbo",
      "subject": "I summarized your inbox into dread",
      "body": "TL;DR: everyone needs something and none of it is you resting.",
      "sanity": 7,
      "doom": true
    },
    {
      "id": "e15",
      "from": "PresenceBot",
      "subject": "YOU APPEAR AWAY — acknowledge immediately",
      "body": "Policy 4-B-ACTIVE: Idle >11s requires mandatory acknowledgment. Moving the mouse is not optional. Dismiss this to resume being Active (and miserable).",
      "sanity": 12,
      "presence": true,
      "doom": false,
      "force": true
    },
    {
      "id": "e16",
      "from": "HR",
      "subject": "Away is a performance conversation",
      "body": "Your status went red. Please confirm you are still employed. Click OK to pretend you were reading Slack.",
      "sanity": 11,
      "presence": true,
      "doom": false,
      "force": true
    }
  ],
  "_writerNote": "Writer: doom=true unsolicited popups; presence/force=Away mandatory mail."
}
```
