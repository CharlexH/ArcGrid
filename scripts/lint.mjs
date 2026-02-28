import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ignored = new Set(["node_modules", ".git"]);

function walk(dir, files) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (ignored.has(entry)) continue;
    const abs = join(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      walk(abs, files);
    } else {
      files.push(abs);
    }
  }
}

const files = [];
walk(root, files);

const checkTargets = files.filter((file) => /\.(mjs|js)$/.test(file));

for (const file of checkTargets) {
  const check = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (check.status !== 0) {
    process.stdout.write(check.stderr || check.stdout || "Syntax check failed\n");
    process.exit(1);
  }
}

console.log(`Lint passed (${checkTargets.length} JS files syntax-checked).`);
