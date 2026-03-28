# CI Pipeline Guide

GitHub Actions test pipeline at `.github/workflows/test.yml`.

## Jobs

| Job | Trigger | Time |
|-----|---------|------|
| `lint` | push / PR | ~2 min |
| `unit` | push / PR | ~1 min |
| `e2e` (×3 browsers) | push / PR | ~10 min |
| `burn-in` | PR + weekly schedule | ~30 min |
| `report` | always | ~1 min |

## Required Secrets

Set in **Repository Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

## First-Time Setup

```bash
# 1. Push the workflow file
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions test pipeline"
git push

# 2. Add secrets in GitHub UI (see above)

# 3. Open a PR to trigger the first run
```

## Running Locally

```bash
# Mirror CI pipeline
./scripts/ci-local.sh          # all stages
./scripts/ci-local.sh lint     # lint only
./scripts/ci-local.sh unit     # unit tests only
./scripts/ci-local.sh e2e      # E2E chromium only

# Burn-in (flaky detection)
./scripts/burn-in.sh           # 10 iterations, chromium
./scripts/burn-in.sh 5         # 5 iterations
./scripts/burn-in.sh 10 firefox  # 10 iterations, firefox
```

## Troubleshooting

**Tests pass locally but fail in CI**
- Check that all required secrets are set
- Run `./scripts/ci-local.sh e2e` to mirror CI environment

**E2E server won't start**
- Ensure port 3000 is free: `lsof -ti:3000 | xargs kill`
- Check that `DATABASE_URL` is valid

**Burn-in too slow**
- Reduce to 5 iterations locally: `./scripts/burn-in.sh 5`
- Weekly schedule runs 10 iterations on CI only

**Cache miss every run**
- Verify `package-lock.json` is committed and not gitignored
