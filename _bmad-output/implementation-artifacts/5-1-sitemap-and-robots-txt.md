# Story 5.1: Sitemap.xml & Robots.txt

Status: review

## Story

As a search engine crawler,
I want a sitemap.xml listing all public pages and a robots.txt guiding crawl behavior,
so that I can efficiently discover and index all content in both languages.

## Acceptance Criteria

1. **Sitemap covers all public routes in both languages**: `/sitemap.xml` returns valid XML containing URLs for:
   - `/$lang` (home), `/$lang/posts`, `/$lang/projects`, `/$lang/about` for both `en` and `vi`
   - `/$lang/posts/$slug` for every published post in each language
2. **lastmod timestamps**: Each URL entry includes `<lastmod>` in YYYY-MM-DD format derived from `publishedAt` (posts) or build date (static pages).
3. **hreflang alternates**: Each URL includes `<xhtml:link>` alternate tags pointing to the en/vi equivalents. Posts with translations reference both languages; posts without a translation reference only their own language.
4. **Dynamic generation**: `/sitemap.xml` is served via a server route that queries the DB on each request. NOT a static file.
5. **Dynamic robots.txt**: `/robots.txt` allows public routes and disallows protected admin/edit/api routes. References the sitemap URL using the production domain from `SITE_URL`.
6. **Crawler compatibility**: Sitemap XML is valid per `sitemaps.org` spec. Robots.txt is valid per `robotstxt.org` spec. Both return correct `Content-Type` headers.

## Tasks / Subtasks

- [x] **Task 1: New DB query for sitemap** (AC: #1, #2, #3)
  - [x] 1.1: In `src/server/db/queries.ts`, add `getPublishedPostsForSitemap()`:
    ```ts
    export async function getPublishedPostsForSitemap() {
      return db.query.posts.findMany({
        where: eq(posts.status, "published"),
        columns: {
          slug: true,
          lang: true,
          translationGroupId: true,
          publishedAt: true,
          updatedAt: true,
        },
        orderBy: [desc(posts.publishedAt)],
      });
    }
    ```
    — Minimal column selection (no joins) for performance. `translationGroupId` is needed to build hreflang pairs.

- [x] **Task 2: Create `/sitemap.xml` route** (AC: #1, #2, #3, #4, #6)
  - [x] 2.1: Create `src/routes/sitemap[.]xml.ts` with a GET handler:

    ```ts
    import { createFileRoute } from "@tanstack/react-router";
    import { getPublishedPostsForSitemap } from "~/server/db/queries";
    import { SITE_URL } from "~/shared/data/site";

    export const Route = createFileRoute("/sitemap.xml")({
      server: {
        handlers: {
          GET: async () => {
            const posts = await getPublishedPostsForSitemap();
            const xml = buildSitemapXml(posts);
            return new Response(xml, {
              headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600",
              },
            });
          },
        },
      },
    });
    ```

  - [x] 2.2: Implement `buildSitemapXml(posts)` (can be a module-level function in the same file):
    - Build static route entries for en+vi: `home`, `/posts`, `/projects`, `/about`
    - Build dynamic post entries grouped by `translationGroupId` to determine hreflang
    - Return the complete XML string
  - [x] 2.3: **IMPORTANT — filename escaping**: TanStack Router uses `[.]` to escape literal dots in file-based routing. If the router rejects this filename, fallback: create `src/routes/api/sitemap.ts` (route at `/api/sitemap`) and update `public/robots.txt` `Sitemap:` reference to `/api/sitemap`. Test on `npm run dev` to confirm which works.

- [x] **Task 3: Update `public/robots.txt`** (AC: #5, #6)
  - [x] 3.1: Replace content of `public/robots.txt` with:

    ```
    User-agent: *
    Allow: /

    Disallow: /api/
    Disallow: /en/admin/
    Disallow: /vi/admin/
    Disallow: /en/edit/
    Disallow: /vi/edit/
    Disallow: /en/new
    Disallow: /vi/new
    Disallow: /en/translate/
    Disallow: /vi/translate/
    Disallow: /en/login
    Disallow: /vi/login

    Sitemap: https://blog.nama3k67.com/sitemap.xml
    ```

  - [x] 3.2: The `Sitemap:` URL must use the production domain. `SITE_URL` from `src/shared/data/site.ts` = `https://blog.nama3k67.com`. Since robots.txt is a static file, hardcode the production URL directly — dynamic env var is not needed here.

- [x] **Task 4: Build verification** (AC: all)
  - [x] 4.1: `npm run build` — 0 TypeScript errors, 0 Biome errors.
  - [x] 4.2: `npm run dev`, curl `http://localhost:3000/sitemap.xml` — verify XML response with correct `Content-Type: application/xml`.
  - [x] 4.3: Verify XML contains static routes (en + vi for home, posts, projects, about).
  - [x] 4.4: Verify XML contains dynamic post entries with `<lastmod>` and `<xhtml:link>` alternates.
  - [x] 4.5: curl `http://localhost:3000/robots.txt` — verify Disallow rules and correct Sitemap reference.

## Dev Notes

### Sitemap XML Structure

Full XML template (no external XML library needed — plain string template):

```ts
function buildSitemapXml(
  posts: Array<{
    slug: string;
    lang: string;
    translationGroupId: string;
    publishedAt: Date | null;
    updatedAt: Date | null;
  }>,
): string {
  const LANGS = ["en", "vi"] as const;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Static routes — same slug across both langs
  const staticPaths = ["", "/posts", "/projects", "/about"];
  const staticEntries = staticPaths.map((path) => {
    const enUrl = `${SITE_URL}/en${path}`;
    const viUrl = `${SITE_URL}/vi${path}`;
    return `
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${viUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>
  <url>
    <loc>${viUrl}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${viUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>`;
  });

  // 2. Build translationGroupId → { en: slug, vi: slug } map
  const groupMap = new Map<
    string,
    { en?: string; vi?: string; date?: string }
  >();
  for (const post of posts) {
    const entry = groupMap.get(post.translationGroupId) ?? {};
    entry[post.lang as "en" | "vi"] = post.slug;
    const postDate = (post.updatedAt ?? post.publishedAt ?? new Date())
      .toISOString()
      .split("T")[0];
    if (!entry.date || postDate > entry.date) entry.date = postDate;
    groupMap.set(post.translationGroupId, entry);
  }

  // 3. Dynamic post entries
  const postEntries: string[] = [];
  for (const [, group] of groupMap) {
    const date = group.date ?? today;
    // For each lang this group has
    for (const lang of LANGS) {
      const slug = group[lang];
      if (!slug) continue;
      const loc = `${SITE_URL}/${lang}/posts/${slug}`;
      const otherLang = lang === "en" ? "vi" : "en";
      const otherSlug = group[otherLang];
      const hreflangLinks = otherSlug
        ? `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en/posts/${group.en ?? slug}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_URL}/vi/posts/${group.vi ?? slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/posts/${group.en ?? slug}"/>`
        : `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}"/>`;
      postEntries.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>${hreflangLinks}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries.join("")}
${postEntries.join("")}
</urlset>`;
}
```

### Architecture Constraints (MUST Follow)

- **No `createServerFn` needed**: API route handlers at `src/routes/api/` (and `src/routes/sitemap[.]xml.ts`) run server-side only and can directly import from `~/server/db/queries` — no wrapper needed (see `upload.ts` which directly imports `~/server/r2/client`).
- **No React component**: API routes with only `server.handlers` have NO default export component — they're pure server handlers. See `upload.ts` for reference.
- **Cloudflare Workers runtime**: No Node.js APIs. `Date`, `Map`, `Array`, string templates — all fine. No `fs`, no `stream`.
- **Server-only imports**: `~/server/db/*` MUST NOT be imported in any client-rendered component. The sitemap route file is server-only (no React component) so this is safe.
- **Biome**: tabs + double quotes for TS. No semicolons only if existing convention; follow existing file patterns.
- **Bundle size**: The sitemap route adds minimal code. No new heavy deps.

### What Already Exists (DO NOT RECREATE)

| Item                        | Location                       | Notes                                                            |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `SITE_URL`                  | `src/shared/data/site.ts`      | `https://blog.nama3k67.com` (Vite env var with fallback)         |
| `public/robots.txt`         | `public/robots.txt`            | Static file — UPDATE content only                                |
| `getPublishedPosts()`       | `src/server/db/queries.ts:83`  | All published posts — too many joins, use new query instead      |
| `getPublishedPostsByLang()` | `src/server/db/queries.ts:101` | Per-lang only, no `translationGroupId` columns by default        |
| API route pattern           | `src/routes/api/upload.ts`     | `createFileRoute("/api/upload")` with `server.handlers.GET/POST` |
| DB client                   | `src/server/db/client.ts`      | Neon HTTP driver — imported via `src/server/db/queries.ts`       |
| `eq`, `desc`                | `drizzle-orm`                  | Already in `queries.ts` imports                                  |

### TanStack Router — Filename Escaping for `/sitemap.xml`

**Primary approach**: `src/routes/sitemap[.]xml.ts` with `createFileRoute("/sitemap.xml")`

In TanStack Router file conventions, `[` and `]` escape special characters in route filenames so they appear literally in the URL. `[.]` should produce a literal `.` in the path, giving `/sitemap.xml`.

**If the build rejects this** (TS error or router mismatch warning):

- Fallback: Create `src/routes/api/sitemap.ts` with `createFileRoute("/api/sitemap")`
- Update `public/robots.txt` `Sitemap:` line to `https://blog.nama3k67.com/api/sitemap`
- This is a minor UX trade-off (non-standard path) but functionally correct

**Test**: Run `npm run dev`, hit the URL, confirm XML response.

### Slug Sharing (Story 4.6 Context)

The translation system (Story 4.6) uses **shared slugs** — an EN post at `/en/posts/my-post` and its VI translation at `/vi/posts/my-post` share the **exact same slug** (`"my-post"`). They are linked by `translationGroupId`. This is guaranteed by the DB schema (`uniqueIndex("slug_lang_idx")` on `(slug, lang)`). Therefore:

- In `buildSitemapXml`, `group.en` and `group.vi` may be the same string (shared slug). That's correct — the URLs differ only in the `/$lang/` prefix.
- `getPostTranslation()` filters `status: "published"` — safe to assume all posts from `getPublishedPostsForSitemap` are published.

### Previous Story Patterns (Stories 3.3, 4.6)

- `SITE_URL` usage: `import { SITE_URL } from "~/shared/data/site"`. Value is inlined at build time via Vite env var. Production fallback is `https://blog.nama3k67.com`.
- `dictionaries` pattern NOT needed here — sitemap/robots.txt are not UI routes, no React context.
- `hreflang` convention from Story 3.3: always include `x-default` pointing to the English version.
- `Date.toISOString().split("T")[0]` for YYYY-MM-DD date format (no date lib needed).
- `translationGroupId` is a UUID string — use as Map key for grouping (from Story 4.6's dashboard logic pattern).

### robots.txt — Protected URL Structure

`_protected` is a **pathless layout** in TanStack Router (underscore prefix = no URL segment). The actual URLs for protected routes are:

| Route File                               | Actual URL              |
| ---------------------------------------- | ----------------------- |
| `$lang/_protected/admin/queue.tsx`       | `/en/admin/queue`       |
| `$lang/_protected/edit/$postId.tsx`      | `/en/edit/$postId`      |
| `$lang/_protected/new.tsx`               | `/en/new`               |
| `$lang/_protected/translate/$postId.tsx` | `/en/translate/$postId` |

So robots.txt Disallow rules must use the actual URL paths (not `_protected`-prefixed paths).

### Cloudflare Analytics (Story 5.3 — NOT this story)

`wrangler.jsonc` shows `observability.enabled: false`. Cloudflare Analytics for Story 5.3 is a **separate story**. Do NOT add analytics code in this story.

### Project Structure Notes

| File                          | Action                                        |
| ----------------------------- | --------------------------------------------- |
| `src/server/db/queries.ts`    | ADD `getPublishedPostsForSitemap()`           |
| `src/routes/sitemap[.]xml.ts` | CREATE — sitemap XML endpoint                 |
| `public/robots.txt`           | UPDATE — Disallow rules + correct Sitemap URL |

### References

- [Source: epics.md#Epic5-Story5.1] — Acceptance criteria
- [Source: architecture.md#public/robots.txt] — Static robots.txt at `public/`
- [Source: architecture.md#routes/api/] — API route conventions
- [Source: src/routes/api/upload.ts] — API route handler pattern (server-only, Response API)
- [Source: src/server/db/queries.ts:83] — `getPublishedPosts()` reference pattern
- [Source: src/shared/data/site.ts] — `SITE_URL` constant
- [Source: implementation-artifacts/3-3-bilingual-content-seo-meta-tags.md] — hreflang convention, SITE_URL pattern
- [Source: implementation-artifacts/4-6-translation-management.md] — slug sharing, translationGroupId grouping pattern
- [Source: DESIGN.md] — N/A (no UI in this story)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation followed story spec exactly. Primary approach `sitemap[.]xml.ts` filename worked without fallback.

### Completion Notes List

- Added `getPublishedPostsForSitemap()` to `src/server/db/queries.ts` — minimal column projection (slug, lang, translationGroupId, publishedAt, updatedAt), no joins, ordered by `publishedAt` desc.
- Created `src/routes/sitemap[.]xml.ts` as a pure server-only route (no React component). TanStack Router's `[.]` filename escape resolved to `/sitemap.xml` correctly.
- `buildSitemapXml()` groups posts by `translationGroupId` to emit correct `hreflang` pairs (en ↔ vi with `x-default` pointing to English). Posts with only one language emit a single hreflang tag for that language.
- Static routes (home, /posts, /projects, /about) for both `en` and `vi` are emitted with `lastmod = today`.
- `public/robots.txt` updated: disallows admin/edit/new/translate/login for both langs; disallows `/api/`; Sitemap URL points to `https://blog.nama3k67.com/sitemap.xml`.
- Build: 0 TypeScript errors, 0 Biome errors. `Content-Type: application/xml; charset=utf-8` verified via curl.

### File List

- `src/server/db/queries.ts` — added `getPublishedPostsForSitemap()`
- `src/routes/sitemap[.]xml.ts` — new sitemap XML route
- `src/routes/robots[.]txt.ts` — new dynamic robots.txt route (uses SITE_URL for Sitemap reference)
- `public/robots.txt` — deleted (replaced by dynamic route)
