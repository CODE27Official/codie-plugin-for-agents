---
name: statusline-setup
description: Add Codie connection status (🟢 Codie online/paired count) to the Claude Code status line
disable-model-invocation: true
---
A plugin cannot register a status line itself (a plugin's `settings.json` only accepts `agent` / `subagentStatusLine`), so it has to go into the user's `~/.claude/settings.json`.

The status line script's absolute path is `${CLAUDE_PLUGIN_ROOT}/dist/statusline.mjs` (called `<script>` below; Claude Code has already replaced the plugin root with the real path, use it as-is).

1. Read `~/.claude/settings.json` (treat a missing file as `{}`); before changing it, copy it to `~/.claude/settings.json.bak-codie`.
2. If there is no `statusLine`, write
   `{"type":"command","command":"node \"<script>\""}`.
3. If there already is a `statusLine`, show the user its `command` and ask whether to (a) replace it or (b) append a line.
   To append, change `command` to `<original command>; node "<script>" </dev/null`.
   The original command reads stdin as usual; the Codie script needs no session JSON, and `</dev/null` keeps it off stdin.
   The status line supports multi-line output, so the Codie status shows on the line below the original. If the user is unsure, change nothing.
4. Change only the `statusLine` key and keep every other setting as-is; make sure it is still valid JSON before writing it back.
5. Tell the user:
   - the status line takes effect on the next refresh (sending a message is enough) or after restarting Claude Code;
   - the `<script>` path changes with the plugin version, so **after a plugin update, run `/codie:statusline-setup` again**;
   - `node` must be on PATH.
