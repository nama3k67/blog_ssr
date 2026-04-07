# Story 5.3: Analytics & Conversion Tracking

Status: review

## Story

As the site owner,
I want to track page views and contact CTA interactions,
so that I can understand visitor behavior and measure conversion.

## Acceptance Criteria

1. **Page views captured server-side**: When a visitor loads any page, page view data is captured via Cloudflare's built-in analytics. Zero additional client-side JavaScript is loaded.
2. **CTA conversion tracked**: When a visitor clicks the contact CTA on the About page, the interaction is tracked as a conversion event. No client-side JS overhead beyond what's already in the bundle.
3. **No PII collected**: No user identity, IP address, or personally identifiable information is stored or logged in any tracking call.
4. **Cloudflare-native only**: All tracking uses Cloudflare's built-in capabilities only. No Google Analytics, Mixpanel, Plausible, or any third-party analytics script.

## Tasks / Subtasks

- [x] **Task 1: Enable Cloudflare Workers Observability** (AC: #1, #4)
  - [x] 1.1: In `wrangler.jsonc`, update the `observability` block:
    ```jsonc
    "observability": {
      "enabled": true,
      "head_sampling_rate": 1,
      "logs": {
        "enabled": true,
        "head_sampling_rate": 1,
        "persist": true,
        "invocation_logs": true
      }
    }
    ```
    Set top-level `"enabled": true` (was `false`). This enables Cloudflare Workers Observability which automatically captures request metrics (invocation count, CPU time, error rate) — no code changes required. Visible in Cloudflare dashboard under "Workers & Pages → [worker] → Observability".

- [x] **Task 2: Create CTA conversion tracking server function** (AC: #2, #3)
  - [x] 2.1: Create `src/shared/services/analytics.ts`:
    ```ts
    import { createServerFn } from "@tanstack/react-start";

    export const trackCtaClickFn = createServerFn({ method: "POST" }).handler(
      async () => {
        // Server-side log — visible in Cloudflare Workers logs (wrangler tail)
        // No PII: only event name + timestamp
        console.log(
          JSON.stringify({
            event: "cta_click",
            ts: new Date().toISOString(),
          }),
        );
        return { ok: true };
      },
    );
    ```
    — No auth guard needed (public event). No input validation needed (no data to validate). `console.log` in Cloudflare Workers writes to the structured logs visible via `wrangler tail` and in the Cloudflare dashboard (Observability → Logs).

- [x] **Task 3: Wire CTA button on About page** (AC: #2, #3)
  - [x] 3.1: In `src/routes/$lang/about.tsx`, find the contact CTA button/link (the email or contact CTA). Import `trackCtaClickFn` and add an `onClick` handler:
    ```tsx
    import { trackCtaClickFn } from "~/shared/services/analytics";

    // Inside RouteComponent, on the CTA element:
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      onClick={() => {
        // Fire-and-forget — don't await, don't block navigation
        trackCtaClickFn({ data: undefined }).catch(() => {});
      }}
      // ... existing className and children ...
    >
      {t.pages.about.contact}
    </a>
    ```
  - [x] 3.2: The `onClick` is a **fire-and-forget** call — do NOT `await` it, do NOT show loading state. The user navigates (or email client opens) immediately. If the tracking call fails, swallow the error silently.
  - [x] 3.3: Locate the exact CTA element in `about.tsx` first — it may be a `<a href="mailto:...">` or a `<Button>` component. Apply `onClick` to whichever renders the primary contact action.

- [x] **Task 4: Build verification** (AC: all)
  - [x] 4.1: `npm run build` — 0 TypeScript errors, 0 Biome errors.
  - [x] 4.2: `npm run dev`, open About page, open DevTools Network tab, click CTA — confirm a POST request to `/_server/trackCtaClickFn` (or similar TanStack Start server fn path) fires. Confirm no third-party analytics scripts in Network.
  - [x] 4.3: Confirm response `{ ok: true }` with 200 status.
  - [x] 4.4: In terminal running `npm run dev`, confirm `{"event":"cta_click","ts":"..."}` appears in the log output.

## Dev Notes

### Cloudflare Analytics Strategy — Why This Approach

The AC says "analytics operates within Cloudflare's built-in analytics capabilities" and "zero additional client-side JavaScript". This rules out:
- Cloudflare Web Analytics (uses a beacon script tag — client-side JS)
- Any third-party analytics SDK
- Cloudflare Analytics Engine (requires additional `analytics_engine_datasets` binding in wrangler.jsonc — overengineered for a personal blog)

**Chosen approach:**
1. **Page views**: Cloudflare Workers Observability — enabled via `wrangler.jsonc`, automatic request counting, visible in CF dashboard. **Zero code changes in application code.**
2. **CTA clicks**: `createServerFn` that `console.log`s a structured JSON event. Cloudflare Workers Observability captures all `console.log` output as structured logs (when `logs.enabled: true`). Filter `event: "cta_click"` in the Cloudflare Logs dashboard to see conversions.

### Why `createServerFn` (Not a Raw API Route)

`createServerFn` is the established pattern in this project for all server calls. The function becomes a POST endpoint automatically via TanStack Start's RPC mechanism — identical pattern to `createPostFn`, `trackConversionFn`, etc. No need to create a new API route file.

### `trackCtaClickFn` Call Pattern

`createServerFn` with `method: "POST"` requires a `data` argument. Since there's no input, pass `{ data: undefined }`:
```ts
trackCtaClickFn({ data: undefined }).catch(() => {});
```
OR if the server function uses `.inputValidator(...)` with optional input:
```ts
trackCtaClickFn().catch(() => {});
```
Check how other no-input server functions in the project call — use whichever matches existing convention.

### About Page — CTA Location

Read `src/routes/$lang/about.tsx` to find the contact CTA before implementing. Based on the component structure (CONTACT_EMAIL is imported and used), the CTA is likely an `<a href="mailto:...">` element. The `t.pages.about` locale keys include contact-related strings — check `src/locales/en.ts` for the exact key name.

Do NOT restructure the CTA or add loading state. Just add `onClick` as a fire-and-forget side effect.

### No PII — Implementation Guarantee

The `trackCtaClickFn` logs **only** `event` name and `ts` (timestamp). It does NOT log:
- Request IP (not accessible via `createServerFn` handler in this project)
- User agent
- Clerk user ID
- Email address or any form data

This satisfies GDPR/privacy requirements.

### Wrangler `observability.traces` — Leave Disabled

The current `wrangler.jsonc` has `traces.enabled: false`. Do NOT enable traces — they are more expensive and overkill for a personal blog. Only enable top-level `observability.enabled` and `logs`.

### Architecture Constraints (MUST Follow)

- **No new dependencies**: `console.log` + `JSON.stringify` — zero new packages.
- **`createServerFn` pattern**: Follows established project convention for server calls.
- **Bundle size**: `analytics.ts` is ~5 lines. Negligible impact. Well within 3MB.
- **Biome**: tabs, double quotes in TS string literals, single quotes in JSX.
- **No `withAdmin()`**: CTA tracking is a public event — no auth guard.

### What Already Exists (DO NOT RECREATE)

| Item | Location | Notes |
|------|----------|-------|
| `CONTACT_EMAIL` | `src/shared/data/author.ts` | Already imported in `about.tsx` — CTA likely uses this |
| `createServerFn` pattern | `src/shared/services/post.ts` | Follow existing pattern exactly |
| `wrangler.jsonc` observability block | `wrangler.jsonc` | Already exists with `enabled: false` — just update to `true` |

### Project Structure Notes

| File | Action |
|------|--------|
| `wrangler.jsonc` | UPDATE `observability.enabled: false` → `true` |
| `src/shared/services/analytics.ts` | CREATE — `trackCtaClickFn` server function |
| `src/routes/$lang/about.tsx` | UPDATE — add `onClick` to contact CTA |

### References

- [Source: epics.md#Epic5-Story5.3] — Acceptance criteria (FR32, FR33, NFR21)
- [Source: wrangler.jsonc] — Current observability config (`enabled: false`)
- [Source: src/routes/$lang/about.tsx] — CTA button location, existing imports
- [Source: src/shared/data/author.ts] — `CONTACT_EMAIL` import
- [Source: src/shared/services/post.ts] — `createServerFn` pattern to follow
- [Source: architecture.md#monitoring] — "Cloudflare Analytics (free) + `wrangler tail` for logs"

## Dev Agent Record

### Agent Model Used

claude-haiku-4-5-20251001

### Debug Log References

- Build completed successfully with 0 TypeScript and 0 Biome errors
- All unit tests pass (66 total, including 2 new analytics tests)
- No regressions detected in existing test suite

### Completion Notes List

✅ **Implementation Summary**

1. **Cloudflare Workers Observability enabled** — `wrangler.jsonc` `observability.enabled` set to `true`. Automatic request metrics now captured and visible in CF dashboard.

2. **CTA conversion tracking implemented** — New `src/shared/services/analytics.ts` with `trackCtaClickFn` server function. Uses `createServerFn({ method: "POST" })` pattern consistent with project conventions.

3. **About page CTA wired** — `src/routes/$lang/about.tsx` now imports `trackCtaClickFn` and fires tracking on contact CTA click. Fire-and-forget pattern prevents blocking user navigation. Error silently swallowed with `.catch(() => {})`.

4. **No PII collected** — `trackCtaClickFn` logs only event name and ISO timestamp. No user identity, IP, or form data.

5. **Tests added** — New unit test `tests/unit/analytics.test.ts` and new e2e test case in `tests/e2e/about.spec.ts` to verify POST request fires on CTA click.

6. **Bundle size maintained** — Zero new dependencies. `analytics.ts` adds ~0.82kB (minified). Well within 3MB Cloudflare Workers free tier limit.

### File List

- `wrangler.jsonc` — MODIFIED: Set `observability.enabled` from `false` to `true`
- `src/shared/services/analytics.ts` — CREATED: New server function for CTA tracking
- `src/routes/$lang/about.tsx` — MODIFIED: Added import and onClick handler for CTA tracking
- `tests/unit/analytics.test.ts` — CREATED: Unit tests for analytics service
- `tests/e2e/about.spec.ts` — MODIFIED: Added e2e test for CTA click tracking
