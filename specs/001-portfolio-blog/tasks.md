# Tasks: Portfolio Blog Platform

**Input**: Design documents from `/specs/001-portfolio-blog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md
**Feature Branch**: `001-portfolio-blog`
**Date**: 2026-03-10

**Tests**: No test tasks included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency management

- [x] T001 Install @tanstack/react-query dependency via npm
- [x] T002 [P] Update package.json scripts for new migration commands
- [x] T003 [P] Verify Clerk, Drizzle ORM, R2 credentials in environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [x] T004 Update posts schema in src/server/db/schema.ts to add translationGroupId column with UUID type and gen_random_uuid() default
- [x] T005 [P] Update posts schema in src/server/db/schema.ts to replace published boolean with status enum ('draft', 'pending', 'published', 'rejected')
- [x] T006 [P] Update posts schema in src/server/db/schema.ts to add admin workflow columns: adminFeedback (text), reviewedBy (UUID FK), reviewedAt (timestamp)
- [x] T007 Create categories table schema in src/server/db/schema.ts with id, name, slug, description, timestamps
- [x] T008 [P] Create tags table schema in src/server/db/schema.ts with id, name, slug, description, createdAt
- [x] T009 [P] Create post_tags junction table schema in src/server/db/schema.ts with composite PK on (postId, tagId)
- [x] T010 Update posts schema in src/server/db/schema.ts to add categoryId FK and featuredImage text column
- [x] T011 Add Drizzle relations in src/server/db/schema.ts for users, posts, categories, tags, post_tags
- [x] T012 Add TypeScript type exports in src/server/db/schema.ts (User, Post, Category, Tag, PostTag, NewPost, etc.)
- [x] T013 Generate migration for translationGroupId via drizzle-kit generate --name add-translation-group
- [x] T014 Generate migration for status enum via drizzle-kit generate --name replace-published-with-status
- [x] T015 Generate migration for categories and tags via drizzle-kit generate --name add-categories-tags
- [x] T016 Generate migration for featuredImage via drizzle-kit generate --name add-featured-image
- [x] T017 Review and edit migration SQL in src/server/db/migrations to ensure data migration for published→status
- [x] T018 Apply all migrations via drizzle-kit push and verify schema in Drizzle Studio
- [x] T019 Add composite index (status, lang, publishedAt DESC) to posts table in migration SQL
- [x] T020 [P] Add index on translationGroupId to posts table in migration SQL
- [x] T021 [P] Add index on categoryId to posts table in migration SQL

### Environment & Authorization

- [x] T022 Add ADMIN_USER_ID environment variable to .env.local with placeholder comment
- [x] T023 Create isAdmin helper function in src/env.ts that compares clerkId === ADMIN_USER_ID
- [x] T024 Update environment validation in src/env.ts to include ADMIN_USER_ID check

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Public Post Reading (Priority: P1) 🎯 MVP

**Goal**: Visitors can discover and read blog posts without authentication

**Independent Test**: Navigate to home page, see list of posts, click one, read full content with proper Markdown rendering. UI shows language toggle when translation exists, otherwise shows fallback banner.

### Implementation for User Story 1

- [x] T025 [P] [US1] Update getPublishedPosts query in src/server/db/queries.ts to filter by status='published' instead of published=true
- [x] T026 [P] [US1] Add getPublishedPostsPaginated query in src/server/db/queries.ts with limit, offset, lang, categorySlug, tagSlugs parameters
- [x] T027 [US1] Create fetchPostsList server function in src/shared/services/post.ts with pagination, filtering, and hasTranslation logic
- [x] T028 [US1] Update fetchPost server function in src/shared/services/post.ts to include fallback language logic (try requested lang → try opposite → 404)
- [x] T029 [US1] Update post listing route loader in src/routes/$lang/posts/index.tsx to use fetchPostsList with pagination
- [x] T030 [US1] Update post detail route loader in src/routes/$lang/posts/$slug.tsx to handle isFallback and originalLang from fetchPost
- [x] T031 [US1] Add fallback banner component in src/components/post/FallbackBanner.tsx to display when post language differs from requested (implemented inline in $slug.tsx)
- [ ] T032 [US1] Update PostItem component in src/components/post/item.tsx to show "Also available in [lang]" badge when hasTranslation=true
- [x] T033 [P] [US1] Add LanguageToggle component in src/components/post/LanguageToggle.tsx to switch between translations (implemented inline in $slug.tsx)
- [ ] T034 [US1] Add localization strings for fallback banner in src/locales/en.ts and src/locales/vi.ts (currently hardcoded)
- [x] T035 [US1] Update post detail page component in src/routes/$lang/posts/$slug.tsx to render FallbackBanner and LanguageToggle conditionally

**Checkpoint**: Public post reading fully functional - visitors can browse and read all published posts with translation support

---

## Phase 4: User Story 2 - Post Creation & Management (Priority: P1) 🎯 MVP

**Goal**: Authenticated authors can create, edit, and delete blog posts with Markdown content

**Independent Test**: Log in, navigate to "New Post", fill form with title/content/category/tags, save as draft, edit, delete with confirmation. Create translation of existing post.

### Implementation for User Story 2

- [x] T036 [P] [US2] Update createPostFn in src/shared/services/post.ts to accept categoryId, tagIds, featuredImage, and set status (draft or pending based on published param) (tagIds TODO remains)
- [ ] T037 [P] [US2] Update updatePostFn in src/shared/services/post.ts to check authorization (author for draft/rejected, admin for published)
- [ ] T038 [P] [US2] Update deletePostFn in src/shared/services/post.ts to check authorization (author for draft only, admin for all)
- [x] T039 [US2] Create getCategoriesList server function in src/shared/services/post.ts returning all categories with id, name, slug
- [x] T040 [P] [US2] Create getTagsList server function in src/shared/services/post.ts returning all tags with id, name, slug
- [x] T041 [P] [US2] Create checkSlugAvailability server function in src/shared/services/post.ts to validate slug uniqueness per language
- [x] T042 [US2] Update post creation form in src/routes/$lang/\_protected/new.tsx to add category select field using getCategoriesList
- [x] T043 [US2] Update post creation form in src/routes/$lang/\_protected/new.tsx to add multi-select tags field (max 10) using getTagsList
- [x] T044 [US2] Update post creation form in src/routes/$lang/\_protected/new.tsx to add featuredImage upload field
- [x] T045 [US2] Add real-time slug validation to post form in src/routes/$lang/\_protected/new.tsx using checkSlugAvailability with debounce
- [ ] T046 [US2] Create edit post route in src/routes/$lang/_protected/edit.$id.tsx with loader fetching post by ID
- [ ] T047 [US2] Create edit post form component in src/routes/$lang/_protected/edit.$id.tsx pre-filled with existing post data
- [ ] T048 [US2] Add delete confirmation dialog component in src/components/post/DeleteConfirmDialog.tsx
- [ ] T049 [US2] Integrate delete confirmation dialog into edit post page in src/routes/$lang/_protected/edit.$id.tsx
- [x] T050 [US2] Create translation service file in src/shared/services/translation.ts
- [x] T051 [US2] Implement createTranslationFn in src/shared/services/translation.ts to link posts via translationGroupId with same slug
- [x] T052 [US2] Implement getPostTranslation in src/shared/services/translation.ts to check if translation exists
- [ ] T053 [US2] Add "Create Translation" button to edit page in src/routes/$lang/_protected/edit.$id.tsx when translation missing
- [ ] T054 [US2] Create translation form route in src/routes/$lang/_protected/translate.$id.tsx pre-filling slug, category, tags from original
- [x] T055 [US2] Add localization strings for post management UI in src/locales/en.ts and src/locales/vi.ts (partially done)

**Checkpoint**: Post creation and management fully functional - authors can create, edit, delete, and translate posts

---

## Phase 5: User Story 2.5 - Admin Post Approval (Priority: P1) 🎯 MVP

**Goal**: Site admin can review and approve/reject submitted posts before they become publicly visible

**Independent Test**: Create post as non-admin and submit for approval, log in as admin, see post in queue, approve or reject with feedback. Author sees feedback and can resubmit.

### Implementation for User Story 2.5

- [x] T056 [P] [US2.5] Create admin service file in src/shared/services/admin.ts
- [x] T057 [P] [US2.5] Implement getPendingPosts server function in src/shared/services/admin.ts filtering status='pending' ordered by createdAt ASC
- [x] T058 [US2.5] Implement approvePostFn server function in src/shared/services/admin.ts with admin check, sets status='published', publishedAt, reviewedBy, reviewedAt
- [x] T059 [US2.5] Implement rejectPostFn server function in src/shared/services/admin.ts with admin check, sets status='rejected', adminFeedback, reviewedBy, reviewedAt
- [x] T060 [US2.5] Implement submitForApproval server function in src/shared/services/admin.ts transitioning draft→pending
- [x] T061 [US2.5] Implement unpublishPostFn server function in src/shared/services/admin.ts transitioning published→draft (admin only)
- [x] T062 [US2.5] Create admin route boundary in src/routes/$lang/\_protected/admin/route.tsx with isAdmin check redirecting non-admins
- [x] T063 [US2.5] Create approval queue route in src/routes/$lang/\_protected/admin/queue.tsx with loader calling getPendingPosts
- [ ] T064 [US2.5] Create all posts management route in src/routes/$lang/\_protected/admin/posts.tsx listing all posts regardless of status
- [x] T065 [US2.5] Create PostReviewCard component in src/components/admin/PostReviewCard.tsx with approve/reject buttons and post preview (implemented inline in queue.tsx)
- [x] T066 [US2.5] Create RejectFeedbackDialog component in src/components/admin/RejectFeedbackDialog.tsx with textarea and submit button (implemented inline in queue.tsx)
- [x] T067 [US2.5] Update approval queue page in src/routes/$lang/\_protected/admin/queue.tsx to render PostReviewCard for each pending post
- [x] T068 [US2.5] Add "Submit for Approval" button to post creation form in src/routes/$lang/\_protected/new.tsx calling submitForApproval instead of createPostFn with status=draft
- [ ] T069 [US2.5] Display adminFeedback on edit page in src/routes/$lang/_protected/edit.$id.tsx when post status='rejected'
- [ ] T070 [US2.5] Add "Resubmit for Approval" button to edit page in src/routes/$lang/_protected/edit.$id.tsx for rejected posts
- [ ] T071 [US2.5] Add admin badge/indicator to Header component in src/components/layout/Header.tsx when current user is admin
- [ ] T072 [US2.5] Add admin menu links to navigation in src/components/layout/menu.tsx for queue and posts management (visible only to admin)
- [x] T073 [US2.5] Add localization strings for admin approval workflow in src/locales/en.ts and src/locales/vi.ts (partially done)

**Checkpoint**: Admin approval workflow fully functional - posts require approval before going live

---

## Phase 6: User Story 4 - Post Listing with Pagination (Priority: P2)

**Goal**: Visitors can browse through all blog posts efficiently with page navigation

**Independent Test**: Create 20+ posts, verify post listing shows 10 per page, navigate with Previous/Next buttons, URL reflects page number (?page=2).

### Implementation for User Story 4

- [x] T074 [US4] Add search params validation schema to post listing route in src/routes/$lang/posts/index.tsx with page number (default 1)
- [x] T075 [US4] Update post listing route loader in src/routes/$lang/posts/index.tsx to pass page and pageSize to fetchPostsList
- [x] T076 [US4] Create Pagination component in src/components/shared/Pagination.tsx with Previous, page numbers, Next buttons (implemented inline in posts/index.tsx)
- [x] T077 [US4] Add Pagination component to post listing page in src/routes/$lang/posts/index.tsx passing totalPages and currentPage
- [x] T078 [US4] Style Pagination component with disabled state for Previous (page 1) and Next (last page) buttons
- [x] T079 [US4] Update URL on page change in Pagination component using TanStack Router navigate with search params
- [x] T080 [US4] Add localization strings for pagination in src/locales/en.ts and src/locales/vi.ts

**Checkpoint**: Pagination fully functional - users can navigate large post lists efficiently

---

## Phase 7: User Story 6 - Responsive Design Across Devices (Priority: P2)

**Goal**: Blog adapts to mobile (320px+), tablet (768px+), and desktop (1920px+) screen sizes

**Independent Test**: Access site on devices with varying screen sizes, verify layouts adapt appropriately, navigation is touch-friendly on mobile.

### Implementation for User Story 6

- [ ] T081 [P] [US6] Audit existing components for mobile responsiveness in src/components/layout (Header, Footer, Navbar)
- [ ] T082 [P] [US6] Update Header component in src/components/layout/Header.tsx with mobile-first responsive classes (hidden → sm:flex patterns)
- [ ] T083 [P] [US6] Update post listing grid in src/routes/$lang/posts/index.tsx to use responsive grid-cols (1 mobile, 2 tablet, 3 desktop)
- [ ] T084 [P] [US6] Update post detail layout in src/routes/$lang/posts/$slug.tsx with max-width prose container and responsive margins
- [ ] T085 [P] [US6] Update admin approval queue layout in src/routes/$lang/\_protected/admin/queue.tsx for mobile stacking
- [ ] T086 [US6] Test post creation form in src/routes/$lang/\_protected/new.tsx on mobile viewport and adjust input sizes
- [ ] T087 [US6] Increase tap target sizes for mobile buttons in Pagination component to minimum 44x44px
- [ ] T088 [US6] Test collapsible navigation in mobile Navbar component in src/components/layout/navbar/mobile/index.tsx

**Checkpoint**: Site is fully responsive across all device sizes with touch-friendly controls

---

## Phase 8: User Story 8 - SEO Optimization (Priority: P2)

**Goal**: Blog is discoverable by search engines with proper meta tags and SSR

**Independent Test**: Inspect page source for meta tags, run Lighthouse SEO audit (target 90+ score), verify social sharing previews.

### Implementation for User Story 8

- [x] T089 [P] [US8] Add head meta tags to post listing route in src/routes/$lang/posts/index.tsx with title, description, og:tags
- [x] T090 [P] [US8] Add dynamic head meta tags to post detail route in src/routes/$lang/posts/$slug.tsx using post title, description, featuredImage
- [ ] T091 [P] [US8] Add hreflang tags to post detail route head when translation exists using translationGroupId check
- [ ] T092 [P] [US8] Add canonical URL meta tag to post detail route to prevent duplicate content
- [ ] T093 [US8] Create sitemap generation script in scripts/generate-sitemap.ts iterating all published posts
- [ ] T094 [US8] Add sitemap.xml route in public/sitemap.xml or src/routes/sitemap.xml.ts
- [ ] T095 [US8] Update robots.txt in public/robots.txt to reference sitemap.xml
- [ ] T096 [US8] Add structured data (JSON-LD) for BlogPosting schema to post detail route in src/routes/$lang/posts/$slug.tsx
- [ ] T097 [US8] Verify all images have alt text in Markdown component in src/components/shared/Markdown.tsx
- [ ] T098 [US8] Add Twitter Card meta tags to root layout in src/routes/\_\_root.tsx with default values
- [ ] T099 [US8] Run Lighthouse SEO audit and address any warnings flagged
- [ ] T100 [US8] Test social sharing preview on Facebook/Twitter/LinkedIn using opengraph.xyz or similar

**Checkpoint**: SEO optimization complete - site is search engine and social media friendly

---

## Phase 9: User Story 5 - Search & Filter by Tags/Categories (Priority: P3)

**Goal**: Visitors can find specific content by searching or filtering posts by topic

**Independent Test**: Create posts with various tags/categories, enter search terms, apply filters, verify results match criteria. Combine search + category + tags.

### Implementation for User Story 5

- [ ] T101 [P] [US5] Create searchPosts server function in src/shared/services/post.ts using PostgreSQL full-text search with to_tsvector
- [ ] T102 [P] [US5] Add search query parameter to post listing route search schema in src/routes/$lang/posts/index.tsx
- [ ] T103 [P] [US5] Add categorySlug and tagSlugs query parameters to post listing route search schema in src/routes/$lang/posts/index.tsx
- [ ] T104 [US5] Update post listing route loader in src/routes/$lang/posts/index.tsx to pass search, categorySlug, tagSlugs to fetchPostsList
- [ ] T105 [US5] Create SearchBar component in src/components/shared/SearchBar.tsx with input and search button
- [ ] T106 [US5] Create CategoryFilter component in src/components/shared/CategoryFilter.tsx with dropdown of categories
- [ ] T107 [US5] Create TagFilter component in src/components/shared/TagFilter.tsx with multi-select checkboxes
- [ ] T108 [US5] Add SearchBar, CategoryFilter, TagFilter components to post listing page in src/routes/$lang/posts/index.tsx
- [ ] T109 [US5] Update URL on filter change using TanStack Router navigate with search params preserving existing filters
- [ ] T110 [US5] Add "Clear Filters" button to post listing page that resets all search params
- [ ] T111 [US5] Display active filters as removable badges on post listing page
- [ ] T112 [US5] Show "No results found" message when filtered posts array is empty
- [ ] T113 [US5] Add loading state to post listing during search/filter operations
- [ ] T114 [US5] Create category detail route in src/routes/$lang/categories/$slug.tsx listing posts for that category
- [ ] T115 [US5] Create tag detail route in src/routes/$lang/tags/$slug.tsx listing posts for that tag
- [ ] T116 [US5] Add category and tag links to post detail page in src/routes/$lang/posts/$slug.tsx
- [ ] T117 [US5] Add localization strings for search and filters in src/locales/en.ts and src/locales/vi.ts

**Checkpoint**: Search and filtering fully functional - users can discover content by topic

---

## Phase 10: User Story 7 - Dark Mode Support (Priority: P3)

**Goal**: Users can toggle between light and dark color schemes with preference persistence

**Independent Test**: Toggle dark mode on/off, verify all pages maintain visual consistency, refresh page and confirm preference persists, test OS default detection.

### Implementation for User Story 7

- [x] T118 [P] [US7] Verify ThemeProvider in src/shared/providers/theme.tsx supports light/dark/system modes
- [x] T119 [P] [US7] Verify ThemeToggle component in src/components/layout/ThemeToggle.tsx cycles through light/dark/system
- [ ] T120 [US7] Audit all custom UI components for dark mode color classes (dark:bg-, dark:text-)
- [ ] T121 [US7] Update post content Markdown styles in src/components/shared/Markdown.tsx for dark mode code blocks
- [ ] T122 [US7] Update admin approval queue styles in src/routes/$lang/\_protected/admin/queue.tsx for dark mode contrast
- [ ] T123 [US7] Test dark mode on all routes and fix any color contrast issues
- [ ] T124 [US7] Verify localStorage persistence of theme preference in ThemeProvider
- [ ] T125 [US7] Test system preference detection on first visit (prefers-color-scheme media query)

**Checkpoint**: Dark mode fully functional with theme persistence and system detection

---

## Phase 11: User Story 9 - Performance Benchmarking (Priority: P3)

**Goal**: Verify site meets performance standards demonstrating engineering quality

**Independent Test**: Run Lighthouse audits, measure Core Web Vitals, verify bundle sizes, check TTFB/FCP/LCP against targets.

### Implementation for User Story 9

- [ ] T126 [P] [US9] Run Lighthouse performance audit on deployed site and record baseline metrics
- [x] T127 [P] [US9] Analyze bundle size using vite build --mode production and vite-bundle-analyzer
- [x] T128 [P] [US9] Add dynamic imports for heavy components (MarkdownEditor, admin routes) to reduce initial bundle
- [ ] T129 [P] [US9] Optimize images using next-generation formats (WebP, AVIF) for featuredImage uploads to R2
- [ ] T130 [US9] Add loading="lazy" to images below viewport fold in post listing and detail pages
- [ ] T131 [US9] Implement TanStack Query caching strategy with 5-minute stale time for read operations
- [ ] T132 [US9] Add cache headers to R2 uploaded images (1 year max-age)
- [ ] T133 [US9] Measure TTFB using WebPageTest from multiple global locations and record 50th percentile
- [ ] T134 [US9] Measure FCP and LCP using Chrome DevTools Performance tab on 4G throttled connection
- [ ] T135 [US9] Document performance metrics in specs/001-portfolio-blog/performance-results.md
- [ ] T136 [US9] Create performance budget configuration and CI check to prevent regressions
- [ ] T137 [US9] Verify Cloudflare Workers cold start time is under 20ms

**Checkpoint**: Performance targets met - site demonstrates production-grade engineering

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T138 [P] Add image upload to R2 function in src/shared/services/upload.ts for featuredImage and Markdown images
- [ ] T139 [P] Integrate R2 upload into post creation form in src/routes/$lang/\_protected/new.tsx with drag-drop support
- [ ] T140 [P] Add error boundary components to critical routes catching and displaying errors gracefully
- [ ] T141 Create loading skeleton components for post listing and detail pages
- [ ] T142 Add toast notifications for success/error feedback on post create/edit/delete actions
- [ ] T143 Add confirmation dialogs for destructive actions (delete post, reject post, unpublish)
- [ ] T144 Implement optimistic UI updates for approve/reject actions in admin queue
- [ ] T145 Add accessibility audit using axe DevTools and fix violations (focus management, ARIA labels)
- [ ] T146 Run WCAG AA compliance check with Lighthouse accessibility audit (target 90+ score)
- [ ] T147 Code cleanup: Remove unused imports, format with Biome, fix linting warnings
- [ ] T148 Update README.md with setup instructions, environment variables, and deployment guide
- [ ] T149 Verify all quickstart.md steps in specs/001-portfolio-blog/quickstart.md are complete
- [x] T150 Create seed data script in scripts/seed.ts for demo categories, tags, and sample posts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-11)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US2.5) can proceed in parallel after Foundational
  - P2 stories (US4, US6, US8) can start after Foundational (may reference P1 components)
  - P3 stories (US5, US7, US9) can start after Foundational (may build on P1/P2 work)
- **Polish (Phase 12)**: Depends on desired user stories being functionally complete

### User Story Dependencies

**P1 - MVP Core (can parallelize with separate team members)**:

- **US1 (Public Post Reading)**: Independent - only needs Foundational
- **US2 (Post Creation & Management)**: Independent - only needs Foundational
- **US2.5 (Admin Approval)**: Integrates with US2 (shares post forms) but independently testable

**P2 - Enhanced Features**:

- **US4 (Pagination)**: Enhances US1 (post listing) but can be tested independently
- **US6 (Responsive Design)**: Cross-cutting - touches all routes, best done after US1/US2 layouts exist
- **US8 (SEO Optimization)**: Enhances US1 (post pages) but independently verifiable

**P3 - Advanced Features**:

- **US5 (Search & Filter)**: Extends US1 (post listing) and US4 (pagination)
- **US7 (Dark Mode)**: Cross-cutting - best done after UI is stable
- **US9 (Performance)**: Optimization pass after features complete

### Within Each User Story

- Database schema changes before query functions (T004-T024 before T025)
- Query functions before server functions (T025-T026 before T027-T028)
- Server functions before route loaders (T027-T028 before T029-T030)
- Route loaders before UI components (T029-T030 before T031-T035)
- Core implementation before edge cases and polish

### Parallel Opportunities (same phase, different files)

**Phase 2 - Foundational**:

- T004-T012 (schema changes) can run in parallel if editing different table definitions
- T013-T016 (migration generation) must run sequentially (Drizzle Kit limitation)
- T020-T021 (indexes) can run in parallel

**Phase 3 - US1**:

- T025-T026 (queries) in parallel
- T033-T034 (components and locales) in parallel

**Phase 4 - US2**:

- T036-T038 (server functions) in parallel
- T039-T041 (utility functions) in parallel
- T050-T052 (translation service) can overlap with T042-T045 (form updates)

**Phase 5 - US2.5**:

- T056-T061 (server functions) in parallel
- T065-T066 (components) in parallel

**Phase 8 - US8**:

- T089-T092 (meta tags per route) in parallel
- T096-T098 (structured data) in parallel

**Phase 9 - US5**:

- T101-T103 (server function and schema) in parallel
- T105-T107 (filter components) in parallel
- T114-T115 (category/tag routes) in parallel

**Phase 11 - US9**:

- T126-T128 (audits and analysis) in parallel
- T129-T130 (image optimizations) in parallel

**Phase 12 - Polish**:

- T138-T140 (upload, error boundaries) in parallel

---

## Parallel Example: User Story 1 (Public Post Reading)

```bash
# Phase 2 Foundational must complete first
# Then launch US1 tasks in waves:

# Wave 1 - Queries (parallel):
- T025: Update getPublishedPosts query
- T026: Add getPublishedPostsPaginated query

# Wave 2 - Server functions (sequential, depends on queries):
- T027: Create fetchPostsList
- T028: Update fetchPost with fallback

# Wave 3 - Routes (sequential, depends on server functions):
- T029: Update post listing route loader
- T030: Update post detail route loader

# Wave 4 - UI Components (parallel):
- T031: Create FallbackBanner component
- T032: Update PostItem component
- T033: Create LanguageToggle component
- T034: Add localization strings

# Wave 5 - Integration (sequential, depends on components):
- T035: Update post detail page with banner and toggle
```

---

## Implementation Strategy

### MVP First (P1 Stories Only - ~2-3 weeks)

1. Complete Phase 1: Setup (T001-T003) - Day 1
2. Complete Phase 2: Foundational (T004-T024) - Week 1
3. Complete Phase 3: US1 - Public Reading (T025-T035) - Week 1-2
4. Complete Phase 4: US2 - Post Management (T036-T055) - Week 2
5. Complete Phase 5: US2.5 - Admin Approval (T056-T073) - Week 2-3
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy MVP to staging/production

### Incremental Delivery (P1 → P2 → P3)

**Week 1-3**: MVP (P1)

- Foundation + US1 + US2 + US2.5
- Deploy for feedback

**Week 4**: P2 Enhanced Features

- US4 (Pagination) - Days 1-2
- US6 (Responsive Design) - Days 3-4
- US8 (SEO Optimization) - Days 4-5
- Deploy with improved UX

**Week 5**: P3 Advanced Features

- US5 (Search & Filter) - Days 1-2
- US7 (Dark Mode) - Day 3
- US9 (Performance) - Days 4-5
- Final deployment

**Week 5+**: Polish

- Phase 12 tasks (T138-T150)
- Bug fixes and refinements

### Parallel Team Strategy (3 developers)

**Week 1**: All team members - Phase 1 + Phase 2 (Foundational)

**Week 2-3** (after Foundational complete):

- **Developer A**: US1 (Public Reading) → US4 (Pagination)
- **Developer B**: US2 (Post Management) → US8 (SEO)
- **Developer C**: US2.5 (Admin Approval) → US5 (Search)

**Week 4**: Merge and integrate all stories

**Week 5**: US6 (Responsive), US7 (Dark Mode), US9 (Performance), Polish

---

## Notes

- Install @tanstack/react-query as mentioned in earlier conversation (not in current package.json)
- Use Clerk's pre-built `<SignIn />` component (existing login.tsx pattern is correct)
- TanStack Form already installed - use for post creation/edit forms
- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] = parallelizable within same phase
- Each user story should be independently completable and testable
- Commit after completing each phase or logical group of tasks
- MVP = US1 + US2 + US2.5 (all P1 stories)
- Target completion: 5 weeks (MVP: 3 weeks, P2: 1 week, P3: 1 week)
