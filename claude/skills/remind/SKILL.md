---
name: remind
description: Show or switch the Codie voice reminder settings (when to remind, how much to say, which language Codie speaks)
---
Call `codie_remind_mode`, passing only what the user asked to change:

- `mode` — when to remind at the end of a turn: "remind every turn" → `every_turn`, "only remind on questions" → `question`;
- `detail` — how much Codie says: "read out the question and your recommendation" → `full`, "just a short reminder" / "don't read details aloud" → `brief`;
- `language` — the Codie voice language: a tag such as `zh-CN`, `en` or `ja` ("speak English" → `en`), or `system` to follow the computer again.

With nothing to change, omit all three and show the current settings and options as-is. After a language switch, write later `codie_notify` messages in the new language.
