# Test Suite

Two test layers: **Vitest** (unit) and **Playwright** (E2E).

## Setup

```bash
# Install dependencies (already done via npm install)
npm install

# Copy and fill test env vars
cp .env.test.example .env.test
```

## Running Tests

```bash
# Unit tests (fast, no browser, no server needed)
npm test                  # run once
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report

# E2E tests (requires running dev server)
npm run dev               # terminal 1 — start dev server
npm run test:e2e          # terminal 2 — run all E2E tests
npm run test:e2e:ui       # interactive Playwright UI
npm run test:e2e:headed   # run with visible browser
```

## Architecture

```
tests/
├── e2e/                    # Playwright E2E specs
│   ├── home.spec.ts
│   ├── about.spec.ts
│   └── projects.spec.ts
├── unit/                   # Vitest unit tests
│   ├── locales.test.ts     # Locale key completeness
│   ├── author-data.test.ts # Static author data shape
│   └── projects-data.test.ts
└── support/
    ├── fixtures/
    │   ├── index.ts        # mergeTests entry point
    │   ├── i18n.ts         # lang + localizedUrl fixtures
    │   └── auth.ts         # auth state fixtures
    ├── helpers/
    │   └── navigation.ts   # navigateTo, switchLanguage, toggleTheme
    └── page-objects/       # (add POM classes here as needed)
```

## Selector Strategy

Always prefer semantic selectors in order:
1. `getByRole()` — `heading`, `link`, `button`, `img`
2. `getByText()` / `getByLabel()` — visible text
3. `getByTestId()` — add `data-testid` sparingly for complex cases
4. Never use CSS class selectors (they change with Tailwind refactors)

## Test Isolation

- Each E2E test navigates to a fresh URL — no shared state between tests
- Unit tests are pure functions with no side effects
- Auth fixtures reset between test files via Playwright's `storageState`

## Adding New Tests

**New route** → add `tests/e2e/<route>.spec.ts`
**New static data file** → add `tests/unit/<data-name>.test.ts`
**New locale keys** → the `locales.test.ts` test catches missing keys automatically

## CI Integration

The E2E suite requires a running app. In CI:

```yaml
- run: npm run build && npm run start &
- run: npx wait-on http://localhost:3000
- run: npm run test:e2e
```

Playwright artifacts (traces, screenshots) are retained on failure in `playwright-report/`.
