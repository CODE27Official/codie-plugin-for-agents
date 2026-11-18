---
name: setup
description: Set up Codie in one go: check every prerequisite, pair a device, confirm where device tasks go when no one is listening, and run a live check. Use when the user says "set up Codie", "install Codie", or "Codie won't connect / doesn't respond".
---
1. Call `codie_doctor` and show the result to the user as-is.
2. Fix ❌ items first, then ⚠️, **one at a time**, calling `codie_doctor` again after each to confirm:
   - **Node too old**: give the user the install method from the check; Claude Code must be restarted afterwards.
   - **No device paired**: pair following the `/codie:pair` steps (scan → pick a number → the user reads the 6-digit code on the device screen). **Never guess the code.**
   - **Device offline**: following the check's hints, ask the user to verify the same Wi-Fi, the firewall, and the macOS Local Network permission; run the check again afterwards.
3. Tell the user: an open Claude Code session **receives device tasks automatically** (plugin monitor; no channel or listening needed, the check covers it). When no Claude Code is open on the computer, device tasks start a Claude session in the background (in the most recently used project directory), and **every task uses quota**. Ask whether to turn background sessions off; if so, set `"claudeBackground": false` in `~/.codie/settings.json` (keep any other fields already in the file).
4. Keep results from getting stuck on a confirmation prompt: tell the user that by default Claude Code asks for confirmation the first time it calls Codie's tool to answer the device, and the device announces nothing until they click. Ask whether to let Codie's device tools run without confirmation; if they agree, add these four entries to `permissions.allow` in `~/.claude/settings.json` (keep the existing content, don't duplicate entries): `mcp__plugin_codie_codie__codie_reply`, `mcp__plugin_codie_codie__codie_notify`, `mcp__plugin_codie_codie__codie_poll`, `mcp__plugin_codie_codie__codie_listen_stop`.
5. Live check:
   - Call `codie_notify` and ask the user whether the device spoke.
   - Ask the user to say "on the computer, check what the date is today" to the device, and wait for them to confirm the device read out the result; if it didn't, troubleshoot with `codie_status` and `codie_doctor`.
6. When everything passes, tell the user in two or three sentences how to use it from now on: saying "on the computer, …" to Codie hands the request to the computer; `/codie:status` shows the status.
