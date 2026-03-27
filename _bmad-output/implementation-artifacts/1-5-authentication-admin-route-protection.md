# Story 1.5: Authentication & Admin Route Protection

Status: review

## Story

As the admin,
I want to sign in via Clerk and access protected routes,
So that I can manage content while keeping admin pages secure from public visitors.

## Acceptance Criteria

1. **Public Access:** All public pages load normally without auth requirements (FR22).

2. **Unauthenticated Redirect:** Navigating to `/$lang/_protected/*` redirects to `/$lang/login` (NFR9). No broken UI state (NFR20).

3. **Login Page:** `/$lang/login` renders Clerk `<SignIn>` component. After auth, redirects to the intended protected route.

4. **Authenticated Access:** Admin accesses protected routes successfully. Auth state available via Clerk's context.

5. **withAdmin() Wrapper:** A `withAdmin()` utility wraps server functions. Calling a `withAdmin()`-wrapped function as a non-admin throws an `UNAUTHORIZED` error code, handled gracefully in the UI.

6. **Sign Out:** Clicking sign out redirects to the public home page. Protected routes no longer accessible after sign out.

7. **Secret Isolation:** `ADMIN_USER_ID`, database URL, R2 credentials are not present in client-side JavaScript bundles (NFR12).

## Context: Brownfield — ~90% Already Implemented

Clerk auth, protected routes, login page, and sign out are all working. The only missing piece is the `withAdmin()` utility wrapper — currently each server function does inline `isAdmin()` checks instead of using a wrapper.

### What Already Exists (DO NOT recreate):
- `src/routes/__root.tsx` — `<ClerkProvider>` wraps the entire app
- `src/routes/$lang/_protected/route.tsx` — `beforeLoad` calls `checkAuth()` server fn, throws on unauthenticated, redirects to `/$lang/login`
- `src/routes/$lang/_protected/admin/route.tsx` — additional `beforeLoad` checks `isAdmin()`, redirects non-admins to home
- `src/routes/$lang/login.tsx` — renders Clerk `<SignIn>` with `fallbackRedirectUrl` support
- `src/components/layout/menu.tsx` — `<SignOutButton>` with `redirectUrl={localizedPath("/")}`
- `src/components/layout/Header.tsx` — shows login button or `<UserMenu>` based on `useUser()`
- `src/env.ts` — `ADMIN_USER_ID` server env var, `isAdmin(clerkId)` helper, proper `clientPrefix: "VITE_"` secret isolation
- `src/shared/services/admin.ts` — server functions with inline `isAdmin()` checks

### What Is Missing:
- **`withAdmin()` wrapper utility** — architecture requires this; currently each server function has inline `isAdmin()` checks. The `withAdmin()` wrapper should extract this cross-cutting concern into one place.

### Architecture Reference for withAdmin():
From `architecture.md`:
```typescript
// ✅ withAdmin wrapper for server functions
const updatePost = createServerFn({ method: "POST" })
  .validator(z.object({ ... }))
  .handler(withAdmin(async ({ data }) => {
    // handler body — auth already checked
  }))
```

`withAdmin()` wraps the handler function, checks `isAdmin()`, and throws `UNAUTHORIZED` if not admin.

## Tasks / Subtasks

- [x] **Task 1: Create withAdmin() utility** (AC: #5)
  - [x] 1.1: Read `src/env.ts` to understand `isAdmin()` and `ADMIN_USER_ID`.
  - [x] 1.2: Read `src/shared/services/admin.ts` to understand current inline auth pattern.
  - [x] 1.3: Created `src/server/utils/withAdmin.ts` with flexible `any`-typed ctx (Biome suppression comment) to handle both GET and POST handler signatures.
  - [x] 1.4: `withAdmin` exported from `src/server/utils/withAdmin.ts`.
  - [x] 1.5: Existing inline checks in `admin.ts` NOT refactored — Epic 4 concern.

- [x] **Task 2: Verify setup note for ADMIN_USER_ID** (AC: #5, #7)
  - [x] 2.1: `ADMIN_USER_ID` is NOT set in `.env.local`. Admin features will silently return `false` from `isAdmin()` until set. Set it to your Clerk user ID to enable admin access.
  - [x] 2.2: No code change needed — environment setup concern.

- [x] **Task 3: Verify all acceptance criteria** (AC: #1–7)
  - [x] 3.1: Navigate to public pages — no auth required ✓.
  - [x] 3.2: Navigate to `/$lang/_protected/new` while unauthenticated — redirected to `/$lang/login` ✓.
  - [x] 3.3: Sign in via Clerk — redirected back to intended route ✓.
  - [x] 3.4: Sign out — redirected to home, protected routes inaccessible ✓.
  - [x] 3.5: `env.ts` clientPrefix: "VITE_" — `ADMIN_USER_ID` never reaches client bundle ✓.
  - [x] 3.6: `npm run build` passes (✓ built in 4.79s).
  - [x] 3.7: Biome check — 0 errors.

## Dev Notes

### Architecture Compliance
- **Two-layer auth model**: Clerk (identity) + `ADMIN_USER_ID` env var (admin role). No database role table — this is by design.
- **Route-level vs function-level**: `_protected/route.tsx` guards pages (Clerk auth only). `withAdmin()` guards server functions (Clerk + admin role). These are complementary, not redundant.
- **Error codes**: Server functions should throw `new Error("UNAUTHORIZED")` — never expose internal details. UI maps error codes to localized messages.
- **Secret isolation**: `src/env.ts` uses `clientPrefix: "VITE_"` — only `VITE_CLERK_PUBLISHABLE_KEY` reaches the client. All other secrets are server-only.

### withAdmin() Placement
Place at `src/server/utils/withAdmin.ts` — this follows the architecture's `server/` boundary for server-only utilities. Do NOT place in `shared/` (shared is for server fn + component co-use; `withAdmin` is server-only).

### Clerk Import Pattern
Use `auth` from `@clerk/tanstack-react-start/server` (not the client import). This is the same import used in `_protected/route.tsx` checkAuth server function.

### Key File Locations
- `src/env.ts` — `isAdmin()` helper (read-only reference)
- `src/routes/$lang/_protected/route.tsx` — existing auth check pattern (reference)
- `src/server/utils/withAdmin.ts` — NEW file to create
- `src/shared/services/admin.ts` — existing inline pattern (do NOT refactor now)

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- withAdmin uses `any`-typed ctx with Biome suppression comment — handler signatures differ between GET (no data) and POST (data: T), so a strict generic wasn't practical
- ADMIN_USER_ID not set in .env.local — add it to enable admin access (set to your Clerk user ID)
- Existing inline isAdmin() checks in admin.ts intentionally NOT refactored — that's Epic 4 scope

### File List
- src/server/utils/withAdmin.ts
