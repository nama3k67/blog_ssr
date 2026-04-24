# Story 6.1: Post Views Counter

Status: review

## Story

As the site owner,
I want each published blog post to track and display a view count,
so that I can gauge reader engagement and see which content resonates most.

## Acceptance Criteria

1. **View count increments on page load**: When a visitor navigates to `/{lang}/posts/{slug}`, a fire-and-forget POST increments the post's `viewCount` in the DB client-side. The increment does NOT block SSR or the loader.
2. **View count displayed on post detail**: The post header shows the view count as "N views" (EN) or "N lượt xem" (VI).
3. **Per-language independence**: EN and VI translations share a `translationGroupId` but have separate `postId`s — each tracks its own count independently.
4. **View count in admin dashboard**: Each post row in the admin dashboard shows its view count.
5. **Bundle size**: `npm run build` produces a gzip bundle under 3 MB (Cloudflare Workers free tier limit).

## Tasks / Subtasks

- [x] **Task 1: Schema — add `viewCount` column** (AC: #1, #2, #3, #4)
  - [x] 1.1: Add `integer` to the import from `drizzle-orm/pg-core` in `src/server/db/schema.ts`
  - [x] 1.2: Add `viewCount: integer("view_count").notNull().default(0)` to `posts` table after `publishedAt`
  - [x] 1.3: Run `npm run db:push` to apply the column to the Neon DB

- [x] **Task 2: Query — `incrementPostViewCount`** (AC: #1, #3)
  - [x] 2.1: Add `sql` to the drizzle-orm import in `src/server/db/queries.ts`
  - [x] 2.2: Add `incrementPostViewCount(postId)` after `deletePost` — uses `sql\`${posts.viewCount} + 1\`` for an atomic update (no read-modify-write race)

- [x] **Task 3: Server fn — `incrementViewFn`** (AC: #1)
  - [x] 3.1: Add `incrementPostViewCount` to the queries import in `src/shared/services/post.ts`
  - [x] 3.2: Wire `incrementPostViewCount(data.postId)` into the `incrementViewFn` handler; return `{ ok: true }`

- [x] **Task 4: Expose `viewCount` from `fetchPost`** (AC: #2, #3)
  - [x] 4.1: Add `viewCount: post.viewCount` to the returned post object in `fetchPost`

- [x] **Task 5: Expose `viewCount` from `getAdminPostsFn`** (AC: #4)
  - [x] 5.1: Add `viewCount: post.viewCount` to the `.map()` in `getAdminPostsFn` in `src/shared/services/admin.ts`
  - [x] 5.2: `AdminPost` type in `src/components/admin/types.ts` is inferred from the return type — no manual edit needed

- [x] **Task 6: Post detail route — fire increment + display count** (AC: #1, #2)
  - [x] 6.1: Import `useEffect` from `react` and `incrementViewFn` from `~/shared/services/post` in `src/routes/$lang/posts/$slug.tsx`
  - [x] 6.2: Add `useEffect(() => { incrementViewFn({ data: { postId: post.id } }); }, [post.id])` — fire-and-forget, no `await`, no `.catch()`
  - [x] 6.3: Add view count display after the `<time>` element in `<header>`: `text-sm text-zinc-400 dark:text-zinc-500` (muted/caption tier)

- [x] **Task 7: Locales** (AC: #2)
  - [x] 7.1: Add `views: "views"` inside `pages.posts` in `src/locales/en.ts`
  - [x] 7.2: Add `views: "lượt xem"` inside `pages.posts` in `src/locales/vi.ts`

- [x] **Task 8: Admin PostRow — display view count** (AC: #4)
  - [x] 8.1: Add `{post.viewCount} {t.pages.posts.views}` to the metadata row in `src/components/admin/PostRow.tsx`

## Dev Notes

### Atomic Increment — No Race Condition

Use the `sql` template tag for the increment expression:
```ts
.set({ viewCount: sql`${posts.viewCount} + 1` })
```
This emits `UPDATE posts SET view_count = view_count + 1 WHERE id = $1` — a single atomic SQL statement. A read-modify-write pattern (fetch count → increment → write) would lose counts under concurrent views.

### Fire-and-Forget Pattern

`useEffect` fires client-side after the component mounts. The call is not awaited and no `.catch()` is attached — errors are silent. This ensures the increment never blocks SSR rendering or the TanStack Start loader.

### Critical Guardrails

- **NO `withAdmin` on `incrementViewFn`** — public visitors trigger this; auth would break for all readers
- **`z.uuid()` not `z.string().uuid()`** — Zod 4 convention (matches existing admin.ts patterns on this branch)
- **`integer` must be added to schema.ts import** — it was not previously imported; build fails without it
- **`sql` must be added to queries.ts import** — same; only `and, asc, desc, eq, ne` were imported before
- **Migration via `db:push`** — snapshot files are out of sync with the DB (project uses push-based workflow); `db:generate` prompts interactively and cannot be used non-interactively

### Design System

- View count uses `text-sm text-zinc-400 dark:text-zinc-500` (muted/caption tier)
- Every visual class must have a `dark:` counterpart — no exceptions
- Neutral scale: `zinc` only — never `gray`, `slate`, `stone`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

✅ **Implementation Summary**

1. **Schema updated** — `integer` import added; `view_count INTEGER NOT NULL DEFAULT 0` column added to `posts` table. Applied to Neon DB via `db:push`.

2. **Atomic query added** — `incrementPostViewCount` in `queries.ts` uses `sql` template tag for a race-free single-statement UPDATE.

3. **Server function wired** — `incrementViewFn` (POST, no auth) calls `incrementPostViewCount` and returns `{ ok: true }`. Placed under the `// ============ VIEWS ============` section in `post.ts`.

4. **`fetchPost` updated** — `viewCount` added to the returned post object; available to the post detail route via loader data.

5. **Admin service updated** — `viewCount` added to `getAdminPostsFn` map; `AdminPost` type auto-updated via TypeScript inference.

6. **Post detail route updated** — `useEffect` fires fire-and-forget increment on mount; view count rendered after `<time>` element using muted caption styles.

7. **Locales added** — `views` key added to both `en.ts` and `vi.ts` under `pages.posts`.

8. **Admin PostRow updated** — view count shown in the metadata row alongside date and slug.

9. **Build verified** — TypeScript clean, gzip **1613 KiB** (well under 3 MB limit).

### File List

- `src/server/db/schema.ts` — MODIFIED: added `integer` import + `viewCount` column
- `src/server/db/queries.ts` — MODIFIED: added `sql` import + `incrementPostViewCount` function
- `src/shared/services/post.ts` — MODIFIED: added `incrementPostViewCount` import, wired `incrementViewFn`, added `viewCount` to `fetchPost` return
- `src/shared/services/admin.ts` — MODIFIED: added `viewCount` to `getAdminPostsFn` map
- `src/routes/$lang/posts/$slug.tsx` — MODIFIED: added `useEffect` increment + view count display
- `src/locales/en.ts` — MODIFIED: added `pages.posts.views`
- `src/locales/vi.ts` — MODIFIED: added `pages.posts.views`
- `src/components/admin/PostRow.tsx` — MODIFIED: added view count to metadata row
