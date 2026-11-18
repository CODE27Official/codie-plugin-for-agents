---
name: setup
description: Set up Codie in one go: check every prerequisite, pair a device, confirm where device tasks go when no one is listening, and run a live check. Use when the user says "set up Codie", "install Codie", or "Codie won't connect / doesn't respond".
---
1. Call `codie_doctor` and show the result to the user as-is.
2. Fix ❌ items first, then ⚠️, **one at a time**, calling `codie_doctor` again after each to confirm:
   - **Node too old**: give the user the install method from the check; Codex must be restarted afterwards.
   - **No device paired**: pair following the `$codie:pair` steps (scan → pick a number → the user reads the 6-digit code on the device screen). **Never guess the code.**
   - **Device offline**: following the check's hints, ask the user to verify the same Wi-Fi, the firewall, and the macOS Local Network permission; run the check again afterwards.
3. Tell the user: when no one is listening, device tasks are handed to an open Codex session (queued into the most recently used one that Codie's hooks have seen, so the hooks must be trusted), and **every task uses quota**. Ask whether to turn this off; if so, set `"codexQueue": false` in `~/.codie/settings.json` (keep any other fields already in the file).
4. Live check:
   - Call `codie_notify` and ask the user whether the device spoke.
   - Ask the user to say "on the computer, check what the date is today" to the device, and wait for them to confirm the device read out the result; if it didn't, troubleshoot with `codie_status` and `codie_doctor`.
5. When everything passes, tell the user in two or three sentences how to use it from now on: saying "on the computer, …" to Codie hands the request to the computer; saying "show Codie status" shows the status.
