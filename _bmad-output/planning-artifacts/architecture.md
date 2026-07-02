---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: "complete"
completedAt: "2026-03-26"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "specs/001-portfolio-blog/research.md"
  - "specs/001-portfolio-blog/data-model.md"
  - "specs/001-portfolio-blog/contracts/api.md"
  - "DESIGN.md"
workflowType: "architecture"
project_name: "blog app"
user_name: "Nama3k67"
date: "2026-03-25"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (33 FRs across 7 capability areas):**

| Capability Area        | Count | Architectural Impact                                                             |
| ---------------------- | ----- | -------------------------------------------------------------------------------- |
| Content Management     | 8     | Post CRUD, Markdown rendering, image upload pipeline, draft/publish lifecycle    |
| Bilingual Content      | 5     | Translation groups, language fallback, `$lang` routing, locale-aware queries     |
| Admin & Moderation     | 5     | Approval workflow, role checks via env var, pending queue, status transitions    |
| Portfolio Display      | 4     | Project cards, GitHub integration links, technology tags, detail pages           |
| Navigation & Discovery | 4     | Category/tag filtering, search (PostgreSQL full-text), pagination (offset-based) |
| User Experience        | 4     | Dark mode toggle, responsive layout, keyboard navigation, loading states         |
| SEO & Analytics        | 3     | SSR meta tags, structured data (JSON-LD), Cloudflare Analytics integration       |

**Non-Functional Requirements (25 NFRs across 5 categories):**

| Category      | Key Constraints                                                              |
| ------------- | ---------------------------------------------------------------------------- |
| Performance   | TTFB <200ms, P95 <500ms, Lighthouse 90+, Core Web Vitals pass                |
| Bundle Size   | Total <3 MB gzip (Worker limit), route chunks <500KB, lazy-load heavy deps   |
| Accessibility | WCAG 2.1 AA, semantic HTML, keyboard navigation, screen reader support       |
| Security      | Clerk auth, CSRF protection, input sanitization, R2 upload validation        |
| Reliability   | Edge deployment (Cloudflare Workers), graceful degradation, error boundaries |

**Scale & Complexity:**

- Primary domain: Full-stack SSR web application
- Complexity level: Medium
- Estimated architectural components: ~12 (routing layer, SSR engine, auth middleware, content API, translation engine, Markdown pipeline, image upload, admin workflow, design system, i18n provider, theme provider, analytics)

### Technical Constraints & Dependencies

1. **Cloudflare Workers runtime** — No Node.js `fs`, `crypto.subtle` only, no long-running processes. All dependencies must be Worker-compatible.
2. **3 MB gzip bundle ceiling** — Eliminates heavy libraries (full Shiki, full MDX). Demands fine-grained imports, tree shaking, and code splitting at route level.
3. **Neon serverless PostgreSQL** — Connection via HTTP driver (no persistent connections from Workers). Cold start latency on first query per invocation.
4. **Clerk authentication** — Session management handled by Clerk middleware. Server functions validate JWT; admin check is `userId === env.ADMIN_USER_ID`.
5. **TanStack Start v1.159.5** — File-based routing with SSR. Server functions via `createServerFn` for type-safe RPC. Still maturing — API surface may shift.
6. **React 19** — Server Components available but TanStack Start's SSR model may not fully leverage them yet. Need to verify RSC compatibility.

### Cross-Cutting Concerns Identified

1. **Internationalization (i18n)** — Affects routing (`/$lang/...`), content queries (translation group joins), UI strings (locale files), and SEO (hreflang tags). Every component and route must be language-aware.
2. **Bundle Size Budget** — Every dependency addition must be justified against the 3 MB ceiling. Shiki, Markdown processing, and date libraries are the main risks. Code splitting strategy must be defined at the architecture level.
3. **Edge Runtime Compatibility** — Libraries using Node.js APIs (Buffer, fs, process) will fail at runtime. Must audit all dependencies for Worker compatibility.
4. **Auth & Authorization** — Two-layer model: Clerk (identity) + env var (admin role). Auth middleware must run before every protected route/server function. No database role table.
5. **SEO & SSR** — All public pages must render complete HTML server-side. Dynamic meta tags per post/project. Sitemap and robots.txt generation. Structured data for blog posts.
6. **Design System Consistency** — Spotlight design system tokens (zinc/teal palette, spacing rhythm, glass effects) must be enforced across all components. Dark mode is a first-class concern.
7. **Accessibility** — WCAG 2.1 AA compliance requires semantic HTML, ARIA attributes, focus management, color contrast ratios, and keyboard navigation throughout.

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack SSR web application** — TanStack Start on Cloudflare Workers with serverless PostgreSQL. Brownfield project with established codebase and dependencies.

### Starter Options Considered

This is a **brownfield project** — the tech stack was already selected and initialized. No starter template evaluation was needed. The project was bootstrapped with `create-tanstack-app` (TanStack Start template) and extended with manually added dependencies.

### Established Foundation: TanStack Start + Cloudflare Workers

**Rationale:** TanStack Start provides file-based routing with full SSR, type-safe server functions (`createServerFn`), and first-class Cloudflare Workers deployment via `@cloudflare/vite-plugin`. It's the natural choice for a React 19 SSR app targeting edge deployment.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- TypeScript 5.9 (strict mode, `~/*` path alias)
- React 19.2 + React DOM 19.2
- Cloudflare Workers runtime (V8 isolate, no Node.js APIs)

**Framework & Routing:**

- TanStack Start ^1.159.5 (SSR framework)
- TanStack Router ^1.159.5 (file-based routing, `$lang` prefix for i18n)
- TanStack Query ^5.90 (server state management, caching)
- TanStack Form ^1.28 (form state management)

**Data Layer:**

- Drizzle ORM ^0.45.1 (type-safe SQL, schema-as-code)
- Drizzle Kit ^0.31.9 (migrations, studio)
- Neon serverless driver ^1.0.2 (HTTP-based PostgreSQL from Workers)
- Zod ^4.3.6 (runtime validation at system boundaries)
- `@t3-oss/env-core` ^0.13 (type-safe environment variables)

**Auth & Storage:**

- Clerk ^0.27.17 (`@clerk/tanstack-react-start` — identity management)
- `aws4fetch` ^1.0.20 (Cloudflare R2 uploads via S3-compatible API)

**Styling & UI:**

- Tailwind CSS ^4.1.18 + `@tailwindcss/vite` plugin + `@tailwindcss/typography`
- shadcn ^3.8.5 (component primitives)
- Radix UI ^1.4.3 (accessible headless components)
- `class-variance-authority` + `clsx` + `tailwind-merge` (standard shadcn utility stack)
- Lucide React ^0.563 (icons)
- `tw-animate-css` ^1.4 (animation utilities)
- Sonner ^2.0 (toast notifications)

**Content Pipeline:**

- Shiki ^3.22 (code highlighting — fine-grained bundle required)
- `react-markdown` ^10.1 + `rehype-raw` ^7.0 + `remark-gfm` ^4.0 (Markdown rendering)
- `@uiw/react-md-editor` ^4.0 (Markdown editor for admin)
- `gray-matter` ^4.0 (frontmatter parsing)

**Build & Tooling:**

- Vite ^7.1.12 + `@vitejs/plugin-react` ^4.7
- `@cloudflare/vite-plugin` ^1.25.2 (Workers build target)
- Wrangler ^4.67 (Cloudflare CLI, deploy, R2 management)
- Biome ^2.3.15 (format + lint — tabs, double quotes)
- ESLint ^9.39 + React/TypeScript plugins (React-specific rules only)
- `vite-tsconfig-paths` ^5.1 (path alias resolution)

**Development Experience:**

- `npm run dev` — Vite dev server with HMR (port 3000)
- `npm run build` — Production build + TypeScript check
- `npm run deploy` — Build + Wrangler deploy to Cloudflare Workers
- `npm run db:studio` — Visual Drizzle database browser
- `npm run db:seed` — Test data population via `tsx`

### Architecture Decision Records

| ADR                                | Decision              | Risk   | Key Constraint                                                    |
| ---------------------------------- | --------------------- | ------ | ----------------------------------------------------------------- |
| ADR-1: TanStack Start over Next.js | Accept                | Medium | Pin versions, test upgrades — pre-1.0 API surface may shift       |
| ADR-2: Drizzle + Neon over Prisma  | Accept                | Low    | Only viable ORM for Workers + PostgreSQL                          |
| ADR-3: Shiki for code highlighting | Accept w/ constraint  | High   | Fine-grained imports only (`shiki/core`), lazy-load, <500KB chunk |
| ADR-4: react-markdown over MDX     | Accept                | Low    | Sufficient for DB-stored content, no runtime compilation          |
| ADR-5: @uiw/react-md-editor        | Accept w/ constraint  | Medium | Admin routes only, code-split from public bundle                  |
| ADR-6: Biome + ESLint dual linting | Accept (transitional) | Low    | Biome for format + general lint, ESLint for React hooks only      |

**Bundle Architecture Rules (from ADRs):**

- Shiki imports MUST use `shiki/core` subpath — never bare `shiki`
- Markdown renderer (Shiki + react-markdown) MUST be lazy-loaded via `React.lazy()` + Suspense
- Admin editor (`@uiw/react-md-editor`) MUST only load on `/_protected/` routes
- Public and admin content pipelines must never cross-contaminate bundles

**Note:** No project initialization story needed — codebase is already established.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Post lifecycle simplified to `draft → published` for MVP (scope change from PRD)
- Error handling: error codes from server, localized messages in UI via `$lang`
- Auth boundary at `_protected` layout + `withAdmin()` wrapper for server functions

**Important Decisions (Shape Architecture):**

- Caching: TanStack Query client-side only for MVP
- Bundle splitting: route-level auto + lazy-load Markdown renderer + lazy-load admin editor
- Image upload validation: reject >500KB or >2000px width, no resize pipeline

**Deferred Decisions (Post-MVP):**

- Rate limiting (Clerk + Cloudflare DDoS sufficient for single-admin)
- Image optimization pipeline (Cloudflare Image Resizing or upload-time transforms)
- CI/CD pipeline (manual `npm run deploy` for MVP)
- Edge caching (Cloudflare Cache API or KV for hot data)
- Full post approval workflow (`pending`/`rejected` states — reintroduce with guest authors)
- Authenticated user features (comments, reactions)

### Data Architecture

| Decision   | Choice                                                       | Rationale                                                                |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Database   | Drizzle ORM + Neon PostgreSQL (serverless)                   | Only viable ORM for Workers + PostgreSQL                                 |
| Caching    | TanStack Query client-side (`staleTime`/`gcTime`)            | Sufficient for low-traffic single-admin blog; no server cache complexity |
| Migrations | `drizzle-kit push` (dev) / `generate`+`migrate` (production) | Standard Drizzle workflow; migration files in git for production         |
| Validation | Zod 4 at system boundaries                                   | Type-safe runtime validation on server function inputs                   |
| Search     | PostgreSQL full-text search                                  | No external search service; built into Neon                              |

### Authentication & Security

| Decision      | Choice                                                     | Rationale                                                      |
| ------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Identity      | Clerk (`@clerk/tanstack-react-start`)                      | Managed auth, handles signup/login/session                     |
| Authorization | `ADMIN_USER_ID` env var                                    | Single-admin model; no DB role table needed                    |
| Auth boundary | `_protected` layout `beforeLoad` + `withAdmin()` wrapper   | Route-level for pages, function-level for server functions     |
| Image upload  | MIME + magic bytes validation, max 500KB, max 2000px width | Prevents oversized uploads without resize pipeline             |
| Rate limiting | Deferred — Clerk + Cloudflare DDoS sufficient for MVP      | Single admin, low write volume, public reads protected by edge |

### API & Communication Patterns

| Decision         | Choice                                                                 | Rationale                                             |
| ---------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| RPC pattern      | `createServerFn` (TanStack Start)                                      | Type-safe, no tRPC overhead                           |
| Error handling   | Server throws error _codes_; UI maps to localized messages via `$lang` | Keeps server language-agnostic, supports bilingual UI |
| List responses   | `{ data: T[], pagination: { page, pageSize, total, totalPages } }`     | Consistent shape for all paginated endpoints          |
| Single responses | Return `T` directly, throw 404 if not found                            | Simple, caught by error boundaries                    |
| Rate limiting    | Deferred to post-MVP                                                   | Low threat model for single-admin portfolio           |

### Frontend Architecture

| Decision           | Choice                                                                                   | Rationale                                    |
| ------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| Server state       | TanStack Query                                                                           | Already in stack; handles SSR hydration      |
| Client state       | React context (`shared/providers/`)                                                      | Theme + locale only; no Redux/Zustand needed |
| Code splitting     | Route-level (automatic) + `React.lazy()` for Markdown renderer + admin editor            | Stay under 3MB gzip; admin chunks isolated   |
| Image handling     | Upload validation (500KB/2000px) + serve originals from R2 + CSS responsive              | Defer resize pipeline to post-MVP            |
| Markdown rendering | `react-markdown` + `rehype-raw` + `remark-gfm` (public) / `@uiw/react-md-editor` (admin) | Two separate pipelines, never cross-bundle   |

### Infrastructure & Deployment

| Decision   | Choice                                                                     | Rationale                                   |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Hosting    | Cloudflare Workers (free tier)                                             | Edge SSR, 3MB gzip limit                    |
| Env config | `@t3-oss/env-core` + Zod; `.dev.vars` local / `wrangler secret` production | Type-safe, validated at startup             |
| CI/CD      | Manual `npm run deploy` for MVP                                            | Solo developer; add GitHub Actions post-MVP |
| Monitoring | Cloudflare Analytics (free) + `wrangler tail` for logs                     | No paid observability for MVP               |
| DB backups | Neon automatic 7-day PITR                                                  | Free tier includes this; no action needed   |

### Scope Change: Post Lifecycle Simplification

**Changed from PRD:** Full approval workflow (`draft → pending → published → rejected`) simplified to `draft → published` for MVP.

**Reason:** Single-admin model makes self-approval meaningless. The 5 approval-related server functions (`getPendingPosts`, `approvePostFn`, `rejectPostFn`, `submitForApproval`, `unpublishPostFn`) are removed from MVP scope.

**Post-MVP reintroduction path:** When adding authenticated user features (comments, reactions) and eventually guest authors, reintroduce the full state machine with actual approval logic.

### Decision Impact Analysis

**Implementation Sequence:**

1. Database schema + migrations (simplified `postStatusEnum`: `draft`, `published`)
2. Auth middleware (`_protected` layout + `withAdmin()` wrapper)
3. Core server functions (CRUD, without approval flow)
4. Public pages (SSR, i18n, design system)
5. Admin pages (editor, image upload with validation)
6. SEO + analytics integration

**Cross-Component Dependencies:**

- Error codes ↔ locale files (every server function error needs i18n entries)
- Auth boundary ↔ routing (protected layout must load before any admin route)
- Bundle splitting ↔ Markdown pipeline (Shiki lazy-load affects rendering UX)
- Image validation ↔ R2 upload (validation runs before `aws4fetch` call)

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

12 areas where AI agents could make different choices if not explicitly specified.

### Naming Patterns

**Database Naming (Drizzle ORM):**

- Tables: `snake_case`, plural (`posts`, `post_tags`, `categories`)
- Columns: `camelCase` in Drizzle schema, maps to `snake_case` in PostgreSQL (`translationGroupId` → `translation_group_id`)
- Enums: `camelCase` name, lowercase values (`postStatusEnum`: `'draft'`, `'published'`)
- Relations: named after the related table (`posts`, `postTags`)

```typescript
// ✅ Correct
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  translationGroupId: uuid("translation_group_id"),
  status: postStatusEnum("status").default("draft"),
});

// ❌ Wrong — PascalCase table, inconsistent column naming
export const Posts = pgTable("Posts", {
  ID: serial("ID").primaryKey(),
  translation_group_id: uuid("translation_group_id"),
});
```

**Code Naming:**

- Components: `PascalCase` (`PostCard.tsx`, `NavBar.tsx`)
- Files: `PascalCase` for components, `camelCase` for utilities/services (`fetchPost.ts`, `slugify.ts`)
- Constants files: `camelCase` (`constant.ts`, not `constants.ts` or `CONSTANTS.ts`)
- Functions: `camelCase` (`fetchPostsList`, `createPostFn`)
- Server functions: suffix with `Fn` when exported (`createPostFn`, `deletePostFn`)
- Types/Interfaces: `PascalCase`, no `I` prefix (`PostWithRelations`, not `IPostWithRelations`)
- Zod schemas: `camelCase` with `Schema` suffix (`createPostSchema`, `updatePostSchema`)

**Route Naming:**

- File-based: `kebab-case` directories, `$param` for dynamic segments
- Pattern: `routes/$lang/posts/$postSlug.tsx`
- Protected routes: under `routes/$lang/_protected/`
- API routes: under `routes/api/`

### Structure Patterns

**Project Organization (existing — enforce consistency):**

```
src/
├── server/db/          # Schema, queries, migrations, seed
├── server/r2/          # R2 upload client
├── shared/services/    # Server functions (createServerFn)
├── shared/providers/   # React context (i18n, theme, query)
├── shared/utils/       # Pure utilities (markdown, slug, date, i18n)
├── shared/schemas/     # Zod validation schemas
├── components/         # UI components
│   ├── layout/         # Layout components (navbar, footer, containers)
│   ├── post/           # Post-specific components
│   ├── admin/          # Admin-only components
│   ├── shared/         # Reusable across features
│   ├── form/           # Form components
│   └── ui/             # shadcn/ui primitives
├── routes/$lang/       # Public routes
├── routes/$lang/_protected/  # Auth-required routes
├── routes/api/         # API endpoints
└── locales/            # Translation files (en.ts, vi.ts)
```

**Placement Rules:**

- Database queries go in `server/db/queries/` — never inline in server functions
- Server functions go in `shared/services/` — one file per domain (`post.ts`, `admin.ts`, `translation.ts`)
- Zod schemas go in `shared/schemas/` — imported by both server functions and forms
- React contexts go in `shared/providers/` — one file per concern
- Pure utility functions go in `shared/utils/` — no React imports, no server imports
- Components organized by feature first (`post/`, `admin/`), shared second (`shared/`, `ui/`)

**Test Organization:**

- Co-located: `PostCard.test.tsx` next to `PostCard.tsx`
- Integration tests: `__tests__/` directory at project root (if added post-MVP)

### Format Patterns

**API Response Formats:**

```typescript
// List endpoints — always this shape
type ListResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Single item — return directly, throw on not found
// ✅ return post;
// ❌ return { data: post };

// Mutations — return the created/updated entity
// ✅ return newPost;
// ❌ return { success: true, data: newPost };
```

**Error Format:**

```typescript
// Server functions throw error codes, never user-facing strings
throw new Error("POST_NOT_FOUND");
throw new Error("SLUG_TAKEN");
throw new Error("UNAUTHORIZED");
throw new Error("UPLOAD_TOO_LARGE");
throw new Error("INTERNAL_ERROR"); // for unexpected failures

// UI maps codes to localized messages
const errorMessage = t(`errors.${error.message}`); // uses $lang context
```

**Date Handling:**

- Database: `timestamp` columns (Drizzle `timestamp("created_at")`)
- API responses: ISO 8601 strings (`"2026-03-25T10:30:00Z"`)
- UI display: formatted via `Intl.DateTimeFormat(lang, { dateStyle: "long" })` in `shared/utils/date.ts`
- Never pass `Date` objects across the server/client boundary

**JSON Field Naming:**

- API responses: `camelCase` (matches TypeScript conventions)
- Database columns: `camelCase` in Drizzle, auto-maps to `snake_case` in PostgreSQL

### Communication Patterns

**Query Key Factory (single source of truth):**

```typescript
// shared/utils/queryKeys.ts — ALL query keys defined here
export const queryKeys = {
  posts: {
    list: (params: PostListParams) => ["posts", "list", params] as const,
    detail: (params: { slug: string; lang: string }) =>
      ["posts", "detail", params] as const,
  },
  categories: {
    list: () => ["categories", "list"] as const,
  },
  tags: {
    list: () => ["tags", "list"] as const,
  },
};

// ✅ Always use factory
useQuery({ queryKey: queryKeys.posts.list({ lang, page }) });

// ❌ Never inline query keys
useQuery({ queryKey: ["posts", "list", { lang, page }] });
```

**State Management:**

- Server state: TanStack Query with `queryKeys.ts` factory (3-part structure: `[domain, action, params]`)
- Mutations: use `useMutation` with `onSuccess` invalidation
  ```typescript
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };
  ```
- Client state: React context only (`ThemeProvider`, `I18nProvider`)
- No prop drilling beyond 2 levels — extract to context or compose with children

**Loading States:**

- Route-level: TanStack Router `pendingComponent` on route definitions
- Component-level: `Suspense` fallback for lazy-loaded components
- Data-level: TanStack Query `isLoading` / `isPending` states
- Naming: always `isLoading` or `isPending`, never `loading` as a boolean

### Process Patterns

**Dependency Management:**

```typescript
// Before adding ANY new dependency:
// 1. Check if a native API exists (Intl.DateTimeFormat, structuredClone, etc.)
// 2. Check if a lightweight alternative exists (inline utility vs lodash)
// 3. Run: wrangler deploy --outdir bundled/ --dry-run
// 4. Verify total gzip stays under 2.5MB (500KB headroom from 3MB limit)

// ❌ import { format } from "date-fns";
// ✅ new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(date)

// ❌ import { debounce } from "lodash";
// ✅ inline 5-line debounce utility in shared/utils/
```

**SSR Safety Rules:**

```typescript
// ❌ Accessing browser APIs during render — crashes on Workers
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// ✅ Browser APIs only in useEffect
const [isDark, setIsDark] = useState(false);
useEffect(() => {
  setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
}, []);

// ✅ Theme/locale from route params or server context, never browser APIs during SSR
```

**Shiki Client-Only Pattern:**

- SSR renders plain `<pre><code>` blocks — no Shiki on server
- Client-side `React.lazy()` loads the highlighter and progressively enhances code blocks
- Shiki highlighter initialization MUST be behind `typeof window !== "undefined"`

**Error Handling Flow:**

1. Server function wraps all DB/external calls in try/catch → rethrows as error codes
2. Route-level: `errorComponent` on route definition catches unrecoverable errors
3. Component-level: `sonner` toast for recoverable errors (failed save, upload error)
4. Form-level: Zod validation errors displayed inline via TanStack Form

```typescript
// ✅ Server function with error wrapping
.handler(withAdmin(async ({ data }) => {
  try {
    return await queries.createPost(data);
  } catch (error) {
    console.error("createPost failed:", error);
    throw new Error("INTERNAL_ERROR");
  }
}));

// ✅ Error boundary for route-level failures
export const Route = createFileRoute("/$lang/posts/$postSlug")({
  errorComponent: PostErrorBoundary,
  pendingComponent: PostSkeleton,
});

// ✅ Toast for recoverable mutation errors
const mutation = useMutation({
  mutationFn: createPostFn,
  onError: (error) => {
    toast.error(t(`errors.${error.message}`));
  },
});
```

**Auth Check Pattern:**

```typescript
// ✅ withAdmin wrapper for server functions
export const createPostFn = createServerFn({ method: "POST" })
  .validator(createPostSchema)
  .handler(
    withAdmin(async ({ data }) => {
      // only runs if user is admin
    }),
  );

// ✅ _protected layout beforeLoad for route-level
export const Route = createFileRoute("/$lang/_protected")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.userId) throw redirect({ to: "/sign-in" });
  },
});
```

**i18n Pattern:**

```typescript
// ✅ Always derive lang from route param, never from browser
const { lang } = Route.useParams(); // "en" | "vi"
const t = useTranslation(lang);

// ✅ Every user-facing string uses t()
<p>{t("posts.empty")}</p>

// ❌ Hardcoded text
<p>No posts found</p>

// ✅ When adding to en.ts, MUST also add to vi.ts
// locales/en.ts: "posts.empty": "No posts found"
// locales/vi.ts: "posts.empty": "Không tìm thấy bài viết"

// ✅ Content queries always include lang parameter
const posts = useQuery({
  queryKey: queryKeys.posts.list({ lang, page }),
  queryFn: () => fetchPostsList({ lang, page }),
});

// ✅ Language fallback happens in server function, not component
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow Biome formatting before committing (tabs, double quotes JS/TS, single quotes JSX)
2. Use existing patterns from `shared/` — never create parallel utility files
3. Place new code in the correct directory per the structure rules
4. Use error codes (not strings) in server functions, wrap all handlers in try/catch
5. Include `$lang` parameter in all content-fetching queries
6. Lazy-load Shiki and the Markdown renderer — client-only, progressive enhancement
7. Keep admin-only imports out of public route bundles
8. Run `wrangler deploy --outdir bundled/ --dry-run` before adding any new dependency
9. Never access `window`/`document`/`localStorage` during render — `useEffect` only
10. Use `queryKeys.ts` factory for all TanStack Query keys — never inline
11. Update both `en.ts` and `vi.ts` when adding any user-facing string
12. Every user-facing string must use `t()` — never hardcode text in JSX

**Anti-Patterns:**

```typescript
// ❌ Bare shiki import
import { createHighlighter } from "shiki";

// ❌ Hardcoded error message
throw new Error("Post not found");

// ❌ Direct DB query in server function
export const getPost = createServerFn().handler(async () => {
  const result = await db.select().from(posts); // should be in server/db/queries/
});

// ❌ Prop drilling lang through 3+ components
<Parent lang={lang}><Child lang={lang}><GrandChild lang={lang} /></Child></Parent>

// ❌ Mixing admin imports in public routes
import { PostEditor } from "~/components/admin/PostEditor"; // in a public route

// ❌ Raw error exposed to client
throw error; // exposes stack trace

// ❌ Browser API during SSR
const width = window.innerWidth; // crashes on Workers

// ❌ Inline query keys
useQuery({ queryKey: ["posts", "list", { lang }] }); // use queryKeys factory

// ❌ Adding date-fns/lodash without bundle check
import { format } from "date-fns"; // use Intl.DateTimeFormat instead
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
blog-app/
├── .claude/                    # Claude Code config & skills
│   └── skills/                 # BMAD workflow skills
├── .env                        # Local secrets (gitignored)
├── .env.example                # Template for required env vars
├── .env.local                  # Local overrides (gitignored)
├── .eslintrc                   # ESLint config (React-specific rules)
├── .gitignore
├── .tanstack/                  # TanStack Start generated config
├── .vscode/                    # VS Code workspace settings
├── CLAUDE.md                   # Project instructions for AI agents
├── DESIGN.md                   # Spotlight design system rules
├── README.md
├── _bmad/                      # BMAD Method v6 (agents, config, modules)
├── _bmad-output/               # BMAD outputs
│   └── planning-artifacts/     # PRD, architecture, sprint plans, workflow status
├── biome.json                  # Biome formatter/linter config
├── components.json             # shadcn/ui component registry config
├── drizzle.config.ts           # Drizzle Kit config (Neon connection)
├── eslint.config.mjs           # ESLint flat config
├── package.json
├── package-lock.json
├── pg-native-stub.js           # Stub for pg-native (Workers compatibility)
├── public/
│   ├── dark-logo.png           # Logo variants
│   ├── light-logo.png
│   ├── logo.png
│   ├── favicon.ico
│   ├── hero.png
│   └── robots.txt
├── specs/                      # Feature specifications
│   └── 001-portfolio-blog/     # Current feature spec
│       ├── data-model.md
│       ├── research.md
│       └── contracts/
│           └── api.md
├── src/
│   ├── env.ts                  # @t3-oss/env-core validation
│   ├── router.tsx              # TanStack Router config
│   ├── routeTree.gen.ts        # Auto-generated route tree (DO NOT EDIT)
│   ├── start.ts                # TanStack Start entry point
│   ├── styles.css              # Global styles (Tailwind imports)
│   │
│   ├── server/                 # === SERVER-ONLY CODE ===
│   │   ├── db/
│   │   │   ├── client.ts       # Neon DB connection (drizzle + neon HTTP)
│   │   │   ├── schema.ts       # Drizzle schema (posts, users, categories, tags, post_tags)
│   │   │   ├── queries.ts      # All DB query functions
│   │   │   ├── seed.ts         # Test data seeder
│   │   │   └── migrations/     # Drizzle Kit migration files
│   │   │       ├── 0000_dashing_maximus.sql
│   │   │       ├── 0001_strong_anthem.sql
│   │   │       ├── 0002_lame_maximus.sql
│   │   │       ├── 0003_opposite_marauders.sql
│   │   │       └── meta/       # Migration snapshots & journal
│   │   └── r2/
│   │       └── client.ts       # Cloudflare R2 upload via aws4fetch
│   │
│   ├── shared/                 # === SHARED CODE (server + client) ===
│   │   ├── constants/
│   │   │   ├── index.ts        # App-wide constants
│   │   │   └── i18n.ts         # Supported languages, default locale
│   │   ├── hooks/
│   │   │   ├── useHeader.tsx    # Header state hook
│   │   │   └── useTranslation.ts # i18n hook (reads $lang param)
│   │   ├── lib/
│   │   │   └── utils.ts        # shadcn cn() utility
│   │   ├── providers/
│   │   │   ├── tanstackQuery.tsx # QueryClient provider
│   │   │   ├── theme.tsx       # Dark/light theme provider
│   │   │   └── i18n.tsx        # i18n context provider
│   │   ├── schemas/
│   │   │   └── post.ts         # Zod schemas (createPost, updatePost)
│   │   ├── services/           # Server functions (createServerFn)
│   │   │   ├── post.ts         # Post CRUD server functions
│   │   │   ├── admin.ts        # Admin server functions
│   │   │   └── translation.ts  # Translation server functions
│   │   ├── tanstackQueries/    # TanStack Query options factories
│   │   │   ├── post.ts         # Post query/mutation options
│   │   │   └── admin.ts        # Admin query options
│   │   ├── types/
│   │   │   ├── index.ts        # Shared type exports
│   │   │   └── post.ts         # Post-related types
│   │   └── utils/
│   │       ├── date.ts         # Date formatting (Intl.DateTimeFormat)
│   │       ├── i18n.ts         # i18n utility functions
│   │       ├── markdown.ts     # Markdown processing utilities
│   │       ├── slug.ts         # Slug generation
│   │       ├── string.ts       # String utilities
│   │       └── upload.ts       # Upload validation utilities
│   │
│   ├── components/             # === REACT COMPONENTS ===
│   │   ├── ui/                 # shadcn/ui primitives (DO NOT EDIT directly)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── field.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── form/               # Form components (TanStack Form wrappers)
│   │   │   ├── FormField.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   └── form-field-meta.ts
│   │   ├── layout/             # Layout components
│   │   │   ├── index.tsx       # Main layout wrapper
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── I18nSwitcher.tsx
│   │   │   ├── menu.tsx
│   │   │   └── navbar/
│   │   │       ├── constant.ts  # Nav items config
│   │   │       ├── desktop/     # Desktop nav (index.tsx, item.tsx)
│   │   │       └── mobile/      # Mobile nav (index.tsx, item.tsx)
│   │   ├── post/               # Post-specific components
│   │   │   ├── item.tsx        # Post list item/card
│   │   │   ├── NewPostForm.tsx  # Post creation form
│   │   │   └── MarkdownEditor.tsx # MD editor (admin-only, lazy-load)
│   │   └── shared/             # Shared components
│   │       ├── Container.tsx    # ContainerOuter/Inner layout
│   │       ├── Markdown.tsx     # Markdown renderer (lazy-load Shiki)
│   │       ├── CodeBlock.tsx    # Code block with Shiki (client-only)
│   │       ├── ClientOnly.tsx   # Client-only render boundary
│   │       └── card/           # Reusable card components
│   │           ├── index.tsx
│   │           ├── title.tsx
│   │           ├── description.tsx
│   │           ├── link.tsx
│   │           ├── cta.tsx
│   │           └── eyeBrown.tsx
│   │
│   ├── routes/                 # === FILE-BASED ROUTING ===
│   │   ├── __root.tsx          # Root layout (providers, global styles)
│   │   ├── index.tsx           # / → redirects to /$lang
│   │   ├── api/                # API endpoints (no UI)
│   │   │   ├── upload.ts       # POST /api/upload (R2 image upload)
│   │   │   └── webhooks/
│   │   │       └── clerk.ts    # POST /api/webhooks/clerk (user sync)
│   │   └── $lang/              # Language-scoped routes
│   │       ├── index.tsx       # /$lang (Home)
│   │       ├── about.tsx       # /$lang/about
│   │       ├── projects.tsx    # /$lang/projects
│   │       ├── login.tsx       # /$lang/login (Clerk sign-in)
│   │       ├── posts/
│   │       │   ├── index.tsx   # /$lang/posts (Blog list)
│   │       │   └── $slug.tsx   # /$lang/posts/:slug (Post detail)
│   │       └── _protected/     # Auth-required routes
│   │           ├── route.tsx   # Auth boundary (beforeLoad check)
│   │           ├── new.tsx     # /$lang/new (Create post)
│   │           └── admin/
│   │               ├── route.tsx  # Admin layout (admin check)
│   │               └── queue.tsx  # /$lang/admin/queue (post queue)
│   │
│   └── locales/                # === TRANSLATION FILES ===
│       ├── index.ts            # Locale registry & type exports
│       ├── en.ts               # English translations
│       └── vi.ts               # Vietnamese translations
│
├── tsconfig.json               # TypeScript config (strict, ~/* alias)
├── typography.ts               # Tailwind typography customization
├── vite.config.ts              # Vite + Cloudflare plugin config
└── wrangler.jsonc              # Cloudflare Workers config (bindings, routes)
```

### Architectural Boundaries

**Server Boundary (`src/server/`):**

- ONLY imported by server functions (`createServerFn` handlers) and API routes
- NEVER imported by components or client-side code
- Contains: DB client, schema, queries, R2 client, migrations
- Runs in: Cloudflare Workers V8 isolate

**Shared Boundary (`src/shared/`):**

- Imported by both server functions and client components
- Must be Worker-compatible AND browser-compatible
- Contains: Zod schemas, types, utilities, hooks, providers, constants
- Server functions live here (they're isomorphic — defined in shared, executed on server)

**Component Boundary (`src/components/`):**

- Client-side React components only
- `ui/` — shadcn primitives (managed by `shadcn` CLI, avoid manual edits)
- `post/` + `shared/` — feature components (admin-only components must be lazy-loaded)
- `layout/` — layout shell (always in main bundle)
- `form/` — TanStack Form wrappers (shared across admin forms)

**Route Boundary (`src/routes/`):**

- `$lang/` — public pages (SSR, SEO-critical, Lighthouse-audited)
- `$lang/_protected/` — auth-required pages (admin editor, post queue)
- `api/` — API endpoints (upload, webhooks — no React, server-only)
- Each route file is a code-split chunk (automatic by TanStack Router)

**Bundle Boundary (critical for 3MB limit):**

- **Main bundle**: layout, routing, providers, Tailwind — must stay lean
- **Public route chunks**: post list, post detail, home, about, projects — SSR + client hydration
- **Admin chunks**: `_protected/*` — loaded only for authenticated admin
- **Lazy chunks**: `Markdown.tsx` (Shiki), `MarkdownEditor.tsx` (MD editor) — `React.lazy()` + Suspense

### Requirements to Structure Mapping

**FR: Content Management (8 FRs):**

- Schema: `src/server/db/schema.ts` (posts table)
- Queries: `src/server/db/queries.ts` (CRUD operations)
- Services: `src/shared/services/post.ts` (createPostFn, updatePostFn, deletePostFn)
- Schemas: `src/shared/schemas/post.ts` (Zod validation)
- UI: `src/components/post/` (NewPostForm, item, MarkdownEditor)
- Routes: `src/routes/$lang/posts/`, `src/routes/$lang/_protected/new.tsx`

**FR: Bilingual Content (5 FRs):**

- Services: `src/shared/services/translation.ts` (createTranslationFn, getPostTranslation)
- Hooks: `src/shared/hooks/useTranslation.ts`
- Provider: `src/shared/providers/i18n.tsx`
- Locales: `src/locales/en.ts`, `src/locales/vi.ts`
- Routes: `src/routes/$lang/` (all routes scoped by `$lang`)
- Constants: `src/shared/constants/i18n.ts`

**FR: Admin & Moderation (5 FRs — simplified for MVP):**

- Services: `src/shared/services/admin.ts`
- Queries: `src/shared/tanstackQueries/admin.ts`
- Routes: `src/routes/$lang/_protected/admin/`
- Auth boundary: `src/routes/$lang/_protected/route.tsx`

**FR: Portfolio Display (4 FRs):**

- Route: `src/routes/$lang/projects.tsx`
- Components: `src/components/shared/card/` (reusable project cards)

**FR: Navigation & Discovery (4 FRs):**

- Components: `src/components/layout/navbar/`
- Routes: `src/routes/$lang/posts/index.tsx` (filtering, search, pagination)
- Queries: `src/shared/tanstackQueries/post.ts`

**FR: User Experience (4 FRs):**

- Theme: `src/shared/providers/theme.tsx`, `src/components/layout/ThemeToggle.tsx`
- Layout: `src/components/layout/`, `src/components/shared/Container.tsx`
- Design system: `DESIGN.md` (enforced via components)

**FR: SEO & Analytics (3 FRs):**

- Routes: SSR meta tags in each route's `meta` export
- Public: `public/robots.txt`
- Analytics: Cloudflare Analytics (configured in `wrangler.jsonc`)

### Cross-Cutting Concern Mapping

| Concern       | Files Affected                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| i18n          | `locales/*`, `shared/hooks/useTranslation.ts`, `shared/providers/i18n.tsx`, all `$lang/` routes           |
| Auth          | `shared/services/admin.ts`, `routes/$lang/_protected/route.tsx`, `routes/api/webhooks/clerk.ts`           |
| Design System | `styles.css`, `typography.ts`, `components/ui/*`, `components/shared/Container.tsx`                       |
| Bundle Size   | `components/shared/Markdown.tsx`, `components/post/MarkdownEditor.tsx`, `components/shared/CodeBlock.tsx` |
| SSR Safety    | `components/shared/ClientOnly.tsx`, all components using browser APIs                                     |

### External Integration Points

| Integration          | Entry Point                                                 | Protocol                       |
| -------------------- | ----------------------------------------------------------- | ------------------------------ |
| Neon PostgreSQL      | `src/server/db/client.ts`                                   | HTTP (Neon serverless driver)  |
| Clerk Auth           | `src/routes/api/webhooks/clerk.ts` + `_protected/route.tsx` | Clerk SDK + webhook            |
| Cloudflare R2        | `src/server/r2/client.ts` + `src/routes/api/upload.ts`      | S3 API via aws4fetch           |
| Cloudflare Analytics | `wrangler.jsonc`                                            | Cloudflare dashboard (no code) |

### Data Flow

```
User Request → Cloudflare Workers (SSR)
  → TanStack Router (route matching, $lang extraction)
    → beforeLoad (auth check if _protected/)
    → loader (server function call via createServerFn)
      → Zod validation (shared/schemas/)
      → DB query (server/db/queries.ts → Neon HTTP)
    → Component render (SSR HTML)
  → Client hydration
    → TanStack Query (cache, refetch)
    → React components (interactive)

Admin Write Flow:
  Component → TanStack Form → Zod validation → createServerFn
    → withAdmin() check → DB mutation → invalidate queries
    → (if upload) → R2 client → Cloudflare R2
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are Worker-compatible and tested together. TanStack Start + Cloudflare Workers + Neon serverless HTTP driver + Clerk SDK + Shiki fine-grained bundle — no conflicts identified. Versions verified against `package.json`.

**Pattern Consistency:**
Naming conventions are consistent across layers (`camelCase` code, `snake_case` DB, `PascalCase` components). Error code pattern aligns with i18n requirement. Auth patterns (route-level + function-level) are complementary.

**Structure Alignment:**
`server/` boundary prevents client-side DB imports. `shared/` enables server function + component co-use. Route structure maps cleanly to auth + i18n boundaries. `ClientOnly.tsx` exists for SSR safety.

### Requirements Coverage Validation ✅

**Functional Requirements (33 FRs):**

| FR Category            | Count | Status        | Notes                                                                                |
| ---------------------- | ----- | ------------- | ------------------------------------------------------------------------------------ |
| Content Management     | 8     | ✅ Covered    | Post CRUD, Markdown, image upload all mapped                                         |
| Bilingual Content      | 5     | ✅ Covered    | Translation groups, `$lang` routing, locale files                                    |
| Admin & Moderation     | 5     | ⚠️ Simplified | 2 FRs active (draft→published), 3 approval FRs deferred — documented as scope change |
| Portfolio Display      | 4     | ✅ Covered    | Projects route + card components                                                     |
| Navigation & Discovery | 4     | ✅ Covered    | Navbar, search, filtering, pagination                                                |
| User Experience        | 4     | ✅ Covered    | Theme, responsive, keyboard nav, loading states                                      |
| SEO & Analytics        | 3     | ✅ Covered    | SSR meta, robots.txt, Cloudflare Analytics                                           |

**Non-Functional Requirements (25 NFRs):**

| NFR Category  | Status | Architectural Support                                                         |
| ------------- | ------ | ----------------------------------------------------------------------------- |
| Performance   | ✅     | SSR on edge, TanStack Query caching, lazy loading, code splitting             |
| Bundle Size   | ✅     | 3MB limit, Shiki constraints, dependency gate, 2.5MB target with headroom     |
| Accessibility | ✅     | WCAG 2.1 AA, Radix UI accessible primitives, semantic HTML in patterns        |
| Security      | ✅     | Clerk auth, `withAdmin()` wrapper, upload validation, error code sanitization |
| Reliability   | ✅     | Error boundaries, try/catch in server functions, graceful degradation         |

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with versions from `package.json`. 6 ADRs with risk levels. Deferred decisions explicitly listed.

**Structure Completeness:** Every existing file in `src/` documented. All 5 boundaries defined (server, shared, component, route, bundle). 4 external integrations mapped.

**Pattern Completeness:** 12 enforcement rules. Code examples for every pattern. 9 anti-pattern examples. 6 pre-mortem gaps addressed.

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (non-blocking, implementation tasks):**

1. `shared/utils/queryKeys.ts` — defined in patterns, needs creation in first story
2. `withAdmin()` utility wrapper — defined in patterns, needs creation in first story
3. `admin/queue.tsx` — repurpose as post management page (approval workflow removed)

**Nice-to-Have Gaps (post-MVP):**

1. Testing framework selection and test architecture
2. Dynamic sitemap generation
3. CI/CD pipeline with GitHub Actions

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (33 FRs, 25 NFRs)
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (Workers 3MB, no Node APIs, Neon HTTP)
- [x] Cross-cutting concerns mapped (7 concerns)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (6 ADRs)
- [x] Technology stack fully specified (from `package.json`)
- [x] Integration patterns defined (Neon, Clerk, R2, Analytics)
- [x] Performance considerations addressed (lazy loading, code splitting, SSR)
- [x] Scope change documented (post lifecycle simplification)

**✅ Implementation Patterns**

- [x] Naming conventions established (DB, code, routes)
- [x] Structure patterns defined (placement rules, test organization)
- [x] Communication patterns specified (query keys factory, state management)
- [x] Process patterns documented (error handling, SSR safety, dependency management, auth, i18n)
- [x] 12 enforcement rules for AI agents
- [x] Anti-patterns with examples

**✅ Project Structure**

- [x] Complete directory structure defined (every file documented)
- [x] Component boundaries established (5 boundaries)
- [x] Integration points mapped (4 external services)
- [x] Requirements to structure mapping complete (all 7 FR categories)
- [x] Data flow diagrams (read flow, admin write flow)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

- Brownfield project with working codebase — architecture documents reality, not theory
- Bundle size constraints thoroughly addressed with multiple safety nets (ADR-3, dependency gate, 2.5MB target)
- i18n is architecturally first-class (route-level, content-level, UI-level)
- Clear boundaries prevent AI agents from making structural mistakes
- Pre-mortem analysis caught 6 non-obvious failure modes before implementation

**Areas for Future Enhancement:**

- Testing framework selection (post-MVP)
- CI/CD pipeline with GitHub Actions (post-MVP)
- Image optimization pipeline (post-MVP)
- Rate limiting when traffic grows (post-MVP)
- Full approval workflow when guest authors added (post-MVP)

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Check the 12 enforcement rules before every PR

**First Implementation Priorities:**

1. Create `shared/utils/queryKeys.ts` (query key factory)
2. Create `withAdmin()` utility wrapper
3. Simplify `postStatusEnum` to `['draft', 'published']`
4. Repurpose `admin/queue.tsx` as post management dashboard
