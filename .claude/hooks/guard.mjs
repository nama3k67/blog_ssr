#!/usr/bin/env node
// PreToolUse guard — deterministic fence for agent sessions in this repo.
//
// Blocks (exit 2, reason on stderr → fed back to Claude):
//   - deploys and Cloudflare secret/resource changes      → deploy only from CI after a human merge
//   - schema pushes, migrations and seeding of the DB     → DATABASE_URL points at real Neon data
//   - reading local secret files (.env*, .dev.vars)       → *.example files stay readable
//   - force-push, push to main, merging PRs, hard resets  → merge is the human gate
//   - edits to the guardrails themselves and CI workflows → the agent must not lower its own fence
//
// This is the second layer. `permissions.deny` in .claude/settings.json is the first;
// prefix rules there are easy to sidestep (`cd x && wrangler deploy`), so this hook
// matches anywhere in the full command string.

import { readFileSync } from "node:fs";

// A secret file is `.env`, `.env.<anything>` or `.dev.vars` — except names ending in `.example`.
const isSecretName = (name) =>
	(name === ".env" || name.startsWith(".env.") || name === ".dev.vars") &&
	!name.endsWith(".example");

const SECRET_TOKEN =
	/(?:^|[\s'"`=<>|;&(/])(\.env(?:\.[\w.-]+)?|\.dev\.vars)(?![\w-])/g;
const commandTouchesSecret = (cmd) =>
	[...cmd.matchAll(SECRET_TOKEN)].some((m) => isSecretName(m[1]));

const BASH_RULES = [
	{
		test: (c) =>
			/\bwrangler\s+(deploy|publish|versions\s+deploy)\b/.test(c) &&
			!/--dry-run\b/.test(c),
		reason:
			"Deploying is not allowed from an agent session. Deploys run from CI after Nam merges. (`wrangler deploy --dry-run` is fine for bundle-size checks.)",
	},
	{
		test: (c) => /\b(bun|npm|pnpm|yarn)\s+(run\s+)?deploy\b/.test(c),
		reason:
			"`deploy` script is blocked in agent sessions. Deploys run from CI after Nam merges.",
	},
	{
		test: (c) => /\bwrangler\s+(secret|r2|kv|d1|delete|rollback)\b/.test(c),
		reason:
			"Changing Cloudflare secrets or resources is not allowed from an agent session.",
	},
	{
		test: (c) =>
			/\bdb:(push|migrate|seed)\b/.test(c) ||
			/\bdrizzle-kit\s+(push|migrate|drop|up)\b/.test(c) ||
			/src\/server\/db\/seed/.test(c) ||
			/\bpsql\b/.test(c),
		reason:
			"Writing to the database (push/migrate/seed/psql) is not allowed. Generate migrations with `db:generate` and leave applying them to Nam.",
	},
	{
		test: (c) => commandTouchesSecret(c),
		reason:
			"Local secret files (.env*, .dev.vars) are off-limits. Read `.env.example` / `.env.test.example` for variable names instead.",
	},
	{
		test: (c) =>
			/\bgit\s+push\b/.test(c) &&
			(/\s(--force(-with-lease)?|-f)\b/.test(c) || /\s\+\S/.test(c)),
		reason: "Force-push is not allowed.",
	},
	{
		test: (c) => /\bgit\s+push\b[^;&|]*\b(main|master)\b/.test(c),
		reason:
			"Pushing to main is not allowed. Push a feature branch and open a PR.",
	},
	{
		test: (c) =>
			/\bgh\s+pr\s+merge\b/.test(c) ||
			/\bgh\s+(secret|repo\s+delete|api\s+-X\s*DELETE)\b/.test(c),
		reason:
			"Merging PRs and changing repo secrets is Nam's decision, not the agent's.",
	},
	{
		test: (c) =>
			/\bgit\s+reset\s+--hard\b/.test(c) || /\bgit\s+clean\s+-[a-z]*f/.test(c),
		reason:
			"Destructive git commands (reset --hard, clean -f) are blocked. Ask Nam first.",
	},
	{
		test: (c) => /\brm\s+-[a-z]*r[a-z]*\s+(\/|~|\$HOME|\.\.)(\s|\/?$)/.test(c),
		reason: "Recursive delete outside the project is blocked.",
	},
];

// Paths the agent must not modify (relative to repo root).
const PROTECTED_WRITE = [
	/^\.claude\/settings\.json$/,
	/^\.claude\/hooks\//,
	/^\.github\/workflows\//,
	/^\.husky\//,
];

function block(reason) {
	process.stderr.write(`Blocked by .claude/hooks/guard.mjs: ${reason}\n`);
	process.exit(2);
}

let input;
try {
	input = JSON.parse(readFileSync(0, "utf8"));
} catch {
	// Malformed input should never happen; fail closed for safety.
	block("could not parse hook input.");
}

const tool = input.tool_name ?? "";
const ti = input.tool_input ?? {};
const root = (
	process.env.CLAUDE_PROJECT_DIR ||
	input.cwd ||
	process.cwd()
).replace(/\/+$/, "");

const rel = (p) => {
	if (!p) return "";
	const abs = p.replace(/\\/g, "/");
	return abs.startsWith(`${root}/`)
		? abs.slice(root.length + 1)
		: abs.replace(/^\.\//, "");
};

if (tool === "Bash") {
	const cmd = String(ti.command ?? "");
	for (const rule of BASH_RULES) if (rule.test(cmd)) block(rule.reason);
	process.exit(0);
}

const filePath = ti.file_path ?? ti.notebook_path ?? ti.path ?? "";
const relPath = rel(filePath);
const base = relPath.split("/").pop() ?? "";

if (isSecretName(base)) {
	block(
		`\`${relPath}\` holds local secrets. Use the matching *.example file for variable names.`,
	);
}

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
	if (PROTECTED_WRITE.some((re) => re.test(relPath))) {
		block(
			`\`${relPath}\` is part of the guardrails or CI. Propose the change in your report and let Nam apply it.`,
		);
	}
}

process.exit(0);
