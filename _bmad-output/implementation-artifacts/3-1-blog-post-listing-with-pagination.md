# Story 3.1: Blog Post Listing with Pagination

Status: ready-for-dev

## Story

As a visitor,
I want to browse a paginated list of published blog posts,
So that I can discover content and find articles that interest me.

## Acceptance Criteria

1. **Post listing:** `/$lang/posts` displays published posts ordered by `publishedAt` descending. Each post card shows title, description/excerpt, publication date, category badge (if present), and featured image (if present).

2. **Pagination:** When more than 10 posts exist, pagination controls render (previous/next). Clicking navigates to the correct page. URL search param `?page=N` reflects current page. TanStack Router `navigate()` is used (already implemented).

3. **Hover ghost pattern:** Post cards use the Card hover ghost pattern (UX-DR5) — already implemented via `CardLink`.

4. **Date eyebrow:** Date decorators use `text-sm text-zinc-400 dark:text-zinc-500` (UX-DR8) — already implemented via `CardEyebrow`.

5. **Mobile layout:** Post cards stack vertically on mobile (375px). Single-column readable layout — already implemented by existing flex-col layout.

6. **Empty state:** When no published posts exist for the current language, `t.pages.posts.noPostsFound` is displayed — already implemented.

7. **queryKeys factory:** `src/shared/utils/queryKeys.ts` MUST be created with the canonical factory pattern from architecture.md. Used for all future TanStack Query keys.

8. **Server function shape:** `fetchPostsList` returns `{ posts, totalCount, currentPage, totalPages }` (existing shape). DB queries live in `server/db/queries.ts`. No inline queries in service.

9. **Bilingual:** All user-facing strings use `t()`. Pagination "Page X of Y" text uses locale keys (en + vi). CTA text uses `t.common.readMore`.

10. **Dark mode:** All visual elements have `dark:` variants — existing Card system is compliant.

11. **Prerequisite:** If no published posts exist in DB, run `npm run db:seed` to populate test data.

## Context: Brownfield — ~75% Already Implemented

The route, server function, DB queries, and Card component system all exist. This story fills **four specific gaps**: `queryKeys.ts`, category/featuredImage in post cards, bilingual pagination text, and CTA localization.

### What Already Exists (DO NOT recreate):

- `src/routes/$lang/posts/index.tsx` — Route with `PostsSearchSchema`, `loader`, `head()` meta tags, `RouteComponent` with pagination buttons, empty state. Loader already calls `fetchPostsList({data: {lang, page, pageSize: 10}})`. **DO NOT restructure this.**
- `src/shared/services/post.ts` — `fetchPostsList` server function exists using `inputValidator` pattern (not `.validator`). Returns `{ posts, totalCount, currentPage, totalPages }`.
- `src/server/db/queries.ts` — `getPublishedPostsPaginated(lang, page, pageSize)` and `countPublishedPosts(lang)` exist. `getPublishedPostsPaginated` already fetches with `category` and `postTags` relations.
- `src/components/shared/card/` — Full Card component system: `CardLink` (hover ghost ✅), `CardCta` (teal + ChevronRight ✅), `CardEyebrow` (date decorator ✅), `CardTitle`, `CardDescription`. Compound pattern via `Card.Title`, `Card.Link`, etc.
- `src/components/post/item.tsx` — `PostItem` uses `Card` system. Renders title, description, date (mobile + desktop). Uses `PostSummary` type.
- `src/shared/types/post.ts` — `PostSummary` type: `{ slug, title, description?, date, path }`.
- `src/locales/en.ts` + `vi.ts` — `pages.posts.*` keys exist: `title`, `description`, `heading`, `intro`, `noPostsFound`. `common.readMore`, `common.previous`, `common.next` exist.
- `src/shared/providers/i18n.tsx` — `useI18n()` returns `{ t, language, localizedPath }`.

### What Is Missing (IMPLEMENT THESE):

1. **`src/shared/utils/queryKeys.ts`** — Does NOT exist. Must be created.
2. **`PostSummary` type** — Missing `category` and `featuredImage` fields.
3. **`fetchPostsList` response** — Does not include `category` or `featuredImage` in the post mapping. Also contains a wasteful N+1 query (`getPostTranslation` called per post but result is unused — remove it).
4. **`PostItem` component** — Does not show category badge or featured image.
5. **`PostItem` CTA** — Uses hardcoded `"Read more"` string instead of `t.common.readMore`.
6. **Pagination "Page X of Y"** — Hardcoded English in the route. Needs locale key.

## Tasks / Subtasks

- [ ] **Task 1: Create queryKeys factory** (AC: #7)
  - [ ] 1.1: Create `src/shared/utils/queryKeys.ts` with exact pattern from architecture:
    ```ts
    export type PostListParams = { lang: string; page: number };

    export const queryKeys = {
      posts: {
        list: (params: PostListParams) => ["posts", "list", params] as const,
        detail: (params: { slug: string; lang: string }) => ["posts", "detail", params] as const,
      },
      categories: {
        list: () => ["categories", "list"] as const,
      },
      tags: {
        list: () => ["tags", "list"] as const,
      },
    } as const;
    ```
  - [ ] 1.2: No other files need updating for this task — file creation only.

- [ ] **Task 2: Add category + featuredImage to PostSummary and service** (AC: #1, #8)
  - [ ] 2.1: In `src/shared/types/post.ts`, extend `PostSummary`:
    ```ts
    export type PostSummary = {
      slug: string;
      title: string;
      description?: string | null;
      date: string;
      path: string;
      category?: { name: string; slug: string } | null;
      featuredImage?: string | null;
    };
    ```
  - [ ] 2.2: In `src/shared/services/post.ts`, update the `postsWithTranslationCheck` mapping inside `fetchPostsList`:
    - **Remove** the `getPostTranslation` call per post (it is unused — this is an N+1 bug)
    - **Add** `category` and `featuredImage` to each mapped post object:
      ```ts
      // Replace postsWithTranslationCheck with:
      const mappedPosts = postsData.map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        path: `/${lang}/posts/${post.slug}`,
        category: post.category ? { name: post.category.name, slug: post.category.slug } : null,
        featuredImage: post.featuredImage,
      }));

      return {
        posts: mappedPosts,
        totalCount,
        currentPage: page,
        totalPages,
      };
      ```
  - [ ] 2.3: The `getPublishedPostsPaginated` DB query already fetches `category` relation — no changes needed in `queries.ts`.

- [ ] **Task 3: Update PostItem to show category and featuredImage** (AC: #1, #3, #4, #9)
  - [ ] 3.1: Add `useI18n()` to `PostItem` to access `t.common.readMore` — replace hardcoded `"Read more"` with `{t.common.readMore}`.
  - [ ] 3.2: Add category badge rendering below `Card.Eyebrow` (mobile) when `data.category` is present:
    ```tsx
    {data.category && (
      <span className='relative z-10 mt-3 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
        {data.category.name}
      </span>
    )}
    ```
  - [ ] 3.3: Add featured image rendering (above `Card.Title`) when `data.featuredImage` is present:
    ```tsx
    {data.featuredImage && (
      <img
        src={data.featuredImage}
        alt={data.title}
        loading='lazy'
        className='relative z-10 mb-4 aspect-video w-full rounded-2xl object-cover'
      />
    )}
    ```
    Place the image ABOVE `Card.Link` so it doesn't conflict with the link overlay.
  - [ ] 3.4: Verify `PostItem` still compiles — `PostSummary` now has optional `category` and `featuredImage`.

- [ ] **Task 4: Add bilingual pagination text and fix route CTA** (AC: #9)
  - [ ] 4.1: Add locale key to `src/locales/en.ts` inside `pages.posts`:
    ```ts
    pageInfo: "Page {page} of {total}",
    ```
    **Note:** locale strings are plain strings without interpolation support. Use a simple approach: add `page: "Page"` and `of: "of"` as separate keys, OR construct the string manually in the component using existing keys. Recommended approach — add `pageNum: "Page"` key:
    ```ts
    // en.ts
    pageNum: "Page",
    pageOf: "of",

    // vi.ts
    pageNum: "Trang",
    pageOf: "/",
    ```
  - [ ] 4.2: Add matching keys to `src/locales/vi.ts` inside `pages.posts`.
  - [ ] 4.3: In `src/routes/$lang/posts/index.tsx`, replace the hardcoded `Page {currentPage} of {totalPages}` with:
    ```tsx
    <span className='text-sm text-muted-foreground'>
      {t.pages.posts.pageNum} {currentPage} {t.pages.posts.pageOf} {totalPages}
    </span>
    ```

- [ ] **Task 5: Verify build passes** (AC: all)
  - [ ] 5.1: Run `npm run build` — must pass with 0 TypeScript errors.
  - [ ] 5.2: Ensure Biome passes (tabs, single quotes JSX, double quotes TS strings).
  - [ ] 5.3: Verify route renders correctly by checking `npm run dev` at `http://localhost:3000/en/posts`.
  - [ ] 5.4: If DB has no posts, run `npm run db:seed` first.

## Dev Notes

### Critical Architecture Rules (from architecture.md)

- **DB queries MUST stay in `server/db/queries.ts`** — not inline in server functions.
- **Server functions MUST use `inputValidator` (not `.validator`)** — see existing `fetchPostsList` pattern.
- **`lang` derives from route params** — never from browser APIs.
- **Every user-facing string uses `t()`** — never hardcode text in JSX.
- **Both `en.ts` and `vi.ts` updated** for every new locale key.
- **No new dependencies needed** for this story — use existing Card system, existing lucide-react, existing utilities.
- **Biome**: tabs for indentation, double quotes in TS/JS, single quotes in JSX (check existing code for reference).

### Key File Locations

| File | Action |
|------|--------|
| `src/shared/utils/queryKeys.ts` | CREATE |
| `src/shared/types/post.ts` | MODIFY — add `category` and `featuredImage` fields |
| `src/shared/services/post.ts` | MODIFY — fix N+1 bug, add category/featuredImage to response |
| `src/components/post/item.tsx` | MODIFY — add category badge, featuredImage, use `t.common.readMore` |
| `src/locales/en.ts` | MODIFY — add `pages.posts.pageNum` and `pages.posts.pageOf` |
| `src/locales/vi.ts` | MODIFY — add matching keys |
| `src/routes/$lang/posts/index.tsx` | MODIFY — use bilingual pagination text |

### PostItem Import Pattern

The `PostItem` component at `src/components/post/item.tsx` currently imports `formatDate`, `Card`, and types. To add `useI18n()`:
```tsx
import { useI18n } from '~/shared/providers/i18n';

// Inside component:
const { t } = useI18n();
```

### fetchPostsList Validator Pattern

The existing `fetchPostsList` uses `inputValidator` (not `.validator`):
```ts
export const fetchPostsList = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof fetchPostsListSchema>) =>
    fetchPostsListSchema.parse(data),
  )
  .handler(async ({ data }) => { ... });
```
**Preserve this exact pattern** — do NOT switch to `.validator()`.

### Route Loader Call Pattern

The route calls the server function as:
```ts
await fetchPostsList({ data: { lang: params.lang, page: deps.page, pageSize: 10 } })
```
The `data` wrapper is required by TanStack Start's `createServerFn` with `inputValidator`. **Do NOT change this call signature.**

### Pagination Return Shape

Current return shape from `fetchPostsList`: `{ posts, totalCount, currentPage, totalPages }`. The route destructures `{ posts, totalPages, currentPage }` from `Route.useLoaderData()`. **Keep this shape** — do not switch to `ListResponse<T>` format which would break the route.

### N+1 Bug to Fix

Current `fetchPostsList` has a wasteful loop:
```ts
// ❌ Remove this entire Promise.all block — translation check result is unused
const postsWithTranslationCheck = await Promise.all(
  postsData.map(async (post) => {
    const otherLang = lang === "en" ? "vi" : "en";
    const translation = await getPostTranslation(post.translationGroupId, otherLang);
    return { slug: post.slug, ... }; // translation variable never used
  }),
);
```
Replace with a synchronous `.map()` that includes `category` and `featuredImage`.

### Design System Patterns

**Category badge** (use this exact pattern from design system):
```tsx
<span className='relative z-10 mt-3 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
  {data.category.name}
</span>
```

**Featured image** — lazy-load, rounded-2xl, aspect-video to maintain uniform card heights:
```tsx
<img
  src={data.featuredImage}
  alt={data.title}
  loading='lazy'
  className='relative z-10 mb-4 aspect-video w-full rounded-2xl object-cover'
/>
```
Image must be `relative z-10` (same z-level as other card content) to appear ABOVE the `CardLink` ghost overlay (which is `z-0`). Place image BEFORE `<Card.Link>`.

### Previous Story Intelligence (from Story 2.3)

- `useI18n()` from `~/shared/providers/i18n` returns `{ t, language, localizedPath }` — safe to call in any component (not just routes).
- Biome enforces single quotes in JSX: use `className='...'`, `aria-label='...'` etc.
- `lucide-react` is already installed — `ChevronRight` is already used in `CardCta`.
- `loading='eager'` is for above-fold images; `loading='lazy'` for below-fold. Featured images in post cards are below-fold, so use `loading='lazy'` (NFR7).
- `rounded-2xl` for images, `rounded-3xl` for code blocks (design system convention).

### queryKeys File — Exact Pattern Required

The architecture mandates this exact 3-part key structure: `[domain, action, params]`. Future stories (3.2 detail route, admin post management) will import from this file:
```ts
// ✅ Required usage pattern (for future reference)
useQuery({ queryKey: queryKeys.posts.list({ lang, page }) });

// ❌ Never inline
useQuery({ queryKey: ["posts", "list", { lang, page }] });
```

### References

- [Source: epics.md#Epic3-Story3.1] — AC definitions
- [Source: architecture.md#QueryKeyFactory] — `queryKeys.ts` pattern
- [Source: architecture.md#FormatPatterns] — `ListResponse<T>` shape (not used for loader but for useQuery contexts)
- [Source: .claude/rules/design-system.md#Cards] — hover ghost, category badge, image border radius
- [Source: src/components/shared/card/link.tsx] — hover ghost implementation (z-0 ghost, z-20 link overlay, z-10 content)
- [Source: src/shared/services/post.ts] — existing `fetchPostsList` pattern (inputValidator, not .validator)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
- src/shared/utils/queryKeys.ts
- src/shared/types/post.ts
- src/shared/services/post.ts
- src/components/post/item.tsx
- src/locales/en.ts
- src/locales/vi.ts
- src/routes/$lang/posts/index.tsx
