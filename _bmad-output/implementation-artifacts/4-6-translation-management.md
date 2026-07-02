# Story 4.6: Translation Management

Status: review

## Story

As the admin,
I want to create and manage translations of blog posts,
so that I can provide bilingual content to English and Vietnamese readers.

## Acceptance Criteria

1. **Create Translation from edit form**: On `/$lang/_protected/edit/$postId`, if the post has no translation in the other language, a "Create Translation" button is shown.
2. **Pre-filled translation form**: Clicking "Create Translation" navigates to a new translation route pre-filled with: same `slug`, opposite `lang`, inherited `categoryId`, inherited `tagIds`. Title and content are EMPTY.
3. **`createTranslationFn` creates post**: Submitting the translation form calls `createTranslationFn`, which creates a new post with the same `translationGroupId` as the original. New post starts in `"draft"` status.
4. **Slug is shared**: The slug is the same as the original (unique per `slug + lang` constraint in DB). The same slug can exist in both `en` and `vi`.
5. **Blocked if translation exists**: If a translation already exists in the target language, "Create Translation" is hidden; "Edit Translation" link to `/$lang/_protected/edit/$translationPostId` is shown instead.
6. **Dashboard translation status**: On the post dashboard (`queue.tsx` from Story 4.5), each row shows a translation status indicator ("EN only", "EN + VI", "VI only"). Clicking the indicator navigates to the translation post's edit form.
7. **Independent edits**: Updating a translation post via `updatePostFn` does not affect the original. The `translationGroupId` is preserved.
8. **Publish translation → language switcher active**: When the translated post is published, the language switcher on the public post detail page (`/$lang/posts/$slug`) shows the alternate language as active.

## Dependencies

**Story 4.5 MUST be complete before implementing AC #6** (translation status column on the dashboard). ACs #1–#5, #7–#8 are independent of Story 4.5.

## Context: Brownfield — ~20% Already Built

The `translationGroupId` field, DB index, and `getPostTranslation()` already exist. The `createPostWithTags()` transaction can be adapted. Story 4.4's `getPostForEditFn` already returns `translationGroupId`.

### What Already Exists (DO NOT RECREATE):

| Item                                      | Location                                                             | Notes                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `translationGroupId`                      | `src/server/db/schema.ts:81`                                         | UUID field on `posts`, `defaultRandom()`, not null                          |
| `translation_group_idx`                   | `src/server/db/schema.ts:106`                                        | Index on `translationGroupId`                                               |
| `getPostTranslation(groupId, targetLang)` | `src/server/db/queries.ts:185`                                       | Filters by `status: "published"` only — NOT usable for admin check          |
| `createPostWithTags(post, tagIds)`        | `src/server/db/queries.ts:312`                                       | Transaction for post creation — adapt for translation                       |
| `getPostForEditFn`                        | `src/shared/services/post.ts:215`                                    | Already returns `translationGroupId` — use as source for Create Translation |
| `postForEditOptions(postId)`              | `src/shared/tanstackQueries/post.ts:44`                              | Already in use in edit route                                                |
| `createPostSchema` / `createPostFn`       | `src/shared/schemas/post.ts`, `src/shared/services/post.ts`          | Reference pattern                                                           |
| `getAllAdminPosts()` (built in 4.5)       | `src/server/db/queries.ts`                                           | Returns `translationGroupId` — used for dashboard grouping                  |
| `withAdmin()`                             | `src/server/utils/withAdmin.ts`                                      | Auth guard                                                                  |
| `NewPostForm.tsx`                         | `src/components/post/NewPostForm.tsx`                                | Reference for translation form component                                    |
| `editPostSchema` / `EditPostForm.tsx`     | `src/shared/schemas/post.ts`, `src/components/post/EditPostForm.tsx` | Reference for translation form                                              |

### What Needs Building:

| Item                                                 | Location                                            | Action                                                      |
| ---------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `getAnyPostByTranslationGroupAndLang()`              | `src/server/db/queries.ts`                          | NEW — find translation by groupId+lang regardless of status |
| `createTranslationSchema` / `CreateTranslationInput` | `src/shared/schemas/post.ts`                        | NEW Zod schema                                              |
| `createTranslationFn`                                | `src/shared/services/post.ts`                       | NEW server fn — creates translation post                    |
| `translationCheckOptions()`                          | `src/shared/tanstackQueries/post.ts`                | NEW query options — check if translation exists             |
| Translation UI on edit route                         | `src/routes/$lang/_protected/edit/$postId.tsx`      | ADD translation status section                              |
| Translation creation route                           | `src/routes/$lang/_protected/translate/$postId.tsx` | NEW route                                                   |
| Dashboard translation column (4.5 integration)       | `src/routes/$lang/_protected/admin/queue.tsx`       | UPDATE to add translation status                            |
| i18n keys                                            | `src/locales/en.ts` + `vi.ts`                       | ADD translation management keys                             |

## Tasks / Subtasks

- [x] **Task 1: DB query** (AC: #1, #5)
  - [x] 1.1: In `src/server/db/queries.ts`, add `getAnyPostByTranslationGroupAndLang(translationGroupId: string, lang: string)`. Uses `and(eq(posts.translationGroupId, ...), eq(posts.lang, ...))` — no status filter.

- [x] **Task 2: Zod schema** (AC: #3)
  - [x] 2.1: Added `createTranslationSchema` and `CreateTranslationInput` to `src/shared/schemas/post.ts`.
  - [x] 2.2: Added `createTranslationFormSchema` and `CreateTranslationFormInput` (includes all form fields).

- [x] **Task 3: Server function** (AC: #3, #4, #5)
  - [x] 3.1: Added `createTranslationFn` to `src/shared/services/post.ts` — guards against duplicate, copies `translationGroupId` and `slug` from original.
  - [x] 3.2: Added imports for `getAnyPostByTranslationGroupAndLang`, `createTranslationSchema`, `CreateTranslationInput`.

- [x] **Task 4: TanStack Query options** (AC: #1, #5)
  - [x] 4.1: Added `translationCheckOptions` to `src/shared/tanstackQueries/post.ts`.
  - [x] 4.2: Added `checkTranslationExistsFn` server function to `src/shared/services/post.ts`.

- [x] **Task 5: Translation creation route** (AC: #2, #3, #4)
  - [x] 5.1: Created `src/routes/$lang/_protected/translate/$postId.tsx`.
  - [x] 5.2: Route loader pre-fetches via `postForEditOptions`, `categoriesOptions`, `tagsOptions`.
  - [x] 5.3: Renders `NewTranslationForm` with pre-filled slug/lang/category/tags; title/content empty.
  - [x] 5.4: On submit calls `createTranslationFn`.
  - [x] 5.5: On success navigates to `/$lang/edit/$newPostId`.
  - [x] 5.6 & 5.7: Error handlers for `TRANSLATION_EXISTS` and `POST_NOT_FOUND`.

- [x] **Task 6: Edit route — translation section** (AC: #1, #5)
  - [x] 6.1: Added `translationCheckOptions` query to `edit/$postId.tsx`.
  - [x] 6.2: Translation section below form: "Create Translation" link or "Edit Translation" link.
  - [x] 6.3: `targetLang` computed from `post.lang`.

- [x] **Task 7: Dashboard translation column** (AC: #6)
  - [x] 7.1: `translationMap` groups posts by `translationGroupId` client-side.
  - [x] 7.2: Translation status shown inline in each row (EN only / VI only / EN + VI).
  - [x] 7.3: When partner exists, status is a clickable Link to partner's edit form.

- [x] **Task 8: i18n keys** (AC: all)
  - [x] 8.1: Added `translation` key to `src/locales/en.ts`.
  - [x] 8.2: Mirrored in `src/locales/vi.ts`.

- [x] **Task 9: Route tree update**
  - [x] 9.1: Route auto-generated by TanStack Router on `npm run build`.

- [x] **Task 10: Build verification** (AC: all)
  - [x] 10.1: `npm run build` — 0 TypeScript errors.
  - [x] 10.2: `npx biome check` — no errors.
  - [ ] 10.3: Manual test: Open existing EN post edit form — "Create Translation" button shown (if no VI exists).
  - [ ] 10.4: Manual test: Click "Create Translation" — form opens pre-filled with correct slug, VI lang, same category/tags, empty title/content.
  - [ ] 10.5: Manual test: Submit translation — redirected to edit form of new VI post.
  - [ ] 10.6: Manual test: Re-open EN post edit — "Edit Translation" link shown (button replaced).
  - [ ] 10.7: Manual test: Dashboard shows translation status per row.
  - [ ] 10.8: Manual test: Publish translated post — language switcher on public page shows VI link active.

## Dev Notes

### Architecture Constraints (MUST follow)

- **createServerFn** — All data mutations are `createServerFn`. Never raw `fetch` for DB calls from client.
- **withAdmin()** — `createTranslationFn` and `checkTranslationExistsFn` MUST use `withAdmin()`.
- **Error codes** — Throw `new Error("TRANSLATION_EXISTS")`, `new Error("POST_NOT_FOUND")`. Map to i18n `onError` client-side.
- **Slug uniqueness** — The DB has `uniqueIndex("slug_lang_idx")` on `(slug, lang)`. Same slug CAN exist in both `en` and `vi` — this is the core translation linking mechanism. Do NOT check slug uniqueness in `createTranslationFn` (it would incorrectly block the shared slug).
- **translationGroupId is NEVER changed** — Once set at post creation (via `defaultRandom()`), it is immutable. When creating a translation, copy it from the original.
- **Biome** — tabs + double quotes for TS/TSX, single quotes for JSX prop string literals.

### `createTranslationFn` Pattern

```ts
// src/shared/services/post.ts
export const createTranslationFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreateTranslationInput) =>
    createTranslationSchema.parse(data),
  )
  .handler(
    withAdmin(async ({ data }) => {
      const { userId: clerkId } = await auth();
      const user = await getUserByClerkId(clerkId!);
      if (!user) throw new Error("USER_NOT_FOUND");

      const original = await getPostByIdForAdmin(data.originalPostId);
      if (!original) throw new Error("POST_NOT_FOUND");

      const targetLang = original.lang === "en" ? "vi" : "en";

      // Check for existing translation
      const existing = await getAnyPostByTranslationGroupAndLang(
        original.translationGroupId,
        targetLang,
      );
      if (existing) throw new Error("TRANSLATION_EXISTS");

      const post = await createPostWithTags(
        {
          userId: user.id,
          title: data.title,
          slug: original.slug, // SAME slug as original
          lang: targetLang,
          content: data.content,
          description: data.description ?? null,
          featuredImage: data.featuredImage ?? null,
          categoryId: original.categoryId,
          translationGroupId: original.translationGroupId, // COPY from original
          status: "draft",
          publishedAt: null,
        },
        original.postTags.map((pt) => pt.tag.id),
      );

      return { id: post.id, slug: post.slug, lang: post.lang };
    }),
  );
```

### `getAnyPostByTranslationGroupAndLang` Query

```ts
// src/server/db/queries.ts
export async function getAnyPostByTranslationGroupAndLang(
  translationGroupId: string,
  lang: string,
) {
  return db.query.posts.findFirst({
    where: and(
      eq(posts.translationGroupId, translationGroupId),
      eq(posts.lang, lang),
    ),
    columns: { id: true, slug: true, lang: true, status: true },
  });
}
```

Note: `getPostTranslation()` at line 185 filters by `status: "published"` — do NOT reuse it for admin translation check; it misses drafts.

### Translation Status Grouping (Dashboard)

```tsx
// In queue.tsx — computed from the flat posts array
const translationMap = new Map<string, string[]>(); // groupId → langs[]
for (const post of posts) {
  const langs = translationMap.get(post.translationGroupId) ?? [];
  if (!langs.includes(post.lang)) langs.push(post.lang);
  translationMap.set(post.translationGroupId, langs);
}

// For each post row:
const langs = translationMap.get(post.translationGroupId) ?? [post.lang];
const statusLabel =
  langs.includes("en") && langs.includes("vi")
    ? t.translation.enAndVi
    : langs.includes("en")
      ? t.translation.enOnly
      : t.translation.viOnly;
```

### Translation Route: `src/routes/$lang/_protected/translate/$postId.tsx`

This route is under `_protected` (auth required) but NOT under `admin` (the admin guard is at `admin/route.tsx`). Since `_protected/route.tsx` only checks Clerk auth (not isAdmin), translation creation is accessible to any authenticated user. Server function `createTranslationFn` uses `withAdmin()` to enforce admin-only constraint at the data layer.

### `routeTree.gen.ts` — Auto-Generated

`routeTree.gen.ts` is auto-generated by TanStack Router's Vite plugin. Creating the file `src/routes/$lang/_protected/translate/$postId.tsx` will automatically register the route on the next `npm run dev` or `npm run build`. Never manually edit `routeTree.gen.ts`.

### Language Switcher (AC #8)

AC #8 ("language switcher active when translation is published") is already implemented in Story 3.2/3.3. The `fetchPost` server function in `post.ts` calls `getPostTranslation(groupId, targetLang)` which filters by `status: "published"`. Once the translation is published, the language switcher will automatically show the link. No code changes needed for AC #8 beyond having `createTranslationFn` create the post with the correct `translationGroupId`.

### TanStack Router `Link` for Translation Navigation

```tsx
// In edit route — "Create Translation" button
<Link to="/$lang/_protected/translate/$postId" params={{ lang, postId: post.id }}>
  {t.translation.createTranslation}
</Link>

// "Edit Translation" link
<Link to="/$lang/_protected/edit/$postId" params={{ lang, postId: translationPostId }}>
  {t.translation.editTranslation}
</Link>
```

### NewTranslationForm vs NewPostForm

**Option A**: Create a `NewTranslationForm` component that mirrors `NewPostForm` with initial values injected (like `EditPostForm.tsx` mirrors `NewPostForm.tsx`).

**Option B**: Reuse `NewPostForm` with URL search params for initial values.

**Recommended: Option A** — cleaner, avoids complex URL state. The component is small and the translation route already loads the original post data in its loader. Pass initial values as props.

Key differences from `NewPostForm`:

- `lang` field is locked (read-only, pre-set to `targetLang`)
- `slug` field is pre-filled from original and read-only (slug is shared)
- Title and content are empty
- On submit calls `createTranslationFn` instead of `createPostFn`
- Slug check can be skipped (slug already exists for the original lang; the new lang variant is guaranteed unique unless someone races)

### Edit Route — getPostForEditFn Already Returns translationGroupId

```ts
// Story 4.4 built getPostForEditFn which returns:
{
  (id,
    title,
    slug,
    lang,
    content,
    description,
    featuredImage,
    status,
    publishedAt,
    translationGroupId, // ← already present!
    categoryId,
    tagIds);
}
```

In the edit route, `translationGroupId` is already available from the post data. Use it directly for the translation check query.

### Previous Story Intelligence (Stories 4.4 + 4.5)

- `getPostByIdForAdmin()` (Story 4.4) already includes `postTags: { with: { tag: true } }` — pass tag IDs to `createPostWithTags`.
- `withAdmin()` signature: `withAdmin(async ({ data }) => { ... })` — the handler receives `{ data }`.
- Follow `createPostFn` pattern exactly for user resolution: `auth()` → `getUserByClerkId()`.
- All `Date` objects in server fn responses must be serialized to `.toISOString()`.
- `queryClient.invalidateQueries({ queryKey: ["posts"] })` after `createTranslationFn` success — invalidates post list caches.

### Project Structure Notes

| File                                                | Action                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `src/server/db/queries.ts`                          | ADD `getAnyPostByTranslationGroupAndLang`                           |
| `src/shared/schemas/post.ts`                        | ADD `createTranslationSchema`, `createTranslationFormSchema`, types |
| `src/shared/services/post.ts`                       | ADD `createTranslationFn`, `checkTranslationExistsFn`               |
| `src/shared/tanstackQueries/post.ts`                | ADD `translationCheckOptions`                                       |
| `src/routes/$lang/_protected/translate/$postId.tsx` | CREATE — new translation creation route                             |
| `src/components/post/NewTranslationForm.tsx`        | CREATE — mirrors NewPostForm with pre-filled values                 |
| `src/routes/$lang/_protected/edit/$postId.tsx`      | UPDATE — add translation management section                         |
| `src/routes/$lang/_protected/admin/queue.tsx`       | UPDATE — add translation status column                              |
| `src/locales/en.ts` + `vi.ts`                       | ADD translation keys                                                |

### References

- [Source: epics.md#Story4.6] — All acceptance criteria
- [Source: src/server/db/schema.ts:81] — `translationGroupId` field definition
- [Source: src/server/db/queries.ts:185] — `getPostTranslation()` — NOT for admin check (published-only)
- [Source: src/server/db/queries.ts:312] — `createPostWithTags()` transaction to adapt
- [Source: src/shared/services/post.ts:215] — `getPostForEditFn` returns `translationGroupId`
- [Source: src/components/post/NewPostForm.tsx] — Reference for NewTranslationForm
- [Source: src/components/post/EditPostForm.tsx] — Reference for how initialValues are passed
- [Source: src/shared/services/post.ts#createPostFn] — User resolution pattern to follow
- [Source: DESIGN.md] — zinc/teal palette, dark mode, Button patterns

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `createTranslationFormSchema` includes all form fields (slug, lang, categoryId, tagIds) to match TanStack Form's value type inference — only `originalPostId/title/content/description/featuredImage` are passed to the server function.
- `categoryId` uses `z.union([z.string().uuid(), z.undefined()])` consistent with `createPostFormSchema` and `updatePostFormSchema` patterns (not `z.optional()`).
- `NewTranslationForm`'s `onSubmit` prop is typed as `CreateTranslationInput` (server schema) to keep parent route clean; the form strips non-essential fields internally.
- The translate route reads post from query cache (pre-loaded by loader) instead of making a second network call.
- Translation section in edit route uses `enabled: !!post?.translationGroupId` to skip the query until post data is loaded.
- Link path for translate route is `/$lang/translate/$postId` (not `_protected`-prefixed) — `_protected` is a pathless layout.
- AC #8 (language switcher activates on translation publish) works automatically via existing `getPostTranslation()` in `fetchPost` — no new code needed.

### File List

- `src/server/db/queries.ts`
- `src/shared/schemas/post.ts`
- `src/shared/services/post.ts`
- `src/shared/tanstackQueries/post.ts`
- `src/routes/$lang/_protected/translate/$postId.tsx`
- `src/components/post/NewTranslationForm.tsx`
- `src/routes/$lang/_protected/edit/$postId.tsx`
- `src/routes/$lang/_protected/admin/queue.tsx`
- `src/locales/en.ts`
- `src/locales/vi.ts`
