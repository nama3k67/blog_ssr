---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain-skipped", "step-06-innovation-skipped", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments:
  - "specs/001-portfolio-blog/research.md"
  - "specs/001-portfolio-blog/data-model.md"
  - "specs/001-portfolio-blog/contracts/api.md"
  - "specs/001-portfolio-blog/tasks.md"
  - "_bmad-output/planning-artifacts/sprint-plan-blog-app-2026-03-24.md"
  - ".claude/rules/design-system.md"
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 1
  brainstorming: 0
  projectDocs: 5
classification:
  projectType: "web-app"
  domain: "Developer Portfolio + Content Platform"
  complexity: "medium"
  projectContext: "brownfield"
---

# Product Requirements Document - blog app

**Author:** Nama3k67
**Date:** 2026-03-24

## Executive Summary

A bilingual (English/Vietnamese) developer portfolio and content platform deployed as an SSR web application on Cloudflare Workers. The platform serves a dual purpose: delivering polished blog content to readers while simultaneously demonstrating frontend-focused full-stack engineering excellence to recruiters, engineers, and technical reviewers. Built with TanStack Start + React 19, Drizzle ORM on Neon PostgreSQL, and a Spotlight-inspired design system (zinc/teal palette, shadcn/ui), the codebase itself is the primary portfolio artifact — every architectural decision, UI interaction, and development process choice is intentional and reviewable.

### What Makes This Special

The differentiator is depth of craft across the entire stack, not a single hero feature:
- **Unconventional edge deployment** — SSR on Cloudflare Workers (3MB gzip budget) instead of the typical Vercel/Next.js path, demonstrating constraint-driven architecture
- **Production bilingual content** — Real i18n with `$lang`-scoped routing and translation management, not a tutorial demo
- **AI-assisted development process** — Full BMAD Method v6 lifecycle (PRD → Architecture → Epics → Sprint Planning → Stories) visible in the repository, showcasing structured AI-human collaboration
- **UI/UX polish in the details** — Spotlight-inspired design system, Shiki code highlighting with fine-grained bundling, thoughtful micro-interactions, dark mode, and accessibility considerations
- **Content governance** — Post state machine (draft → pending → published → rejected) with env-var-based admin role, image uploads to R2

The blog *is* the portfolio. Reviewers should be impressed by the engineering before they read a single post.

## Project Classification

- **Type:** Web Application (SSR + SPA hybrid)
- **Domain:** Developer Portfolio + Content Platform
- **Complexity:** Medium — no regulated domain, but bilingual content management, Workers size constraints, serverless DB, and multi-surface UX (public readers + admin author) create meaningful architectural challenge
- **Context:** Brownfield — existing TanStack Start scaffolding, Drizzle schema, API contracts, and design system in place

## Success Criteria

### User Success

- **Portfolio reviewers** (recruiters, engineers): Impressed by UI/UX quality on first visit, navigate deeper within 10-15 seconds (time-to-engagement), explore projects and blog content, follow GitHub links to review codebase, recognize architectural decisions and AI-assisted development process
- **Blog readers**: Find individual posts high-quality and insightful, return for new content based on quality over quantity
- **Measurable signal**: Reviewer engagement leads to interview conversations; readers bookmark or share individual posts; contact CTA conversions tracked via Cloudflare Analytics

### Business Success

- **Phase 1 (Interview):** Platform is live, polished, and confidently shareable as a portfolio link — directly contributes to landing interviews. Contact CTA tracking confirms inbound interest originates from the platform
- **Phase 2 (Personal Brand):** Consistent content builds recognition in frontend/full-stack community
- **Phase 3 (Long-term):** Evolves into a personal hobby platform for writing and showcasing work

### Technical Success

Key targets (detailed in Web App Specific Requirements and Non-Functional Requirements):
- Lighthouse 90+ all categories | TTFB < 200ms | P95 < 500ms | Bundle < 3MB gzip
- Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- SSR all public pages | Bilingual en/vi with zero-shift toggle
- Cross-browser (Chrome, Firefox, Safari) | Responsive (375–1440px)

### Measurable Outcomes

| Metric | Target | How to measure |
|--------|--------|----------------|
| Lighthouse all categories | 90+ | Lighthouse CI or manual audit |
| TTFB | < 200ms | WebPageTest / Cloudflare Analytics |
| P95 response time | < 500ms | Cloudflare Analytics |
| Bundle gzip (total) | < 3MB | `wrangler deploy --dry-run --outdir bundled/` |
| Route chunk gzip (max) | < 500KB | Build output analysis |
| Core Web Vitals | Pass all 3 | Chrome UX Report / Web Vitals JS |
| Time-to-engagement | < 15s to first navigation | Cloudflare Analytics (page view paths) |
| Contact CTA conversions | Tracked | Cloudflare Analytics event tracking |
| Cross-browser | Chrome, Firefox, Safari pass | Manual + automated testing |
| Responsive breakpoints | 375/768/1024/1440px | Visual regression or manual QA |
| Language switch CLS | < 0.1 | CLS metric + manual toggle test |
| Blog post quality | Proofread, code-highlighted, bilingual | Editorial review per post |

## User Journeys

### Journey 1: Minh — The Recruiter Scanning for Talent

**Persona:** Minh, 34, technical recruiter at a mid-size tech company. Reviewing 20+ developer portfolios this week for a senior frontend role. Has 2 minutes per candidate before deciding "shortlist or skip."

**Opening Scene:** Minh clicks the portfolio link from a resume. The page loads instantly — SSR delivers a polished landing page with a Spotlight-inspired dark theme. GitHub stats are visible, the layout feels intentional, not template-generated. First thought: "This doesn't look like every other dev blog."

**Rising Action:** Minh navigates to Projects (< 10 seconds). Project cards show thumbnails, concise descriptions, and tech stack tags (TanStack Start, Cloudflare Workers, Drizzle ORM). She clicks one — the GitHub link opens clean, well-structured code. Back on the site, she skims a blog post — Shiki-highlighted code blocks, bilingual toggle, smooth dark mode. Every detail reinforces competence.

**Climax:** Minh opens the About page. Professional summary, skills visualization, and a clear contact CTA. She thinks: "This person built this entire platform — the architecture, the UI, the content. Not a template."

**Resolution:** Minh hits the contact CTA and adds the candidate to her shortlist. Total time on site: 90 seconds. The platform did its job — it communicated engineering quality faster than a resume ever could.

**Requirements revealed:** Instant SSR load, compelling Home with GitHub integration, visually rich Project cards, polished About page with CTA, seamless navigation between sections, mobile-responsive (recruiters browse on phones)

### Journey 2: David — The Developer Who Found a Blog Post

**Persona:** David, 28, mid-level frontend developer. Googled "TanStack Start Cloudflare Workers SSR" and landed on a blog post from this platform.

**Opening Scene:** David arrives on a blog post page via Google search. The page is server-rendered with proper meta tags — the search snippet matched his query perfectly. The post loads fast, code blocks are syntax-highlighted, and the layout is clean and readable.

**Rising Action:** David reads the post — it's well-structured with practical code examples. He notices the bilingual toggle (en/vi) and switches out of curiosity — the page updates without layout shift. He checks the post listing for more content. Only 5-6 posts, but each one is substantial and technical.

**Climax:** David finds a post about fine-grained Shiki bundling for Workers — exactly the problem he's facing. The code examples are copy-pasteable and the explanation is clear. He bookmarks it.

**Resolution:** David subscribes mentally — he'll check back. He notices the Projects page and realizes this blog is part of a larger portfolio platform. He explores the GitHub repo linked from a project card and stars it. The blog earned credibility through one high-quality post.

**Requirements revealed:** SEO-optimized SSR with meta tags, excellent code highlighting (Shiki), bilingual content without layout shift, post listing with clear navigation, quality over quantity content strategy, GitHub links from project context

### Journey 3: Nam — The Admin Writing a New Post

**Persona:** Nam (you), the sole author and admin. It's Sunday evening, and you want to publish a technical blog post in both English and Vietnamese.

**Opening Scene:** Nam signs in via Clerk on a protected route. The admin interface loads — clean, functional, no unnecessary complexity. He starts a new post in English: title, markdown content with code blocks, category selection, and a cover image.

**Rising Action:** Nam uploads a cover image — it goes to R2 via aws4fetch, returns a URL instantly. He writes the English content in markdown, previewing as he goes. The Shiki highlighter renders code blocks in real-time. Satisfied with the English version, he switches to the translation management view and writes the Vietnamese version.

**Climax:** Nam sets the post status to "pending" and reviews it one more time. Everything looks right — the bilingual content is consistent, the code blocks render correctly in both languages, the image displays properly. He approves it, moving status to "published."

**Edge case — error recovery:** Mid-upload, the R2 connection drops. The UI shows a clear error state with a retry button — no data is lost, the draft is auto-preserved. Nam retries the upload successfully. Later, he accidentally clicks "publish" on a draft that isn't ready — the state machine requires going through "pending" first, preventing accidental publication.

**Resolution:** The post is live in both languages within minutes. Nam checks the public view — SSR delivers it immediately, meta tags are populated for SEO, the bilingual toggle works. He shares the English URL on Twitter and the Vietnamese URL in a local dev community.

**Requirements revealed:** Clerk auth on protected routes, markdown editor with preview, R2 image upload with error handling, translation management UI, post state machine (draft → pending → published), auto-save/draft preservation, admin-only approval flow, bilingual URL generation

### Journey 4: Googlebot — The Search Engine Crawler

**Persona:** Googlebot, crawling the site to index content for search results.

**Opening Scene:** Googlebot hits the sitemap.xml — it lists all public pages across both language versions (`/en/posts/...`, `/vi/posts/...`). Each URL has proper `lastmod` timestamps.

**Rising Action:** Googlebot crawls a blog post page. The response is fully server-rendered HTML — no client-side rendering required. The `<head>` contains proper meta tags: `<title>`, `<meta description>`, Open Graph tags for social sharing, `hreflang` tags linking English and Vietnamese versions of the same post. Structured data (JSON-LD) marks up the article with author, date, and category.

**Climax:** Googlebot sees clean semantic HTML: proper heading hierarchy, `<article>` tags, `<code>` blocks, alt text on images. No hydration-dependent content — everything is in the initial HTML response.

**Resolution:** The post appears in Google search results with a rich snippet — title, description, date, and breadcrumb. The `hreflang` tags ensure Vietnamese users see the Vietnamese version and English users see the English version in search results.

**Requirements revealed:** SSR for all public pages, sitemap.xml generation, meta tags (title, description, OG), `hreflang` tags for bilingual SEO, JSON-LD structured data, semantic HTML, image alt text, clean URL structure

### Journey Requirements Summary

| Capability | Revealed by Journey |
|-----------|-------------------|
| SSR with instant load | Minh, David, Googlebot |
| Home page with GitHub integration | Minh |
| Project cards (thumbnail, description, tags, GitHub link) | Minh, David |
| About page with skills viz + contact CTA | Minh |
| Blog post with Shiki code highlighting | David, Nam |
| Bilingual content with zero-shift toggle | David, Nam |
| SEO meta tags, hreflang, structured data | David, Googlebot |
| Sitemap.xml generation | Googlebot |
| Clerk auth on protected routes | Nam |
| Markdown editor with preview | Nam |
| R2 image upload with error handling | Nam |
| Translation management UI | Nam |
| Post state machine + approval workflow | Nam |
| Draft auto-save / preservation | Nam |
| Responsive design (mobile recruiters) | Minh |
| Dark mode (Spotlight design system) | Minh, David |

## Web App Specific Requirements

### Project-Type Overview

SSR-first web application with client-side hydration (TanStack Start + React 19). Server-rendered for SEO and performance, with SPA-like navigation after initial load. Deployed to Cloudflare Workers edge network for global low-latency delivery.

### Browser Matrix

| Browser | Support Level | Notes |
|---------|--------------|-------|
| Chrome (latest 2) | Full | Primary development target |
| Firefox (latest 2) | Full | Second priority |
| Safari (latest 2) | Full | Critical — recruiters on Mac/iOS |
| Edge (Chromium) | Inherited | Chromium-based, no extra effort needed |
| IE / Legacy | None | Not supported |

Mobile browsers: Safari iOS and Chrome Android — both covered by responsive design and the desktop browser targets above.

### Responsive Design

| Breakpoint | Target | Priority |
|-----------|--------|----------|
| 375px | Mobile (iPhone SE/Mini) | High — recruiters browse on phones |
| 768px | Tablet / small laptop | Medium |
| 1024px | Laptop | High — primary viewing context |
| 1440px | Desktop / wide monitor | Medium |

Approach: Mobile-first CSS with Tailwind 4 breakpoints. All 4 pages (Home, Projects, Blogs, About) must be fully functional and visually polished at every breakpoint. No horizontal scroll, no truncated content, no broken layouts.

### SEO Strategy

- **SSR:** All public pages fully server-rendered — no client-side-only content
- **Meta tags:** `<title>`, `<meta description>`, Open Graph (og:title, og:description, og:image) on every page
- **Bilingual SEO:** `hreflang` tags linking `/en/...` and `/vi/...` equivalents; `<html lang="en|vi">` attribute
- **Structured data:** JSON-LD for blog posts (Article schema — author, datePublished, category) and person (About page)
- **Sitemap:** Auto-generated `sitemap.xml` covering all public routes in both languages with `lastmod` timestamps
- **Robots:** `robots.txt` allowing all public routes, blocking admin/protected routes
- **URL structure:** Clean, semantic slugs (`/en/posts/tanstack-start-workers-ssr`)

### Accessibility Level

**Target: WCAG 2.1 AA** — the standard for professional-quality web applications.

- **Keyboard navigation:** All interactive elements reachable and operable via keyboard; visible focus indicators (Spotlight design system already uses teal focus rings)
- **Screen readers:** Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`), proper heading hierarchy, ARIA labels where semantic HTML is insufficient
- **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text — zinc/teal palette verified against both light and dark mode
- **Focus management:** Focus trapped in modals, restored on close; skip-to-content link on every page
- **Images:** Alt text on all images; decorative images marked `aria-hidden`
- **Motion:** Respect `prefers-reduced-motion` for animations and transitions
- **Forms:** Labels associated with inputs, error messages linked via `aria-describedby`

### Performance Targets

- **TTFB:** < 200ms (Workers edge)
- **P95 response:** < 500ms (including Neon cold starts)
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle:** < 3MB total gzip; < 500KB per route chunk
- **Images:** Lazy-loaded below fold, served from R2 with proper cache headers
- **Code splitting:** Per-route via TanStack Start; heavy components (Shiki renderer) loaded via `React.lazy()` + Suspense

### Implementation Considerations

- **No real-time features for MVP** — Standard request-response. Admin editing is save-and-refresh, not live collaborative editing. Real-time preview of markdown is client-side only (no WebSocket needed).
- **Edge caching strategy:** Static assets cached aggressively via Workers; dynamic pages (post listings, individual posts) use stale-while-revalidate pattern where Cloudflare supports it
- **Hydration budget:** Minimize client-side JS shipped for public pages — SSR does the heavy lifting, hydration adds interactivity (language toggle, dark mode, navigation)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the minimum that demonstrates engineering craft and delivers a polished, usable portfolio + blog. Not a feature-complete CMS, but a curated showcase where every visible element is production-quality.

**Resource:** Solo developer. AI-assisted development via BMAD Method v6. No external team dependencies.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Minh (Recruiter) — full happy path: Home → Projects → Blog → About → Contact CTA
- David (Blog Reader) — full happy path: Google → Post → Explore → Bookmark
- Nam (Admin) — full happy path: Auth → Create post → Upload image → Translate → Publish
- Googlebot — full path: Sitemap → Crawl → Index → Rich snippets

**Must-Have Capabilities:**
- Home page with GitHub integration and personal intro
- Blog engine: post listing, individual posts, Shiki code highlighting, pagination
- Project cards with thumbnail, description, tech stack tags, GitHub links
- About page with professional profile, skills visualization, contact CTA
- Admin: Clerk auth, markdown editor with preview, R2 image upload, translation management
- Post state machine (draft → pending → published → rejected)
- Bilingual content (en/vi) with `$lang` routing
- Dark mode, responsive design (375–1440px), Spotlight design system
- SSR for all public pages, SEO meta tags, hreflang, sitemap.xml, JSON-LD
- Cloudflare Analytics (free, server-side)
- WCAG 2.1 AA accessibility

**Explicitly deferred from MVP:**
- Rich project detail pages (Growth)
- Full-text search (Growth)
- Categories & tags taxonomy (Growth)
- RSS feed (Growth)
- AI-powered features (Vision)
- Comments, newsletter, analytics dashboard (Vision)

### Post-MVP Features

**Phase 2 (Growth):**
- Rich project detail pages — architecture breakdowns, "how it was built," AI dev process showcase
- Dedicated portfolio page showing development methodology
- PostgreSQL full-text search across posts
- Categories & tags with filtered views
- RSS feed for subscribers

**Phase 3 (Vision):**
- AI-assisted translations and content suggestions
- Analytics dashboard with visitor insights
- Comment system for reader engagement
- Newsletter / email subscription

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Cloudflare Workers 3MB gzip limit breached | Deployment blocked | Monitor per-commit with `wrangler --dry-run`; Shiki fine-grained imports; React.lazy() for heavy components |
| Neon cold start latency spikes | P95 > 500ms | Connection pooling; cache frequently-read queries at edge; monitor via Cloudflare Analytics |
| Shiki bundle bloat from language imports | Chunk size exceeds budget | Only import languages actually used in blog posts; tree-shake via `shiki/core` + `shiki/engine/javascript` |

**Market Risks:**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Portfolio doesn't convert to interviews | Business goal unmet | Track contact CTA conversions; iterate on About page and project presentation based on feedback |
| Blog content not discoverable via search | No organic traffic | SEO strategy from day one (SSR, meta, hreflang, sitemap); write content targeting specific technical keywords |

**Resource Risks:**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Solo developer bandwidth | Slow progress | BMAD sprint planning keeps scope focused; AI-assisted development accelerates implementation; strict MVP boundary — no scope creep |
| Context switching between planning and coding | Loss of momentum | Complete full BMAD planning cycle before writing code; stories are self-contained with full context |

## Functional Requirements

### Content Management

- **FR1:** Author can create a new blog post with title, markdown content, and category
- **FR2:** Author can edit an existing blog post's content, title, and metadata
- **FR3:** Author can upload images to include in blog posts
- **FR4:** Author can preview markdown content with rendered code highlighting before publishing
- **FR5:** Author can save a post as draft without publishing
- **FR6:** Author can submit a draft for review by setting status to "pending"
- **FR7:** Admin can approve or reject pending posts, transitioning them to "published" or "rejected"
- **FR8:** Author can create and manage Vietnamese translations for each English post
- **FR9:** Author can delete posts (with confirmation)

### Content Display

- **FR10:** Visitors can browse a paginated list of published blog posts
- **FR11:** Visitors can read individual blog posts with syntax-highlighted code blocks
- **FR12:** Visitors can switch between English and Vietnamese versions of any content
- **FR13:** Visitors can view the Home page with personal introduction and GitHub information
- **FR14:** Visitors can browse project cards showing thumbnail, description, tech stack tags, and GitHub links
- **FR15:** Visitors can view the About page with professional profile, skills visualization, and contact CTA
- **FR16:** Visitors can navigate between all sections (Home, Blogs, Projects, About) from any page

### Appearance & Preferences

- **FR17:** Visitors can toggle between dark and light mode
- **FR18:** Visitors can switch the site language between English and Vietnamese
- **FR19:** The system preserves the visitor's language and theme preferences across page navigations

### Authentication & Authorization

- **FR20:** Author can sign in and sign out via Clerk authentication
- **FR21:** The system restricts admin/authoring routes to the authenticated admin user only
- **FR22:** Unauthenticated visitors can access all public pages without signing in

### Search Engine Optimization

- **FR23:** The system serves fully server-rendered HTML for all public pages
- **FR24:** The system generates meta tags (title, description, Open Graph) for every public page
- **FR25:** The system generates `hreflang` tags linking English and Vietnamese page equivalents
- **FR26:** The system generates a sitemap.xml covering all public routes in both languages
- **FR27:** The system outputs structured data (JSON-LD) for blog posts and the About page
- **FR28:** The system serves a robots.txt that allows public routes and blocks protected routes

### Image Management

- **FR29:** Author can upload images to cloud storage (R2) from the post editor
- **FR30:** The system displays uploaded images with lazy loading for below-fold content
- **FR31:** The system serves images with appropriate cache headers

### Analytics & Tracking

- **FR32:** The system tracks page views and navigation paths via server-side analytics
- **FR33:** The system tracks contact CTA interactions for conversion measurement

## Non-Functional Requirements

### Performance

- **NFR1:** Public pages load with TTFB < 200ms from Cloudflare edge
- **NFR2:** P95 server response time < 500ms including Neon cold starts
- **NFR3:** Lighthouse Performance score ≥ 90 on all public pages
- **NFR4:** Core Web Vitals pass: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **NFR5:** Total bundle size stays under 3MB gzip; no single route chunk exceeds 500KB gzip
- **NFR6:** Language switch completes without visible layout shift (CLS < 0.1 during toggle)
- **NFR7:** Images lazy-load below the fold with no impact on LCP for above-fold content

### Security

- **NFR8:** All traffic served over HTTPS (enforced by Cloudflare)
- **NFR9:** Admin routes inaccessible without valid Clerk authentication — return 401/redirect
- **NFR10:** R2 upload endpoint validates file type and size server-side before accepting
- **NFR11:** User input sanitized in markdown rendering to prevent XSS via injected HTML/scripts
- **NFR12:** Environment secrets (ADMIN_USER_ID, database URL, R2 credentials) never exposed to client bundles

### Accessibility

- **NFR13:** All public pages meet WCAG 2.1 AA compliance
- **NFR14:** All interactive elements operable via keyboard with visible focus indicators
- **NFR15:** Color contrast meets minimum 4.5:1 (normal text) and 3:1 (large text) in both light and dark mode
- **NFR16:** Animations and transitions respect `prefers-reduced-motion` media query
- **NFR17:** Screen reader navigation supported via semantic HTML and ARIA where needed

### Integration Reliability

- **NFR18:** R2 image upload failures display a clear error state with retry capability — no data loss
- **NFR19:** Neon database connection failures on post creation preserve draft content client-side
- **NFR20:** Clerk authentication failures redirect gracefully to sign-in — no broken UI states
- **NFR21:** Cloudflare Analytics operates server-side with zero client JS overhead

### Maintainability

- **NFR22:** TypeScript strict mode enforced across the entire codebase
- **NFR23:** Biome formatting and linting pass on all committed code
- **NFR24:** Drizzle migrations are versioned and reversible
- **NFR25:** Bundle size monitored on every build via `wrangler --dry-run` output
