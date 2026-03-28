# API Contracts: Portfolio Blog Platform

**Date**: 2026-03-10  
**Phase**: 1 (Design & Contracts)  
**Status**: Complete  
**Type**: Server Function Contracts (TanStack Start)

## Overview

This document defines all server functions (API contracts) for the Portfolio Blog Platform. Unlike traditional REST APIs, TanStack Start uses type-safe server functions created with `createServerFn` that provide end-to-end type safety between server and client.

**Authentication**: All server functions receive authenticated user ID via `context.auth()` from Clerk integration.

**Error Handling**: Server functions throw errors with specific codes that are caught and displayed in UI:

- `UNAUTHORIZED`: User not authenticated or lacks permission
- `NOT_FOUND`: Resource doesn't exist
- `INVALID_STATE`: Operation not allowed in current state (e.g., approve already-published post)
- `VALIDATION_ERROR`: Input validation failed
- `SLUG_TAKEN`: Slug already exists for the given language

---

## Post Management

### fetchPostsList

**Purpose**: Retrieve paginated list of published posts for a language  
**Method**: GET  
**Location**: `src/shared/services/post.ts`

**Input**:

```typescript
{
  lang: string;          // Language code: 'en' | 'vi'
  page?: number;         // Page number (default: 1)
  pageSize?: number;     // Posts per page (default: 10)
  categorySlug?: string; // Filter by category (optional)
  tagSlugs?: string[];   // Filter by tags (optional, AND logic)
}
```

**Output**:

```typescript
{
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    lang: string;
    description: string | null;
    publishedAt: string; // ISO 8601
    featuredImage: string | null;
    author: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    } | null;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    hasTranslation: boolean; // True if translation exists in other language
  }>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
```

**Validation**:

- `lang` must be 'en' or 'vi'
- `page` must be >= 1
- `pageSize` must be 1-100

**Example**:

```typescript
const result = await fetchPostsList({
  data: {
    lang: "en",
    page: 2,
    categorySlug: "web-development",
  },
});
```

---

### fetchPost

**Purpose**: Retrieve single post with fallback to available language  
**Method**: GET  
**Location**: `src/shared/services/post.ts`

**Input**:

```typescript
{
  slug: string;
  lang: string; // Requested language
}
```

**Output**:

```typescript
{
  post: {
    id: string;
    title: string;
    slug: string;
    lang: string;
    content: string;         // Markdown
    description: string | null;
    publishedAt: string;
    featuredImage: string | null;
    translationGroupId: string;
    author: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    } | null;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  isFallback: boolean;     // True if showing different language than requested
  originalLang?: string;   // Present if isFallback=true, indicates actual post language
  translationSlug?: string; // Slug of translation if it exists
}
```

**Fallback Behavior**:

1. Try to fetch post with requested language
2. If not found, try opposite language (en ↔ vi)
3. If neither exists, throw `NOT_FOUND`
4. If fallback used, set `isFallback=true` and `originalLang`

**Example**:

```typescript
// Request Vietnamese post, but only English exists
const result = await fetchPost({ data: { slug: "my-first-post", lang: "vi" } });
// result.isFallback === true
// result.originalLang === 'en'
// UI shows banner: "This post is only available in English"
```

---

### createPostFn

**Purpose**: Create new blog post (draft state)  
**Method**: POST  
**Location**: `src/shared/services/post.ts`  
**Auth**: Required

**Input**:

```typescript
{
  title: string;              // 1-255 chars
  slug: string;               // Auto-generated from title if empty
  lang: string;               // 'en' | 'vi'
  content: string;            // Markdown, not empty
  description?: string;       // Optional excerpt
  categoryId?: string;        // Optional category UUID
  tagIds?: string[];          // Optional tag UUIDs (max 10)
  featuredImage?: string;     // Optional R2 URL
  published?: boolean;        // If true, status='pending' (submit for approval)
}
```

**Output**:

```typescript
{
  id: string;
  slug: string;
  lang: string;
  status: "draft" | "pending";
  translationGroupId: string;
  createdAt: string;
}
```

**Validation**:

- `title` length 1-255
- `slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` if provided
- `slug` + `lang` combination must be unique (throws `SLUG_TAKEN`)
- `content` must not be empty
- `tagIds` max 10 items
- User must be authenticated

**Example**:

```typescript
const post = await createPostFn({
  data: {
    title: "My First Post",
    lang: "en",
    content: "# Hello World\n\nThis is my first post.",
    description: "Introduction to my blog",
    published: true, // Submit for admin approval
  },
});
// post.status === 'pending' (awaiting approval)
```

---

### updatePostFn

**Purpose**: Update existing post  
**Method**: POST  
**Location**: `src/shared/services/post.ts`  
**Auth**: Required (must be post author or admin)

**Input**:

```typescript
{
  postId: string;
  title?: string;
  slug?: string;
  content?: string;
  description?: string;
  categoryId?: string;
  tagIds?: string[];
  featuredImage?: string;
}
```

**Output**:

```typescript
{
  id: string;
  slug: string;
  updatedAt: string;
}
```

**Authorization**:

- Author can edit own posts in 'draft' or 'rejected' state
- Admin can edit any post in any state
- Editing 'published' post requires admin (prevents unauthorized changes)

**Validation**:

- Same as `createPostFn`
- If slug changed, new slug+lang must be unique

**Example**:

```typescript
await updatePostFn({
  data: {
    postId: "abc-123",
    title: "Updated Title",
    content: "# New Content",
  },
});
```

---

### deletePostFn

**Purpose**: Delete post  
**Method**: POST  
**Location**: `src/shared/services/post.ts`  
**Auth**: Required (must be post author or admin)

**Input**:

```typescript
{
  postId: string;
}
```

**Output**:

```typescript
{
  success: boolean;
}
```

**Authorization**:

- Author can delete own posts in 'draft' state only
- Admin can delete any post in any state

**Cascade Behavior**:

- Deletes associated `post_tags` rows (CASCADE)
- Does NOT delete category, tags, or author
- Translation links remain (other language versions unaffected)

---

### checkSlugAvailability

**Purpose**: Check if slug is available for a language  
**Method**: POST  
**Location**: `src/shared/services/post.ts`  
**Auth**: Optional (public)

**Input**:

```typescript
{
  slug: string;
  lang: string;
  excludePostId?: string; // When editing, exclude current post from check
}
```

**Output**:

```typescript
{
  available: boolean;
  suggestion?: string; // If not available, suggest alternative (slug-2, slug-3, etc.)
}
```

**Example**:

```typescript
const result = await checkSlugAvailability({
  data: { slug: "my-post", lang: "en" },
});
// result.available === false
// result.suggestion === 'my-post-2'
```

---

## Translation Management

### createTranslationFn

**Purpose**: Create translation of existing post  
**Method**: POST  
**Location**: `src/shared/services/translation.ts`  
**Auth**: Required

**Input**:

```typescript
{
  originalPostId: string;
  targetLang: string;     // Language for new translation
  title: string;
  content: string;
  description?: string;
  // Category and tags inherited from original, but can override
  categoryId?: string;
  tagIds?: string[];
}
```

**Output**:

```typescript
{
  id: string;
  slug: string; // Same slug as original
  lang: string; // targetLang
  translationGroupId: string; // Same as original
  status: "draft";
}
```

**Behavior**:

- Uses same `slug` as original post
- Links via same `translationGroupId`
- Starts in 'draft' state (must go through approval separately)
- Pre-fills category and tags from original (unless overridden)

**Validation**:

- Original post must exist
- targetLang must be opposite of original (can't translate en→en)
- Translation must not already exist (slug+targetLang unique)

**Example**:

```typescript
// Original English post exists at /en/posts/my-first-post
const translation = await createTranslationFn({
  data: {
    originalPostId: "abc-123",
    targetLang: "vi",
    title: "Bài viết đầu tiên của tôi",
    content: "# Xin chào thế giới",
  },
});
// Creates /vi/posts/my-first-post (draft, needs approval)
```

---

### getPostTranslation

**Purpose**: Get translation of a post if it exists  
**Method**: GET  
**Location**: `src/shared/services/translation.ts`  
**Auth**: Optional

**Input**:

```typescript
{
  postId: string;
  targetLang: string;
}
```

**Output**:

```typescript
{
  translation: {
    id: string;
    slug: string;
    lang: string;
    title: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
  } | null; // null if no translation exists
}
```

**Use Case**: Determine if language toggle should be shown in UI

---

## Admin Approval Workflow

### getPendingPosts

**Purpose**: Get queue of posts awaiting admin approval  
**Method**: GET  
**Location**: `src/shared/services/admin.ts`  
**Auth**: Required (admin only)

**Input**: None (no parameters)

**Output**:

```typescript
{
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    lang: string;
    description: string | null;
    createdAt: string;
    author: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    category: {
      name: string;
      slug: string;
    } | null;
  }>;
}
```

**Ordering**: FIFO (oldest first by `createdAt`)

---

### approvePostFn

**Purpose**: Approve pending post for publication  
**Method**: POST  
**Location**: `src/shared/services/admin.ts`  
**Auth**: Required (admin only)

**Input**:

```typescript
{
  postId: string;
}
```

**Output**:

```typescript
{
  id: string;
  status: "published";
  publishedAt: string;
  reviewedBy: string;
  reviewedAt: string;
}
```

**Authorization**: Only admin (checked via `ADMIN_USER_ID` env var)

**State Transition**: `pending` → `published`

**Side Effects**:

- Sets `publishedAt` to current timestamp
- Sets `reviewedBy` to admin's user ID
- Sets `reviewedAt` to current timestamp
- Clears `adminFeedback` if present

**Throws**: `INVALID_STATE` if post not in 'pending' status

---

### rejectPostFn

**Purpose**: Reject pending post with feedback  
**Method**: POST  
**Location**: `src/shared/services/admin.ts`  
**Auth**: Required (admin only)

**Input**:

```typescript
{
  postId: string;
  feedback: string; // 1-1000 characters, required
}
```

**Output**:

```typescript
{
  id: string;
  status: "rejected";
  adminFeedback: string;
  reviewedBy: string;
  reviewedAt: string;
}
```

**State Transition**: `pending` → `rejected`

**Side Effects**:

- Sets `adminFeedback` to provided feedback
- Sets `reviewedBy` to admin's user ID
- Sets `reviewedAt` to current timestamp
- Author can now see feedback and resubmit

---

### submitForApproval

**Purpose**: Submit draft/rejected post for admin review  
**Method**: POST  
**Location**: `src/shared/services/post.ts`  
**Auth**: Required (must be post author)

**Input**:

```typescript
{
  postId: string;
}
```

**Output**:

```typescript
{
  id: string;
  status: "pending";
}
```

**State Transitions**:

- `draft` → `pending`
- `rejected` → `pending` (resubmission after edits)

**Side Effects**:

- Clears `adminFeedback` on resubmission

**Throws**: `INVALID_STATE` if post already published or pending

---

### unpublishPostFn

**Purpose**: Remove post from public site (admin only)  
**Method**: POST  
**Location**: `src/shared/services/admin.ts`  
**Auth**: Required (admin only)

**Input**:

```typescript
{
  postId: string;
}
```

**Output**:

```typescript
{
  id: string;
  status: "draft";
  publishedAt: null;
}
```

**State Transition**: `published` → `draft`

**Side Effects**: Clears `publishedAt` timestamp

**Use Case**: Temporarily remove post from site without deleting

---

## Image Upload

### uploadImageFn

**Purpose**: Upload image to Cloudflare R2 storage  
**Method**: POST  
**Location**: `src/routes/api/upload.ts`  
**Auth**: Required

**Input**: `multipart/form-data` with file field

```typescript
FormData {
  image: File; // Must be image/* MIME type, max 5MB
}
```

**Output**:

```typescript
{
  url: string; // Public R2 URL: https://images.yourdomain.com/uploads/{userId}/{uuid}.{ext}
  filename: string;
  size: number; // Bytes
}
```

**Validation**:

- File must be image type (`image/jpeg`, `image/png`, `image/gif`, `image/webp`)
- File size max 5MB
- User must be authenticated

**Storage Path**: `uploads/{userId}/{uuid}.{ext}`

**Example**:

```typescript
const formData = new FormData();
formData.append("image", fileInput.files[0]);

const result = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const { url } = await result.json();
// url: 'https://images.yourdomain.com/uploads/user-123/abc-def-ghi.jpg'
```

---

## Search & Filter

### searchPosts

**Purpose**: Full-text search across posts  
**Method**: GET  
**Location**: `src/shared/services/post.ts`

**Input**:

```typescript
{
  query: string;          // Search term
  lang: string;           // Language to search in
  page?: number;
  pageSize?: number;
}
```

**Output**: Same as `fetchPostsList`

**Search Scope**: Searches across `title` and `content` fields using PostgreSQL full-text search

**Ranking**: Results ordered by relevance rank, then `publishedAt` DESC

**Example**:

```typescript
const results = await searchPosts({
  data: {
    query: "typescript react",
    lang: "en",
    page: 1,
  },
});
```

---

## Categories & Tags

### getCategoriesList

**Purpose**: Get all categories  
**Method**: GET  
**Location**: `src/shared/services/category.ts`

**Input**: None

**Output**:

```typescript
{
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    postCount: number; // Count of published posts in this category
  }>;
}
```

---

### getTagsList

**Purpose**: Get all tags with usage counts  
**Method**: GET  
**Location**: `src/shared/services/tag.ts`

**Input**: None

**Output**:

```typescript
{
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    postCount: number; // Count of published posts with this tag
  }>;
}
```

**Ordering**: By `postCount` DESC (most popular first)

---

### createCategoryFn

**Purpose**: Create new category (admin only)  
**Method**: POST  
**Location**: `src/shared/services/category.ts`  
**Auth**: Required (admin only)

**Input**:

```typescript
{
  name: string;        // Unique, 1-100 chars
  slug: string;        // Auto-generated from name if empty
  description?: string;
}
```

**Output**:

```typescript
{
  id: string;
  name: string;
  slug: string;
}
```

---

### createTagFn

**Purpose**: Create new tag (admin or auto-create on post save)  
**Method**: POST  
**Location**: `src/shared/services/tag.ts`  
**Auth**: Required

**Input**:

```typescript
{
  name: string; // Unique, 1-50 chars
  slug: string; // Auto-generated from name if empty
}
```

**Output**: Same as input + `id`

---

## Type Definitions

**All server functions use Zod for validation**. TypeScript types are inferred from validators:

```typescript
import { createServerFn } from "@tanstack/start";
import { z } from "zod";

// Example: fetchPost validator
const fetchPostSchema = z.object({
  slug: z.string().min(1),
  lang: z.enum(["en", "vi"]),
});

export const fetchPost = createServerFn({ method: "GET" })
  .validator(fetchPostSchema)
  .handler(async ({ data }) => {
    // data is typed as { slug: string; lang: 'en' | 'vi' }
    // ...
  });
```

---

## Error Codes

| Code                | HTTP Status | Description                                | User Message                                   |
| ------------------- | ----------- | ------------------------------------------ | ---------------------------------------------- |
| `UNAUTHORIZED`      | 401         | User not authenticated or lacks permission | "You must be logged in to perform this action" |
| `NOT_FOUND`         | 404         | Resource doesn't exist                     | "Post not found"                               |
| `INVALID_STATE`     | 400         | Operation not allowed in current state     | "Cannot approve post that is not pending"      |
| `VALIDATION_ERROR`  | 400         | Input validation failed                    | Specific field error from Zod                  |
| `SLUG_TAKEN`        | 409         | Slug already exists for language           | "This slug is already in use for [language]"   |
| `FILE_TOO_LARGE`    | 413         | Uploaded file exceeds 5MB                  | "Image must be smaller than 5MB"               |
| `INVALID_FILE_TYPE` | 400         | Uploaded file is not an image              | "Only image files are allowed"                 |

---

## Rate Limiting

**Not implemented in MVP**. Future enhancement via Cloudflare Workers rate limiting or Upstash Redis.

**Recommended Limits**:

- POST requests: 10/minute per user
- Image uploads: 5/minute per user
- Search queries: 30/minute per IP

---

## Caching Strategy

**Server Functions**:

- Read operations (fetchPostsList, fetchPost): Cache in TanStack Query with 5-minute stale time
- Mutation operations: Invalidate related queries on success

**Example** (client-side):

```typescript
// In route loader
export const Route = createFileRoute("/$lang/posts/")({
  loader: ({ params }) =>
    queryClient.ensureQueryData({
      queryKey: ["posts", params.lang],
      queryFn: () => fetchPostsList({ data: { lang: params.lang } }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
});

// After creating post
await createPostFn({ data: newPost });
queryClient.invalidateQueries({ queryKey: ["posts"] });
```

---

**Next Phase**: Quickstart guide (Phase 1)
