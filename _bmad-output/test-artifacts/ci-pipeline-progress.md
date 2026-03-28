---
stepsCompleted: ['step-01-preflight', 'step-02-generate-pipeline', 'step-03-configure-quality-gates', 'step-04-validate-and-summary']
lastStep: 'step-04-validate-and-summary'
status: complete
lastSaved: '2026-03-27'
---

## Step 1 — Preflight Results

### Detected Configuration
- **Stack:** fullstack (playwright.config.ts + vitest.config.ts)
- **CI Platform:** github-actions (inferred from github.com remote)
- **Node version:** 24 (from .nvmrc)
- **Package manager:** npm
- **Test framework:** Playwright (E2E) + Vitest (unit)
- **Unit tests:** 11/11 passing

### Environment Context
- Node 24 LTS
- npm cache key: package-lock.json hash
- Playwright browser cache: ~/.cache/ms-playwright
- No existing .github/workflows/ directory

## Step 2 — Generated Pipeline

### Output
- **File:** `.github/workflows/test.yml`
- **Platform:** GitHub Actions

### Pipeline Jobs
| Job | Trigger | Depends On |
|-----|---------|------------|
| `lint` | push/PR | — |
| `unit` | push/PR | lint |
| `e2e` (×3 browser matrix) | push/PR | lint |
| `burn-in` | PR + schedule | e2e |
| `report` | always | unit, e2e, burn-in |

### Key Decisions
- Node version resolved from `.nvmrc` (24) via `node-version-file`
- E2E parallelized as matrix: chromium · firefox · mobile-chrome
- `mobile-chrome` installs `chromium` engine (Pixel 5 preset is Chromium-based)
- Dev server started with `npm run dev &` + `npx wait-on` for E2E
- All secrets routed through `env:` blocks (script injection prevention)
- Burn-in targets chromium only (10 iterations, PR and schedule only)
- Artifacts retained 30 days on failure; coverage retained 7 days

### Required GitHub Secrets
- `DATABASE_URL` — Neon PostgreSQL connection string
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key

## Step 3 — Quality Gates & Notifications

### Burn-In
- **Status:** Enabled (fullstack stack)
- **Iterations:** 10
- **Browser:** chromium only
- **Trigger:** pull_request + schedule (weekly Sunday 02:00 UTC)

### Quality Gates
| Priority | Gate | Threshold |
|----------|------|-----------|
| P0 | Unit tests (Vitest) | 100% — any failure fails CI |
| P0 | E2E chromium | 100% — any failure fails CI |
| P1 | E2E firefox | 100% — matrix fail-fast: false |
| P1 | E2E mobile-chrome | 100% — matrix fail-fast: false |
| P0 | Burn-in (10 iterations) | 10/10 — any iteration failure fails CI |

### Contract Testing
- Not applicable (`tea_use_pactjs_utils` not configured)

### Notifications
- GitHub PR status checks surface all job results natively
- Optional: add `8398a7/action-slack` to `report` job for Slack alerts

## Step 4 — Validation & Summary

### Checklist Results
| Item | Status |
|------|--------|
| Config file at `.github/workflows/test.yml` | ✅ |
| Stages: lint, unit, e2e, burn-in, report | ✅ |
| Browser install (fullstack) | ✅ |
| npm cache + Playwright browser cache | ✅ |
| E2E matrix (3 projects), fail-fast: false | ✅ |
| Burn-in: 10 iterations, || exit 1, PR + schedule | ✅ |
| Artifacts on failure, 30d retention | ✅ |
| Secrets via env: blocks (injection prevention) | ✅ |
| Helper scripts: ci-local.sh, burn-in.sh | ✅ |
| Documentation: docs/ci.md | ✅ |

### Files Created
- `.github/workflows/test.yml` — GitHub Actions pipeline
- `scripts/ci-local.sh` — local CI mirror script
- `scripts/burn-in.sh` — local flaky detection script
- `docs/ci.md` — pipeline guide + secrets checklist

### Post-Setup Actions (user)
1. Add GitHub Secrets: `DATABASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
2. Commit + push `.github/workflows/test.yml` and helper files
3. Open a PR to trigger the first CI run
4. Monitor pipeline in GitHub Actions tab
