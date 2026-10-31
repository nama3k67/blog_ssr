import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Regression tests for the agent guardrail hook (.claude/hooks/guard.mjs).
// Exit code 2 = blocked, 0 = allowed.

const HOOK = resolve(__dirname, "../../.claude/hooks/guard.mjs");
const ROOT = "/repo";

function run(tool: string, toolInput: Record<string, string>) {
	const r = spawnSync("node", [HOOK], {
		input: JSON.stringify({
			tool_name: tool,
			tool_input: toolInput,
			cwd: ROOT,
		}),
		env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT },
		encoding: "utf8",
	});
	return { blocked: r.status === 2, stderr: r.stderr };
}

const bash = (command: string) => run("Bash", { command });
const file = (tool: string, path: string) =>
	run(tool, { file_path: `${ROOT}/${path}` });

describe("guard hook — Bash", () => {
	it.each([
		"bun run deploy",
		"cd src && npx wrangler deploy",
		"wrangler secret put CLERK_SECRET_KEY",
		"bun run db:push",
		"bunx drizzle-kit migrate",
		"bunx tsx src/server/db/seed.ts",
		"cat .env",
		"grep DATABASE .env.local",
		"source ./.dev.vars",
		"git push --force origin feat/x",
		"git push origin main",
		"gh pr merge 13 --squash",
		"git reset --hard HEAD~1",
		"rm -rf ~",
	])("blocks `%s`", (cmd) => {
		const r = bash(cmd);
		expect(r.blocked).toBe(true);
		expect(r.stderr).toContain("Blocked by .claude/hooks/guard.mjs");
	});

	it.each([
		"npx wrangler deploy --outdir bundled/ --dry-run",
		"bun run test",
		"bun run db:generate",
		"cat .env.example",
		"cat .env.test.example",
		"git push -u origin feat/rss-feed",
		"git commit -m 'feat: add rss feed'",
		"rm -rf node_modules/.cache",
		"grep -rn environment src/",
	])("allows `%s`", (cmd) => {
		expect(bash(cmd).blocked).toBe(false);
	});
});

describe("guard hook — files", () => {
	it.each([
		".env",
		".env.local",
		".env.test",
		".dev.vars",
	])("blocks reading %s", (p) => {
		expect(file("Read", p).blocked).toBe(true);
	});

	it.each([
		".env.example",
		".env.test.example",
		"src/env.ts",
	])("allows reading %s", (p) => {
		expect(file("Read", p).blocked).toBe(false);
	});

	it.each([
		".claude/settings.json",
		".claude/hooks/guard.mjs",
		".github/workflows/test.yml",
		".husky/pre-commit",
	])("blocks editing guardrail file %s", (p) => {
		expect(file("Edit", p).blocked).toBe(true);
	});

	it.each([
		"src/routes/rss[.]xml.ts",
		".claude/agents/reviewer.md",
		".github/pull_request_template.md",
	])("allows editing %s", (p) => {
		expect(file("Write", p).blocked).toBe(false);
	});
});
