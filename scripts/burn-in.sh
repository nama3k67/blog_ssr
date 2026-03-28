#!/bin/bash
# burn-in.sh — run N iterations of E2E tests to detect flaky tests
# Usage: ./scripts/burn-in.sh [iterations] [project]
#   iterations  number of runs (default: 10)
#   project     Playwright project name (default: chromium)
set -euo pipefail

ITERATIONS="${1:-10}"
PROJECT="${2:-chromium}"

echo "Starting burn-in: $ITERATIONS iterations on $PROJECT"

# Start dev server in background
npm run dev &
DEV_PID=$!
trap "kill $DEV_PID 2>/dev/null" EXIT

npx wait-on http://localhost:3000 --timeout 60000

for i in $(seq 1 "$ITERATIONS"); do
  echo "Iteration $i/$ITERATIONS"
  npx playwright test --project="$PROJECT" || {
    echo "FAILED at iteration $i — flaky test detected"
    exit 1
  }
done

echo "Burn-in complete — no flaky tests detected after $ITERATIONS iterations"
