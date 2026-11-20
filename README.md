# Codie plugin (Claude Code / Codex)

Let **Codie voice devices** on your LAN give instructions straight to Claude Code or Codex on your computer: say "on the computer, …" to Codie, the agent on the computer does it, and Codie reads you the result when it's done. No need to keep "listening" on.

Version 0.10.10.

## Before you start

- **A Codie device running firmware 1.6.0 or later is required.** Earlier firmware versions are not supported; update your Codie before pairing. Connect your computer and Codie to the same trusted Wi-Fi network.
- Install Claude Code or Codex and sign in. On Windows, install Git as well.
- In PowerShell on Windows or Terminal on macOS, check that Node.js is version 20 or newer:

```sh
node --version
```

- While this repository is private, use GitHub credentials with read access to it.

## Install from the terminal

Run the commands for the app you use. If you use both, follow both sets of steps.

### Claude Code

1. Add the Codie marketplace.

   ```sh
   claude plugin marketplace add CODE27Official/codie-plugin-for-agents
   ```

2. Install Codie.

   ```sh
   claude plugin install codie@codie
   ```

3. Restart Claude Code. In a new session, type `/codie:setup`.

### Codex

1. Add the Codie marketplace.

   ```sh
   codex plugin marketplace add CODE27Official/codie-plugin-for-agents
   ```

2. Install Codie.

   ```sh
   codex plugin add codie@codie
   ```

3. Restart Codex. Review and trust the Codie hooks when prompted. In a new session, type `$codie:setup`.

## Install with your assistant

If you prefer, paste this into Claude Code or Codex:

```text
Please install and set up the Codie plugin for me:
1. Run node -v and confirm Node ≥ 20; if it's older, tell me how to install it and stop.
2. If this computer has the claude command, run:
   claude plugin marketplace add CODE27Official/codie-plugin-for-agents && claude plugin install codie@codie
3. If this computer has the codex command, run:
   codex plugin marketplace add CODE27Official/codie-plugin-for-agents && codex plugin add codie@codie
4. Tell me which ones were installed and that I need to reopen the session; after I reopen it and say "set up Codie", follow codie's setup skill to walk me through the check, device pairing and the live check.
```

## Pair your device and verify it works

After reopening the session, you can also say "set up Codie" to start the wizard. The wizard will:

1. Check every prerequisite (`codie_doctor`): Node, the background service, the plugins on both sides, device pairing and online state, firewall / local network;
2. Fill in whatever is missing (such as the other side's plugin), one item at a time;
3. Pair a device: scan the LAN → pick a device → enter the 6-digit code from the device screen;
4. Explain where device tasks go when no one is listening and what they cost in quota, and ask whether to turn that off;
5. Run a live check: the device speaks a reminder, then you say "on the computer, check what the date is today" to the device.

## What you need to do yourself

- macOS may ask for Local Network permission on first run: allow it (the computer finds and connects to the device on the LAN).
- Read out the pairing code on the device screen.
- The device needs **Codie firmware 1.6.0 or later**: pairing must issue a client credential. Earlier firmware versions are not supported.

## Updating

```text
claude plugin marketplace update codie && claude plugin update codie@codie
codex plugin marketplace upgrade codie && codex plugin add codie@codie
```

## Documentation

- [Claude Code plugin](claude/README.md): how it works, background sessions, quota, configuration and known limitations
- [Codex plugin](codex/README.md)

⚠️ The device and the computer talk over unencrypted (signed) HTTP / WebSocket on the LAN; use it only on trusted home/office networks.
