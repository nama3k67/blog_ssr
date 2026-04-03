# Test Automation Summary — Epic 4

Generated: 2026-04-03

## Generated Tests

### Unit Tests

- [x] `tests/unit/slug.test.ts` — `generateSlug` utility: English text, Vietnamese diacritics (22 tests)
- [x] `tests/unit/post-schemas.test.ts` — Zod schema validation for create/update/translation schemas (31 tests)

### E2E Tests

- [x] `tests/e2e/epic4-admin-guards.spec.ts` — Admin route auth guards: unauthenticated access redirects to `/$lang` (9 tests)
- [x] `tests/e2e/epic4-upload-api.spec.ts` — Upload API rejects unauthenticated/malformed requests (3 tests)

## Coverage

### Unit Tests

| Feature | File | Tests | Stories |
|---------|------|-------|---------|
| Slug generation | `slug.test.ts` | 22 | 4.1, 4.2 |
| Post create schema | `post-schemas.test.ts` | 8 | 4.1 |
| Post update schema | `post-schemas.test.ts` | 4 | 4.4 |
| Translation schema (incl. categoryId/tagIds fix) | `post-schemas.test.ts` | 13 | 4.6 |
| Translation form schema | `post-schemas.test.ts` | 4 | 4.6 |
| Update form schema | `post-schemas.test.ts` | 3 | 4.4 |

### E2E Tests

| Feature | File | Tests | Stories |
|---------|------|-------|---------|
| `/en/new` auth redirect | `epic4-admin-guards.spec.ts` | 1 | 4.1 |
| `/en/admin/queue` auth redirect | `epic4-admin-guards.spec.ts` | 1 | 4.5 |
| `/en/edit/:id` auth redirect | `epic4-admin-guards.spec.ts` | 1 | 4.4 |
| `/en/translate/:id` auth redirect | `epic4-admin-guards.spec.ts` | 1 | 4.6 |
| VI language equivalents | `epic4-admin-guards.spec.ts` | 4 | 4.1, 4.4, 4.5, 4.6 |
| Redirect lands on valid page | `epic4-admin-guards.spec.ts` | 1 | all |
| Upload API no-auth rejection | `epic4-upload-api.spec.ts` | 3 | 4.3 |

## Auth-Gated Tests (not automatable without Clerk test helpers)

The following ACs require an authenticated admin session and cannot be tested until
`@clerk/testing` is configured in `tests/support/fixtures/auth.ts`:

- Story 4.2: Markdown editor renders live preview, toolbar actions, mobile toggle
- Story 4.3: Upload succeeds with valid image file, rejects oversized/wrong-type files
- Story 4.4: Create post → draft saved; Publish → post appears on public listing
- Story 4.5: Dashboard renders all posts; filters work; delete/publish/unpublish inline
- Story 4.6: Create Translation form pre-fills; submit creates draft in target lang; "Edit Translation" link appears

## Next Steps

- Run `npm run test:e2e` with a dev server running to verify redirect tests pass
- Install `@clerk/testing` and extend `tests/support/fixtures/auth.ts` to unlock admin-session tests
