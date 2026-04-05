# Story 5.2: Structured Data (JSON-LD)

Status: review

## Story

As a search engine,
I want structured data embedded in page HTML,
so that I can display rich snippets (article info, author details) in search results.

## Acceptance Criteria

1. **Article schema on blog post pages**: When `/$lang/posts/$slug` renders (SSR), a `<script type="application/ld+json">` block is included with Article schema containing: `headline` (post title), `author` (name, url), `datePublished` (ISO 8601), `dateModified` (ISO 8601), `description`, `image` (featured image URL or fallback), `inLanguage` (`"en"` or `"vi"`).
2. **Person schema on About page**: When `/$lang/about` renders, a `<script type="application/ld+json">` block is included with Person schema containing: `name`, `jobTitle`, `url`, `sameAs` (GitHub URL from `SOCIAL_LINKS`).
3. **SSR-rendered**: Structured data is in the SSR HTML — NOT injected via client-side JS after hydration. Verify by viewing page source.
4. **Schema.org valid**: Both schemas must pass Google's Rich Results Test (manual verification). No required fields missing, correct `@context`/`@type`.

## Tasks / Subtasks

- [x] **Task 1: Add `AUTHOR_NAME` to `src/shared/data/author.ts`** (AC: #1, #2)
  - [x] 1.1: Add constant:
    ```ts
    export const AUTHOR_NAME = "Nam Tran";
    export const AUTHOR_JOB_TITLE = "Software Developer";
    ```
    These are referenced by both JSON-LD schemas (post author + about person).

- [x] **Task 2: Article JSON-LD on blog post detail page** (AC: #1, #3, #4)
  - [x] 2.1: In `src/routes/$lang/posts/$slug.tsx`, inside `RouteComponent`, build and render the Article schema:
    ```tsx
    import { AUTHOR_NAME, GITHUB_URL } from "~/shared/data/author";

    function RouteComponent() {
      const { post, isFallback, originalLang, translationSlug } = Route.useLoaderData();
      const { lang } = Route.useParams();
      // ... existing code ...

      const articleJsonLd = post
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description || undefined,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt, // no separate updatedAt in fetchPost output
            image: post.featuredImage
              ? post.featuredImage.startsWith("http")
                ? post.featuredImage
                : `${SITE_URL}${post.featuredImage}`
              : `${SITE_URL}/logo.png`,
            inLanguage: lang,
            author: {
              "@type": "Person",
              name: AUTHOR_NAME,
              url: `${SITE_URL}/en/about`,
            },
            publisher: {
              "@type": "Person",
              name: AUTHOR_NAME,
              url: `${SITE_URL}/en/about`,
            },
          }
        : null;

      return (
        <Container className="mt-16 sm:mt-32">
          {articleJsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
          )}
          {/* ... rest of existing component body ... */}
        </Container>
      );
    }
    ```
  - [x] 2.2: Place `<script>` tag as the **first child** inside the outermost JSX element (before any visible content) — this ensures it's high up in the SSR HTML.
  - [x] 2.3: Import `SITE_URL` is already present in this file (from Story 3.3). Do NOT add a duplicate import.

- [x] **Task 3: Person JSON-LD on About page** (AC: #2, #3, #4)
  - [x] 3.1: In `src/routes/$lang/about.tsx`, inside `RouteComponent`, build and render the Person schema:
    ```tsx
    import { AUTHOR_NAME, AUTHOR_JOB_TITLE, SOCIAL_LINKS, SITE_URL } from "...";

    function RouteComponent() {
      const { t, language } = useI18n();

      const personJsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: AUTHOR_NAME,
        jobTitle: AUTHOR_JOB_TITLE,
        url: `${SITE_URL}/en/about`,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      };

      return (
        <Container className="mt-16 sm:mt-32">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          />
          {/* ... rest of existing component body ... */}
        </Container>
      );
    }
    ```
  - [x] 3.2: `SOCIAL_LINKS` and `SITE_URL` are already imported in `about.tsx`. Add `AUTHOR_NAME`, `AUTHOR_JOB_TITLE` to the existing `author.ts` import line.

- [x] **Task 4: Build verification** (AC: all)
  - [x] 4.1: `npm run build` — 0 TypeScript errors, 0 Biome errors.
  - [ ] 4.2: `npm run dev`, view source of `/en/posts/[any-slug]` — confirm `<script type="application/ld+json">` in HTML body with Article schema.
  - [ ] 4.3: View source of `/en/about` — confirm Person schema `<script>` present.
  - [ ] 4.4: Validate JSON manually: paste the JSON-LD block into `https://validator.schema.org` — no errors.

## Dev Notes

### Why `dangerouslySetInnerHTML` in Component Body (Not `head()`)

TanStack Start's `head()` function supports `meta`, `links`, and possibly `scripts` arrays, but its `scripts` array is primarily designed for external script `src` references. For inline JSON-LD content, the standard React pattern is `dangerouslySetInnerHTML` in the component body.

**Is this SSR-safe?** Yes — TanStack Start renders the full component tree server-side. The `<script>` tag will be in the SSR HTML response. Google's structured data parser reads JSON-LD from anywhere in the document (`<head>` or `<body>`). Google docs explicitly state: "You can place a JSON-LD block anywhere in the page."

**React 19 note**: React 19 added hoisting for external `<script src>` tags, but NOT for inline `<script>` tags. Inline scripts remain in place in the component body — this is correct behavior.

### `$slug.tsx` — Existing Structure to Know

The component already uses `Route.useLoaderData()` and `SITE_URL`. The `post` object returned by `fetchPost` has:
```ts
{
  title: string,
  description: string | null,
  publishedAt: string, // ISO string (already serialized)
  featuredImage: string | null,
  author: { firstName: string | null, lastName: string | null, ... }
}
```
Note: `post.author` exists but the name may be split into `firstName`/`lastName`. Use `AUTHOR_NAME` constant instead of reconstructing from `post.author` — it avoids null-handling complexity.

### `about.tsx` — Existing Imports

Current imports in `about.tsx` already include:
```ts
import { AVATAR_URL, CONTACT_EMAIL, SKILLS, SOCIAL_LINKS } from "~/shared/data/author";
import { SITE_URL } from "~/shared/data/site";
```
Only add `AUTHOR_NAME`, `AUTHOR_JOB_TITLE` to the existing `author.ts` import.

### Article Schema — Field Notes

| Field | Value | Notes |
|-------|-------|-------|
| `@type` | `"Article"` | Standard article; `"BlogPosting"` (extends Article) is also valid |
| `headline` | `post.title` | Required by Google for rich snippets |
| `datePublished` | `post.publishedAt` | Already ISO 8601 string from `fetchPost` |
| `dateModified` | `post.publishedAt` | No separate `updatedAt` in `fetchPost` output — reuse |
| `image` | `post.featuredImage \|\| SITE_URL + "/logo.png"` | Must be absolute URL |
| `inLanguage` | `lang` | `"en"` or `"vi"` — lowercase BCP 47 tag |
| `author.url` | `${SITE_URL}/en/about` | Always English about page (author is not language-specific) |

### Person Schema — Field Notes

| Field | Value | Source |
|-------|-------|--------|
| `name` | `AUTHOR_NAME` = `"Nam Tran"` | New constant in `author.ts` |
| `jobTitle` | `AUTHOR_JOB_TITLE` = `"Software Developer"` | New constant in `author.ts` |
| `url` | `${SITE_URL}/en/about` | Canonical About page |
| `sameAs` | `SOCIAL_LINKS.map(l => l.href)` | `["https://github.com/nama3k67"]` |

### Architecture Constraints (MUST Follow)

- **SSR — no window checks needed**: `dangerouslySetInnerHTML` on `<script>` is safe in SSR — no browser API involved.
- **No new dependencies**: Pure JSON string — no `schema-dts`, `next-seo`, or any library. One `JSON.stringify()` call.
- **Biome**: tabs + double quotes in TS, single quotes in JSX string literals. `dangerouslySetInnerHTML` is valid JSX — Biome accepts it.
- **No `any` types**: Build the JSON-LD objects as plain object literals — TypeScript infers them correctly without explicit types.
- **Bundle impact**: Zero. Inline objects, one `JSON.stringify`. Well within 3MB bundle budget.

### What Already Exists (DO NOT RECREATE)

| Item | Location | Notes |
|------|----------|-------|
| `SITE_URL` | `src/shared/data/site.ts` | Already imported in `$slug.tsx` and `about.tsx` |
| `SOCIAL_LINKS`, `GITHUB_URL` | `src/shared/data/author.ts` | Already imported in `about.tsx` |
| `Route.useLoaderData()` in `$slug.tsx` | `src/routes/$lang/posts/$slug.tsx` | Returns `{ post, isFallback, translationSlug }` |
| `fetchPost` return shape | `src/shared/services/post.ts:109-122` | `title`, `description`, `publishedAt` (ISO string), `featuredImage`, `author` |
| `AVATAR_URL` | `src/shared/data/author.ts` | Already there — NOT needed for JSON-LD |

### Project Structure Notes

| File | Action |
|------|--------|
| `src/shared/data/author.ts` | ADD `AUTHOR_NAME`, `AUTHOR_JOB_TITLE` constants |
| `src/routes/$lang/posts/$slug.tsx` | ADD Article JSON-LD `<script>` in `RouteComponent` |
| `src/routes/$lang/about.tsx` | ADD Person JSON-LD `<script>` in `RouteComponent` |

### References

- [Source: epics.md#Epic5-Story5.2] — Acceptance criteria
- [Source: src/routes/$lang/posts/$slug.tsx] — `RouteComponent` structure, existing `SITE_URL` import
- [Source: src/routes/$lang/about.tsx] — `RouteComponent` structure, existing imports
- [Source: src/shared/data/author.ts] — `SOCIAL_LINKS`, `GITHUB_URL`, existing constants
- [Source: src/shared/services/post.ts:109-122] — `fetchPost` return shape
- [Source: implementation-artifacts/3-3-bilingual-content-seo-meta-tags.md] — `SITE_URL` usage, absoluteImage pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

(none)

### Completion Notes List

- Task 1: Added `AUTHOR_NAME = "Nam Tran"` and `AUTHOR_JOB_TITLE = "Software Developer"` constants to `src/shared/data/author.ts`.
- Task 2: Added `articleJsonLd` object in `RouteComponent` of `$slug.tsx`. Renders `<script type="application/ld+json">` as first child of `<Container>` — SSR-safe via `dangerouslySetInnerHTML`. Imports `AUTHOR_NAME` from `author.ts`; `SITE_URL` was already imported.
- Task 3: Added `personJsonLd` object in `RouteComponent` of `about.tsx`. Renders `<script type="application/ld+json">` as first child of `<Container>`. Added `AUTHOR_NAME`, `AUTHOR_JOB_TITLE` to existing `author.ts` import.
- Task 4: `npm run build` passed — 0 TypeScript errors, 0 Biome errors. Tasks 4.2, 4.3, 4.4 require manual browser verification (view page source + validator.schema.org).

### File List

- `src/shared/data/author.ts` — added `AUTHOR_NAME`, `AUTHOR_JOB_TITLE` constants
- `src/routes/$lang/posts/$slug.tsx` — added Article JSON-LD `<script>` in `RouteComponent`
- `src/routes/$lang/about.tsx` — added Person JSON-LD `<script>` in `RouteComponent`

## Change Log

- 2026-04-05: Implemented Story 5.2 — Added `AUTHOR_NAME`/`AUTHOR_JOB_TITLE` constants; Article JSON-LD on post detail page; Person JSON-LD on About page. Build passes with 0 errors.
