# Story 4.5: Post Management Dashboard

Status: review

## Story

As the admin,
I want to see all my posts in one place with quick actions,
so that I can efficiently manage content across both languages and statuses.

## Acceptance Criteria

1. **Dashboard renders all posts**: Navigating to `/$lang/_protected/admin/queue` shows a list/table of ALL posts (both draft and published, both languages).
2. **Row columns**: Each row displays title, language (EN/VI badge), status (Draft/Published badge), publishedAt (if published), and createdAt.
3. **Filter by status**: Posts can be filtered by "draft", "published", or "all" (default: "all").
4. **Filter by language**: Posts can be filtered by "en", "vi", or "all" (default: "all").
5. **Default sort**: Posts are sorted by updatedAt descending.
6. **Edit action**: Clicking "Edit" navigates to `/$lang/_protected/edit/$postId`.
7. **Delete with confirmation**: Clicking "Delete" opens a dialog showing the post title and stating the action is irreversible; confirming calls `deletePostFn`, shows success toast, refreshes the list.
8. **Publish/Unpublish inline**: Clicking "Publish" on a draft or "Unpublish" on a published post toggles status inline and refreshes the list.
9. **Delete only affects selected post**: Deleting a post does NOT delete its translation partner (same `translationGroupId`, different `lang`).
10. **Design system compliance**: Uses zinc/teal palette, dark mode variants, Container pattern, and `t()` for all user-facing strings.
11. **Approval workflow cleanup**: Old `approvePostFn`, `rejectPostFn`, `submitForApproval`, `getPendingPosts`, `pendingPostsOptions` code is fully removed.

## Context: Brownfield — Repurpose queue.tsx + Cleanup Legacy Code

The `queue.tsx` file must be **completely replaced** (approval workflow is removed from scope). This story also cleans up leftover `@ts-expect-error` and `biome-ignore` comments left by Story 4.1.

### What Already Exists (DO NOT RECREATE):

| Item                        | Location                              | Notes                                                                  |
| --------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `deletePost(postId)`        | `src/server/db/queries.ts`            | Generic delete — `postTags` cascade via DB FK (`onDelete: "cascade"`)  |
| `updatePost(postId, data)`  | `src/server/db/queries.ts`            | Used for inline publish/unpublish                                      |
| `getAllPostsByLang(lang)`   | `src/server/db/queries.ts`            | Per-language admin query — too narrow, need a new all-language version |
| `publishPostFn`             | `src/shared/services/post.ts`         | Draft → published — REUSE for inline publish                           |
| `unpublishPostFn`           | `src/shared/services/admin.ts`        | Published → draft — REUSE for inline unpublish                         |
| `withAdmin()`               | `src/server/utils/withAdmin.ts`       | Auth guard — ALL admin mutations MUST use this                         |
| `Container`                 | `src/components/shared/Container.tsx` | Layout pattern                                                         |
| `Badge`, `Button`, `Dialog` | `src/components/ui/`                  | shadcn components already in use                                       |
| `useI18n`                   | `src/shared/providers/i18n.ts`        | i18n hook                                                              |
| `toast`                     | `sonner`                              | Toast pattern                                                          |

### What to REMOVE (Legacy Approval Workflow):

| Item                  | Location                              | Action                                                                       |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `getPendingPosts()`   | `src/server/db/queries.ts`            | DELETE — `"pending"` removed from status enum in Story 4.1; has TODO comment |
| `approvePostFn`       | `src/shared/services/admin.ts`        | DELETE                                                                       |
| `rejectPostFn`        | `src/shared/services/admin.ts`        | DELETE                                                                       |
| `submitForApproval`   | `src/shared/services/admin.ts`        | DELETE                                                                       |
| `getPendingPostsFn`   | `src/shared/services/admin.ts`        | DELETE                                                                       |
| `pendingPostsOptions` | `src/shared/tanstackQueries/admin.ts` | DELETE                                                                       |

### What Needs Building:

| Item                  | Location                                      | Action                                                                     |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| `getAllAdminPosts()`  | `src/server/db/queries.ts`                    | NEW — all posts across both langs, with category; sorted by updatedAt desc |
| `getAdminPostsFn`     | `src/shared/services/admin.ts`                | NEW — server fn wrapping `getAllAdminPosts()` with `withAdmin()`           |
| `deletePostFn`        | `src/shared/services/admin.ts`                | NEW — delete post by ID with `withAdmin()`                                 |
| `adminPostsOptions()` | `src/shared/tanstackQueries/admin.ts`         | REPLACE `pendingPostsOptions`                                              |
| `queue.tsx`           | `src/routes/$lang/_protected/admin/queue.tsx` | REPLACE content entirely                                                   |
| i18n keys             | `src/locales/en.ts` + `vi.ts`                 | ADD admin dashboard keys                                                   |

## Tasks / Subtasks

- [x] **Task 1: DB query** (AC: #1, #2, #5)
  - [x] 1.1: In `src/server/db/queries.ts`, add `getAllAdminPosts()` returning all posts with `category` and `author`, sorted by `updatedAt desc`. Include fields: `id`, `title`, `slug`, `lang`, `status`, `publishedAt`, `createdAt`, `updatedAt`, `translationGroupId`.
  - [x] 1.2: Remove `getPendingPosts()` and its `biome-ignore` comment. Ensure no other file imports it.

- [x] **Task 2: Admin server functions** (AC: #7, #8, #11)
  - [x] 2.1: In `src/shared/services/admin.ts`, DELETE `approvePostFn`, `rejectPostFn`, `submitForApproval`, `getPendingPostsFn`. Clean up their Zod schemas and imports.
  - [x] 2.2: ADD `getAdminPostsFn` — `createServerFn({ method: "GET" })` wrapped with `withAdmin()`, calls `getAllAdminPosts()`. Return mapped array: `{ id, title, slug, lang, status, publishedAt, createdAt, updatedAt, translationGroupId, category }`.
  - [x] 2.3: ADD `deletePostFn` — `createServerFn({ method: "POST" })` with `z.object({ postId: z.string().uuid() })`, wrapped with `withAdmin()`. Call `deletePost(data.postId)`. Return `{ id: data.postId }`.
  - [x] 2.4: Add imports at top: `deletePost`, `getAllAdminPosts` from `~/server/db/queries`.

- [x] **Task 3: TanStack Query options** (AC: #1)
  - [x] 3.1: Replace ALL content of `src/shared/tanstackQueries/admin.ts` with `adminPostsOptions()` using `queryKey: ["admin", "posts"]` and `queryFn: () => getAdminPostsFn()`. Remove `pendingPostsOptions` and its import.

- [x] **Task 4: Dashboard route** (AC: #1–#10)
  - [x] 4.1: Replace ALL content of `src/routes/$lang/_protected/admin/queue.tsx` with `PostDashboardPage`.
  - [x] 4.2: Use `useQuery(adminPostsOptions())` to fetch all posts.
  - [x] 4.3: Add `useState` for `statusFilter: "all" | "draft" | "published"` and `langFilter: "all" | "en" | "vi"`. Filter `posts` client-side.
  - [x] 4.4: Render a table or card list. Each row: title, lang badge (EN/VI), status badge (Draft/Published), publishedAt (formatted), createdAt (formatted), and action buttons: Edit, Publish/Unpublish, Delete.
  - [x] 4.5: "Edit" button: `<Link to="/$lang/edit/$postId" params={{ lang, postId: post.id }}>` (Note: `_protected` is pathless — correct path is `/$lang/edit/$postId`)
  - [x] 4.6: "Publish" mutation: calls `publishPostFn({ data: { postId } })`, invalidates `["admin", "posts"]` AND `["posts"]` on success.
  - [x] 4.7: "Unpublish" mutation: calls `unpublishPostFn({ data: { postId } })`, invalidates same keys.
  - [x] 4.8: Delete confirmation dialog: show post title, call `deletePostFn({ data: { postId } })`, invalidate `["admin", "posts"]` AND `["posts"]`.
  - [x] 4.9: Use `useParams` to get `lang` for Edit links: `const { lang } = Route.useParams()`.

- [x] **Task 5: i18n keys** (AC: #10)
  - [x] 5.1: Add admin dashboard keys to `src/locales/en.ts` under new `admin` key: `dashboard`, `allStatuses`, `allLanguages`, `filterByStatus`, `filterByLang`, `noPosts`, `deleteConfirmTitle`, `deleteConfirmBody`, `deleteSuccess`, `deleteError`, `publishSuccess`, `publishError`, `unpublishSuccess`, `unpublishError`.
  - [x] 5.2: Mirror keys in `src/locales/vi.ts`.

- [x] **Task 6: Build verification** (AC: all)
  - [x] 6.1: `npm run build` — 0 TypeScript errors.
  - [x] 6.2: `npx biome check ...` — no errors.
  - [ ] 6.3: Manual test: Navigate to dashboard — all posts shown.
  - [ ] 6.4: Manual test: Filter by status/language — correct posts shown.
  - [ ] 6.5: Manual test: Delete a post — confirmation shown, post removed from list.
  - [ ] 6.6: Manual test: Publish/unpublish — status badge updates after mutation.

## Dev Notes

### Architecture Constraints (MUST follow)

- **createServerFn** — ALL data mutations are `createServerFn`. Never raw `fetch` for DB calls from client.
- **withAdmin()** — ALL admin server functions MUST use `withAdmin()`. Never inline `isAdmin()` checks. See current `unpublishPostFn` in `admin.ts` as the correct pattern.
- **Error codes** — Throw `new Error("NOT_FOUND")`, `new Error("UNAUTHORIZED")` — map to i18n in `onError`.
- **Query invalidation** — After any mutation, invalidate BOTH `["admin", "posts"]` and `["posts"]` to keep all caches in sync.
- **TanStack Router `Link`** — Use `<Link to="/$lang/_protected/edit/$postId" params={{ lang, postId: ... }}>` for type-safe navigation. Import from `@tanstack/react-router`.
- **Biome** — tabs + double quotes for TS/TSX, single quotes for JSX prop string literals.

### DB Cascade: `postTags` auto-deletes

`postTags.postId` has `onDelete: "cascade"` in `src/server/db/schema.ts:118-120`. Calling `deletePost(postId)` is sufficient — no manual postTags deletion needed in `deletePostFn`.

### Legacy Cleanup: `admin.ts` has `@ts-expect-error` comments

After removing the old approval functions, the `@ts-expect-error` lines referencing `"pending"` and `"rejected"` statuses will also be removed. This is expected and intended.

### `getAllAdminPosts()` Query Pattern

```ts
// src/server/db/queries.ts
export async function getAllAdminPosts() {
  return db.query.posts.findMany({
    with: { author: true, category: true },
    orderBy: [desc(posts.updatedAt)],
  });
}
```

Include `translationGroupId` — it's already in the `posts` table (Story 4.1 schema). Story 4.6 will use it for translation status grouping.

### `deletePostFn` Pattern

```ts
// src/shared/services/admin.ts
const deletePostSchema = z.object({ postId: z.string().uuid() });

export const deletePostFn = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof deletePostSchema>) =>
    deletePostSchema.parse(data),
  )
  .handler(
    withAdmin(async ({ data }) => {
      const post = await getPostById(data.postId);
      if (!post) throw new Error("NOT_FOUND");
      await deletePost(data.postId); // postTags cascade via DB FK
      return { id: data.postId };
    }),
  );
```

### `getAdminPostsFn` Return Shape

```ts
// Map to serializable shape (no Date objects — use .toISOString())
return posts.map((post) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  lang: post.lang,
  status: post.status,
  translationGroupId: post.translationGroupId,
  publishedAt: post.publishedAt?.toISOString() ?? null,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  category: post.category
    ? { id: post.category.id, name: post.category.name }
    : null,
}));
```

### Dashboard State Pattern

```tsx
// Client-side filtering (no server round-trips for filters)
const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">(
  "all",
);
const [langFilter, setLangFilter] = useState<"all" | "en" | "vi">("all");

const filtered = posts
  .filter((p) => statusFilter === "all" || p.status === statusFilter)
  .filter((p) => langFilter === "all" || p.lang === langFilter);
```

### Publish/Unpublish Imports

```ts
// Import from their respective modules — DO NOT create duplicates
import { publishPostFn } from "~/shared/services/post";
import {
  deletePostFn,
  getAdminPostsFn,
  unpublishPostFn,
} from "~/shared/services/admin";
```

### Query Key Invalidation

```ts
// After any mutation in queue.tsx:
queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
queryClient.invalidateQueries({ queryKey: ["posts"] }); // keep public cache in sync
```

### Route Guard: Admin Layout Already Handles Auth

`src/routes/$lang/_protected/admin/route.tsx` has `beforeLoad` that calls `isAdmin()` and redirects if not admin. The `queue.tsx` component does NOT need to re-check auth — `withAdmin()` in server functions is sufficient.

### Design System Patterns

Follow patterns from the existing `queue.tsx` and `edit/$postId.tsx`:

- Page container: `<Container className="mt-16 sm:mt-32">`
- Page header: `<h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">`
- Table/card rows: `rounded-2xl border border-zinc-100 dark:border-zinc-700/40 p-6`
- Status badges: Use `<Badge variant="outline">` for EN/VI, `<Badge>` for Draft/Published
- Destructive button: `<Button variant="destructive">` for Delete confirm
- Filter controls: Use `<select>` or shadcn `Select` — zinc style

### `useParams` for lang in Link

```tsx
// queue.tsx — get current lang for typed navigation
const { lang } = Route.useParams();
// ...
<Link to="/$lang/_protected/edit/$postId" params={{ lang, postId: post.id }}>
  {t.common.edit}
</Link>;
```

### Previous Story Intelligence (Story 4.4)

- `publishPostFn` is in `src/shared/services/post.ts` — import from there.
- `unpublishPostFn` is in `src/shared/services/admin.ts` — import from there.
- `withAdmin()` pattern: `withAdmin(async ({ data }) => { ... })` — the wrapped function receives `{ data }`.
- Error code pattern: throw `new Error("NOT_FOUND")` server-side, handle in `onError` with `error.message.includes("NOT_FOUND")`.
- Toast pattern: `import { toast } from "sonner"` + `toast.success(...)` / `toast.error(...)`.
- QueryClient pattern: `const queryClient = useQueryClient()` at component top.

### Project Structure Notes

- `src/routes/$lang/_protected/admin/queue.tsx` — **REPLACE** entire file content. The file name stays the same (route must remain `/$lang/_protected/admin/queue`).
- `src/shared/tanstackQueries/admin.ts` — **REPLACE** entire file content.
- No new files needed — all changes go into existing files.

### References

- [Source: epics.md#Story4.5] — All acceptance criteria
- [Source: src/routes/$lang/_protected/admin/queue.tsx] — Current file to replace
- [Source: src/shared/services/admin.ts#unpublishPostFn] — withAdmin() pattern
- [Source: src/shared/services/post.ts#publishPostFn] — Publish pattern
- [Source: src/server/db/schema.ts:118] — postTags cascade `onDelete: "cascade"`
- [Source: src/server/db/queries.ts:233] — `deletePost()` exists
- [Source: src/server/db/queries.ts:242] — getPendingPosts TODO to remove
- [Source: DESIGN.md] — zinc/teal palette, Container, dark mode

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Replaced `queue.tsx` entirely — old approval workflow (approve/reject/submitForApproval) fully removed.
- `getPendingPosts()` removed from `queries.ts`; `getAdminPostsFn` + `deletePostFn` added to `admin.ts`.
- Link path is `/$lang/edit/$postId` (not `/$lang/_protected/edit/$postId`) because `_protected` is a pathless layout segment in TanStack Router.
- `deleteConfirmBody` uses single quotes to embed double-quoted `{title}` placeholder (Biome formatter requirement).
- `getAdminPostsFn` import removed from queue.tsx — it's consumed via `adminPostsOptions()` hook, not called directly.
- Labels given `htmlFor` attributes matching select `id`s to satisfy `lint/a11y/noLabelWithoutControl`.

### File List

- `src/server/db/queries.ts`
- `src/shared/services/admin.ts`
- `src/shared/tanstackQueries/admin.ts`
- `src/routes/$lang/_protected/admin/queue.tsx`
- `src/locales/en.ts`
- `src/locales/vi.ts`
