#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// ../codie-claude-plugin/src/hook-forwarder.mjs
import fs from "node:fs";
import path2 from "node:path";

// ../codie_host/src/agentd/daemon/home.mjs
import os from "node:os";
import path from "node:path";
function codieHome() {
  return process.env.CODIE_HOME || path.join(os.homedir(), ".codie");
}

// ../codie_host/src/agentd/ancestry.mjs
import { execFile, execFileSync } from "node:child_process";
function ancestorPids(start = process.ppid, maxDepth = 16) {
  if (process.platform === "win32") return [];
  const chain = [];
  let pid = start;
  while (pid > 1 && chain.length < maxDepth) {
    chain.push(pid);
    try {
      pid = parseInt(execFileSync("ps", ["-o", "ppid=", "-p", String(pid)], { encoding: "utf8" }).trim(), 10);
    } catch {
      break;
    }
  }
  return chain;
}
function hookPids({ env = process.env, chain = ancestorPids() } = {}) {
  const claude = Number(env.CLAUDE_PID);
  return Number.isInteger(claude) && claude > 0 && !chain.includes(claude) ? [...chain, claude] : chain;
}
function pidAlive(pid, { kill = process.kill.bind(process) } = {}) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    kill(pid, 0);
    return true;
  } catch (e) {
    return e?.code === "EPERM";
  }
}

// ../codie-claude-plugin/src/hook-forwarder.mjs
var STDIN_FALLBACK_MS = 3e3;
var POST_TIMEOUT_MS = 1500;
var ROUTES = ["stop", "stop-failure", "notification", "ask", "permission", "interrupt", "session-start", "session-end", "prompt", "poll-result"];
var AGENTD_START_WAIT_MS = 2500;
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function endpoint(home, route) {
  const a = JSON.parse(fs.readFileSync(path2.join(home, "agentd.json"), "utf8"));
  if (!a?.port || !a.token || !pidAlive(a.pid)) return null;
  return { url: `http://127.0.0.1:${a.port}/hooks/${route}`, headers: { authorization: `Bearer ${a.token}` } };
}
async function reach(home, route, waitMs) {
  for (const end = Date.now() + waitMs; ; await sleep(100)) {
    try {
      const ep = endpoint(home, route);
      if (ep) return ep;
    } catch {
    }
    if (Date.now() >= end) return null;
  }
}
function runHookForwarder(home = codieHome(), { host = "claude" } = {}) {
  const ROUTE = ROUTES.includes(process.argv[2]) ? process.argv[2] : "stop";
  const fast = ROUTE === "interrupt" || ROUTE === "session-end";
  let input = "";
  async function forward() {
    try {
      const ep = await reach(home, ROUTE, ROUTE === "session-start" ? AGENTD_START_WAIT_MS : 0);
      if (!ep) return;
      const body = { ...JSON.parse(input), host, pids: host === "codex" ? [] : hookPids() };
      await fetch(ep.url, {
        method: "POST",
        headers: { "content-type": "application/json", ...ep.headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(fast ? 800 : POST_TIMEOUT_MS)
      });
    } catch {
    }
  }
  let finishing = null;
  const done = () => finishing ??= forward().finally(() => process.exit(0));
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (c) => input += c);
  process.stdin.on("end", done);
  process.stdin.on("error", done);
  setTimeout(done, fast ? 500 : STDIN_FALLBACK_MS).unref();
}

// src/stop-hook.mjs
runHookForwarder(void 0, { host: "codex" });
