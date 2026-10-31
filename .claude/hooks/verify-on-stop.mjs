#!/usr/bin/env node
// Stop hook — Claude may not report "done" while the code it changed is red.
//
// Runs only when there are uncommitted changes under src/ or tests/ (so plain Q&A
// turns stay fast). Checks: Biome, TypeScript, Vitest unit tests.
// E2E (Playwright) is not run here — it needs the dev server and a DB; CI runs it.
//
// On failure: exit 2 with the tail of the failing output, so Claude keeps working.
// Claude Code overrides a Stop hook after 8 consecutive blocks with no tool call in
// between, so a stuck loop cannot run forever.

import { execSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

try {
	JSON.parse(readFileSync(0, "utf8"));
} catch {
	// Input is informational only here; never block on a parse problem.
}

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let changed = "";
try {
	changed = execSync("git status --porcelain -- src tests", {
		cwd: root,
		encoding: "utf8",
	}).trim();
} catch {
	process.exit(0); // not a git checkout — nothing to verify
}
if (!changed) process.exit(0);

const CHECKS = [
	["Biome", "bunx", ["biome", "check", "src", "tests"]],
	["TypeScript", "bunx", ["tsc", "--noEmit"]],
	["Unit tests", "bun", ["run", "test"]],
];

for (const [name, cmd, args] of CHECKS) {
	const r = spawnSync(cmd, args, {
		cwd: root,
		encoding: "utf8",
		timeout: 240_000,
	});
	if (r.error?.code === "ENOENT") {
		process.stderr.write(
			`verify-on-stop: \`${cmd}\` not found; skipping ${name}.\n`,
		);
		continue;
	}
	if (r.status !== 0) {
		const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`
			.trim()
			.split("\n")
			.slice(-40)
			.join("\n");
		process.stderr.write(
			`${name} failed on your changes. Fix it before finishing, or explain in your report why it cannot pass.\n\n${out}\n`,
		);
		process.exit(2);
	}
}

process.exit(0);
