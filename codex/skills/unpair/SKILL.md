---
name: unpair
description: Remove a paired Codie device
---
1. Call `codie_status` to list paired devices (each line ends with `device_id=…`), and ask the user to pick one.
2. After a second confirmation, call `codie_unpair` with its device_id.

If this session has no `codie_*` tools, the plugin was installed or enabled after the session started: ask the user to open a new Codex session. **Do not start or connect to `server.mjs` yourself**: that would leave an extra service outside any session holding the device, and device instructions would stop arriving.
