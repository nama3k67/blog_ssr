# Sprint Plan: blog app

**Date:** 2026-03-24
**Scrum Master:** Solo Developer
**Project Level:** 3 (Complex)
**Total Stories:** 20
**Total Points:** 89
**Planned Sprints:** 7 (weekly)
**Team Capacity:** 13 points/sprint (15 max, 15% buffer)
**Target Completion:** 2026-05-12 (Week of)

---

## Executive Summary

This sprint plan covers the remaining ~77 tasks across 9 user story groups for the Portfolio Blog Platform. Phases 1-2 (Setup & Foundation) are complete, and P1 stories (US1, US2, US2.5) are 60-90% done. The plan prioritizes completing the MVP first (Sprints 1-2), then layering P2 enhanced features (Sprints 3-4), P3 advanced features (Sprints 5-6), and final polish (Sprint 7).

**Key Metrics:**
- Total Stories: 20
- Total Points: 89
- Sprints: 7 (1-week each)
- Team Capacity: 13 points/sprint committed (15 max)
- Target Completion: 2026-05-12

---

## Story Inventory

### STORY-001: US1 Translation Badges & Localization

**Epic:** US1 – Public Post Reading
**Priority:** Must Have
**Points:** 2

**User Story:**
As a visitor, I want to see when a post is available in another language so I can easily switch.

**Acceptance Criteria:**
- [ ] PostItem shows "Also available in [lang]" badge when hasTranslation=true
- [ ] Fallback banner and language toggle strings are localized (not hardcoded)

**Technical Notes:**
- T032: Update PostItem in `src/components/post/item.tsx`
- T034: Add localization strings in `src/locales/en.ts` and `src/locales/vi.ts`

**Dependencies:** None

---

### STORY-002: Post Edit & Delete Flow

**Epic:** US2 – Post Creation & Management
**Priority:** Must Have
**Points:** 5

**User Story:**
As an author, I want to edit my existing posts and delete drafts so I can manage my content.

**Acceptance Criteria:**
- [ ] Edit route loads post by ID with pre-filled form
- [ ] Author can update all post fields (title, content, category, tags, image)
- [ ] Delete confirmation dialog prevents accidental deletion
- [ ] Delete is integrated into edit page

**Technical Notes:**
- T046: Create edit route `src/routes/$lang/_protected/edit.$id.tsx` with loader
- T047: Create edit form component pre-filled with post data
- T048: Create DeleteConfirmDialog in `src/components/post/DeleteConfirmDialog.tsx`
- T049: Integrate delete dialog into edit page

**Dependencies:** STORY-003 (auth guards needed for edit/delete)

---

### STORY-003: Post Authorization Guards

**Epic:** US2 – Post Creation & Management
**Priority:** Must Have
**Points:** 3

**User Story:**
As the system, I need to enforce authorization rules so only authors can edit their own posts and only admins can modify published content.

**Acceptance Criteria:**
- [ ] updatePostFn checks: author can edit draft/rejected, admin can edit published
- [ ] deletePostFn checks: author can delete own drafts, admin can delete any

**Technical Notes:**
- T037: Update updatePostFn in `src/shared/services/post.ts`
- T038: Update deletePostFn in `src/shared/services/post.ts`

**Dependencies:** None

---

### STORY-004: Translation Workflow

**Epic:** US2 – Post Creation & Management
**Priority:** Must Have
**Points:** 5

**User Story:**
As an author, I want to create a translation of an existing post so bilingual readers can access content in their language.

**Acceptance Criteria:**
- [ ] "Create Translation" button on edit page when translation is missing
- [ ] Translation form pre-fills slug, category, tags from original post
- [ ] New translation is linked via translationGroupId

**Technical Notes:**
- T053: Add "Create Translation" button to edit page
- T054: Create translation form route `src/routes/$lang/_protected/translate.$id.tsx`

**Dependencies:** STORY-002 (edit page must exist first)

---

### STORY-005: Admin All Posts Management

**Epic:** US2.5 – Admin Post Approval
**Priority:** Must Have
**Points:** 3

**User Story:**
As an admin, I want to see all posts (any status) so I can manage the full content library.

**Acceptance Criteria:**
- [ ] Admin posts page lists all posts with status filter
- [ ] Posts show status, author, date, and action buttons

**Technical Notes:**
- T064: Create `src/routes/$lang/_protected/admin/posts.tsx`

**Dependencies:** None

---

### STORY-006: Admin Feedback & Resubmit Flow

**Epic:** US2.5 – Admin Post Approval
**Priority:** Must Have
**Points:** 3

**User Story:**
As an author, I want to see admin feedback on rejected posts and resubmit after edits.

**Acceptance Criteria:**
- [ ] Edit page displays adminFeedback when status='rejected'
- [ ] "Resubmit for Approval" button transitions rejected→pending

**Technical Notes:**
- T069: Display adminFeedback on edit page
- T070: Add "Resubmit for Approval" button

**Dependencies:** STORY-002 (edit page must exist)

---

### STORY-007: Admin Navigation

**Epic:** US2.5 – Admin Post Approval
**Priority:** Must Have
**Points:** 2

**User Story:**
As an admin, I want visible admin indicators and menu links so I can quickly access admin features.

**Acceptance Criteria:**
- [ ] Header shows admin badge when current user is admin
- [ ] Navigation includes admin links (queue, posts) visible only to admin

**Technical Notes:**
- T071: Update Header in `src/components/layout/Header.tsx`
- T072: Update menu in `src/components/layout/menu.tsx`

**Dependencies:** None

---

### STORY-008: Responsive Layout – Core Pages

**Epic:** US6 – Responsive Design
**Priority:** Should Have
**Points:** 5

**User Story:**
As a visitor on mobile/tablet, I want the blog layout to adapt to my screen size.

**Acceptance Criteria:**
- [ ] Header responsive with mobile-first classes
- [ ] Post listing uses responsive grid (1/2/3 columns)
- [ ] Post detail uses max-width prose container with responsive margins
- [ ] All layouts audit for existing responsiveness gaps

**Technical Notes:**
- T081: Audit existing components
- T082: Update Header responsive classes
- T083: Update post listing grid
- T084: Update post detail layout

**Dependencies:** None

---

### STORY-009: Responsive Layout – Forms & Admin

**Epic:** US6 – Responsive Design
**Priority:** Should Have
**Points:** 5

**User Story:**
As a mobile user, I want forms and admin pages to be usable on small screens.

**Acceptance Criteria:**
- [ ] Admin queue stacks cards on mobile
- [ ] Post creation form inputs resize for mobile
- [ ] Pagination tap targets ≥44x44px
- [ ] Mobile navigation is collapsible and functional

**Technical Notes:**
- T085: Admin queue mobile layout
- T086: Post form mobile testing
- T087: Pagination tap targets
- T088: Mobile navbar testing

**Dependencies:** STORY-008

---

### STORY-010: SEO Meta & Structured Data

**Epic:** US8 – SEO Optimization
**Priority:** Should Have
**Points:** 5

**User Story:**
As a search engine crawler, I need proper meta tags and structured data to index blog content correctly.

**Acceptance Criteria:**
- [ ] hreflang tags on post detail when translation exists
- [ ] Canonical URL meta tag on post detail
- [ ] JSON-LD BlogPosting schema on post detail
- [ ] Twitter Card meta tags on root layout

**Technical Notes:**
- T091: hreflang tags
- T092: Canonical URL
- T096: JSON-LD structured data
- T098: Twitter Card meta tags

**Dependencies:** None

---

### STORY-011: Sitemap & Robots

**Epic:** US8 – SEO Optimization
**Priority:** Should Have
**Points:** 3

**User Story:**
As a search engine, I need a sitemap and robots.txt to discover all published content.

**Acceptance Criteria:**
- [ ] Sitemap generation script iterates all published posts
- [ ] sitemap.xml route serves generated sitemap
- [ ] robots.txt references sitemap.xml

**Technical Notes:**
- T093: Create sitemap generation script
- T094: Add sitemap.xml route
- T095: Update robots.txt

**Dependencies:** None

---

### STORY-012: SEO Validation

**Epic:** US8 – SEO Optimization
**Priority:** Should Have
**Points:** 3

**User Story:**
As a developer, I want to verify SEO implementation meets quality standards.

**Acceptance Criteria:**
- [ ] All images in Markdown have alt text
- [ ] Lighthouse SEO audit ≥90
- [ ] Social sharing previews validated

**Technical Notes:**
- T097: Audit image alt text in Markdown component
- T099: Lighthouse SEO audit
- T100: Social preview testing

**Dependencies:** STORY-010, STORY-011

---

### STORY-013: Search Infrastructure

**Epic:** US5 – Search & Filter
**Priority:** Could Have
**Points:** 5

**User Story:**
As the system, I need search and filter backend infrastructure so visitors can find posts by keyword, category, or tag.

**Acceptance Criteria:**
- [ ] PostgreSQL full-text search function for posts
- [ ] Search, categorySlug, tagSlugs query params in route schema
- [ ] Post listing loader passes all filter params to fetchPostsList

**Technical Notes:**
- T101: Create searchPosts server function with to_tsvector
- T102: Add search query param to route
- T103: Add category/tag params to route
- T104: Update listing loader with all params

**Dependencies:** None

---

### STORY-014: Search & Filter UI

**Epic:** US5 – Search & Filter
**Priority:** Could Have
**Points:** 8

**User Story:**
As a visitor, I want to search posts and filter by category/tag so I can find relevant content.

**Acceptance Criteria:**
- [ ] SearchBar component with input and button
- [ ] CategoryFilter dropdown
- [ ] TagFilter multi-select checkboxes
- [ ] URL updates on filter change preserving existing filters
- [ ] "Clear Filters" button resets all search params
- [ ] Active filters shown as removable badges
- [ ] "No results found" message for empty results
- [ ] Loading state during search/filter

**Technical Notes:**
- T105-T113: Full search/filter UI component suite

**Dependencies:** STORY-013

---

### STORY-015: Category & Tag Detail Routes

**Epic:** US5 – Search & Filter
**Priority:** Could Have
**Points:** 5

**User Story:**
As a visitor, I want dedicated pages for categories and tags showing all related posts.

**Acceptance Criteria:**
- [ ] Category detail page at `/$lang/categories/$slug`
- [ ] Tag detail page at `/$lang/tags/$slug`
- [ ] Post detail shows clickable category and tag links
- [ ] Localization strings for search and filters

**Technical Notes:**
- T114: Category detail route
- T115: Tag detail route
- T116: Category/tag links on post detail
- T117: Localization strings

**Dependencies:** STORY-013

---

### STORY-016: Dark Mode Polish

**Epic:** US7 – Dark Mode
**Priority:** Could Have
**Points:** 5

**User Story:**
As a user, I want consistent dark mode across all pages including code blocks and admin UI.

**Acceptance Criteria:**
- [ ] All custom components audited for dark: classes
- [ ] Markdown code blocks styled for dark mode
- [ ] Admin queue has proper dark contrast
- [ ] All routes tested and color contrast issues fixed
- [ ] localStorage persistence verified
- [ ] System preference detection on first visit works

**Technical Notes:**
- T120-T125: Full dark mode audit and polish

**Dependencies:** None

---

### STORY-017: Performance Audit & Optimization

**Epic:** US9 – Performance
**Priority:** Could Have
**Points:** 5

**User Story:**
As a developer, I want to optimize images, caching, and lazy loading for production performance.

**Acceptance Criteria:**
- [ ] Lighthouse performance audit baseline recorded
- [ ] Featured images use WebP/AVIF formats
- [ ] Below-fold images use loading="lazy"
- [ ] TanStack Query caching with 5-min stale time
- [ ] R2 images have 1-year cache headers

**Technical Notes:**
- T126: Lighthouse baseline
- T129: Image format optimization
- T130: Lazy loading
- T131: TanStack Query caching
- T132: R2 cache headers

**Dependencies:** None

---

### STORY-018: Performance Benchmarking

**Epic:** US9 – Performance
**Priority:** Could Have
**Points:** 5

**User Story:**
As a developer, I want documented performance metrics and CI guardrails.

**Acceptance Criteria:**
- [ ] TTFB measured from multiple locations (50th percentile)
- [ ] FCP and LCP measured on throttled 4G
- [ ] Metrics documented in performance-results.md
- [ ] Performance budget CI check configured
- [ ] Workers cold start <20ms verified

**Technical Notes:**
- T133-T137: Performance measurement and documentation

**Dependencies:** STORY-017

---

### STORY-019: UX Polish

**Epic:** Phase 12 – Polish
**Priority:** Could Have
**Points:** 8

**User Story:**
As a user, I want polished UX with drag-drop uploads, loading states, toasts, and confirmation dialogs.

**Acceptance Criteria:**
- [ ] R2 upload in post form with drag-drop support
- [ ] Error boundaries on critical routes
- [ ] Loading skeleton components for post listing/detail
- [ ] Toast notifications for CRUD actions
- [ ] Confirmation dialogs for destructive actions
- [ ] Optimistic UI for admin approve/reject

**Technical Notes:**
- T139: R2 drag-drop upload
- T140: Error boundaries
- T141: Loading skeletons
- T142: Toast notifications
- T143: Confirmation dialogs
- T144: Optimistic UI

**Dependencies:** None

---

### STORY-020: Accessibility & Final Cleanup

**Epic:** Phase 12 – Polish
**Priority:** Could Have
**Points:** 5

**User Story:**
As a developer, I want the project to pass accessibility audits and be clean for production.

**Acceptance Criteria:**
- [ ] axe DevTools audit with violations fixed
- [ ] WCAG AA Lighthouse ≥90
- [ ] Code cleanup: unused imports, Biome formatting, lint warnings fixed
- [ ] README updated with setup, env vars, deployment
- [ ] quickstart.md verified complete

**Technical Notes:**
- T145-T149: Accessibility, cleanup, documentation

**Dependencies:** All other stories ideally complete

---

## Sprint Allocation

### Sprint 1 (2026-03-24 → 2026-03-28) — 13/15 points

**Goal:** Complete MVP core — post editing, authorization, and admin navigation

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-001 | US1 Translation Badges & Localization | 2 | Must Have |
| STORY-003 | Post Authorization Guards | 3 | Must Have |
| STORY-002 | Post Edit & Delete Flow | 5 | Must Have |
| STORY-007 | Admin Navigation | 2 | Must Have |

**Total:** 12 points / 15 capacity (80% utilization)
**Buffer:** 3 points for bug fixes from existing implementation

**Risks:**
- Edit form complexity may exceed estimate if reusing new-post form requires significant refactoring

**Definition of Done:** Authors can edit/delete their posts, auth is enforced, admin sees navigation links

---

### Sprint 2 (2026-03-31 → 2026-04-04) — 11/15 points

**Goal:** Complete MVP — translation workflow and full admin management

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-005 | Admin All Posts Management | 3 | Must Have |
| STORY-006 | Admin Feedback & Resubmit Flow | 3 | Must Have |
| STORY-004 | Translation Workflow | 5 | Must Have |

**Total:** 11 points / 15 capacity (73% utilization)
**Buffer:** 4 points for MVP integration testing and bug fixes

**Risks:**
- Translation form route needs careful slug handling to match original post

**Definition of Done:** Full MVP complete — all P1 user stories functional end-to-end

🎯 **MVP MILESTONE — Deploy to production after Sprint 2**

---

### Sprint 3 (2026-04-07 → 2026-04-11) — 13/15 points

**Goal:** Responsive design foundations and SEO meta infrastructure

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-008 | Responsive Layout – Core Pages | 5 | Should Have |
| STORY-010 | SEO Meta & Structured Data | 5 | Should Have |
| STORY-011 | Sitemap & Robots | 3 | Should Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Risks:**
- JSON-LD schema correctness needs validation against Google's Rich Results Test

**Definition of Done:** Core pages responsive on mobile/tablet, SEO meta tags and sitemap deployed

---

### Sprint 4 (2026-04-14 → 2026-04-18) — 13/15 points

**Goal:** Complete responsive polish, SEO validation, and dark mode

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-009 | Responsive Layout – Forms & Admin | 5 | Should Have |
| STORY-012 | SEO Validation | 3 | Should Have |
| STORY-016 | Dark Mode Polish | 5 | Could Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Risks:**
- Dark mode audit may uncover more issues than estimated across all routes

**Definition of Done:** Fully responsive site, Lighthouse SEO ≥90, consistent dark mode

---

### Sprint 5 (2026-04-21 → 2026-04-25) — 13/15 points

**Goal:** Search and filter — full-text search with category/tag filtering

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-013 | Search Infrastructure | 5 | Could Have |
| STORY-014 | Search & Filter UI | 8 | Could Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Risks:**
- PostgreSQL full-text search with Neon serverless may have latency considerations
- Filter UI is the largest story (8 pts) — may spill into Sprint 6

**Definition of Done:** Visitors can search by keyword and filter by category/tag with responsive UI

---

### Sprint 6 (2026-04-28 → 2026-05-01) — 13/15 points

**Goal:** Category/tag routes and UX polish

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-015 | Category & Tag Detail Routes | 5 | Could Have |
| STORY-019 | UX Polish | 8 | Could Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Risks:**
- UX polish (8 pts) covers many small items — risk of scope creep

**Definition of Done:** Dedicated category/tag pages, error boundaries, loading states, toasts, drag-drop upload

---

### Sprint 7 (2026-05-05 → 2026-05-09) — 15/15 points

**Goal:** Performance optimization, benchmarking, accessibility, and final cleanup

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-017 | Performance Audit & Optimization | 5 | Could Have |
| STORY-018 | Performance Benchmarking | 5 | Could Have |
| STORY-020 | Accessibility & Final Cleanup | 5 | Could Have |

**Total:** 15 points / 15 capacity (100% utilization)

**Risks:**
- Full capacity sprint — any spillover from earlier sprints will cause delays
- Performance benchmarking depends on production deployment

**Definition of Done:** Lighthouse performance/accessibility ≥90, metrics documented, codebase clean, README complete

🏁 **PROJECT COMPLETE — Final deployment after Sprint 7**

---

## Epic Traceability

| Epic | Stories | Total Points | Sprints |
|------|---------|--------------|---------|
| US1 – Public Post Reading | STORY-001 | 2 | Sprint 1 |
| US2 – Post Creation & Management | STORY-002, 003, 004 | 13 | Sprint 1-2 |
| US2.5 – Admin Post Approval | STORY-005, 006, 007 | 8 | Sprint 1-2 |
| US6 – Responsive Design | STORY-008, 009 | 10 | Sprint 3-4 |
| US8 – SEO Optimization | STORY-010, 011, 012 | 11 | Sprint 3-4 |
| US5 – Search & Filter | STORY-013, 014, 015 | 18 | Sprint 5-6 |
| US7 – Dark Mode | STORY-016 | 5 | Sprint 4 |
| US9 – Performance | STORY-017, 018 | 10 | Sprint 7 |
| Phase 12 – Polish | STORY-019, 020 | 13 | Sprint 6-7 |

---

## Task Coverage Map

| Story | Tasks Covered |
|-------|--------------|
| STORY-001 | T032, T034 |
| STORY-002 | T046, T047, T048, T049 |
| STORY-003 | T037, T038 |
| STORY-004 | T053, T054 |
| STORY-005 | T064 |
| STORY-006 | T069, T070 |
| STORY-007 | T071, T072 |
| STORY-008 | T081, T082, T083, T084 |
| STORY-009 | T085, T086, T087, T088 |
| STORY-010 | T091, T092, T096, T098 |
| STORY-011 | T093, T094, T095 |
| STORY-012 | T097, T099, T100 |
| STORY-013 | T101, T102, T103, T104 |
| STORY-014 | T105, T106, T107, T108, T109, T110, T111, T112, T113 |
| STORY-015 | T114, T115, T116, T117 |
| STORY-016 | T120, T121, T122, T123, T124, T125 |
| STORY-017 | T126, T129, T130, T131, T132 |
| STORY-018 | T133, T134, T135, T136, T137 |
| STORY-019 | T139, T140, T141, T142, T143, T144 |
| STORY-020 | T145, T146, T147, T148, T149 |

**All 77 remaining tasks are covered. No orphaned tasks.**

---

## Risks and Mitigation

**High:**
- Cloudflare Workers 3MB gzip limit — monitor bundle size after adding search/filter UI (Sprint 5). Mitigation: lazy-load search components, use `shiki/core` bundle
- Sprint 7 at full capacity — any spillover delays project. Mitigation: de-scope STORY-018 (benchmarking) if needed

**Medium:**
- PostgreSQL full-text search performance on Neon serverless — mitigation: test with realistic data volume, add GIN index
- Edit form reuse — may need significant refactoring from new-post form. Mitigation: budget extra time in Sprint 1 buffer

**Low:**
- Dark mode color issues across all routes — mitigation: systematic audit with checklist
- Social preview validation requires deployed site — mitigation: test on staging

---

## Definition of Done (Global)

For a story to be considered complete:
- [ ] Code implemented and committed
- [ ] Biome formatting and linting pass
- [ ] TypeScript strict mode — no type errors
- [ ] Tested manually on dev server
- [ ] Deployed to Cloudflare Workers (bundle <3MB gzip)
- [ ] Acceptance criteria validated

---

## Next Steps

**Immediate:** Begin Sprint 1

Run `/dev-story STORY-003` first (auth guards have no dependencies and unblock STORY-002).

**Sprint cadence:**
- Sprint length: 1 week (Monday–Friday)
- Sprint review: Friday EOD
- Sprint planning: Following Monday

---

**This plan was created using BMAD Method v6 — Phase 4 (Implementation Planning)**
