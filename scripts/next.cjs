#!/usr/bin/env node
require("./patch-fs.cjs");

const { spawn } = require("node:child_process");
const path = require("node:path");

const nextBin = path.join(
  path.dirname(require.resolve("next/package.json")),
  "dist",
  "bin",
  "next"
);

const args = process.argv.slice(2);
if (args[0] === "dev" && !args.includes("--webpack")) args.push("--webpack");
if (args[0] === "build" && !args.includes("--webpack")) args.push("--webpack");

const patch = require.resolve("./patch-fs.cjs");
const child = spawn(
  process.execPath,
  ["--require", patch, nextBin, ...args],
  {
    stdio: "inherit",
    env: process.env,
  }
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
