# Portfolio Blog Platform

A full-stack, bilingual (EN/VI) portfolio and blog platform built with TanStack Start, deployed on Cloudflare Workers, and developed end-to-end with AI assistance.

## Features

- **Bilingual content** — EN/VI routes with i18n via `$lang` prefix; posts linked by translation group
- **Blog posts** — Markdown editor with Shiki syntax highlighting, image uploads to Cloudflare R2
- **Projects showcase** — Curated project listing
- **Admin dashboard** — Role-based access (env-var driven) with full CRUD, moderation queue, and translation workflow
- **Auth** — Clerk-powered sign-in/sign-up with protected routes
- **SEO** — Dynamic sitemap, robots.txt, and structured metadata per post
- **Analytics** — Server-side request tracking via Cloudflare Workers logs
- **Edge-first** — SSR on Cloudflare Workers free tier (3 MB gzip budget enforced at build time)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start v1.159 + React 19 (SSR) |
| Runtime | Cloudflare Workers (`@cloudflare/vite-plugin`) |
| Database | Drizzle ORM + Neon PostgreSQL (serverless) |
| Auth | Clerk (`@clerk/tanstack-react-start`) |
| Storage | Cloudflare R2 via `aws4fetch` |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Code highlighting | Shiki 3 (fine-grained bundle, JS regex engine) |
| Validation | Zod 4 |
| Build | Vite 7 + Wrangler |
| Testing | Vitest (unit) + Playwright (E2E) |

## AI-Assisted Development

This project was built with an AI-native workflow using two tools in tandem:

### Claude Code
All implementation — components, server functions, database schema, tests, and CI config — was written with [Claude Code](https://claude.ai/code) as the primary coding assistant. Claude Code handles file editing, shell commands, and multi-step tasks directly inside the terminal.

### BMAD Method v6.2.0
Product planning and sprint execution follow the [BMAD Method](https://github.com/bmad-code-org/bmad-method), an AI-native Agile methodology. The workflow goes:

```
/bmad-create-prd  →  /bmad-create-architecture  →  /bmad-create-epics-and-stories
  →  /bmad-dev-story (per story)  →  /bmad-sprint-planning
```

All planning artifacts (PRD, architecture, epics, stories) live in `specs/` and `_bmad-output/`. The **TEA module** (Test Architecture Enterprise) drives E2E test design and Playwright test generation alongside feature development.

## Getting Started

### Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) account
- A [Neon](https://neon.tech) PostgreSQL database
- A Cloudflare account (Workers + R2)

### Setup

1. Clone and install:

```bash
git clone <repo-url>
cd blog-app
npm install
```

2. Copy the env file and fill in your keys:

```bash
cp .env.example .env
```

Required variables:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon
DATABASE_URL=

# Cloudflare R2
R2_BUCKET_NAME=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=

# Admin (Clerk user ID granted admin access)
ADMIN_USER_ID=
```

3. Apply the database schema:

```bash
npm run db:push
```

4. (Optional) Seed test data:

```bash
npm run db:seed
```

5. Start the dev server:

```bash
npm run dev      # http://localhost:3000
```

## Scripts

```bash
npm run dev             # Dev server
npm run build           # Production build + TypeScript check
npm run deploy          # Build + deploy to Cloudflare Workers

npm run db:generate     # Generate Drizzle migrations
npm run db:push         # Apply migrations to Neon
npm run db:studio       # Visual DB browser

npm run test            # Unit tests (Vitest)
npm run test:e2e        # E2E tests (Playwright)
npm run lint            # Biome lint + ESLint
npm run format          # Biome format
```

## Project Structure

```
_bmad/                          # BMAD Method v6 agents and config
_bmad-output/                   # Sprint plans, workflow status, artifacts
specs/                          # Feature specs (PRD, architecture, stories, tasks)
src/
├── routes/
│   ├── $lang/                  # Public routes (en / vi)
│   │   ├── index.tsx           # Home
│   │   ├── about.tsx           # About
│   │   ├── projects.tsx        # Projects showcase
│   │   ├── posts/              # Blog listing + post detail
│   │   └── _protected/         # Auth-required (new post, edit, translate, admin)
│   ├── api/                    # Upload + Clerk webhook endpoints
│   ├── sitemap[.]xml.ts
│   └── robots[.]txt.ts
├── components/
│   ├── layout/                 # Header, footer, nav
│   ├── post/                   # Post card, content renderer, editor, forms
│   ├── admin/                  # Admin dashboard and moderation queue
│   └── ui/                     # shadcn/ui component library
├── server/
│   ├── db/                     # Drizzle schema, queries, migrations, seed
│   └── r2/                     # R2 upload client
├── shared/
│   ├── services/               # Server functions (post, admin, translation)
│   ├── providers/              # React context (i18n, theme, TanStack Query)
│   ├── utils/                  # Slug, date, markdown, i18n helpers
│   └── schemas/                # Zod validation schemas
└── locales/                    # Translation strings (en.ts, vi.ts)
```

## Deployment

```bash
npm run deploy
```

Deploys to Cloudflare Workers. Monitor the bundle size before deploying:

```bash
wrangler deploy --outdir bundled/ --dry-run
```

The gzip output must stay under **3 MB** (Cloudflare Workers free tier limit).

## License

MIT
