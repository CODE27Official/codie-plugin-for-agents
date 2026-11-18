---
name: status
description: Show Codie device connection status (online/offline, tasks in progress)
---
Call `codie_status` and show the result as-is.

If this session has no `codie_*` tools, the plugin was installed or enabled after the session started: ask the user to open a new Codex session. **Do not start or connect to `server.mjs` yourself**: that would leave an extra service outside any session holding the device, and device instructions would stop arriving.
