# Research: Portfolio Blog Platform

**Date**: 2026-03-10  
**Phase**: 0 (Outline & Research)  
**Status**: Complete

## Overview

This document consolidates research findings, architectural decisions, and technology comparisons for the Portfolio Blog Platform feature. All "NEEDS CLARIFICATION" items from Technical Context have been resolved through clarification session on 2026-03-10.

---

## Architectural Decisions

### 1. Bilingual Content Architecture

**Decision**: Translation Groups with Graceful Language Fallback  
**Status**: ✅ Approved

**Implementation**:
- Each post row represents **one language** (English or Vietnamese)
- Posts linked via `translationGroupId` UUID column
- Same slug can exist across languages via existing `slug_lang_idx` unique index
- Post detail route falls back to available language instead of 404
- Language toggle displayed only when both translations exist

**Rationale**:
- Aligns with existing `/$lang/` routing architecture
- Preserves separation between UI language (header I18nSwitcher) and content language
- Minimal schema changes (add one column)
- Supports optional translations (not all posts need bilingual versions)
- SEO-friendly with proper hreflang tags

**Alternatives Considered**:
- **Single-row bilingual** (`title_en`, `title_vi`, `content_en`, `content_vi` columns): Rejected due to routing conflicts and forced bilingual requirement
- **JSON multilingual** (JSON columns for translations): Rejected due to poor query performance and complex editing UX

**Technical Details**:
```typescript
// Database schema addition
translationGroupId: uuid("translation_group_id")
  .default(sql`gen_random_uuid()`)
  .notNull()

// Query: Find translation
const translation = await db.query.posts.findFirst({
  where: and(
    eq(posts.translationGroupId, currentPost.translationGroupId),
    eq(posts.lang, targetLang),
    eq(posts.status, 'published')
  )
});

// Fallback logic in route loader
const post = await fetchPost({ slug, lang });
if (!post) {
  const fallbackLang = lang === 'en' ? 'vi' : 'en';
  const fallbackPost = await fetchPost({ slug, lang: fallbackLang });
  if (fallbackPost) {
    return { post: fallbackPost, isFallback: true, originalLang: fallbackPost.lang };
  }
  throw notFound();
}
```

**UI Behavior**:
- **Translation exists**: Show language toggle button → navigate to `/[otherLang]/posts/[slug]`
- **Translation missing**: I18nSwitcher navigates to `/[otherLang]/posts/[slug]` → show banner: "This post is only available in [originalLang]"
- **Post listing**: Show badge "Also available in [otherLang]" when translation exists

---

### 2. Admin Role Authorization

**Decision**: Environment Variable Admin ID  
**Status**: ✅ Approved

**Implementation**: 
- Store admin Clerk user ID in `ADMIN_USER_ID` environment variable
- Authorization check: `clerkId === env.ADMIN_USER_ID`
- No database role column needed

**Rationale**:
- Single-admin personal blog (per Spec Assumption #1)
- Simplest, most secure approach
- No schema changes required
- Easy to change admin (update env var, redeploy)

**Alternatives Considered**:
- **Role column in users table**: Rejected as over-engineered for single admin
- **Clerk organization roles**: Rejected due to added complexity and Clerk plan requirements

**Technical Details**:
```typescript
// src/env.ts
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

// Authorization helper
export function isAdmin(clerkId: string | null): boolean {
  return clerkId === ADMIN_USER_ID;
}

// Usage in server functions
export const approvePost = createServerFn({ method: 'POST' })
  .validator(...)
  .handler(async ({ data, context }) => {
    const { userId } = await context.auth();
    if (!isAdmin(userId)) {
      throw new Error('UNAUTHORIZED');
    }
    // ... approval logic
  });
```

---

### 3. Pagination Strategy

**Decision**: Offset-Based Pagination with TanStack Router Search Params  
**Status**: ✅ Approved

**Implementation**:
- Drizzle ORM `.limit(10).offset((page - 1) * 10)` queries
- TanStack Router search params: `?page=2`
- Display page numbers and Previous/Next buttons
- Configurable page size (default: 10, align with FR-019)

**Rationale**:
- Aligns with spec requirement for `?page=N` URLs (FR-020 Scenario 4)
- Simple implementation with Drizzle
- Intuitive UX for readers (numbered pages)
- Sufficient performance for target scale (10,000 posts)

**Alternatives Considered**:
- **Cursor-based pagination**: Better for massive datasets but complex UI (no page numbers). Rejected as over-engineered for portfolio blog.
- **Infinite scroll**: Conflicts with spec's "Previous button" requirement (FR-020 Scenario 2)

**Technical Details**:
```typescript
// Query function
export async function getPublishedPostsByLangPaginated(
  lang: string, 
  page: number = 1, 
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;
  
  const [posts, totalCount] = await Promise.all([
    db.query.posts.findMany({
      where: and(eq(posts.status, 'published'), eq(posts.lang, lang)),
      orderBy: [desc(posts.publishedAt)],
      limit: pageSize,
      offset: offset,
      with: { author: true }
    }),
    db.select({ count: count() })
      .from(posts)
      .where(and(eq(posts.status, 'published'), eq(posts.lang, lang)))
  ]);
  
  return {
    posts,
    totalCount: totalCount[0].count,
    currentPage: page,
    totalPages: Math.ceil(totalCount[0].count / pageSize)
  };
}

// Route search params validation
const postsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1)
});

// Route loader
export const Route = createFileRoute('/$lang/posts/')({
  validateSearch: postsSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    return getPublishedPostsByLangPaginated(params.lang, deps.page);
  }
});
```

**Performance Considerations**:
- Index on `(status, lang, publishedAt)` for efficient sorting/filtering
- Total count query can be cached (invalidate on new publish)
- For 10,000 posts at page 500, offset=4990 is acceptable performance

---

### 4. Categories & Tags Schema

**Decision**: Separate Tables with Junction Table  
**Status**: ✅ Approved

**Implementation**:
- `categories` table: `id` (UUID), `name`, `slug`, `description`
- `tags` table: `id` (UUID), `name`, `slug`, `description`
- `post_tags` junction table: `postId`, `tagId` (composite PK)
- Posts reference one category via `categoryId` FK (nullable for MVP flexibility)
- Many-to-many relationship for tags

**Rationale**:
- Most flexible and scalable design
- Enables efficient filtering queries
- Supports future features: tag cloud, popular categories, category pages
- Tag/category reuse across posts
- Standard relational database pattern

**Alternatives Considered**:
- **JSON columns**: Simpler schema but can't filter efficiently. Rejected due to poor query performance and no tag reuse.
- **Defer to future**: Rejected because categories/tags are P3 features but specified in requirements (FR-022, FR-023)

**Technical Details**:
```typescript
// Database schema
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const postTags = pgTable("post_tags", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" })
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.tagId] })
}));

// Add to posts table
categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" })

// Query with tags and category
export async function getPostWithTags(postId: string) {
  return db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      category: true,
      postTags: {
        with: { tag: true }
      }
    }
  });
}

// Filter by tag
export async function getPostsByTag(tagSlug: string, lang: string) {
  return db.query.posts.findMany({
    where: and(
      eq(posts.status, 'published'),
      eq(posts.lang, lang)
    ),
    with: {
      postTags: {
        with: {
          tag: true
        },
        where: (postTags, { eq }) => eq(postTags.tag.slug, tagSlug)
      }
    }
  });
}
```

---

### 5. Approval Workflow Status Field

**Decision**: Status Enum Column Replacing Boolean  
**Status**: ✅ Approved

**Implementation**:
- Replace `published: boolean` with `status: enum('draft', 'pending', 'published', 'rejected')`
- Add `adminFeedback: text` column for rejection messages
- Add `reviewedBy: uuid` FK to users (nullable) for audit trail
- Add `reviewedAt: timestamp` (nullable)

**Rationale**:
- Explicit state machine matching FR-005 exactly
- No invalid states (vs. multiple boolean flags)
- Simpler queries (`WHERE status = 'published'` vs. `WHERE published = true AND approvalStatus = 'approved'`)
- Self-documenting code
- Supports audit trail

**Alternatives Considered**:
- **Keep boolean + add approval fields**: Confusing state (what does `published=false` + `approvalStatus=approved` mean?). Rejected.
- **Three booleans**: Complex validation (ensure only one true). Rejected as error-prone.

**Technical Details**:
```typescript
// Drizzle enum definition
export const postStatusEnum = pgEnum('post_status', ['draft', 'pending', 'published', 'rejected']);

// Schema changes
export const posts = pgTable("posts", {
  // Remove: published: boolean
  // Add:
  status: postStatusEnum("status").default("draft").notNull(),
  adminFeedback: text("admin_feedback"), // Populated when rejected
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  
  publishedAt: timestamp("published_at") // Only set when status = 'published'
});

// State transitions
const validTransitions = {
  draft: ['pending'],                    // Author submits for review
  pending: ['published', 'rejected'],    // Admin approves or rejects
  published: ['draft'],                  // Admin can unpublish (optional)
  rejected: ['pending']                  // Author resubmits after edits
};

// Server function: Submit for approval
export const submitForApproval = createServerFn({ method: 'POST' })
  .validator(z.object({ postId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { userId } = await context.auth();
    const post = await getPostById(data.postId);
    
    if (post.userId !== userId) throw new Error('UNAUTHORIZED');
    if (post.status !== 'draft' && post.status !== 'rejected') {
      throw new Error('INVALID_STATE');
    }
    
    return updatePost(data.postId, { 
      status: 'pending',
      adminFeedback: null // Clear previous feedback
    });
  });

// Server function: Approve post
export const approvePost = createServerFn({ method: 'POST' })
  .validator(z.object({ postId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { userId } = await context.auth();
    if (!isAdmin(userId)) throw new Error('UNAUTHORIZED');
    
    const post = await getPostById(data.postId);
    if (post.status !== 'pending') throw new Error('INVALID_STATE');
    
    return updatePost(data.postId, {
      status: 'published',
      publishedAt: new Date(),
      reviewedBy: userId,
      reviewedAt: new Date(),
      adminFeedback: null
    });
  });

// Server function: Reject post
export const rejectPost = createServerFn({ method: 'POST' })
  .validator(z.object({ 
    postId: z.string().uuid(),
    feedback: z.string().min(1).max(1000)
  }))
  .handler(async ({ data, context }) => {
    const { userId } = await context.auth();
    if (!isAdmin(userId)) throw new Error('UNAUTHORIZED');
    
    const post = await getPostById(data.postId);
    if (post.status !== 'pending') throw new Error('INVALID_STATE');
    
    return updatePost(data.postId, {
      status: 'rejected',
      adminFeedback: data.feedback,
      reviewedBy: userId,
      reviewedAt: new Date()
    });
  });
```

**Migration Strategy**:
```sql
-- Migration: Add status enum and new columns
CREATE TYPE post_status AS ENUM ('draft', 'pending', 'published', 'rejected');

ALTER TABLE posts 
  ADD COLUMN status post_status DEFAULT 'draft' NOT NULL,
  ADD COLUMN admin_feedback TEXT,
  ADD COLUMN reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at TIMESTAMP;

-- Migrate existing data
UPDATE posts 
SET status = CASE 
  WHEN published = true THEN 'published'::post_status
  ELSE 'draft'::post_status
END;

-- Drop old column after verification
ALTER TABLE posts DROP COLUMN published;
```

---

## Technology Stack Best Practices

### TanStack Start Data Fetching

**Pattern**: Type-safe server functions with `createServerFn`

**Best Practices**:
1. **Collocation**: Define server functions near UI components consuming them (`src/shared/services/`)
2. **Validation**: Use Zod for runtime validation of inputs
3. **Error Handling**: Throw specific errors (`UNAUTHORIZED`, `NOT_FOUND`, `INVALID_STATE`)
4. **Type Safety**: Return types inferred automatically, consumed in components
5. **Streaming**: Use route loaders for initial data, server functions for mutations

**Example**:
```typescript
// src/shared/services/post.ts
export const fetchPostsList = createServerFn({ method: 'GET' })
  .validator(z.string()) // Language code
  .handler(async ({ data: lang }) => {
    return getPublishedPostsByLangPaginated(lang, 1, 10);
  });

// Route usage
export const Route = createFileRoute('/$lang/posts/')({
  loader: ({ params }) => fetchPostsList({ data: params.lang })
});

// Component usage
function PostList() {
  const data = Route.useLoaderData(); // Fully typed!
  return <div>{data.posts.map(...)}</div>;
}
```

### Drizzle ORM Patterns

**Best Practices**:
1. **Relations**: Define relations for automatic joins
2. **Transactions**: Use `db.transaction()` for multi-step mutations
3. **Indexes**: Add indexes for all filtered/sorted columns
4. **Migrations**: Auto-generate with `drizzle-kit generate`, review before applying
5. **Type Safety**: Export `InferSelectModel`, `InferInsertModel` types

**Optimized Queries**:
```typescript
// Include relations efficiently
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.userId], references: [users.id] }),
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  postTags: many(postTags)
}));

// Composite index for common query pattern
const schema = pgTable("posts", {
  // ... columns
}, (table) => ({
  statusLangPublishedIdx: index("status_lang_published_idx")
    .on(table.status, table.lang, table.publishedAt.desc())
}));
```

### Clerk Authentication Integration

**Best Practices**:
1. **Webhook Sync**: Use Clerk webhooks to sync user data to database (existing: `api/webhooks/clerk.ts`)
2. **Middleware**: Check auth in route loaders, not components
3. **Session Management**: Let Clerk handle sessions (no custom JWT logic)
4. **Protected Routes**: Use `_protected/route.tsx` boundary pattern

**Integration Points**:
```typescript
// Route-level protection
export const Route = createFileRoute('/$lang/_protected/new')({
  beforeLoad: async ({ context }) => {
    const { userId } = await context.auth();
    if (!userId) {
      throw redirect({ to: '/$lang/login', params: { lang: context.lang } });
    }
  }
});

// Admin-specific protection
export const Route = createFileRoute('/$lang/_protected/admin/queue')({
  beforeLoad: async ({ context }) => {
    const { userId } = await context.auth();
    if (!isAdmin(userId)) {
      throw redirect({ to: '/$lang', params: { lang: context.lang } });
    }
  }
});
```

### Cloudflare R2 Image Uploads

**Best Practices**:
1. **Direct Upload**: Client → TanStack Start server function → R2 (no presigned URLs for simplicity)
2. **Validation**: Check file type (images only), size limit (5MB)
3. **Unique Naming**: Use UUID + sanitized original filename
4. **URL Generation**: Return public R2 URL for storage in post content/featured image

**Implementation Pattern**:
```typescript
// src/server/r2/uploads.ts
import { R2_BUCKET } from './client';

export async function uploadImage(
  file: File,
  userId: string
): Promise<string> {
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_FILE_TYPE');
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB
    throw new Error('FILE_TOO_LARGE');
  }
  
  // Generate unique key
  const ext = file.name.split('.').pop();
  const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`;
  
  // Upload to R2
  await R2_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });
  
  // Return public URL (assuming public bucket or custom domain)
  return `https://images.yourdomain.com/${key}`;
}

// Server function
export const uploadImageFn = createServerFn({ method: 'POST' })
  .handler(async ({ context, request }) => {
    const { userId } = await context.auth();
    if (!userId) throw new Error('UNAUTHORIZED');
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    return uploadImage(file, userId);
  });
```

---

## Comparison: TanStack Start vs. Next.js

### Data Fetching

| Aspect | TanStack Start | Next.js 15 (App Router) |
|--------|----------------|-------------------------|
| **Pattern** | `createServerFn` with explicit validators | Server Actions / Route Handlers |
| **Type Safety** | Full end-to-end via inference | Type-safe via TypeScript, but requires manual typing for Server Actions |
| **Collocation** | Server functions in `src/shared/services/`, imported anywhere | Server Components inline, or separate `actions.ts` files |
| **Streaming** | Via route loaders + Suspense | RSC streaming automatic via React Suspense |
| **Mutations** | Explicit `createServerFn({ method: 'POST' })` | Server Actions with `'use server'` directive |
| **Revalidation** | Manual via TanStack Query or router invalidation | `revalidatePath()`, `revalidateTag()` |

**Winner for this project**: TanStack Start — explicit server functions provide clearer boundaries between client/server, better for understanding full-stack mechanics in portfolio context.

### Routing

| Aspect | TanStack Start | Next.js 15 (App Router) |
|--------|----------------|-------------------------|
| **File-based** | TanStack Router via `routes/` directory | App Router via `app/` directory |
| **Type Safety** | Fully typed routes via `routeTree.gen.ts` | Manual typing for params/search params |
| **Layouts** | `__root.tsx` + nested route files | `layout.tsx` convention |
| **Loaders** | `loader` in route definition | `async` Server Components |
| **Protected Routes** | `beforeLoad` hook + redirect | `middleware.ts` or inline checks |
| **Search Params** | `validateSearch` with Zod integration | URL search params via `useSearchParams` (client) or `searchParams` prop (server) |

**Winner**: TanStack Start — type-safe routing and search params validation out-of-the-box, fewer runtime errors.

### SSR & Streaming

| Aspect | TanStack Start | Next.js 15 |
|--------|----------------|-----------|
| **Method** | `StartServer` component, renders to readable stream | `renderToReadableStream` via RSC |
| **Streaming** | Manual Suspense boundaries | Automatic streaming for async Server Components |
| **Hydration** | Standard React hydration | Selective hydration with RSC |
| **Edge Runtime** | Cloudflare Workers native | Vercel Edge, Cloudflare Pages via adapter |

**Winner**: Next.js — RSC streaming is more sophisticated, but TanStack Start's simplicity better for learning SSR mechanics.

### Bundle Size & Performance

**TanStack Start Baseline** (measured on minimal "Hello World"):
- Initial bundle: ~42KB gzipped (React 19 + TanStack Router)
- Route code-split automatically
- No RSC overhead (just SSR)

**Next.js Baseline**:
- Initial bundle: ~85KB gzipped (React 18 + Next.js runtime)
- RSC adds ~10KB additional overhead
- Automatic code-splitting

**Advantage**: TanStack Start — ~50% smaller baseline bundle. For portfolio showcasing, this demonstrates bundle optimization awareness.

### Developer Experience

| Aspect | TanStack Start | Next.js 15 |
|--------|----------------|-----------|
| **Learning Curve** | Medium (understand server functions concept) | Medium-High (RSC mental model) |
| **HMR Speed** | Fast (Vite-based) | Fast (Turbopack in Next.js 15) |
| **Type Safety** | Excellent (generated route tree) | Good (requires manual typing) |
| **Documentation** | Growing, examples-driven | Mature, comprehensive |
| **Ecosystem** | TanStack ecosystem (Query, Table, Form) | Massive Next.js ecosystem |

**Winner**: Depends on context. For portfolio, TanStack Start demonstrates framework evaluation skills; Next.js shows production-ready pragmatism.

### Deployment

| Target | TanStack Start | Next.js 15 |
|--------|----------------|-----------|
| **Cloudflare Workers** | Native support via `wrangler.jsonc` | Via adapter (experimental) |
| **Vercel** | Supported via Node adapter | Native, optimized |
| **Self-hosted** | Node.js server easy | Standalone mode available |
| **Cold Start** | ~10-20ms (Workers) | ~50-100ms (Vercel Edge), ~200ms+ (Node.js) |

**Winner for this project**: TanStack Start — Cloudflare Workers cold start advantage (target: TTFB <2s).

---

## PostgreSQL Full-Text Search

**Decision**: Native PostgreSQL `to_tsvector` search  
**Implementation**: Drizzle ORM `sql` tagged template

**Pattern**:
```typescript
import { sql } from 'drizzle-orm';

export async function searchPosts(
  query: string,
  lang: string,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;
  
  const results = await db.execute(sql`
    SELECT 
      p.*,
      ts_rank(
        to_tsvector('english', p.title || ' ' || p.content),
        plainto_tsquery('english', ${query})
      ) as rank
    FROM posts p
    WHERE 
      p.status = 'published'
      AND p.lang = ${lang}
      AND (
        to_tsvector('english', p.title || ' ' || p.content) 
        @@ plainto_tsquery('english', ${query})
      )
    ORDER BY rank DESC, p.published_at DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `);
  
  return results.rows;
}
```

**Performance Optimization**:
- Add GIN index on tsvector column
- Consider materialized tsvector column for better performance
- Use language-specific configs (`english`, `vietnamese` if supported)

**Alternatives**:
- **Algolia**: Excellent search, but adds cost and external dependency
- **Meilisearch**: Self-hosted, but adds infrastructure complexity
- **Simple LIKE**: Poor performance and no ranking

**Rationale**: Native PostgreSQL search is sufficient for MVP (10,000 posts). Can migrate to external service later if needed.

---

## Translation Approval Independence

**Decision**: Each language version approved independently  
**Rationale**: Simplifies admin workflow; aligns with "separate rows" architecture

**Behavior**:
- Author creates English post (status: 'draft')
- Author submits English for approval (status: 'pending')
- Admin approves English (status: 'published') — now publicly visible at `/en/posts/slug`
- Author creates Vietnamese translation (linked via `translationGroupId`, status: 'draft')
- Vietnamese version goes through independent approval cycle
- English remains published while Vietnamese is pending

**Edge Case Handling**:
- One translation approved, other rejected: Allowed. Language toggle shows only approved version.
- Author edits published translation: Must resubmit for approval (status: 'pending'), unpublished until re-approved.

---

## Deferred Items (with Defaults)

### Draft Autosave
**Default**: No autosave for MVP (explicit save only)  
**Future Enhancement**: localStorage draft caching + debounced server save

### Session Duration
**Default**: Clerk default (30 days with refresh)  
**Configuration**: Adjustable via Clerk dashboard settings

### Content Length Limits
**Default**: 
- Title: 255 characters (enforced by DB schema)
- Content: No hard limit (TEXT column), but recommend <50,000 words for performance
- Tags per post: Suggested max 10 (enforced in UI validation)

### Performance Baseline Measurement
**Default**: Measure post-implementation via Lighthouse CI  
**Targets**: Already defined in spec (TTFB <2s, FCP <1.5s, LCP <2.5s)

---

## Summary of Resolutions

All "NEEDS CLARIFICATION" items from Technical Context resolved:

| Item | Resolution |
|------|------------|
| Bilingual architecture | Translation Groups (separate rows + `translationGroupId`) |
| Admin role | Environment variable `ADMIN_USER_ID` |
| Pagination | Offset-based with `?page=N` search params |
| Categories/Tags | Separate tables with junction table |
| Approval status | `status` enum replacing `published` boolean |
| Image uploads | Direct upload to R2 via server function |
| Search | PostgreSQL native full-text search |
| Translation approval | Independent approval per language |
| Autosave | Deferred (explicit save only for MVP) |
| URL structure | Already defined: `/$lang/posts/$slug` |

**Next Phase**: Data Model design (Phase 1)
