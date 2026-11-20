---
name: pair
description: Scan the LAN for Codie devices, pick one, and pair with the 6-digit code shown on the device screen
---
1. Call `codie_list_devices`, show only its numbered IP address list, and ask the user to reply with a number. Do not show device names, device IDs or pairing state.
2. Once they choose, use the matching row in `structuredContent.devices` to call `codie_pair_begin` with its `device_id`. Keep this internal mapping out of the displayed list.
3. Ask the user to read the 6-digit code on the device screen, then call `codie_pair_confirm`.
4. If the user gives up, call `codie_pair_cancel`.
5. On success, call `codie_status` to show the connection (the device usually connects within a few seconds). If confirming says the device did not issue a client credential, nothing was saved: tell the user to update the Codie firmware, then pair again.

If the code is wrong, ask the user to enter it again; never guess the code.
