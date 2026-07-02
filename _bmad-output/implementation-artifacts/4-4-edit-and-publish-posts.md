# Story 4.4: Edit & Publish Posts

Status: done

## Story

As the admin,
I want to edit existing posts and control their publication status,
So that I can refine content and make it publicly available when ready.

## Acceptance Criteria

1. **Edit form pre-populated**: Navigating to `/$lang/_protected/edit/$postId` renders the post form pre-filled with title, slug, content, description, category, tags, and featuredImage from the database.
2. **Save changes**: Clicking "Save Changes" calls `updatePostFn`, updates the post in the DB, and shows a success toast.
3. **Slug uniqueness on edit**: If the slug is changed, uniqueness is validated against all posts of the same lang **excluding the current post**. An error is shown if taken.
4. **Publish draft**: Admin clicks "Publish" on a draft → status changes to `"published"`, `publishedAt` is set to now, post becomes visible on public listing.
5. **Unpublish published post**: Admin clicks "Unpublish" → status reverts to `"draft"`, `publishedAt` cleared, post hidden from public.
6. **Admin-only**: All mutations (`updatePostFn`, `publishPostFn`) use `withAdmin()` — return `UNAUTHORIZED` error code for non-admins.
7. **DB failure resilience**: On save failure, the form stays populated with unsaved content — no data loss (NFR19). A recoverable error toast is shown with retry guidance.
8. **Tags replaced atomically**: Tag updates delete all existing `postTags` for the post and insert the new set in a single transaction.

## Context: Brownfield — ~35% Already Implemented

Significant infrastructure already exists. No new DB schema. The key gap is the edit route, the `updatePostFn` server function, the `EditPostForm` component, and `publishPostFn`.

### What Already Exists (DO NOT RECREATE):

| Item                                        | Location                              | Notes                                                                         |
| ------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| `updatePost(postId, data)`                  | `src/server/db/queries.ts`            | Generic update, no tag handling                                               |
| `createPostTags(postId, tagIds)`            | `src/server/db/queries.ts`            | Insert-only, no delete                                                        |
| `createPostWithTags(post, tagIds)`          | `src/server/db/queries.ts`            | Create-only transaction                                                       |
| `unpublishPostFn`                           | `src/shared/services/admin.ts`        | `published → draft`, clears `publishedAt` — FULLY WORKING                     |
| `withAdmin()`                               | `src/server/utils/withAdmin.ts`       | Auth guard for all admin mutations                                            |
| `NewPostForm.tsx`                           | `src/components/post/NewPostForm.tsx` | TanStack Form + slug check + categories/tags/editor — reference for edit form |
| `new.tsx` route                             | `src/routes/$lang/_protected/new.tsx` | Reference pattern for edit route                                              |
| `categoriesOptions()`, `tagsOptions()`      | `src/shared/tanstackQueries/post.ts`  | Reuse for edit form dropdowns                                                 |
| `createPostSchema` / `createPostFormSchema` | `src/shared/schemas/post.ts`          | Reference for `updatePostSchema`                                              |
| `generateSlug()`                            | `src/shared/utils/slug.ts`            | Slug auto-generation util                                                     |

### What Needs Building:

| Item                                   | Location                                       | Action                                                                      |
| -------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `getPostByIdForAdmin()`                | `src/server/db/queries.ts`                     | NEW query — fetch post with category + postTags for edit form               |
| `updatePostWithTags()`                 | `src/server/db/queries.ts`                     | NEW transaction — update post + replace all postTags atomically             |
| `updatePostSchema` / `UpdatePostInput` | `src/shared/schemas/post.ts`                   | NEW Zod schema for update                                                   |
| `getPostForEditFn`                     | `src/shared/services/post.ts`                  | NEW server fn — admin fetch by ID for edit form                             |
| `updatePostFn`                         | `src/shared/services/post.ts`                  | NEW server fn — admin update                                                |
| `publishPostFn`                        | `src/shared/services/post.ts`                  | NEW server fn — draft → published                                           |
| `checkSlugAvailability` updated        | `src/shared/services/post.ts`                  | MODIFY — add optional `excludePostId` param                                 |
| `postForEditOptions()`                 | `src/shared/tanstackQueries/post.ts`           | NEW query options helper                                                    |
| `slugCheckOptions()` updated           | `src/shared/tanstackQueries/post.ts`           | MODIFY — forward `excludePostId`                                            |
| `EditPostForm.tsx`                     | `src/components/post/EditPostForm.tsx`         | NEW component — mirrors NewPostForm with initial values + publish/unpublish |
| `edit/$postId.tsx` route               | `src/routes/$lang/_protected/edit/$postId.tsx` | NEW route — loads post, renders EditPostForm                                |
| i18n keys                              | `src/locales/en.ts` + `vi.ts`                  | ADD new editor/common keys                                                  |

## Tasks / Subtasks

- [x] **Task 1: DB queries** (AC: #1, #3, #8)
  - [x] 1.1: In `src/server/db/queries.ts`, add `getPostByIdForAdmin(postId: string)`.
  - [x] 1.2: Add `updatePostWithTags(postId, data, newTagIds)` as a transaction.
  - [x] 1.3: Add `getAnyPostBySlugAndLang(slug, lang, excludePostId?)` with `ne` from drizzle-orm.

- [x] **Task 2: Schema** (AC: #2, #3)
  - [x] 2.1: In `src/shared/schemas/post.ts`, add `updatePostSchema` and `UpdatePostInput`.
  - [x] 2.2: Add `updatePostFormSchema` and `UpdatePostFormInput` (featuredImage: z.string() for form alignment).

- [x] **Task 3: Server functions** (AC: #2, #3, #4, #5, #6)
  - [x] 3.1: In `src/shared/services/post.ts`, add `getPostForEditFn`.
  - [x] 3.2: Add `updatePostFn`.
  - [x] 3.3: Add `publishPostFn` (draft → published).
  - [x] 3.4: Update `checkSlugAvailability` to accept optional `excludePostId` and use `getAnyPostBySlugAndLang`.
  - [x] 3.5: Import new query functions and schemas at top of `post.ts`.

- [x] **Task 4: TanStack Query options** (AC: #1)
  - [x] 4.1: In `src/shared/tanstackQueries/post.ts`, add `postForEditOptions`.
  - [x] 4.2: Update `slugCheckOptions` to forward `excludePostId`.

- [x] **Task 5: EditPostForm component** (AC: #1, #2, #3, #4, #5, #7)
  - [x] 5.1: Create `src/components/post/EditPostForm.tsx` mirroring NewPostForm with initialValues + status-conditional buttons.
  - [x] 5.2: Form `onSubmit` handler blocks on `isTaken`.
  - [x] 5.3: Buttons area with Publish/Unpublish/Save Changes correctly gated by status.

- [x] **Task 6: Edit route** (AC: #1, #2, #4, #5, #6, #7)
  - [x] 6.1: Create `src/routes/$lang/_protected/edit/$postId.tsx` with loader.
  - [x] 6.2: `EditPostPage` with updateMutation, publishMutation, unpublishMutation and full error handling.

- [x] **Task 7: i18n keys** (AC: #2, #4, #5)
  - [x] 7.1: Keys already present in `src/locales/en.ts` from prior implementation.
  - [x] 7.2: Keys already present in `src/locales/vi.ts` from prior implementation.

- [x] **Task 8: Build verification** (AC: all)
  - [x] 8.1: `npm run build` — 0 TypeScript errors.
  - [x] 8.2: `npx biome check ...` — no errors.
  - [ ] 8.3: Manual test: navigate to `/$lang/_protected/edit/{id}` for an existing draft post — form pre-filled, Save Changes updates DB, Publish transitions status + shows success.
  - [ ] 8.4: Manual test: edit a published post — Unpublish button removes it from public listing.
  - [ ] 8.5: Manual test: change slug to an existing slug — taken error shown, save blocked.
  - [ ] 8.6: Manual test: change slug to the same slug (no change) — no false "taken" error.

## Dev Notes

### Architecture Constraints (MUST follow)

- **createServerFn** — ALL data mutations are `createServerFn`. Never use raw `fetch` for DB calls from client.
- **withAdmin()** — Wrap ALL write server functions with `withAdmin()`. Never check `isAdmin()` manually inside the handler.
- **Error codes** — Throw `new Error("SLUG_TAKEN")`, `new Error("POST_NOT_FOUND")`, `new Error("UNAUTHORIZED")` — never throw user-facing strings from server functions. Map to i18n in the mutation `onError` handler client-side.
- **TanStack Query invalidation** — After mutations, call `queryClient.invalidateQueries({ queryKey: ["posts"] })` to keep list/detail caches in sync.
- **TanStack Form** — `@tanstack/react-form` (already in use in `NewPostForm.tsx`). Do NOT switch to react-hook-form.
- **Sonner toasts** — `import { toast } from "sonner"` — already in use in `new.tsx`. Use same pattern.
- **Biome** — tabs + double quotes for TS/TSX, single quotes for JSX prop string literals.

### Drizzle `ne` Import

```ts
// src/server/db/queries.ts — add to existing import:
import { and, asc, desc, eq, ne } from "drizzle-orm";
```

### Existing `unpublishPostFn` — Use Directly

`unpublishPostFn` is FULLY working in `src/shared/services/admin.ts`. Import and call it from the edit route:

```ts
import { unpublishPostFn } from "~/shared/services/admin";
// In unpublishMutation:
mutationFn: () => unpublishPostFn({ data: { postId } });
```

Do NOT create a duplicate. Do NOT move it to `post.ts`.

### Slug Uniqueness Edge Cases

- **Original slug unchanged**: `checkSlugAvailability` with `excludePostId` will find no conflict → shows "available" (green ✓) correctly.
- **Slug changed to taken value**: Returns conflict → shows error, blocks save.
- **Slug changed to available value**: Returns clear → allows save.
- **Disable slug auto-generation on edit**: In `NewPostForm.tsx`, `handleTitleChange` auto-updates slug only when `!slugManuallyEdited`. For `EditPostForm.tsx`, NEVER auto-update slug from title — the URL is already established.

### Form Pre-Population

```ts
// In EditPostForm.tsx defaultValues:
const form = useForm({
  defaultValues: {
    postId: initialValues.postId,
    title: initialValues.title,
    slug: initialValues.slug,
    lang: initialValues.lang,
    description: initialValues.description ?? "",
    content: initialValues.content,
    categoryId: initialValues.categoryId,
    tagIds: initialValues.tagIds,
    featuredImage: initialValues.featuredImage ?? "",
  },
  validators: { onSubmit: updatePostFormSchema },
  onSubmit: ({ value }) => { ... },
});
```

### Status-Conditional Button Logic

Draft post: show [Save Changes] [Publish]  
Published post: show [Unpublish] [Save Changes]  
Never show both Publish and Unpublish simultaneously.

### Query Key Invalidation Pattern

```ts
// After any mutation that affects post data:
queryClient.invalidateQueries({ queryKey: ["posts"] });
// This invalidates all: lists, detail, edit, slug-check
```

Use `useQueryClient()` hook in the route component.

### `getPostForEditFn` — Returns Status

Ensure the `status` field is returned from `getPostForEditFn` so the edit form knows which buttons to show. The DB `postStatusEnum` is `["draft", "published"]`.

### Route File Naming — TanStack Start

TanStack Start file-based routes use `$paramName` for dynamic segments. The file:
`src/routes/$lang/_protected/edit/$postId.tsx`

produces the route: `/$lang/_protected/edit/:postId`

The `$lang` segment is already used elsewhere — confirm the file nests correctly under the `_protected` layout which enforces auth via `beforeLoad`.

### Client-Side Draft Preservation (NFR19)

TanStack Form holds form state in memory. As long as the mutation `onError` handler does NOT reset the form, the entered content persists through a save failure. Do NOT call `form.reset()` on error. Only reset on success if navigating away.

### Previous Story Intelligence (Story 4.3)

- Story 4.3 is focused on upload validation — no overlap with this story.
- `MarkdownEditor.tsx` is production-ready. Import it the same way as `NewPostForm.tsx`.
- The `ClientOnly` + `Suspense` wrapping is inside `MarkdownEditor.tsx` — no need to wrap it again in `EditPostForm.tsx`.

### Key File Locations

| File                                           | Action                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/server/db/queries.ts`                     | ADD `getPostByIdForAdmin`, `updatePostWithTags`, `getAnyPostBySlugAndLang`; add `ne` to drizzle import |
| `src/shared/schemas/post.ts`                   | ADD `updatePostSchema`, `updatePostFormSchema`, `UpdatePostInput`, `UpdatePostFormInput`               |
| `src/shared/services/post.ts`                  | ADD `getPostForEditFn`, `updatePostFn`, `publishPostFn`; MODIFY `checkSlugAvailability`                |
| `src/shared/tanstackQueries/post.ts`           | ADD `postForEditOptions`; MODIFY `slugCheckOptions`                                                    |
| `src/components/post/EditPostForm.tsx`         | CREATE — mirrors NewPostForm with initialValues + status-conditional buttons                           |
| `src/routes/$lang/_protected/edit/$postId.tsx` | CREATE — edit post route                                                                               |
| `src/locales/en.ts` + `vi.ts`                  | ADD new editor keys                                                                                    |

### References

- [Source: epics.md#Story4.4] — All acceptance criteria
- [Source: architecture.md#APIPatterns] — `createServerFn` pattern, error code conventions
- [Source: src/components/post/NewPostForm.tsx] — Form patterns to mirror for EditPostForm
- [Source: src/routes/$lang/_protected/new.tsx] — Route pattern (loader, mutation, toast, navigate)
- [Source: src/shared/services/admin.ts#unpublishPostFn] — Existing unpublish fn — import and reuse
- [Source: src/server/db/queries.ts#createPostWithTags] — Transaction pattern to mirror for `updatePostWithTags`
- [Source: src/shared/schemas/post.ts] — Existing schemas to extend
- [Source: DESIGN.md] — Button variants, zinc/teal palette, dark mode

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- All i18n keys for 4.4 were already present in en.ts and vi.ts from a prior session.
- `updatePostFormSchema` uses `featuredImage: z.string()` (non-optional) instead of `z.string().optional()` to match the form defaultValues type and avoid TS mismatch with TanStack Form validators.
- `checkSlugAvailability` updated to use `getAnyPostBySlugAndLang` instead of `getPostBySlugAndLang` so it checks all statuses (draft + published), not just published posts.
- `unpublishPostFn` imported from `~/shared/services/admin` as-is (not duplicated).
- Slug check in EditPostForm is always enabled (not gated on manual edit) since the slug is pre-filled and always valid to check.

#### Code Review Fixes (2026-04-02)

- [P3] `checkSlugAvailability` now wrapped with `withAdmin()` — prevents unauthenticated draft slug enumeration.
- [P4] `updatePostFn` now guards `if (!post) throw new Error("POST_NOT_FOUND")` after `updatePostWithTags`.
- [P7] `publishPostFn` now returns `slug` in response; `publishMutation.onSuccess` uses `result.slug` for navigation.
- [P8] Publish button now disabled when `isCheckingSlug` is true (race condition fix).
- [P9] `featuredImage` field now rendered in EditPostForm as a URL text input.
- [P12] `categoryId` in form schemas changed from `z.literal(undefined)` to `z.union([..., z.undefined()])`.
- [P13] Unpublish error handler now checks `raw.includes("NOT_FOUND")` matching admin.ts error code.
- [P14] Save Changes button now disabled when `isTaken || isCheckingSlug`.
- Added `featuredImage` i18n key to en.ts and vi.ts.

#### Second-Pass Code Review Fixes (2026-04-01)

- [P4] `unpublishPostFn` in `admin.ts` now uses `withAdmin()` instead of inline `isAdmin()` check — consistent with AC6 requirement.
- [P5] Publish button now saves pending form edits first (sets `publishIntentRef`, calls `form.handleSubmit()`); route chains `updateMutation.mutateAsync` → `publishMutation.mutate()`.
- [P7] `publishPostFn` made atomic: no pre-read, single `updatePost` call, returns `updated.slug` (authoritative). TOCTOU race eliminated.
- [P8] Slug check error state added to EditPostForm: `isSlugCheckError` from `useQuery` disables save/publish buttons and shows `t.editor.slugCheckFailed` error message.
- [P11] `updatePostSchema.featuredImage` transforms empty string to `undefined` before DB write — aligns with create flow that converts falsy → null.
- [P13] `slugCheckOptions` staleTime reduced from `POSITIVE_INFINITY` to `30_000` ms (30 s) — prevents indefinitely-cached stale availability results.
- [P3] `updatePostWithTags` transaction: `POST_NOT_FOUND` guard moved inside transaction before tag operations — prevents tag delete/insert on nonexistent posts.
- [P14] `getAnyPostBySlugAndLang` now uses explicit conditions array instead of spreading `undefined` into `and()`.
- Added `slugCheckFailed` i18n key to `en.ts` and `vi.ts`.

### File List

- `src/server/db/queries.ts`
- `src/shared/schemas/post.ts`
- `src/shared/services/post.ts`
- `src/shared/services/admin.ts`
- `src/shared/tanstackQueries/post.ts`
- `src/components/post/EditPostForm.tsx`
- `src/routes/$lang/_protected/edit/$postId.tsx`
- `src/locales/en.ts`
- `src/locales/vi.ts`
