# Story 3.3: Bilingual Content & SEO Meta Tags

Status: review

## Story

As a visitor,
I want to switch between English and Vietnamese versions of a blog post,
So that I can read content in my preferred language.

As a search engine,
I want proper meta tags and hreflang attributes,
So that I can index and display the correct language version in search results.

## Acceptance Criteria

1. **Translation toggle behavior:** When a Vietnamese translation exists for a post at `/en/posts/my-post`, the translation toggle navigates to `/vi/posts/my-post`. (Toggle UI already implemented in `$slug.tsx` via Story 3.2 — this story verifies the end-to-end behavior is correct.)

2. **Fallback banner:** When `/vi/posts/my-post` is requested but no Vietnamese version exists, the English version displays with a fallback banner. `fetchPost` returns `isFallback: true` and `originalLang: "en"`. (Already implemented — this story verifies it.)

3. **hreflang on post detail:** When a post exists in both languages, `<link rel="alternate" hreflang="en|vi|x-default">` tags are in the `<head>` with absolute URLs pointing to each language version.

4. **hreflang on static pages:** Home, About, Projects, and Posts Listing pages each include `<link rel="alternate" hreflang="en">`, `<link rel="alternate" hreflang="vi">`, and `<link rel="alternate" hreflang="x-default">` with absolute URLs.

5. **OG tags on all public pages:** Every public page has `og:title`, `og:description`, and `og:image` meta tags.

6. **Post detail OG image:** `og:image` on the post detail uses `post.featuredImage` when available, falling back to `/logo.png`.

7. **Per-page og:locale:** Post detail pages set `og:locale` to `en_US` or `vi_VN` based on `$lang`. Static pages inherit the global `og:locale` from `__root.tsx`.

8. **`<html lang>` attribute:** Set to the current `$lang` value on every page render — already implemented in `__root.tsx`.

9. **Image alt text & aria:** All content images have meaningful `alt` text. Decorative images (site logo, background assets) have `alt=""` and `aria-hidden="true"` (NFR17, UX-DR16).

## Context: Brownfield — ~30% Already Implemented

Translation toggle UI and fallback banner exist in `$slug.tsx`. `<html lang>` is set dynamically. Root-level OG/twitter tags exist globally. **This story's primary work is adding hreflang links and improving OG completeness across all routes.**

### What Already Exists (DO NOT recreate):

- `src/routes/__root.tsx` — Global `<html lang={currentLanguage}>` ✅, global OG/twitter defaults (og:type website, og:title, og:description, og:image `/logo.png`, twitter:card) ✅, robots `index, follow` ✅.
- `src/routes/$lang/posts/$slug.tsx` — `head()` with title, description, og:title, og:description, og:type `article`, twitter tags ✅. Translation toggle + fallback banner UI ✅ (strings fixed by Story 3.2).
- `src/routes/$lang/posts/index.tsx` — `head()` with title, description, og:title, og:description, twitter ✅.
- `src/routes/$lang/index.tsx` — `head()` with title + description ONLY (no OG tags ❌).
- `src/routes/$lang/about.tsx` — `head()` with title + description ONLY (no OG tags ❌).
- `src/routes/$lang/projects.tsx` — `head()` with title + description ONLY (no OG tags ❌).
- `src/env.ts` — `@t3-oss/env-core` with server + client config. Has `VITE_` client prefix. **No SITE_URL yet**.
- `src/shared/data/author.ts` — `GITHUB_URL`, `AVATAR_URL`, `CONTACT_EMAIL`, `SKILLS`, `SOCIAL_LINKS`.

### What Is Missing (IMPLEMENT THESE):

1. **`src/shared/data/site.ts`** — Does not exist. Create with `SITE_URL` constant used for absolute URL construction in hreflang/OG tags.
2. **hreflang links** — Missing from ALL routes (post detail, posts listing, home, about, projects).
3. **OG tags on home, about, projects** — Missing `og:title`, `og:description`, `og:image`.
4. **`og:image` on post detail** — Missing (uses featuredImage or fallback to `/logo.png`).
5. **`og:locale` override** — Post detail should output `vi_VN` for Vietnamese posts (root defaults to `en_US`).
6. **Decorative image accessibility** — Logo and background images need `alt=""` + `aria-hidden="true"` audit.

### Dependency on Story 3.2

This story modifies `$slug.tsx` `head()`. Story 3.2 also modifies `$slug.tsx` (component body, errorComponent, SSR split). Implement Story 3.2 BEFORE this story, or apply changes surgically to only the `head()` function without touching the component body.

## Tasks / Subtasks

- [x] **Task 1: Create SITE_URL constant** (AC: #3, #4)
  - [x] 1.1: Create `src/shared/data/site.ts`:
    ```ts
    /**
     * Absolute base URL for the site.
     * Set VITE_SITE_URL in .dev.vars for local dev and wrangler secret for production.
     * Falls back to production URL if env var is not set.
     */
    export const SITE_URL =
      (import.meta.env.VITE_SITE_URL as string | undefined) ??
      "https://blog.nama3k67.com";
    ```
  - [x] 1.2: Add `VITE_SITE_URL` to `.dev.vars` (local dev):
    ```
    VITE_SITE_URL=http://localhost:3000
    ```
    **Note:** `.dev.vars` is gitignored — this does not get committed. Remind user to set it.
  - [x] 1.3: Add `VITE_SITE_URL` to `src/env.ts` client config so it's type-validated:
    ```ts
    client: {
      VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
      VITE_SITE_URL: z.string().url().optional(),  // ← add this line
    },
    ```

- [x] **Task 2: Add hreflang + OG image to post detail** (AC: #3, #5, #6, #7)
  - [x] 2.1: In `src/routes/$lang/posts/$slug.tsx`, update `head()` to add `og:image`, `og:url`, `og:locale`, and hreflang links:
    ```ts
    import { SITE_URL } from "~/shared/data/site";

    head: ({ loaderData, params }) => {
      const post = loaderData?.post;
      const translationSlug = loaderData?.translationSlug;
      const lang = params.lang as "en" | "vi";
      const slug = params.slug;
      const ogLocale = lang === "vi" ? "vi_VN" : "en_US";
      const canonicalUrl = `${SITE_URL}/${lang}/posts/${slug}`;
      const ogImage = post?.featuredImage || "/logo.png";

      // Build hreflang links
      const hreflangLinks: Array<{ rel: string; hreflang: string; href: string }> = [];
      if (translationSlug) {
        const otherLang = lang === "en" ? "vi" : "en";
        const otherSlug = translationSlug;
        hreflangLinks.push(
          { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/posts/${lang === "en" ? slug : otherSlug}` },
          { rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/posts/${lang === "vi" ? slug : otherSlug}` },
          { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/posts/${lang === "en" ? slug : otherSlug}` },
        );
      } else {
        hreflangLinks.push({ rel: "alternate", hreflang: lang, href: canonicalUrl });
      }

      return {
        meta: [
          { title: `${post?.title || "Blog Post"} - My Blog` },
          { name: "description", content: post?.description || "Read this article on my blog." },
          { property: "og:title", content: post?.title || "Blog Post" },
          { property: "og:description", content: post?.description || "Read this article." },
          { property: "og:type", content: "article" },
          { property: "og:image", content: `${SITE_URL}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}` },
          { property: "og:url", content: canonicalUrl },
          { property: "og:locale", content: ogLocale },
          { name: "article:published_time", content: post?.publishedAt || new Date().toISOString() },
          { name: "twitter:title", content: post?.title || "Blog Post" },
          { name: "twitter:description", content: post?.description || "Read this article." },
          { name: "twitter:image", content: `${SITE_URL}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}` },
        ],
        link: hreflangLinks,
      };
    },
    ```
  - [x] 2.2: Verify TypeScript accepts `link` array with `hreflang` attribute (TanStack Start's `head()` type accepts arbitrary link attributes).

- [x] **Task 3: Add hreflang + OG to home page** (AC: #4, #5)
  - [x] 3.1: In `src/routes/$lang/index.tsx`, update `head()`:
    ```ts
    import { SITE_URL } from "~/shared/data/site";

    head: ({ params }) => {
      const lang = params.lang as "en" | "vi";
      const t = dictionaries[lang] || dictionaries.en;
      return {
        meta: [
          { title: t.pages.home.title },
          { name: "description", content: t.pages.home.description },
          { property: "og:title", content: t.pages.home.title },
          { property: "og:description", content: t.pages.home.description },
          { property: "og:image", content: `${SITE_URL}/logo.png` },
          { property: "og:url", content: `${SITE_URL}/${lang}/` },
        ],
        link: [
          { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/` },
          { rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/` },
          { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/` },
        ],
      };
    },
    ```

- [x] **Task 4: Add hreflang + OG to about page** (AC: #4, #5)
  - [x] 4.1: In `src/routes/$lang/about.tsx`, update `head()`:
    ```ts
    import { SITE_URL } from "~/shared/data/site";

    head: ({ params }) => {
      const lang = params.lang as "en" | "vi";
      const t = dictionaries[lang] || dictionaries.en;
      return {
        meta: [
          { title: t.pages.about.title },
          { name: "description", content: t.pages.about.description },
          { property: "og:title", content: t.pages.about.title },
          { property: "og:description", content: t.pages.about.description },
          { property: "og:image", content: `${SITE_URL}/logo.png` },
          { property: "og:url", content: `${SITE_URL}/${lang}/about` },
        ],
        link: [
          { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/about` },
          { rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/about` },
          { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/about` },
        ],
      };
    },
    ```

- [x] **Task 5: Add hreflang + OG to projects page** (AC: #4, #5)
  - [x] 5.1: In `src/routes/$lang/projects.tsx`, update `head()`:
    ```ts
    import { SITE_URL } from "~/shared/data/site";

    head: ({ params }) => {
      const lang = params.lang as "en" | "vi";
      const t = dictionaries[lang] || dictionaries.en;
      return {
        meta: [
          { title: t.pages.projects.title },
          { name: "description", content: t.pages.projects.description },
          { property: "og:title", content: t.pages.projects.title },
          { property: "og:description", content: t.pages.projects.description },
          { property: "og:image", content: `${SITE_URL}/logo.png` },
          { property: "og:url", content: `${SITE_URL}/${lang}/projects` },
        ],
        link: [
          { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/projects` },
          { rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/projects` },
          { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/projects` },
        ],
      };
    },
    ```

- [x] **Task 6: Add hreflang to posts listing** (AC: #4)
  - [x] 6.1: In `src/routes/$lang/posts/index.tsx`, add `link` array to the existing `head()`. The listing already has meta tags — only add the `link` entries:
    ```ts
    import { SITE_URL } from "~/shared/data/site";

    // Inside head():
    link: [
      { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/posts` },
      { rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/posts` },
      { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/posts` },
    ],
    ```

- [x] **Task 7: Audit decorative image accessibility** (AC: #9)
  - [x] 7.1: Check `src/routes/__root.tsx` and layout components for any `<img>` tags used as decoration. Ensure they have `alt=""` and `aria-hidden="true"`. (__root.tsx has no img tags — only CSS background divs. No change needed.)
  - [x] 7.2: Check `src/components/layout/Header.tsx` (and Footer) for logo images — add `alt=""` `aria-hidden="true"` if logo is decorative (text label exists alongside it), or `alt="Site logo"` if standalone. (Header uses AvatarImage with `alt="Logo"` — logo is standalone nav link, so descriptive alt is correct. No change needed.)
  - [x] 7.3: The Avatar image in `about.tsx` is content, not decorative — it should already have meaningful alt text. Confirm `alt` is `t.pages.about.heading` or the author's name. (Was `alt=""` — fixed to `alt={t.pages.about.heading}`.)
  - [x] 7.4: Post featured images added in Story 3.2 already have `alt={post.title}` — no change needed.

- [x] **Task 8: Verify build and SEO output** (AC: all)
  - [x] 8.1: Run `npm run build` — 0 TypeScript errors. ✅
  - [ ] 8.2: Run `npm run dev`, open `/en/` and view source — confirm `og:title`, `og:description`, `og:image` present in `<head>`. (Manual verification by user)
  - [ ] 8.3: View source of `/en/posts/[slug-with-translation]` — confirm `<link rel="alternate" hreflang="en">` and `<link rel="alternate" hreflang="vi">` present. (Manual verification by user)
  - [ ] 8.4: Check `/vi/posts/[slug-without-vi-translation]` — confirm fallback banner renders and `isFallback: true` is working. (Already implemented in Story 3.1/3.2 — no change to loader logic)
  - [x] 8.5: Biome check passes. ✅

## Dev Notes

### How head() link Array Works in TanStack Start

TanStack Start's `head()` function returns `{ meta: [...], link: [...] }`. The `link` array maps to `<link>` HTML elements. Each object becomes attributes on the tag:
```ts
{ rel: "alternate", hreflang: "en", href: "https://..." }
// → <link rel="alternate" hreflang="en" href="https://...">
```
This is the standard HTML pattern Google uses to determine language alternates. Absolute URLs are required by Google — relative URLs in hreflang are ignored.

### hreflang Logic for Post Detail

When a post has `translationSlug` (the slug for the other language version):
- `/en/posts/my-post` has translation at `/vi/posts/my-post-vi` → translationSlug = `"my-post-vi"`
- hreflang en → `SITE_URL/en/posts/my-post`
- hreflang vi → `SITE_URL/vi/posts/my-post-vi`
- hreflang x-default → `SITE_URL/en/posts/my-post` (English as canonical default)

When there is NO translation (`translationSlug` is null/undefined):
- Only one hreflang tag with the current language.
- Google accepts a single hreflang tag as valid (indicates content is only in one language).

### SITE_URL — OG Image URL Construction

The `og:image` must be an absolute URL. The `post.featuredImage` from R2 may already be absolute (`https://...`) or may be a path starting with `/`. Handle both:
```ts
const rawImage = post?.featuredImage || "/logo.png";
const absoluteImage = rawImage.startsWith("http")
  ? rawImage
  : `${SITE_URL}${rawImage}`;
```
This is safer than the string interpolation approach in Task 2.1. Use whichever pattern is cleaner.

### `dictionaries` Pattern (Existing Convention)

Static pages use `dictionaries[params.lang]` inside `head()` to get typed locale strings without `useI18n()` (which requires React context). This is the correct pattern for `head()` since it runs outside of React render:
```ts
import { dictionaries } from "~/locales";
const t = dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
```
The `as "en" | "vi"` cast is an alternative to `as keyof typeof dictionaries`. Use whichever the existing routes use (they use `as keyof typeof dictionaries`).

### import.meta.env in TanStack Start (Cloudflare Workers)

`import.meta.env.VITE_SITE_URL` is a client-side env var (Vite inlines it at build time). For Cloudflare Workers, VITE_* vars are inlined during `npm run build`. Set them in `.dev.vars` for local dev and via `wrangler secret put VITE_SITE_URL` for production... **Actually:** Cloudflare Workers doesn't support `wrangler secret put` for VITE_ vars (they must be set at build time). Set `VITE_SITE_URL` in `.dev.vars` for local dev. For production builds, the fallback hardcoded URL in `site.ts` handles it. The developer updates the fallback URL to their production domain.

### Do NOT Modify __root.tsx Global Head

The root route already has global defaults (og:type website, og:image /logo.png, twitter:card). Route-level `head()` entries **override** these on a per-property basis in TanStack Start. Specifically:
- If a route sets `og:image`, it replaces the root's `og:image` for that page.
- If a route does NOT set `og:image`, the root's fallback `/logo.png` is used.
Do not remove the root head configuration — it's the correct fallback layer.

### Key File Locations

| File | Action |
|------|--------|
| `src/shared/data/site.ts` | CREATE — `SITE_URL` constant |
| `src/env.ts` | MODIFY — add `VITE_SITE_URL` to client config |
| `src/routes/$lang/posts/$slug.tsx` | MODIFY — `head()` only: add og:image, og:locale, hreflang links |
| `src/routes/$lang/index.tsx` | MODIFY — `head()`: add OG tags + hreflang links |
| `src/routes/$lang/about.tsx` | MODIFY — `head()`: add OG tags + hreflang links |
| `src/routes/$lang/projects.tsx` | MODIFY — `head()`: add OG tags + hreflang links |
| `src/routes/$lang/posts/index.tsx` | MODIFY — `head()`: add hreflang links only |
| `src/components/layout/Header.tsx` | REVIEW — logo image alt text |

### Story 3.2 Dependency

Story 3.2 modifies the component body of `$slug.tsx` (errorComponent, SSR split, author/image display, locale strings). This story modifies ONLY the `head()` function of `$slug.tsx`. These are non-overlapping changes — apply both without conflict. If Story 3.2 is not yet merged, only touch the `head()` function in Task 2.

### Previous Story Intelligence

- `dictionaries` import from `~/locales` gives typed access to en/vi locale objects — use in `head()` for static pages (same pattern as existing home/about/projects routes).
- `Route.useLoaderData()` in component body gives `{ post, isFallback, originalLang, translationSlug }` — but `head()` accesses `loaderData` directly as a function param (not via hook).
- `head()` runs server-side during SSR and in the browser during client navigation. `SITE_URL` from `import.meta.env` works in both contexts (Vite inlines it at build time).
- Biome: tabs, single quotes in JSX attributes, double quotes in TS string literals.

### References

- [Source: epics.md#Epic3-Story3.3] — AC definitions
- [Source: architecture.md#NFR5, FR24, FR25] — meta tag and hreflang requirements
- [Source: .claude/rules/design-system.md#UX-DR16] — `aria-hidden` on decorative SVGs/images
- [Source: src/routes/__root.tsx] — global head() structure (do not remove)
- [Source: src/routes/$lang/index.tsx] — `dictionaries` pattern for head() in static routes
- [Source: src/env.ts] — `@t3-oss/env-core` pattern for adding VITE_SITE_URL

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
- Biome formatter required expanding inline object literals to multi-line in $slug.tsx and about.tsx — auto-fixed with `biome check --write`.
- .dev.vars was missing from .gitignore — added it during Task 1.2.
- about.tsx avatar had `alt=""` (decorative treatment) — corrected to `alt={t.pages.about.heading}` per AC #9.

### Completion Notes List
- Created `src/shared/data/site.ts` with `SITE_URL` constant (Vite env var with production fallback).
- Added `VITE_SITE_URL: z.string().url().optional()` to `src/env.ts` client config.
- Created root `.dev.vars` with `VITE_SITE_URL=http://localhost:3000`; added `.dev.vars` to `.gitignore`.
- Updated `$slug.tsx` head(): added og:image (featuredImage or /logo.png fallback with absolute URL construction), og:url, og:locale (vi_VN/en_US), hreflang links (en+vi+x-default when translationSlug exists, single lang tag when no translation).
- Updated `$lang/index.tsx`, `about.tsx`, `projects.tsx` head(): added og:title, og:description, og:image, og:url, and hreflang links (en+vi+x-default for all static pages).
- Updated `$lang/posts/index.tsx` head(): added hreflang link array (en+vi+x-default).
- Fixed accessibility: about.tsx avatar `alt=""` → `alt={t.pages.about.heading}`.
- Build: `npm run build` passed with 0 TypeScript errors. Biome check passed.

### File List
- src/shared/data/site.ts (CREATED)
- src/env.ts (MODIFIED — added VITE_SITE_URL to client config)
- .dev.vars (CREATED — gitignored, VITE_SITE_URL for local dev)
- .gitignore (MODIFIED — added .dev.vars entry)
- src/routes/$lang/posts/$slug.tsx (MODIFIED — head() with og:image, og:locale, og:url, hreflang)
- src/routes/$lang/index.tsx (MODIFIED — head() with OG tags + hreflang)
- src/routes/$lang/about.tsx (MODIFIED — head() with OG tags + hreflang; avatar alt text fix)
- src/routes/$lang/projects.tsx (MODIFIED — head() with OG tags + hreflang)
- src/routes/$lang/posts/index.tsx (MODIFIED — head() with hreflang links)

### Change Log
- 2026-03-28: Implemented Story 3.3 — hreflang links on all public routes, OG tags on home/about/projects, og:image+og:locale on post detail, SITE_URL constant, accessibility fix on about avatar.
