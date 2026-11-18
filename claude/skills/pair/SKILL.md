---
name: pair
description: Scan the LAN for Codie devices, pick one, and pair with the 6-digit code shown on the device screen
---
1. Call `codie_list_devices`, show the result to the user as-is, and ask them to reply with a number.
2. Once they choose, call `codie_pair_begin` with that row's device_id.
3. Ask the user to read the 6-digit code on the device screen, then call `codie_pair_confirm`.
4. If the user gives up, call `codie_pair_cancel`.
5. On success, call `codie_status` to show the connection (the device usually connects within a few seconds). If confirming says the device did not issue a client credential, nothing was saved: tell the user to update the Codie firmware, then pair again.

If the code is wrong, ask the user to enter it again; never guess the code.
