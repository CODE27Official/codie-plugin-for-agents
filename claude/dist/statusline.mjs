#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// src/statusline.mjs
import fs2 from "node:fs";
import { fileURLToPath } from "node:url";

// ../codie_host/src/agentd/daemon/home.mjs
import os from "node:os";
import path from "node:path";
function codieHome() {
  return process.env.CODIE_HOME || path.join(os.homedir(), ".codie");
}

// ../codie_host/src/agentd/store.mjs
import fs from "node:fs";
import path2 from "node:path";
function readStatus(dir = codieHome()) {
  return readJson(path2.join(dir, "status.json"));
}
function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// ../codie_host/src/agentd/ancestry.mjs
function pidAlive(pid, { kill = process.kill.bind(process) } = {}) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    kill(pid, 0);
    return true;
  } catch (e) {
    return e?.code === "EPERM";
  }
}
function isLiveStatus(s) {
  return s?.mode === "active" && pidAlive(s.sessionPid);
}

// src/statusline.mjs
var STDIN_FALLBACK_MS = 500;
function renderStatus(s) {
  if (!isLiveStatus(s)) return "\u26AA Codie not connected";
  return `${s.online > 0 ? "\u{1F7E2}" : "\u26AA"} Codie ${s.online}/${s.paired}`;
}
function isMain() {
  try {
    return fs2.realpathSync(process.argv[1]) === fs2.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isMain()) {
  let printed = false;
  const print = () => {
    if (printed) return;
    printed = true;
    let line;
    try {
      line = renderStatus(readStatus());
    } catch {
      line = renderStatus(null);
    }
    process.stdout.write(`${line}
`, () => process.exit(0));
  };
  if (process.stdin.isTTY) {
    print();
  } else {
    process.stdin.on("data", () => {
    });
    process.stdin.on("end", print);
    process.stdin.on("error", print);
    setTimeout(print, STDIN_FALLBACK_MS).unref();
  }
}
export {
  renderStatus
};
