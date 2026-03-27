#!/bin/bash
# ci-local.sh — mirror the CI pipeline locally
# Usage: ./scripts/ci-local.sh [lint|unit|e2e|all]
set -euo pipefail

MODE="${1:-all}"

run_lint() {
  echo "==> Lint"
  npx biome check .
}

run_unit() {
  echo "==> Unit tests"
  npm test
}

run_e2e() {
  echo "==> E2E tests (chromium)"
  # Start dev server in background
  npm run dev &
  DEV_PID=$!
  trap "kill $DEV_PID 2>/dev/null" EXIT
  npx wait-on http://localhost:3000 --timeout 60000
  npx playwright test --project=chromium
}

case "$MODE" in
  lint)  run_lint ;;
  unit)  run_unit ;;
  e2e)   run_e2e ;;
  all)
    run_lint
    run_unit
    run_e2e
    ;;
  *)
    echo "Usage: $0 [lint|unit|e2e|all]"
    exit 1
    ;;
esac

echo "Done."
