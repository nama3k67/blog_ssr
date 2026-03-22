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

## Development Workflow

- **Planning**: Use BMAD skills (`/workflow-init`, `/product-brief`, `/architecture`, `/dev-story`)
- **Task Management**: Task Master MCP for structured task tracking
- **Specs**: Feature specs live in `specs/{feature-id}/` with spec.md, plan.md, research.md, data-model.md, tasks.md, contracts/
- **Current Feature**: `specs/001-portfolio-blog/`

## Key Directories

```
src/
├── server/db/          # Schema, queries, migrations, seed
├── server/r2/          # R2 upload client
├── shared/services/    # Server functions (post, admin, translation)
├── shared/providers/   # React context (i18n, theme, query)
├── shared/utils/       # Utilities (markdown, slug, date, i18n)
├── shared/schemas/     # Zod validation schemas
├── components/         # UI (layout/, post/, admin/, shared/, form/, ui/)
├── routes/$lang/       # Language-scoped public routes
├── routes/$lang/_protected/  # Auth-required routes (new post, admin)
├── routes/api/         # API endpoints (upload, webhooks)
└── locales/            # Translation files (en.ts, vi.ts)
```

## Scripts

```bash
npm run dev           # Dev server (port 3000)
npm run build         # Production build + TS check
npm run deploy        # Build + deploy to Cloudflare Workers
npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Apply migrations
npm run db:studio     # Visual DB browser
npm run db:seed       # Populate test data
```
