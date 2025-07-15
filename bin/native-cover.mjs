#!/usr/bin/env node
import { rm, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";

const coverageDir = process.env.NODE_V8_COVERAGE ?? './coverage';

const reporter = new URL('../src/index.js', import.meta.url);
await rm(coverageDir, { recursive: true }).catch(() => {});
await mkdir(coverageDir, { recursive: true });
await new Promise((resolve, reject) => {
  const childProc = spawn("node", [
    "--test-reporter", "spec",
    "--test-reporter-destination", "stdout",
    "--test-reporter", reporter,
    "--test-reporter-destination", "stdout",
    "--experimental-test-coverage",
    "--test",
    ...process.argv.slice(2)
  ], {
    env: { ...process.env, NODE_V8_COVERAGE: coverageDir },
    stdio: 'inherit',
  });
  childProc.on('close', (code) => {
    if (code === 0) resolve();
    else reject(`Subprocess exited with code ${code}`);
  });
})
