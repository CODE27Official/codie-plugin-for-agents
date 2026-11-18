# Codie × Codex

A local Codex plugin modeled on the repo's `codie-claude-plugin`. Requires Node.js 20+.

Supports LAN discovery, on-screen code pairing, status checks, unpairing, claiming device tasks with voice replies, and question/every-turn reminders. Device tasks arrive as the device model's `ask_agent` / `cancel_task` tool calls, the same as with the Claude plugin.

Device connections are held by the background service **codie-agentd**, shared with the Claude plugin: the same process and the same pairings; each Codex session's MCP server is just its client. For when agentd starts/exits, how instructions are distributed among sessions and where the logs are, see ["Background service codie-agentd" in the Claude plugin README](../codie-claude-plugin/README.md#background-service-codie-agentd).

## Install

Release version: `codex plugin marketplace add CODE27Official/codie-plugin-for-agents && codex plugin add codie@codie`, then reopen the session and say "set up Codie" (`$codie:setup`). Update: `codex plugin marketplace upgrade codie && codex plugin add codie@codie`. The rest of this section covers a development install from this repo:

The repo root already provides `.agents/plugins/marketplace.json`:

```sh
codex plugin marketplace add /absolute/path/to/codie-plugin-for-agents
```

In the plugin directory of a desktop client that supports local plugins, select the "Codie local plugins" marketplace (`codie-local`), install `codie`, then start a new session. Hooks only take effect after you review and trust them in the client (remembered by hook content; you won't be asked again unless the content changes). They tell agentd which Codex threads are open and which turn a device task runs in: without them, device tasks are not handed to open Codex threads (listening still works), cancelling cannot stop a Codex turn, and reminders can only be triggered with `codie_turn_complete`.

If the client doesn't support a plugin directory yet, you can register just the MCP server (skills and hooks are not installed by this command):

```sh
codex mcp add codie -- node /absolute/path/to/codie-plugin-for-agents/codie-codex-plugin/dist/server.mjs
```

When a tool reports "A newer Codie plugin is starting the background service; try again shortly. If this keeps happening, update this plugin.", a newer version of the plugin just upgraded agentd (`~/.codie/agentd.min-version`, expires after 30 seconds); if it keeps happening, update this plugin too.

The distribution includes dist (including `agentd.mjs`), so no npm dependencies need installing. With several Codex (or Claude Code) sessions open at once, they all connect to the same agentd, and each session can query, pair and listen — there is no longer a "who holds the connection" problem.

### Uninstall

```sh
codex plugin remove codie@codie                # internal build: codie@codie-local
codex plugin marketplace remove codie          # remove the plugin source if you won't reinstall; internal build: codie-local
```

**On Windows, first close all Codex windows, then run `codex app-server daemon stop`**, and only then remove. After the windows close, Codex's background daemon still hosts the sessions and Codie's MCP server, so the plugin files are in use and remove fails with "The process cannot access the file because it is being used by another process".

What's left after uninstalling: the `[hooks.state."codie@…:hooks/hooks.json:…"]` sections in `~/.codex/config.toml` (the hook trust records; harmless, can be deleted by hand); the pairings and settings in `~/.codie/` are **shared with the Claude Code plugin**, so don't delete them if that side is still in use — if neither is used, delete the whole directory. agentd exits on its own when no session is connected; nothing to do there.

## Usage

Tell Codex "pair Codie", pick a device from the scan results and enter the code shown on the device screen. You can then say "show Codie status", "remind me every turn", "check Codie messages" or "listen to Codie for five minutes".

**Device instructions arrive whenever Codex is open, no listening needed**: when no session is listening (and there is no channel-enabled Claude Code session), agentd picks the most recently used Codex thread that Codie's hooks reported open (any hook registers its thread: starting the session, sending a message, ending a turn; closing it removes it; the list is kept in `~/.codie/codex-threads.json` across agentd restarts) and that Codex's shared app-server still has loaded, and puts the task into it as a message with `codex queue` — Codex starts a new turn right away (if busy, it queues until that turn ends), you can watch it run in the window, and when done it calls `codie_reply` with the task's `task_id`. The conversation before and after stays in the same session. If the session finishes and hasn't replied within 15 seconds, the device hears "The session on the computer finished but did not reply with a result." Every task is a real Codex turn and consumes usage; if you don't want this, set `"codexQueue": false` in `~/.codie/settings.json`. If putting the task in fails, agentd first checks the thread's queue and record for it: a task the thread got after all is followed as usual and never run a second time; one that can't be checked ends with a message to check the computer. When no Codex session is open (or the task never got in), the task goes to a background Claude session (see "Background sessions" in the Claude plugin README; turn it off with `"claudeBackground": false`). This relies on two experimental features, `codex queue` and the shared app-server; whether the desktop app uses the same app-server hasn't been verified.

You can still listen as before: device messages are claimed actively via `codie_poll`. "Listening" means a `codie_poll` is waiting, something was claimed within the last 90 seconds, or there is a claimed task not yet replied to. When none of these hold, the device immediately hears "No session on the computer is handling Codie" instead of waiting ten minutes for a timeout. After you say "listen to Codie", Codex calls `codie_poll(wait_seconds=50)` in a loop: with no task it waits at most 50 seconds (below Codex's default 60-second tool timeout), and returns immediately when a task arrives. **Device tasks are asynchronous**: as soon as a task enters the listening queue, the device hears "The computer has received the task and is working on it; there is no result yet. The result will be announced separately when it is ready, so do not state a result now." and is free again; when Codex finishes it replies with `codie_reply`, and the device announces "The computer finished: <summary>" (sent only to the device that started the task; if offline, queued until it reconnects). Queued tasks wait until the listening session finishes its current task and polls again; later failures, such as the session that claimed the task closing or no session listening anymore, are also announced to the device; taken tasks last at most 60 minutes, after which a timeout is announced. `codie_status` shows whether any session is listening, and the connected sessions (e.g. `Codex ×2`).

Hooks tie each device task to the Codex thread and turn running it: a queued task by the `UserPromptSubmit` prompt carrying its `task_id`, a polled one by the `codie_poll` result (`PostToolUse`). The Stop hook announces a fixed reminder according to the reminder mode, and, as a fallback when Codex did not call `codie_reply`, answers only the tasks bound to the turn that just ended, with that turn's last reply. Calling `codie_reply` explicitly is still the reliable way.

**Questions and permission prompts**: before asking you to choose, Codex speaks its proposal with `codie_notify`; if it did not, a question tool (`PreToolUse`) has Codie read the question and its options. A permission request (`PermissionRequest`) is spoken right away ("Codex on the computer needs your approval: …"), since Codex has no delayed notification like Claude Code's.

**Cancelling from the device** removes the task's queued message, or interrupts exactly the turn running it, and the device hears "cancelled" only once that turn is seen stopped (within 15 seconds); otherwise it hears that the computer could not confirm and to stop it there.

**Interrupting frees the device**: if you stop the task or switch to something else mid-task, Codex immediately calls `codie_reply` with the fixed sentence "The task on the computer has stopped. You can tell me again what to do."; when you click the stop button (or press Esc), the `Interrupt` hook ends the tasks of that turn with the fixed sentence at once; as a fallback, the session process sees `turn_aborted` in **this thread's own** rollout (`~/.codex/sessions/…`) after the task was claimed, and within a few seconds has agentd end the tasks it claimed with that fixed sentence (announced as-is by the device) and stop its listening. A custom `CODEX_HOME` may not reach the MCP server (Codex filters its environment variables); in that case it still looks in the default `~/.codex`.

Configuration and credentials are stored in `~/.codie/`, shared with the Claude plugin. Environment variables:

| Environment variable | Default | Purpose |
|---|---|---|
| `CODIE_HOME` | `~/.codie` | Data directory, shared by agentd and all sessions |
| `CODIE_AGENTD_IDLE_MS` | `600000` | How long agentd waits with no session connected before exiting |

## Development

The session client and agentd code is shared with `../codie-claude-plugin/src` and codie-host (this directory only holds the Codex tool list, descriptions and entry points) and bundled by esbuild into `dist/` (`server.mjs`, `stop-hook.mjs`, `agentd.mjs`), so the installed plugin doesn't depend on the sibling directory. Tests launch a real agentd with a temporary `CODIE_HOME` and make it exit when done. Install the Claude plugin's dependencies before building:

```sh
(cd ../codie-claude-plugin && npm ci)
npm ci
npm run build   # also rebuild after changes to shared code; test/dist.test.mjs checks whether dist is stale
npm test
```

If you change agentd's behavior or IPC in the shared code, bump `AGENTD_VERSION` in codie-host (`src/agentd/daemon/version.mjs`), and **build and publish both plugins together** — each carries its own `dist/agentd.mjs`, and the agentd from whichever side starts first serves all sessions.

Sources: [OpenAI plugin packaging spec](https://developers.openai.com/plugins/build/plugins), [Codex Hooks](https://learn.chatgpt.com/docs/hooks). The local MCP and protocol logic is adapted from the MIT-licensed Claude plugin in the same repo.
