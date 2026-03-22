# Data Model: Portfolio Blog Platform

**Date**: 2026-03-10  
**Phase**: 1 (Design & Contracts)  
**Status**: Complete

## Overview

This document defines the complete data model for the Portfolio Blog Platform, including all entities, relationships, validation rules, and state machines. The model is implemented using Drizzle ORM with PostgreSQL as the storage engine.

---

## Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄──────────┐
│ clerkId      │           │
│ email        │           │ 1
│ firstName    │           │
│ lastName     │           │
│ imageUrl     │           │
│ createdAt    │           │
│ updatedAt    │           │
└──────────────┘           │
                           │
                           │
                           │ N
┌──────────────┐           │         ┌──────────────────┐
│ categories   │           │         │      posts       │
│──────────────│           │         │──────────────────│
│ id (PK)      │◄──────────┼─────────┤ id (PK)          │
│ name         │         1 │         │ userId (FK) NULL │
│ slug         │           │         │ categoryId (FK)  │
│ description  │           └─────────┤ title            │
│ createdAt    │                     │ slug             │
│ updatedAt    │                     │ lang             │
└──────────────┘                     │ content          │
                                     │ description      │
                                     │ status           │
                                     │ translationGroupId│
                                     │ adminFeedback    │
                                     │ reviewedBy (FK)  │
                                     │ reviewedAt       │
                                     │ publishedAt      │
                                     │ featuredImage    │
                                     │ createdAt        │
                                     │ updatedAt        │
                                     └──────────────────┘
                                              │
                                              │ N
                                              │
                                              │
                                              │ N
                                     ┌────────▼──────────┐
                                     │    post_tags      │
                                     │───────────────────│
                                     │ postId (FK, PK)   │
                                     │ tagId (FK, PK)    │
                                     └───────────────────┘
                                              │ N
                                              │
                                              │
                                              │ 1
                                     ┌────────▼──────────┐
                                     │      tags         │
                                     │───────────────────│
                                     │ id (PK)           │
                                     │ name              │
                                     │ slug              │
                                     │ description       │
                                     │ createdAt         │
                                     └───────────────────┘
```

**Relationships**:

- **users ↔ posts**: One user can create many posts (1:N). `userId` is nullable (posts can exist without author if user deleted).
- **users ↔ posts (reviewer)**: One user (admin) can review many posts (1:N). `reviewedBy` is nullable.
- **categories ↔ posts**: One category can have many posts (1:N). `categoryId` is nullable for MVP flexibility.
- **posts ↔ tags**: Many-to-many via `post_tags` junction table.
- **posts ↔ posts (translations)**: Posts with the same `translationGroupId` are translations of each other.

---

## Entities

### 1. users

**Purpose**: Store user profile data synced from Clerk authentication service

**Schema**:

```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Fields**:

- `id` (UUID, PK): Internal database identifier
- `clerkId` (VARCHAR 255, UNIQUE, NOT NULL): Clerk's user ID for auth integration
- `email` (VARCHAR 255, UNIQUE, NOT NULL): User's email address
- `firstName` (VARCHAR 100, NULLABLE): User's first name
- `lastName` (VARCHAR 100, NULLABLE): User's last name
- `imageUrl` (TEXT, NULLABLE): URL to user's profile image
- `createdAt` (TIMESTAMP, NOT NULL): User creation timestamp
- `updatedAt` (TIMESTAMP, NOT NULL): Last update timestamp

**Validation Rules**:

- Email MUST be valid email format (enforced by Clerk)
- clerkId MUST be unique across all users
- Email MUST be unique across all users

**Indexes**:

- PRIMARY KEY on `id`
- UNIQUE INDEX on `clerkId` (for fast Clerk user lookup)
- UNIQUE INDEX on `email` (for duplicate prevention)

**Admin Role**:

- Admin is determined by comparing `clerkId` against `ADMIN_USER_ID` environment variable
- No `role` column in database (single admin model)

**Relationships**:

- **Has Many**: `posts` (as author via `userId`)
- **Has Many**: `posts` (as reviewer via `reviewedBy`)

---

### 2. posts

**Purpose**: Store blog post content with translation support and approval workflow

**Schema**:

```typescript
export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "pending",
  "published",
  "rejected",
]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    // Content fields
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    lang: varchar("lang", { length: 10 }).notNull(), // 'en' or 'vi'
    content: text("content").notNull(),
    description: text("description"),
    featuredImage: text("featured_image"),

    // Translation linking
    translationGroupId: uuid("translation_group_id").defaultRandom().notNull(),

    // Approval workflow
    status: postStatusEnum("status").default("draft").notNull(),
    adminFeedback: text("admin_feedback"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),

    // Timestamps
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: same slug can exist per language
    slugLangIdx: uniqueIndex("slug_lang_idx").on(table.slug, table.lang),

    // Performance indexes
    statusLangPublishedIdx: index("status_lang_published_idx").on(
      table.status,
      table.lang,
      table.publishedAt.desc(),
    ),

    translationGroupIdx: index("translation_group_idx").on(
      table.translationGroupId,
    ),

    categoryIdx: index("category_idx").on(table.categoryId),

    authorIdx: index("author_idx").on(table.userId),
  }),
);
```

**Fields**:

- `id` (UUID, PK): Post identifier
- `userId` (UUID, FK, NULLABLE): Author reference (null if user deleted)
- `categoryId` (UUID, FK, NULLABLE): Category reference
- `title` (VARCHAR 255, NOT NULL): Post title
- `slug` (VARCHAR 255, NOT NULL): URL-safe slug (unique per language)
- `lang` (VARCHAR 10, NOT NULL): Language code ('en' or 'vi')
- `content` (TEXT, NOT NULL): Markdown content
- `description` (TEXT, NULLABLE): Post excerpt/summary for SEO
- `featuredImage` (TEXT, NULLABLE): URL to featured image
- `translationGroupId` (UUID, NOT NULL): Links translations together (same value = same post in different languages)
- `status` (ENUM, NOT NULL, DEFAULT 'draft'): Approval workflow state
- `adminFeedback` (TEXT, NULLABLE): Admin's rejection reason or notes
- `reviewedBy` (UUID, FK, NULLABLE): Admin who reviewed the post
- `reviewedAt` (TIMESTAMP, NULLABLE): When review occurred
- `publishedAt` (TIMESTAMP, NULLABLE): When post was published (only set when status = 'published')
- `createdAt` (TIMESTAMP, NOT NULL): Post creation timestamp
- `updatedAt` (TIMESTAMP, NOT NULL): Last update timestamp

**Validation Rules**:

- Title MUST be 1-255 characters
- Slug MUST match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase alphanumeric with hyphens)
- Slug + lang combination MUST be unique (enforced by `slug_lang_idx`)
- Lang MUST be 'en' or 'vi'
- Content MUST NOT be empty
- Description SHOULD be <300 characters for SEO (soft limit)
- Status transitions MUST follow state machine (see below)

**State Machine** (Approval Workflow):

```
┌───────┐  submit   ┌─────────┐  approve  ┌───────────┐
│ draft │─────────>│ pending │─────────>│ published │
└───────┘           └─────────┘           └───────────┘
    ▲                    │                      │
    │                    │ reject               │ unpublish
    │                    ▼                      │ (optional)
    │               ┌──────────┐                │
    └───────────────│ rejected │◄───────────────┘
                    └──────────┘
                         │
                         │ resubmit
                         ▼
                    ┌─────────┐
                    │ pending │
                    └─────────┘
```

**Valid Transitions**:

- `draft` → `pending`: Author submits for approval
- `pending` → `published`: Admin approves (sets `publishedAt`, `reviewedBy`, `reviewedAt`)
- `pending` → `rejected`: Admin rejects (sets `adminFeedback`, `reviewedBy`, `reviewedAt`)
- `rejected` → `pending`: Author resubmits after edits (clears `adminFeedback`)
- `published` → `draft`: Admin unpublishes (optional, clears `publishedAt`)

**Indexes**:

- PRIMARY KEY on `id`
- UNIQUE INDEX on `(slug, lang)` (ensures slug uniqueness per language)
- INDEX on `(status, lang, publishedAt DESC)` (optimizes post listing queries)
- INDEX on `translationGroupId` (optimizes translation lookup)
- INDEX on `categoryId` (optimizes category filtering)
- INDEX on `userId` (optimizes author post lists)

**Relationships**:

- **Belongs To**: `users` (as author via `userId`)
- **Belongs To**: `users` (as reviewer via `reviewedBy`)
- **Belongs To**: `categories` (via `categoryId`)
- **Has Many**: `post_tags` (junction table)
- **Self-Referencing**: Other posts with same `translationGroupId` are translations

---

### 3. categories

**Purpose**: Organize posts into broad topic groups

**Schema**:

```typescript
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Fields**:

- `id` (UUID, PK): Category identifier
- `name` (VARCHAR 100, UNIQUE, NOT NULL): Display name (e.g., "Web Development")
- `slug` (VARCHAR 100, UNIQUE, NOT NULL): URL-safe identifier (e.g., "web-development")
- `description` (TEXT, NULLABLE): Category description for SEO
- `createdAt` (TIMESTAMP, NOT NULL): Creation timestamp
- `updatedAt` (TIMESTAMP, NOT NULL): Last update timestamp

**Validation Rules**:

- Name MUST be unique (case-insensitive comparison recommended)
- Slug MUST be unique
- Slug MUST match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

**Indexes**:

- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- UNIQUE INDEX on `slug`

**Relationships**:

- **Has Many**: `posts` (via `categoryId` FK)

---

### 4. tags

**Purpose**: Enable fine-grained topic labeling for posts

**Schema**:

```typescript
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Fields**:

- `id` (UUID, PK): Tag identifier
- `name` (VARCHAR 50, UNIQUE, NOT NULL): Display name (e.g., "TypeScript")
- `slug` (VARCHAR 50, UNIQUE, NOT NULL): URL-safe identifier (e.g., "typescript")
- `description` (TEXT, NULLABLE): Tag description
- `createdAt` (TIMESTAMP, NOT NULL): Creation timestamp

**Validation Rules**:

- Name MUST be unique (case-insensitive)
- Slug MUST be unique
- Slug MUST match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Name SHOULD be 1-50 characters (enforced by schema)

**Indexes**:

- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- UNIQUE INDEX on `slug`

**Relationships**:

- **Has Many**: `post_tags` (junction table)

---

### 5. post_tags (Junction Table)

**Purpose**: Enable many-to-many relationship between posts and tags

**Schema**:

```typescript
export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    postIdx: index("post_tags_post_idx").on(table.postId),
    tagIdx: index("post_tags_tag_idx").on(table.tagId),
  }),
);
```

**Fields**:

- `postId` (UUID, FK, PK): Reference to post
- `tagId` (UUID, FK, PK): Reference to tag

**Validation Rules**:

- (postId, tagId) tuple MUST be unique (enforced by composite PK)
- Recommended: Limit posts to max 10 tags (enforced in application layer)

**Indexes**:

- PRIMARY KEY on `(postId, tagId)` (composite)
- INDEX on `postId` (optimizes "get tags for post" query)
- INDEX on `tagId` (optimizes "get posts for tag" query)

**Cascading Behavior**:

- If post deleted → corresponding `post_tags` rows deleted (CASCADE)
- If tag deleted → corresponding `post_tags` rows deleted (CASCADE)

**Relationships**:

- **Belongs To**: `posts` (via `postId`)
- **Belongs To**: `tags` (via `tagId`)

---

## Drizzle ORM Relations

**Define relations for automatic joins**:

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts, { relationName: "author" }),
  reviewedPosts: many(posts, { relationName: "reviewer" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
    relationName: "author",
  }),
  reviewer: one(users, {
    fields: [posts.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
```

---

## Type Exports

**Export TypeScript types for use in application**:

```typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Select types (read from DB)
export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type Category = InferSelectModel<typeof categories>;
export type Tag = InferSelectModel<typeof tags>;
export type PostTag = InferSelectModel<typeof postTags>;

// Insert types (write to DB)
export type NewUser = InferInsertModel<typeof users>;
export type NewPost = InferInsertModel<typeof posts>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewTag = InferInsertModel<typeof tags>;
export type NewPostTag = InferInsertModel<typeof postTags>;

// Domain types with relations
export type PostWithAuthor = Post & { author: User | null };
export type PostWithDetails = Post & {
  author: User | null;
  category: Category | null;
  postTags: Array<PostTag & { tag: Tag }>;
};
export type PostWithTranslation = Post & {
  translation: Post | null; // Other language version
};
```

---

## Migration Strategy

### Migration 1: Add Translation Support

```sql
-- Add translationGroupId column with default random UUID
ALTER TABLE posts
ADD COLUMN translation_group_id UUID DEFAULT gen_random_uuid() NOT NULL;

-- Create index for translation lookups
CREATE INDEX translation_group_idx ON posts(translation_group_id);
```

### Migration 2: Replace published Boolean with Status Enum

```sql
-- Create enum type
CREATE TYPE post_status AS ENUM ('draft', 'pending', 'published', 'rejected');

-- Add new columns
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

-- Drop old column
ALTER TABLE posts DROP COLUMN published;

-- Create performance index
CREATE INDEX status_lang_published_idx ON posts(status, lang, published_at DESC);
```

### Migration 3: Add Categories and Tags

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create post_tags junction table
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes
CREATE INDEX post_tags_post_idx ON post_tags(post_id);
CREATE INDEX post_tags_tag_idx ON post_tags(tag_id);

-- Add category FK to posts
ALTER TABLE posts
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX category_idx ON posts(category_id);
```

### Migration 4: Add Featured Image

```sql
ALTER TABLE posts
ADD COLUMN featured_image TEXT;
```

---

## Query Examples

### Get Published Posts with Pagination

```typescript
export async function getPublishedPostsPaginated(
  lang: string,
  page: number = 1,
  pageSize: number = 10,
  categorySlug?: string,
  tagSlugs?: string[],
) {
  const offset = (page - 1) * pageSize;

  let query = db.query.posts.findMany({
    where: and(
      eq(posts.status, "published"),
      eq(posts.lang, lang),
      categorySlug ? eq(posts.category.slug, categorySlug) : undefined,
    ),
    orderBy: [desc(posts.publishedAt)],
    limit: pageSize,
    offset: offset,
    with: {
      author: true,
      category: true,
      postTags: {
        with: { tag: true },
        where: tagSlugs ? inArray(postTags.tag.slug, tagSlugs) : undefined,
      },
    },
  });

  return query;
}
```

### Find Translation of Post

```typescript
export async function getPostTranslation(postId: string, targetLang: string) {
  const originalPost = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!originalPost) return null;

  return db.query.posts.findFirst({
    where: and(
      eq(posts.translationGroupId, originalPost.translationGroupId),
      eq(posts.lang, targetLang),
      eq(posts.status, "published"),
    ),
  });
}
```

### Get Pending Posts for Admin Review

```typescript
export async function getPendingPosts() {
  return db.query.posts.findMany({
    where: eq(posts.status, "pending"),
    orderBy: [asc(posts.createdAt)], // FIFO queue
    with: {
      author: true,
      category: true,
    },
  });
}
```

---

## Validation Summary

| Entity         | Key Validations                                                  |
| -------------- | ---------------------------------------------------------------- |
| **users**      | Email unique, clerkId unique                                     |
| **posts**      | (slug, lang) unique, status transitions valid, content not empty |
| **categories** | Name unique, slug unique, slug format                            |
| **tags**       | Name unique, slug unique, slug format, max 50 chars              |
| **post_tags**  | (postId, tagId) unique, max 10 tags per post (soft limit)        |

---

## Performance Considerations

### Indexes

- **Composite index** `(status, lang, published_at DESC)` for post listing queries (most common)
- **Translation lookup** via `translation_group_id` index
- **Tag filtering** via `post_tags` composite PK and individual FK indexes
- **Author queries** via `user_id` index

### Denormalization (if needed later)

- Consider materialized `post_count` on categories/tags tables if counts are frequent
- Consider full-text search index (GIN) for title+content if native search is used

### Caching Strategy

- Published posts list can be cached (invalidate on new publish)
- Translation lookups can be memoized per request
- Category/tag lists rarely change (cache for 1 hour)

---

**Next Phase**: API Contracts definition (Phase 1)
