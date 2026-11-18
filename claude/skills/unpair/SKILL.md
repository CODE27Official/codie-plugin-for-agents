---
name: unpair
description: Remove a paired Codie device
---
1. Call `codie_status` to list paired devices (each line ends with `device_id=…`), and ask the user to pick one.
2. After a second confirmation, call `codie_unpair` with its device_id.
