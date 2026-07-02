# Story 3.2: Blog Post Detail with Markdown Rendering

Status: done

## Story

As a visitor,
I want to read a full blog post with syntax-highlighted code blocks,
So that I can learn from well-formatted technical content.

## Acceptance Criteria

1. **Full post display:** `/$lang/posts/$slug` shows title, author info, publication date, category badge, tag badges, featured image, and markdown content.

2. **SSR markdown:** The page is server-rendered with markdown content in initial HTML. Plain `<pre><code>` blocks are readable without JavaScript.

3. **Progressive Shiki highlighting:** After client hydration, Shiki applies syntax highlighting via `React.lazy()` + Suspense — Shiki loads client-only, never on the server.

4. **Shiki fine-grained only:** Uses `shiki/core` + `shiki/engine/javascript` + explicit lang imports. Never bare `import { ... } from "shiki"`. Shiki chunk ≤ 500KB gzip (NFR5).

5. **XSS sanitization:** `rehype-raw` + `rehype-sanitize` used together — raw HTML is sanitized before rendering (NFR11). No unfiltered script injection possible.

6. **Featured image:** Displayed with `loading="lazy"` and `rounded-2xl` or `rounded-3xl` border radius (UX-DR15, NFR7).

7. **Prose styles:** Article body uses `prose dark:prose-invert` with custom typography config (UX-DR13). Code blocks use `rounded-3xl` (UX-DR15).

8. **404 error handling:** When the post slug does not exist, `fetchPost` throws and the route `errorComponent` shows a user-friendly bilingual 404 message.

9. **Bilingual UI:** All user-facing strings in the route use `t()`. No hardcoded English/Vietnamese strings. Fallback banner and translation toggle use locale keys.

10. **Dark mode:** All visual elements have `dark:` variants. Zinc/teal palette only — no `slate`, `blue`, `gray` (UX-DR1, UX-DR3).

## Context: Brownfield — ~50% Already Implemented

The route, server function, and markdown pipeline all exist. This story fills **six specific gaps**: SSR split, XSS sanitization, errorComponent, author/featured-image display, locale keys, and design system compliance.

### What Already Exists (DO NOT recreate):

- `src/routes/$lang/posts/$slug.tsx` — Route with `loader`, `head()`, fallback language banner, translation toggle, article with title/date/description/category/tags, `React.lazy()` Markdown, Suspense skeleton.
- `src/shared/services/post.ts` — `fetchPost` server function. Returns `{ post, isFallback, originalLang, translationSlug }`. The `post` object includes: `id, slug, title, lang, content, description, publishedAt, featuredImage, translationGroupId, author { firstName, lastName, imageUrl }, category { name, slug }, tags[]`.
- `src/components/shared/Markdown.tsx` — `react-markdown` + `rehype-raw` + `remark-gfm`. Custom `code` renderer → `CodeBlock`. Custom `a` renderer for internal links. `prose dark:prose-invert` wrapper.
- `src/components/shared/CodeBlock.tsx` — Renders `highlightCode()` output via `dangerouslySetInnerHTML`. Fine-grained Shiki ✅.
- `src/shared/utils/markdown.ts` — `createHighlighterCoreSync` with `shiki/core`, `shiki/engine/javascript`, explicit lang imports. Exports `highlightCode(code, language): string`.
- `src/components/shared/ClientOnly.tsx` — `ClientOnly` component wraps children in `useEffect`-based mount guard. Supports `fallback` prop. **Use this for Shiki client-only enforcement.**
- `src/components/ui/badge.tsx` — `Badge` component with `variant="outline"` support. Already used in the route for tags.
- `src/shared/utils/date.ts` — `formatDate(isoString): string`.
- Locale keys: `pages.posts.{title, description, heading, intro, noPostsFound}` exist. `common.{readMore, previous, next, loading, error}` exist.

### What Is Missing (IMPLEMENT THESE):

1. **SSR split**: Markdown is `React.lazy()` from the route — no markdown HTML in SSR output. Must move lazy-loading inside `Markdown.tsx` (lazy the `CodeBlock` with Shiki) and import `Markdown` directly in the route.
2. **XSS**: `rehype-raw` without `rehype-sanitize` is an XSS vulnerability (NFR11). `rehype-sanitize` is NOT installed.
3. **errorComponent**: Route has no `errorComponent`. A 404 error from `fetchPost` crashes the page.
4. **Author info**: `post.author` is in the loader response but never rendered.
5. **Featured image**: `post.featuredImage` is in the loader response but never rendered.
6. **Hardcoded strings**: Fallback banner and translation toggle use hardcoded string literals instead of `t()`.
7. **Design issues in CodeBlock**: Uses `bg-slate-950` (❌ must be `zinc-900`) and `rounded-lg` (❌ must be `rounded-3xl` per UX-DR15).
8. **Missing locale keys**: No keys for 404, fallback banner, translation toggle, author, featured image alt.

## Tasks / Subtasks

- [x] **Task 1: Add missing locale keys** (AC: #8, #9)
  - [x] 1.1: In `src/locales/en.ts` inside `pages.posts`, add:
    ```ts
    notFound: "Post not found",
    notFoundMessage: "The article you're looking for doesn't exist or has been removed.",
    fallbackOnly: "This article is only available in",
    viewOriginal: "View original",
    translationAvailable: "Also available in:",
    langVi: "Vietnamese",
    langEn: "English",
    by: "By",
    ```
  - [x] 1.2: Add matching keys to `src/locales/vi.ts` inside `pages.posts`:
    ```ts
    notFound: "Không tìm thấy bài viết",
    notFoundMessage: "Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
    fallbackOnly: "Bài viết này chỉ có bằng tiếng",
    viewOriginal: "Xem bản gốc",
    translationAvailable: "Cũng có sẵn bằng:",
    langVi: "Tiếng Việt",
    langEn: "Tiếng Anh",
    by: "Bởi",
    ```
  - [x] 1.3: Run `npm run build` to confirm TypeScript picks up new keys without error.

- [x] **Task 2: Install rehype-sanitize and fix XSS** (AC: #5)
  - [x] 2.1: Run `npm install rehype-sanitize`.
  - [x] 2.2: Run bundle size check: `npx wrangler deploy --outdir bundled/ --dry-run`. Verify total gzip stays under 2.5MB.
  - [x] 2.3: Update `src/components/shared/Markdown.tsx` to add `rehype-sanitize` to the rehype plugins array. Order matters — `rehype-raw` must come BEFORE `rehype-sanitize`:

    ```tsx
    import rehypeSanitize from "rehype-sanitize";

    // In ReactMarkdown:
    rehypePlugins={[rehypeRaw, rehypeSanitize]}
    ```

    This allows raw HTML but sanitizes it to remove `<script>`, `onclick`, etc.

- [x] **Task 3: Fix SSR — split lazy loading** (AC: #2, #3, #4)

  **Current broken pattern (route lazy-loads entire Markdown → no SSR content):**

  ```tsx
  // ❌ Current: route has lazy Markdown → server sends empty skeleton
  const Markdown = lazy(() => import("~/components/shared/Markdown")...);
  ```

  **Correct pattern (Markdown renders on server; CodeBlock lazy-loads Shiki on client):**
  - [x] 3.1: In `src/routes/$lang/posts/$slug.tsx`, change the Markdown import from `lazy()` to a **direct import**:
    ```tsx
    // ✅ Replace lazy import with direct import
    import { Markdown } from "~/components/shared/Markdown";
    // Remove: const Markdown = lazy(() => import(...));
    // Remove: import { Suspense, lazy } from "react";
    // Keep: Suspense import — still needed for CodeBlock lazy inside Markdown
    import { Suspense } from "react";
    ```
  - [x] 3.2: In `src/components/shared/Markdown.tsx`, lazy-load `CodeBlock` **inside** Markdown (not at route level):

    ```tsx
    import { Suspense, lazy } from "react";

    const CodeBlock = lazy(() =>
      import("~/components/shared/CodeBlock").then((m) => ({
        default: m.CodeBlock,
      })),
    );
    ```

  - [x] 3.3: In the `code` renderer inside `Markdown.tsx`, wrap `<CodeBlock>` in `<Suspense>` with a plain `<pre><code>` fallback (this is what SSR sends and what shows before Shiki loads):

    ```tsx
    code({ className: codeClassName, children }) {
      const isInline = !String(children).includes("\n");
      if (isInline) return <code>{children}</code>;

      const match = /language-(\w+)/.exec(codeClassName || "");
      const lang = match ? match[1] : "text";
      const code = String(children).replace(/\n$/, "");

      return (
        <Suspense
          fallback={
            <pre className='my-4 overflow-x-auto rounded-3xl bg-zinc-900 p-4 text-sm'>
              <code className={codeClassName}>{children}</code>
            </pre>
          }
        >
          <CodeBlock code={code} language={lang} />
        </Suspense>
      );
    },
    ```

  - [x] 3.4: In `src/routes/$lang/posts/$slug.tsx`, remove the outer `<Suspense>` wrapper around `<Markdown>` (it's no longer lazy at route level). Replace with direct render:
    ```tsx
    <div className="mt-8">
      <Markdown content={post.content} />
    </div>
    ```

- [x] **Task 4: Fix CodeBlock design system compliance** (AC: #7, #10)
  - [x] 4.1: In `src/components/shared/CodeBlock.tsx`, fix `bg-slate-950` → `bg-zinc-900` and `rounded-lg` → `rounded-3xl`:

    ```tsx
    // ❌ Current
    <div className="relative w-full my-4 rounded-lg overflow-hidden bg-slate-950">
      <div className="overflow-x-auto p-4 text-sm bg-slate-950" ...>

    // ✅ Fix
    <div className='relative my-4 w-full overflow-hidden rounded-3xl bg-zinc-900'>
      <div className='overflow-x-auto p-4 text-sm' ...>
    ```

  - [x] 4.2: `dangerouslySetInnerHTML={{ __html: highlighted }}` is safe for Shiki output (Shiki generates controlled HTML). Keep as-is.

- [x] **Task 5: Add errorComponent for 404** (AC: #8, #9)
  - [x] 5.1: In `src/routes/$lang/posts/$slug.tsx`, create a `PostError` component above `RouteComponent`:
    ```tsx
    function PostError() {
      const { lang } = Route.useParams();
      const { t } = useI18n();
      return (
        <Container className="mt-16 sm:mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
              {t.pages.posts.notFound}
            </h1>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              {t.pages.posts.notFoundMessage}
            </p>
            <Link
              to="/$lang/posts/"
              params={{ lang }}
              className="mt-8 inline-flex items-center text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              ← {t.pages.posts.heading}
            </Link>
          </div>
        </Container>
      );
    }
    ```
  - [x] 5.2: Add `errorComponent: PostError` to the route definition:
    ```tsx
    export const Route = createFileRoute("/$lang/posts/$slug")({
      loader: ...,
      head: ...,
      errorComponent: PostError,  // ← add this
      component: RouteComponent,
    });
    ```
  - [x] 5.3: Add `useI18n` import to the route file.

- [x] **Task 6: Add featured image and author info** (AC: #1, #6)
  - [x] 6.1: In `src/routes/$lang/posts/$slug.tsx`, add featured image rendering **inside `<article>`**, below the `<header>` block:
    ```tsx
    {
      post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          className="mt-8 w-full rounded-2xl object-cover"
        />
      );
    }
    ```
  - [x] 6.2: Add author info rendering inside `<header>`, after the date `<time>` block:
    ```tsx
    {
      post.author && (
        <div className="mt-4 flex items-center gap-3">
          {post.author.imageUrl && (
            <img
              src={post.author.imageUrl}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              loading="lazy"
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.pages.posts.by} {post.author.firstName} {post.author.lastName}
          </span>
        </div>
      );
    }
    ```

- [x] **Task 7: Replace hardcoded strings with t()** (AC: #9)
  - [x] 7.1: In `src/routes/$lang/posts/$slug.tsx`, replace the fallback language banner content with locale keys. Current hardcoded:
    ```tsx
    // ❌ Current — hardcoded strings
    {
      lang === "en"
        ? `This article is not available in English. Showing Vietnamese version.`
        : `Bài viết này không có bản tiếng Việt. Đang hiển thị bản tiếng Anh.`;
    }
    ```
    Replace with:
    ```tsx
    // ✅ Locale-based
    `${t.pages.posts.fallbackOnly} ${lang === "en" ? t.pages.posts.langVi : t.pages.posts.langEn}.`;
    ```
  - [x] 7.2: Replace the `translationSlug` link text:

    ```tsx
    // ❌ Current
    {
      lang === "en" ? "View original" : "Xem bản gốc";
    }

    // ✅
    {
      t.pages.posts.viewOriginal;
    }
    ```

  - [x] 7.3: Replace the translation toggle label:

    ```tsx
    // ❌ Current
    {
      lang === "en" ? "Also available in:" : "Cũng có sẵn bằng:";
    }

    // ✅
    {
      t.pages.posts.translationAvailable;
    }
    ```

  - [x] 7.4: Replace the translation language link text:

    ```tsx
    // ❌ Current (emoji flags — avoid; screen reader unfriendly)
    {
      lang === "en" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English";
    }

    // ✅
    {
      lang === "en" ? t.pages.posts.langVi : t.pages.posts.langEn;
    }
    ```

  - [x] 7.5: Fix translation toggle design: replace shadcn tokens (`bg-muted/50`, `border-border`, `text-primary`) with design system zinc/teal values:

    ```tsx
    // ❌ Current — uses CSS variable tokens (not design system compliant)
    className = "rounded-2xl border border-border bg-muted/50 p-4";

    // ✅
    className =
      "rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700/40 dark:bg-zinc-800/50";
    ```

    And the link:

    ```tsx
    // ❌ Current
    className = "text-sm font-medium text-primary hover:text-primary/80";

    // ✅
    className =
      "text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300";
    ```

- [x] **Task 8: Fix h1 design system compliance** (AC: #10)
  - [x] 8.1: In the article `<h1>`, replace `text-foreground` with explicit zinc values:

    ```tsx
    // ❌ Current
    className =
      "mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl";

    // ✅
    className =
      "mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100";
    ```

- [x] **Task 9: Verify build and bundle size** (AC: all)
  - [x] 9.1: Run `npm run build` — must pass with 0 TypeScript errors.
  - [x] 9.2: Run `npx wrangler deploy --outdir bundled/ --dry-run` — verify total gzip ≤ 2.5MB.
  - [ ] 9.3: Verify at `npm run dev` that `http://localhost:3000/en/posts/[slug]` renders with SSR content (view source, confirm markdown HTML is present, not just loading skeleton).
  - [x] 9.4: Biome check passes.

## Dev Notes

### Critical Architecture Rules

- **Shiki MUST use fine-grained imports** — `shiki/core`, `shiki/engine/javascript`, named lang imports. Never `import { createHighlighter } from "shiki"` (already correct in `markdown.ts`).
- **No Shiki on server** — `CodeBlock` must be lazy-loaded inside `Markdown.tsx`. The `ClientOnly` component exists but `Suspense + lazy` is preferred for this use case (provides SSR fallback HTML vs `null`).
- **DB queries in `server/db/queries.ts`** — `fetchPost` already follows this. No changes needed to DB layer.
- **Both `en.ts` and `vi.ts` updated** for every new key.
- **`dangerouslySetInnerHTML` in CodeBlock is safe** — Shiki generates controlled HTML output. Not a XSS risk. Do NOT remove it.
- **Biome**: tabs, single quotes in JSX, double quotes in TS/JS strings.

### Key File Locations

| File                                  | Action                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/routes/$lang/posts/$slug.tsx`    | MODIFY — direct Markdown import, errorComponent, author, featuredImage, locale strings, design fixes |
| `src/components/shared/Markdown.tsx`  | MODIFY — lazy CodeBlock inside, add rehype-sanitize, Suspense per code block                         |
| `src/components/shared/CodeBlock.tsx` | MODIFY — zinc-900, rounded-3xl                                                                       |
| `src/locales/en.ts`                   | MODIFY — add posts.notFound, posts.fallbackOnly, etc.                                                |
| `src/locales/vi.ts`                   | MODIFY — matching keys                                                                               |

### SSR Split Pattern — Why This Change

The route currently does:

```tsx
// Route: lazy-load entire Markdown ← no SSR content at all
const Markdown = lazy(() => import("~/components/shared/Markdown")...);
<Suspense fallback={<skeleton>}><Markdown content={post.content} /></Suspense>
```

This sends a loading skeleton to the browser, not the actual content. Googlebot and users with slow JS see nothing.

The correct pattern:

```
Route → imports Markdown directly (SSR renders it)
  Markdown → lazy-loads CodeBlock (Shiki stays client-only)
    Server output: <pre><code>...</code></pre> (readable, indexable)
    Client after hydration: CodeBlock with Shiki highlighting
```

### rehype-sanitize Default Config

The default `rehypeSanitize` schema strips `<script>`, `onclick`, `javascript:` hrefs, and other dangerous patterns. It allows standard HTML tags (`<p>`, `<strong>`, `<code>`, `<pre>`, `<img>`, etc.). For a technical blog, the defaults are suitable. Do NOT pass a custom permissive schema.

### Bundle Size Check — Before/After

After adding `rehype-sanitize`, run:

```bash
npx wrangler deploy --outdir bundled/ --dry-run
```

Abort if total gzip exceeds 2.5MB. `rehype-sanitize` is small (~10KB gzip) — this should be fine.

### fetchPost Error Handling

Currently `fetchPost` throws `new Error("Post not found")` when no post is found. The architecture mandates error codes, but this is pre-existing. For this story, the `errorComponent` catches whatever error is thrown. Do NOT change the server function error handling — that would be scope creep.

### PostItem CTA Interaction with Story 3.1

Story 3.1 changes `PostItem` to use `t.common.readMore`. If Story 3.1 is not yet merged, that change is independent of this story. Do NOT touch `PostItem` in this story.

### Previous Story Intelligence (from Stories 2.x and 3.1)

- `useI18n()` from `~/shared/providers/i18n` — call at top of any component (route or child). Returns `{ t, language, localizedPath }`.
- `Route.useParams()` returns `{ lang }` for `/$lang/*` routes.
- `Link` from `@tanstack/react-router` — use for internal navigation, not `<a>`.
- Design system: NEVER use `text-primary`, `bg-muted`, `border-border` — use zinc/teal directly.
- `loading='eager'` for above-fold images, `loading='lazy'` for below-fold. Featured image in post detail is typically below the fold → `lazy`.
- Author avatar (`h-8 w-8 rounded-full`) is small and above-fold — can use `loading='eager'` or omit (browser default is eager for small above-fold images).

### Imports Needed in `$slug.tsx`

After changes, the route needs these imports:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react"; // ← keep for potential use
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/shared/Container";
import { Markdown } from "~/components/shared/Markdown"; // ← direct import
import { fetchPost } from "~/shared/services/post";
import { formatDate } from "~/shared/utils/date";
import { useI18n } from "~/shared/providers/i18n"; // ← add
```

### References

- [Source: epics.md#Epic3-Story3.2] — AC definitions
- [Source: architecture.md#ShikiClientOnlyPattern] — SSR/client split pattern
- [Source: architecture.md#NFR5] — 500KB gzip per chunk limit
- [Source: DESIGN.md#UX-DR13] — `prose dark:prose-invert`
- [Source: DESIGN.md#UX-DR15] — `rounded-3xl` for code blocks, `rounded-2xl` for images
- [Source: src/components/shared/ClientOnly.tsx] — exists but use Suspense+lazy for code blocks instead
- [Source: src/shared/utils/markdown.ts] — fine-grained Shiki (already correct, don't touch)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- TypeScript error: `Link to='/$lang/posts/'` → changed to `'/$lang/posts'` (trailing slash not in route tree)
- TypeScript error: `/$lang/posts` `Link` requires `search` prop → added `search={{ page: 1 }}`
- Biome import-order: `{ Suspense, lazy }` → `{ lazy, Suspense }` in Markdown.tsx
- Biome line-length: `notFoundMessage` string wrapped to new line in en.ts

### Code Review Fixes (post-review pass)

- **F1**: Replaced `border-destructive/30 bg-destructive/5 text-destructive` on fallback banner with explicit `border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400` (AC10 design system compliance).
- **F2**: Fixed null author name rendering — replaced direct `{firstName} {lastName}` with `[firstName, lastName].filter(Boolean).join(" ")` in both `<span>` text and avatar `alt` attribute.
- **F3** (deferred): `PostError` catches all error types as "not found" — solution documented, to be addressed in a future story.

### Completion Notes List

- Added 8 locale keys to `en.ts` and `vi.ts` (`notFound`, `notFoundMessage`, `fallbackOnly`, `viewOriginal`, `translationAvailable`, `langVi`, `langEn`, `by`).
- Installed `rehype-sanitize`; added to Markdown.tsx after `rehype-raw` (correct XSS-safe order).
- Bundle gzip: 1597 KB — well under 2.5MB constraint.
- Fixed SSR split: `Markdown` imported directly in route (SSR renders content); `CodeBlock` lazy-loaded inside `Markdown.tsx` (Shiki stays client-only). Suspense fallback is plain `<pre><code>` — readable without JS.
- Fixed CodeBlock: `bg-slate-950` → `bg-zinc-900`, `rounded-lg` → `rounded-3xl` (design system compliance).
- Added `PostError` errorComponent with bilingual 404 message and back-link.
- Added author avatar + name display in article header.
- Added featured image below header with `loading='lazy'` and `rounded-2xl`.
- Replaced all hardcoded strings in fallback banner and translation toggle with `t()` locale keys.
- Replaced shadcn token classes (`bg-muted/50`, `border-border`, `text-primary`) with zinc/teal design system values.
- Fixed `<h1>` from `text-foreground` → `text-zinc-800 dark:text-zinc-100`.
- Build: 0 TypeScript errors. Biome: clean.

### File List

- src/routes/$lang/posts/$slug.tsx (modified)
- src/components/shared/Markdown.tsx (modified)
- src/components/shared/CodeBlock.tsx (modified)
- src/locales/en.ts (modified)
- src/locales/vi.ts (modified)
