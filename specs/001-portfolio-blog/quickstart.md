# Quickstart Guide: Portfolio Blog Platform

**Date**: 2026-03-10  
**Phase**: 1 (Design & Contracts)  
**Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the Portfolio Blog Platform feature based on the specifications, data model, and API contracts defined in this directory.

**Prerequisites**:

- Read [spec.md](./spec.md) for requirements
- Read [research.md](./research.md) for architectural decisions
- Read [data-model.md](./data-model.md) for database schema
- Read [contracts/api.md](./contracts/api.md) for server function signatures

---

## Development Workflow

### Phase 2: Detailed Task Breakdown

**Next Command**: `/speckit.tasks`

This will generate `tasks.md` with granular implementation tasks including:

- File paths for each change
- Function signatures to implement
- Test cases to write
- Component structures
- Migration scripts

---

## Quick Implementation Checklist

### 1. Database Migrations (Priority: P0)

**Goal**: Update database schema to support bilingual content, approval workflow, categories, and tags

**Steps**:

```bash
# 1. Generate migration for translationGroupId
npm run db:generate -- --name add-translation-group

# Edit generated migration to add column and index:
# ALTER TABLE posts ADD COLUMN translation_group_id UUID DEFAULT gen_random_uuid() NOT NULL;
# CREATE INDEX translation_group_idx ON posts(translation_group_id);

# 2. Generate migration for status enum
npm run db:generate -- --name replace-published-with-status

# Edit to:
# - CREATE TYPE post_status AS ENUM (...)
# - ADD COLUMN status, admin_feedback, reviewed_by, reviewed_at
# - Migrate data: UPDATE posts SET status = CASE WHEN published ...
# - DROP COLUMN published
# - CREATE INDEX status_lang_published_idx

# 3. Generate migration for categories and tags
npm run db:generate -- --name add-categories-tags

# Edit to create categories, tags, post_tags tables + indexes

# 4. Generate migration for featured_image
npm run db:generate -- --name add-featured-image

# Apply all migrations
npm run db:push
```

**Files to Edit**:

- `src/server/db/schema.ts`: Add new tables and columns
- `src/server/db/migrations/`: Review and edit generated SQL

**Validation**:

```bash
# Check schema matches expected structure
npm run db:studio
# Verify: posts table has status enum, translationGroupId, etc.
```

---

### 2. Update Database Queries (Priority: P0)

**Goal**: Update query functions to work with new schema

**Files to Edit**:

- `src/server/db/queries.ts`

**Changes**:

```typescript
// Replace getPublishedPosts with pagination
export async function getPublishedPostsPaginated(
  lang: string,
  page: number = 1,
  pageSize: number = 10,
) {
  // Implement pagination with limit/offset
  // Filter by status='published' instead of published=true
}

// Add query for pending posts
export async function getPendingPosts() {
  return db.query.posts.findMany({
    where: eq(posts.status, "pending"),
    orderBy: [asc(posts.createdAt)],
  });
}

// Add query for translation lookup
export async function getPostTranslation(
  translationGroupId: string,
  targetLang: string,
) {
  // Find post with same translationGroupId but different lang
}

// Add category/tag queries
export async function getCategoriesList() {
  /*...*/
}
export async function getTagsList() {
  /*...*/
}
export async function getPostsByCategory(categorySlug: string) {
  /*...*/
}
export async function getPostsByTags(tagSlugs: string[]) {
  /*...*/
}
```

**Testing**:

```typescript
// tests/unit/queries.test.ts
describe("getPublishedPostsPaginated", () => {
  it("returns correct page of posts", async () => {
    // Create 25 test posts
    // Query page 2 with pageSize 10
    // Expect 10 posts, correct totalPages
  });
});
```

---

### 3. Update Server Functions (Priority: P1)

**Goal**: Implement server functions defined in API contracts

**Files to Create/Edit**:

- `src/shared/services/post.ts`: Update existing functions
- `src/shared/services/admin.ts`: Create new file for admin functions
- `src/shared/services/translation.ts`: Create new file for translation functions

**Implementation Order**:

1. **Update `createPostFn`**:
   - Add `status` field (draft vs. pending based on `published` param)
   - Add `categoryId`, `tagIds` support
   - Generate `translationGroupId` automatically

2. **Update `updatePostFn`**:
   - Check authorization (author for draft/rejected, admin for published)
   - Update `updatedAt` timestamp

3. **Implement approval workflow functions**:

   ```typescript
   // src/shared/services/admin.ts
   export const getPendingPosts = createServerFn({ method: "GET" }).handler(
     async ({ context }) => {
       const { userId } = await await context.auth();
       if (!isAdmin(userId)) throw new Error("UNAUTHORIZED");
       return getPendingPostsQuery();
     },
   );

   export const approvePostFn = createServerFn({ method: "POST" })
     .validator(z.object({ postId: z.string().uuid() }))
     .handler(async ({ data, context }) => {
       // Admin check
       // State validation (must be 'pending')
       // Update to 'published', set publishedAt, reviewedBy, reviewedAt
     });
   ```

4. **Implement translation functions**:
   ```typescript
   // src/shared/services/translation.ts
   export const createTranslationFn = createServerFn({ method: 'POST' })
     .validator(...)
     .handler(async ({ data }) => {
       // Get original post
       // Use same slug and translationGroupId
       // Create new post with targetLang
     });
   ```

**Testing**:

```typescript
// tests/integration/serverFunctions.test.ts
describe("approvePostFn", () => {
  it("approves pending post as admin", async () => {
    const post = await createTestPost({ status: "pending" });
    await approvePostFn({ data: { postId: post.id } }, mockAdminContext);
    const updated = await getPostById(post.id);
    expect(updated.status).toBe("published");
  });

  it("throws UNAUTHORIZED for non-admin", async () => {
    await expect(
      approvePostFn({ data: { postId: "x" } }, mockUserContext),
    ).rejects.toThrow("UNAUTHORIZED");
  });
});
```

---

### 4. Add Admin Routes (Priority: P1)

**Goal**: Create admin UI for approval queue and post management

**Files to Create**:

- `src/routes/$lang/_protected/admin/route.tsx`: Admin protection boundary
- `src/routes/$lang/_protected/admin/queue.tsx`: Approval queue page
- `src/routes/$lang/_protected/admin/posts.tsx`: All posts management

**queue.tsx Structure**:

```typescript
export const Route = createFileRoute('/$lang/_protected/admin/queue')({
  beforeLoad: ({ context }) => {
    if (!isAdmin(context.auth.userId)) {
      throw redirect({ to: '/$lang', params: { lang: context.lang } });
    }
  },
  loader: () => getPendingPosts(),
  component: ApprovalQueuePage
});

function ApprovalQueuePage() {
  const pendingPosts = Route.useLoaderData();

  return (
    <Container>
      <h1>Approval Queue</h1>
      {pendingPosts.map(post => (
        <PostReviewCard
          key={post.id}
          post={post}
          onApprove={async () => {
            await approvePostFn({ data: { postId: post.id } });
            router.invalidate();
          }}
          onReject={async (feedback) => {
            await rejectPostFn({ data: { postId: post.id, feedback } });
            router.invalidate();
          }}
        />
      ))}
    </Container>
  );
}
```

**Components to Create**:

- `src/components/admin/PostReviewCard.tsx`: Post preview with approve/reject buttons
- `src/components/admin/RejectFeedbackDialog.tsx`: Modal for rejection feedback

---

### 5. Update Post Creation/Edit Forms (Priority: P1)

**Goal**: Add category, tags, and translation support to post forms

**Files to Edit**:

- `src/routes/$lang/_protected/new.tsx`: Add category/tags selection
- `src/routes/$lang/_protected/edit.$id.tsx`: Create edit route

**Changes to new.tsx**:

```typescript
// Add to form fields
<form.Field name="categoryId">
  {(field) => (
    <Select value={field.state.value} onChange={field.handleChange}>
      {categories.map(cat => (
        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
      ))}
    </Select>
  )}
</form.Field>

<form.Field name="tagIds">
  {(field) => (
    <MultiSelect
      value={field.state.value}
      onChange={field.handleChange}
      options={tags}
      max={10}
    />
  )}
</form.Field>

// Update submit handler to include new fields
await createPostFn({
  data: {
    ...values,
    categoryId: values.categoryId,
    tagIds: values.tagIds
  }
});
```

**Create edit.$id.tsx**:

```typescript
export const Route = createFileRoute("/$lang/_protected/edit/$id")({
  loader: ({ params }) => getPostById(params.id),
  component: EditPostPage,
});

function EditPostPage() {
  const post = Route.useLoaderData();
  // Same form as new.tsx but pre-filled with post data
  // Authorization check: author for draft/rejected, admin for published
}
```

---

### 6. Implement Language Fallback (Priority: P1)

**Goal**: Gracefully handle missing translations instead of 404

**File to Edit**:

- `src/routes/$lang/posts/$slug.tsx`

**Changes**:

```typescript
export const Route = createFileRoute('/$lang/posts/$slug')({
  loader: async ({ params }) => {
    // Try requested language
    let post = await fetchPost({ data: { slug: params.slug, lang: params.lang } });
    let isFallback = false;
    let originalLang = params.lang;

    if (!post) {
      // Try opposite language
      const fallbackLang = params.lang === 'en' ? 'vi' : 'en';
      post = await fetchPost({ data: { slug: params.slug, lang: fallbackLang } });

      if (post) {
        isFallback = true;
        originalLang = fallbackLang;
      } else {
        throw notFound();
      }
    }

    return { post, isFallback, originalLang };
  },
  component: PostDetailPage
});

function PostDetailPage() {
  const { post, isFallback, originalLang } = Route.useLoaderData();
  const { t } = useI18n();

  return (
    <Container>
      {isFallback && (
        <div className="fallback-banner">
          {t.posts.onlyAvailableIn[originalLang]}
        </div>
      )}

      <article>
        {/* Post content */}
      </article>

      {post.translation && (
        <LanguageToggle
          currentLang={post.lang}
          translationSlug={post.translation.slug}
        />
      )}
    </Container>
  );
}
```

**Locales to Add**:

```typescript
// src/locales/en.ts
posts: {
  onlyAvailableIn: {
    en: 'This post is only available in English',
    vi: 'This post is only available in Vietnamese'
  }
}

// src/locales/vi.ts
posts: {
  onlyAvailableIn: {
    en: 'Bài viết này chỉ có sẵn bằng tiếng Anh',
    vi: 'Bài viết này chỉ có sẵn bằng tiếng Việt'
  }
}
```

---

### 7. Add Pagination UI (Priority: P1)

**Goal**: Add page navigation to post listing

**File to Edit**:

- `src/routes/$lang/posts/index.tsx`

**Changes**:

```typescript
// Add search params validation
const postsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1)
});

export const Route = createFileRoute('/$lang/posts/')({
  validateSearch: postsSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    return fetchPostsPaginated({
      data: { lang: params.lang, page: deps.page }
    });
  },
  component: PostListPage
});

function PostListPage() {
  const { posts, currentPage, totalPages } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <>
      {/* Post grid */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => navigate({ search: { page } })}
      />
    </>
  );
}
```

**Component to Create**:

- `src/components/shared/PaginationControls.tsx`: Previous/Next + page numbers

---

### 8. Add Image Upload (Priority: P2)

**Goal**: Enable image uploads for post content and featured images

**Files to Edit/Create**:

- `src/server/r2/uploads.ts`: Create upload helper
- `src/routes/api/upload.ts`: Update or verify upload endpoint
- `src/components/post/ImageUpload.tsx`: Create upload component

**Implementation**:

```typescript
// src/server/r2/uploads.ts
export async function uploadImage(file: File, userId: string): Promise<string> {
  // Validate file type and size
  // Generate unique key
  // Upload to R2
  // Return public URL
}

// src/components/post/ImageUpload.tsx
export function ImageUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const { url } = await response.json();
    onUploadComplete(url);
    setUploading(false);
  };

  return (
    <input type="file" accept="image/*" onChange={(e) => {
      if (e.target.files?.[0]) handleUpload(e.target.files[0]);
    }} disabled={uploading} />
  );
}
```

**Integration in MarkdownEditor**:

- Add toolbar button for image upload
- Insert `![alt](url)` into content on upload complete

---

### 9. Add Search & Filter (Priority: P3)

**Goal**: Enable full-text search and category/tag filtering

**Files to Create**:

- `src/components/post/SearchBar.tsx`
- `src/components/post/FilterPanel.tsx`

**Route Changes**:

```typescript
// Update search schema
const postsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Update loader to pass filters
loader: async ({ params, deps }) => {
  return fetchPostsPaginated({
    data: {
      lang: params.lang,
      page: deps.page,
      search: deps.search,
      categorySlug: deps.category,
      tagSlugs: deps.tags,
    },
  });
};
```

---

### 10. Environment Variables (Priority: P0)

**Goal**: Configure admin user ID and R2 credentials

**File to Edit**:

- `.env.local` (create if doesn't exist)

**Required Variables**:

```bash
# Admin Configuration
ADMIN_USER_ID=user_xxxxxxxxxxxxx  # Replace with your Clerk user ID

# Cloudflare R2 (already configured)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Database (already configured)
DATABASE_URL=postgresql://...
```

**Get your Clerk user ID**:

1. Log into the app in development
2. Open browser console
3. Run: `localStorage.getItem('__clerk_db_jwt')`
4. Decode JWT at jwt.io
5. Copy `sub` field (your user ID)

**File to Edit**:

- `src/env.ts`: Add `ADMIN_USER_ID` export

```typescript
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

if (!ADMIN_USER_ID) {
  throw new Error("ADMIN_USER_ID environment variable not set");
}
```

---

### 11. Localization Updates (Priority: P1)

**Goal**: Add translations for new UI elements

**Files to Edit**:

- `src/locales/en.ts`
- `src/locales/vi.ts`

**Keys to Add**:

```typescript
// English
admin: {
  approvalQueue: 'Approval Queue',
  approve: 'Approve',
  reject: 'Reject',
  rejectionFeedback: 'Rejection Feedback',
  enterFeedback: 'Enter feedback for author...',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
},
editor: {
  category: 'Category',
  tags: 'Tags',
  selectCategory: 'Select a category',
  selectTags: 'Select tags (max 10)',
  featuredImage: 'Featured Image',
  uploadImage: 'Upload Image',
  submitForReview: 'Submit for Review',
  resubmit: 'Resubmit',
}

// Vietnamese equivalents...
```

---

### 12. Testing (Priority: P0)

**Goal**: Achieve 80%+ coverage on critical paths

**Test Files to Create**:

```
tests/
├── unit/
│   ├── utils/slug.test.ts
│   ├── components/MarkdownEditor.test.tsx
│   └── hooks/useTranslation.test.ts
├── integration/
│   ├── serverFunctions/post.test.ts
│   ├── serverFunctions/admin.test.ts
│   ├── serverFunctions/translation.test.ts
│   └── routes/postDetail.test.tsx
└── e2e/
    ├── auth.spec.ts
    ├── postCreation.spec.ts
    ├── approvalWorkflow.spec.ts
    └── translation.spec.ts
```

**Priority Test Coverage**:

1. ✅ Auth flows (login, protected routes, admin checks)
2. ✅ Post CRUD (create, update, delete, authorization)
3. ✅ Approval workflow (submit, approve, reject, resubmit)
4. ✅ Translation creation and fallback
5. ✅ Pagination (page navigation, correct data)
6. ✅ Markdown rendering and sanitization
7. ✅ Image upload validation

**Run Tests**:

```bash
# Unit + integration
npm run test

# Coverage report
npm run test:coverage

# E2E (requires running dev server)
npm run test:e2e
```

---

## Implementation Priority

**Week 1: Foundation** (P0)

- [ ] Database migrations
- [ ] Update queries with new schema
- [ ] Environment variables (ADMIN_USER_ID)
- [ ] Admin authorization helper

**Week 2: Core Features** (P1)

- [ ] Update server functions (approval workflow)
- [ ] Admin approval queue route
- [ ] Language fallback in post detail
- [ ] Update post creation form (categories, tags)

**Week 3: Polish** (P1-P2)

- [ ] Pagination UI
- [ ] Translation creation flow
- [ ] Image upload
- [ ] Edit post route
- [ ] Localization updates

**Week 4: Enhancements** (P3)

- [ ] Search & filter
- [ ] Category/tag pages
- [ ] Admin post management dashboard
- [ ] Performance optimization (indexes, caching)

**Week 5: Testing & Launch** (P0)

- [ ] Write comprehensive tests (80%+ coverage)
- [ ] Lighthouse audit (meet performance targets)
- [ ] Accessibility audit (WCAG AA)
- [ ] Deploy to production

---

## Performance Checklist

Before deploying:

- [ ] Add database indexes (see data-model.md)
- [ ] Measure bundle size (`npm run build` → check output)
- [ ] Run Lighthouse audit (target: 90+ scores)
- [ ] Test Core Web Vitals (TTFB <2s, FCP <1.5s, LCP <2.5s)
- [ ] Enable R2 caching headers
- [ ] Configure Cloudflare Workers caching

---

## Deployment

```bash
# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Run migrations on production database
npm run db:push -- --url=$PRODUCTION_DATABASE_URL
```

**Post-Deployment Verification**:

1. Check admin approval queue is accessible
2. Create test post and submit for approval
3. Approve post and verify public visibility
4. Test language fallback (visit post URL in unavailable language)
5. Verify image uploads work
6. Run Lighthouse on production URL

---

## Troubleshooting

### "ADMIN_USER_ID not set" Error

**Solution**: Add your Clerk user ID to `.env.local` and restart dev server

### Approval Queue Empty Despite Pending Posts

**Solution**: Check database - `SELECT * FROM posts WHERE status = 'pending'`. Verify admin ID matches your Clerk ID.

### Language Fallback Not Working

**Solution**: Check posts have same `translationGroupId`. Run: `SELECT slug, lang, translation_group_id FROM posts WHERE slug = 'your-slug'`

### Migration Failed

**Solution**: Rollback with `npm run db:studio`, manually fix, regenerate migration

---

## Next Steps

1. Run `/speckit.tasks` to generate granular task breakdown
2. Create GitHub issues from tasks.md
3. Begin implementation following priority order
4. Open PR for each major milestone (migrations, approval workflow, etc.)
5. Request code review from team/mentors

---

**Questions?** Review the planning documents:

- [spec.md](./spec.md) - Requirements and success criteria
- [research.md](./research.md) - Architectural decisions
- [data-model.md](./data-model.md) - Database schema
- [contracts/api.md](./contracts/api.md) - Server function signatures
