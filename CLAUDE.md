# Portfolio Blog Platform

## Tech Stack

- **Framework**: TanStack Start v1.159.5 + React 19 (SSR on Cloudflare Workers)
- **Database**: Drizzle ORM + Neon PostgreSQL (serverless)
- **Auth**: Clerk (@clerk/tanstack-react-start)
- **Storage**: Cloudflare R2 via aws4fetch
- **Styling**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **Code Highlighting**: Shiki 3 (fine-grained bundle)
- **Validation**: Zod 4
- **Build**: Vite 7 + @cloudflare/vite-plugin

## Constraints

- Cloudflare Workers free tier: **3 MB gzip limit** — monitor with `wrangler deploy --outdir bundled/ --dry-run`
- **Never** use bare `shiki` imports — use `shiki/core` + `shiki/engine/javascript` with explicit language imports
- Lazy-load heavy components (Markdown renderer) with `React.lazy()` + Suspense
- Admin role is env-var based (`ADMIN_USER_ID`), not database column

## Code Conventions

- **Formatter/Linter**: Biome (tabs, double quotes for JS/TS, single for JSX)
- **TypeScript**: strict mode, path alias `~/*` → `./src/*`
- **Server functions**: `createServerFn` from TanStack Start (type-safe RPC)
- **Routing**: File-based with `$lang` prefix for i18n (en/vi)
- **Database queries**: Drizzle ORM with typed relations
- **Validation**: Zod schemas at system boundaries
- **Commits**: Group by purpose (feat/fix/chore), separate commits per concern
- **UI/Styling**: Spotlight-inspired design system — see `DESIGN.md` at the repo root (zinc/teal palette). Follow it for all UI work under `src/components/`, `src/routes/`, `src/shared/providers/`.

## Development Workflow

- **Methodology**: BMAD Method v6.2.0 (original install via `npx bmad-method@latest install`)
  - Config: `_bmad/_config/manifest.yaml` | Modules: core, bmm (Agile-AI), bmb, cis, tea, wds
  - Key skills: `/bmad-help`, `/bmad-create-prd`, `/bmad-create-architecture`, `/bmad-dev-story`, `/bmad-sprint-planning`
  - Output: `_bmad-output/` (planning-artifacts, implementation-artifacts, test-artifacts)
- **Specs**: Feature specs live in `specs/{feature-id}/` with spec.md, research.md, data-model.md, tasks.md, contracts/
- **Current Feature**: `specs/001-portfolio-blog/`

## Key Directories

```
_bmad/                          # BMAD Method v6 (agents, config, modules)
_bmad-output/                   # BMAD outputs (sprint plans, workflow status)
specs/                          # Feature specs (spec.md, research.md, tasks.md)
src/
├── server/db/                  # Schema, queries, migrations, seed
├── server/r2/                  # R2 upload client
├── shared/services/            # Server functions (post, admin, translation)
├── shared/providers/           # React context (i18n, theme, query)
├── shared/utils/               # Utilities (markdown, slug, date, i18n)
├── shared/schemas/             # Zod validation schemas
├── components/                 # UI (layout/, post/, admin/, shared/, form/, ui/)
├── routes/$lang/               # Language-scoped public routes
├── routes/$lang/_protected/    # Auth-required routes (new post, admin)
├── routes/api/                 # API endpoints (upload, webhooks)
└── locales/                    # Translation files (en.ts, vi.ts)
```

## Scripts

```bash
bun install           # Install dependencies (package manager: Bun)
bun run dev           # Dev server (port 3000)
bun run build         # Production build + TS check
bun run deploy        # Build + deploy to Cloudflare Workers
bun run db:generate   # Generate Drizzle migrations
bun run db:push       # Apply migrations
bun run db:studio     # Visual DB browser
bun run db:seed       # Populate test data
```

## Agent Guardrails

In **local sessions** these are enforced by `.claude/settings.json` and `.claude/hooks/`. In **cloud threads and scheduled tasks** (Claude Code on the web, Projects) hooks, permission rules, `.claude/agents/` and `.claude/skills/` are **not loaded** — follow every rule below yourself. The hard gates that apply everywhere are GitHub branch protection on `main` and required CI checks.

- **Never deploy.** Deploys run from CI after Nam merges. `wrangler deploy --dry-run` for bundle checks is fine.
- **Never write to the database.** No `db:push`, `db:migrate`, `db:seed` or `psql`. Generate migrations with `db:generate` and list them under "Risks" in the PR.
- **Never read `.env*` or `.dev.vars`.** Variable names are in `.env.example` and `.env.test.example`.
- **Never push to `main`, force-push, or merge PRs.** Work on a `feat/*` or `fix/*` branch and open a PR.
- **Don't edit `.claude/settings.json`, `.claude/hooks/`, `.github/workflows/` or `.husky/`.** Propose changes in the PR description instead.
- **Blog post content is Nam's.** Posts live in the database and are written by Nam in the admin editor. Don't generate or rewrite post text; suggest edits in a separate note if asked.

### Definition of done for a change

1. Work from a spec (BMAD story in `_bmad-output/implementation-artifacts/` or an issue). If there is none, write a short one first and stop for approval.
2. Tests for the new behaviour. Before finishing, `bunx biome check .`, `bunx tsc --noEmit` and `bun run test` must pass (locally the Stop hook enforces this; in the cloud, run them yourself and paste the result lines in the PR).
3. E2E for affected pages (`bunx playwright test <specs>`). For UI changes, attach screenshots: light + dark, desktop + 390px mobile. If the environment can't reach the DB or Clerk, say so in the PR — never mock to make it pass.
4. Independent review: use the `reviewer` subagent, or where it isn't available (cloud threads) spawn a fresh subagent with the instructions in `.claude/agents/reviewer.md`. Fix blocking findings.
5. Open a PR using `.github/pull_request_template.md`, including the reviewer report, and keep fixing CI failures and review comments until it's green.
