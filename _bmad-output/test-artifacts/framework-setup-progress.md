---
stepsCompleted: ['step-01-preflight', 'step-02-select-framework', 'step-03-scaffold-framework', 'step-04-docs-and-scripts', 'step-05-validate-and-summary']
lastStep: 'step-05-validate-and-summary'
lastSaved: '2026-03-27'
status: complete
---

## Step 1 — Preflight Results

### Detected Stack
- **Type:** fullstack (React 19 SSR + Cloudflare Workers backend)
- **Bundler:** Vite 7 + @cloudflare/vite-plugin
- **Framework:** TanStack Start v1.159.5
- **Runtime:** Cloudflare Workers (edge SSR)
- **Auth:** Clerk (@clerk/tanstack-react-start)
- **DB:** Drizzle ORM + Neon PostgreSQL (serverless)
- **Language:** TypeScript (strict)

### Prerequisites
- ✅ package.json present
- ✅ No existing E2E framework (no playwright.config.*, cypress.config.*)
- ✅ No existing test runner (no Vitest, Jest, or similar in devDependencies)
- ✅ Architecture context available via CLAUDE.md

## Step 2 — Framework Selection

### Selected Frameworks
- **E2E:** Playwright — multi-browser, SSR-compatible, fast CI parallelism
- **Unit:** Vitest — zero-config in Vite ecosystem, fast locale/data/utility tests

### Rationale
Playwright chosen over Cypress: large SSR repo, Cloudflare Workers runtime, auth-gated routes needing API interception, multi-browser coverage.
Vitest chosen for unit layer: already in the Vite monorepo, no extra dependencies, ideal for locale completeness + data shape tests.

---

### Key Constraints
- Cloudflare Workers free tier: 3MB gzip bundle limit
- SSR environment — tests must account for server-rendered HTML
- No window/DOM on server (SSR-safe components only)
- Auth-gated routes (Clerk) need test user handling
