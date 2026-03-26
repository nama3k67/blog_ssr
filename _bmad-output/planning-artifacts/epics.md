---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - ".claude/rules/design-system.md"
  - "specs/001-portfolio-blog/data-model.md"
  - "specs/001-portfolio-blog/contracts/api.md"
  - "specs/001-portfolio-blog/research.md"
---

# blog app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for blog app, decomposing the requirements from the PRD, Architecture, and Design System into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Author can create a new blog post with title, markdown content, and category
FR2: Author can edit an existing blog post's content, title, and metadata
FR3: Author can upload images to include in blog posts
FR4: Author can preview markdown content with rendered code highlighting before publishing
FR5: Author can save a post as draft without publishing
FR6: Author can directly publish a post (simplified from approval workflow per Architecture scope change: draft -> published)
FR7: Admin can manage all posts (edit, delete, publish/unpublish any post)
FR8: Author can create and manage Vietnamese translations for each English post
FR9: Author can delete posts (with confirmation)
FR10: Visitors can browse a paginated list of published blog posts
FR11: Visitors can read individual blog posts with syntax-highlighted code blocks
FR12: Visitors can switch between English and Vietnamese versions of any content
FR13: Visitors can view the Home page with personal introduction and GitHub information
FR14: Visitors can browse project cards showing thumbnail, description, tech stack tags, and GitHub links
FR15: Visitors can view the About page with professional profile, skills visualization, and contact CTA
FR16: Visitors can navigate between all sections (Home, Blogs, Projects, About) from any page
FR17: Visitors can toggle between dark and light mode
FR18: Visitors can switch the site language between English and Vietnamese
FR19: The system preserves the visitor's language and theme preferences across page navigations
FR20: Author can sign in and sign out via Clerk authentication
FR21: The system restricts admin/authoring routes to the authenticated admin user only
FR22: Unauthenticated visitors can access all public pages without signing in
FR23: The system serves fully server-rendered HTML for all public pages
FR24: The system generates meta tags (title, description, Open Graph) for every public page
FR25: The system generates hreflang tags linking English and Vietnamese page equivalents
FR26: The system generates a sitemap.xml covering all public routes in both languages
FR27: The system outputs structured data (JSON-LD) for blog posts and the About page
FR28: The system serves a robots.txt that allows public routes and blocks protected routes
FR29: Author can upload images to cloud storage (R2) from the post editor
FR30: The system displays uploaded images with lazy loading for below-fold content
FR31: The system serves images with appropriate cache headers
FR32: The system tracks page views and navigation paths via server-side analytics
FR33: The system tracks contact CTA interactions for conversion measurement

### NonFunctional Requirements

NFR1: Public pages load with TTFB < 200ms from Cloudflare edge
NFR2: P95 server response time < 500ms including Neon cold starts
NFR3: Lighthouse Performance score >= 90 on all public pages
NFR4: Core Web Vitals pass: LCP < 2.5s, FID < 100ms, CLS < 0.1
NFR5: Total bundle size stays under 3MB gzip; no single route chunk exceeds 500KB gzip
NFR6: Language switch completes without visible layout shift (CLS < 0.1 during toggle)
NFR7: Images lazy-load below the fold with no impact on LCP for above-fold content
NFR8: All traffic served over HTTPS (enforced by Cloudflare)
NFR9: Admin routes inaccessible without valid Clerk authentication — return 401/redirect
NFR10: R2 upload endpoint validates file type and size server-side before accepting
NFR11: User input sanitized in markdown rendering to prevent XSS via injected HTML/scripts
NFR12: Environment secrets (ADMIN_USER_ID, database URL, R2 credentials) never exposed to client bundles
NFR13: All public pages meet WCAG 2.1 AA compliance
NFR14: All interactive elements operable via keyboard with visible focus indicators
NFR15: Color contrast meets minimum 4.5:1 (normal text) and 3:1 (large text) in both light and dark mode
NFR16: Animations and transitions respect prefers-reduced-motion media query
NFR17: Screen reader navigation supported via semantic HTML and ARIA where needed
NFR18: R2 image upload failures display a clear error state with retry capability — no data loss
NFR19: Neon database connection failures on post creation preserve draft content client-side
NFR20: Clerk authentication failures redirect gracefully to sign-in — no broken UI states
NFR21: Cloudflare Analytics operates server-side with zero client JS overhead
NFR22: TypeScript strict mode enforced across the entire codebase
NFR23: Biome formatting and linting pass on all committed code
NFR24: Drizzle migrations are versioned and reversible
NFR25: Bundle size monitored on every build via wrangler --dry-run output

### Additional Requirements

- Post lifecycle simplified to draft -> published for MVP (Architecture scope change from PRD's draft -> pending -> published -> rejected)
- withAdmin() utility wrapper must be created for server function authorization
- queryKeys.ts factory must be created for TanStack Query key management
- Error handling: server functions throw error codes, UI maps to localized messages via $lang
- API responses follow consistent formats: ListResponse<T> for lists, direct T for singles
- Shiki code highlighting must be client-only with React.lazy() + Suspense (no SSR)
- Admin editor (@uiw/react-md-editor) must be code-split from public bundle
- Image upload validation: reject >500KB or >2000px width, MIME + magic bytes check
- All dependencies must be audited for Cloudflare Workers compatibility (no Node.js APIs)
- Dependency additions require bundle size check via wrangler deploy --outdir bundled/ --dry-run
- SSR safety: no window/document/localStorage access during render — useEffect only
- Both en.ts and vi.ts locale files must be updated for every user-facing string
- Database queries must live in server/db/queries/ — never inline in server functions
- admin/queue.tsx should be repurposed as post management dashboard (approval workflow removed)

### UX Design Requirements

No dedicated UX Design document. Design system rules from .claude/rules/design-system.md serve as the visual specification:

UX-DR1: All neutral colors must use zinc scale only (never gray, slate, stone, neutral)
UX-DR2: All accent/interactive colors must use teal scale only (never blue, indigo, green)
UX-DR3: Every visual element must have dark: variant — page bg zinc-50/black, content bg white/zinc-900, headings zinc-800/zinc-100, body zinc-600/zinc-400
UX-DR4: Glass morphism pattern (bg-white/90, backdrop-blur-sm, shadow-lg, ring-1) applied to nav/header floating elements
UX-DR5: Card hover ghost pattern (absolute inset, scale-95->100, opacity-0->100) on blog post cards
UX-DR6: Container hierarchy must use ContainerOuter > ContainerInner system (max-w-7xl outer, max-w-2xl/5xl inner)
UX-DR7: Spotlight page background pattern with fixed inset-0 content area ring
UX-DR8: Typography scale follows Spotlight custom sizes (text-xs 0.8125rem through text-5xl 3rem)
UX-DR9: Page titles use text-4xl sm:text-5xl font-bold tracking-tight; body text-base text-zinc-600 dark:text-zinc-400
UX-DR10: Buttons follow primary (bg-zinc-800/zinc-700) and secondary (bg-zinc-50/zinc-800/50) patterns
UX-DR11: Form inputs use shadow-md, outline-zinc-900/10, focus:ring-teal-500/10 pattern
UX-DR12: Links use hover:text-teal-500 dark:hover:text-teal-400; active nav uses teal with gradient underline
UX-DR13: Prose/article content uses prose dark:prose-invert with custom typography.ts config
UX-DR14: Spacing rhythm: page top mt-16 sm:mt-32, content after header mt-16 sm:mt-20, footer mt-32
UX-DR15: Border radius convention: nav pill rounded-full, cards rounded-2xl, buttons rounded-md, images rounded-2xl/3xl
UX-DR16: All icon-only buttons have aria-label, decorative SVGs have aria-hidden="true", sr-only text where needed
UX-DR17: Mobile-first CSS (default mobile, sm:/md:/lg: for larger), responsive at 375/768/1024/1440px breakpoints

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 4 | Create blog post |
| FR2 | Epic 4 | Edit blog post |
| FR3 | Epic 4 | Upload images |
| FR4 | Epic 4 | Preview markdown with code highlighting |
| FR5 | Epic 4 | Save as draft |
| FR6 | Epic 4 | Publish post (draft->published) |
| FR7 | Epic 4 | Admin manage all posts |
| FR8 | Epic 4 | Create/manage translations |
| FR9 | Epic 4 | Delete posts |
| FR10 | Epic 3 | Paginated post listing |
| FR11 | Epic 3 | Read posts with syntax highlighting |
| FR12 | Epic 3 | Switch between en/vi content |
| FR13 | Epic 2 | Home page with GitHub info |
| FR14 | Epic 2 | Project cards |
| FR15 | Epic 2 | About page with CTA |
| FR16 | Epic 1 | Site navigation |
| FR17 | Epic 1 | Dark/light mode toggle |
| FR18 | Epic 1 | Language switch |
| FR19 | Epic 1 | Persist preferences |
| FR20 | Epic 1 | Clerk sign in/out |
| FR21 | Epic 1 | Admin route restriction |
| FR22 | Epic 1 | Public access |
| FR23 | Epic 1 | SSR for public pages |
| FR24 | Epic 3 | Meta tags per page |
| FR25 | Epic 3 | hreflang tags |
| FR26 | Epic 5 | Sitemap.xml |
| FR27 | Epic 5 | JSON-LD structured data |
| FR28 | Epic 5 | robots.txt |
| FR29 | Epic 4 | R2 image upload |
| FR30 | Epic 3 | Image lazy loading |
| FR31 | Epic 4 | Image cache headers |
| FR32 | Epic 5 | Page view tracking |
| FR33 | Epic 5 | CTA conversion tracking |

## Epic List

### Epic 1: Site Foundation & Navigation
Visitors arrive at a polished, responsive site with dark/light mode, bilingual support, and seamless navigation. Admin can sign in to protected routes. This is the shell that enables everything else: layout (Container system, Spotlight background), i18n routing ($lang), theme provider, Clerk auth boundary, SSR.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

### Epic 2: Portfolio & Landing Pages
Recruiters can explore Home, Projects, and About pages — forming an impression of engineering quality within 90 seconds. Standalone showcase pages with personal intro, GitHub info, project cards with thumbnails/tags/links, and About with skills visualization and contact CTA.
**FRs covered:** FR13, FR14, FR15

### Epic 3: Blog Reading Experience
Visitors can browse published posts, read articles with syntax-highlighted code blocks, and switch between English/Vietnamese versions. Post listing with pagination, post detail with Shiki code highlighting (lazy-loaded), bilingual content toggle with language fallback, per-page meta tags + hreflang, image lazy loading.
**FRs covered:** FR10, FR11, FR12, FR24, FR25, FR30

### Epic 4: Content Authoring & Management
Admin can create, edit, preview, upload images, translate, and publish blog posts from a protected admin interface. Markdown editor with preview, R2 image upload with validation and error handling, post CRUD (draft->published), translation management, post management dashboard, delete with confirmation.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR29, FR31

### Epic 5: SEO & Discoverability
Search engines can crawl, index, and display rich snippets for all content. Author can track engagement. Sitemap.xml generation (both languages), JSON-LD structured data, robots.txt, Cloudflare Analytics integration, CTA conversion tracking.
**FRs covered:** FR26, FR27, FR28, FR32, FR33

---

## Epic 1: Site Foundation & Navigation

Visitors arrive at a polished, responsive site with dark/light mode, bilingual support, and seamless navigation. Admin can sign in to protected routes. This is the shell that enables everything else: layout (Container system, Spotlight background), i18n routing ($lang), theme provider, Clerk auth boundary, SSR.

### Story 1.1: Root Layout, Providers & Design System Shell

As a visitor,
I want the site to load with a polished, consistent visual shell and server-rendered HTML,
So that I get an instant, professional first impression regardless of which page I land on.

**Acceptance Criteria:**

**Given** a visitor requests any public page
**When** the server responds
**Then** the HTML is fully server-rendered (no client-only content gates)
**And** the response includes the Spotlight background pattern (fixed inset-0 content area with bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20)

**Given** the root layout renders
**When** the page loads
**Then** ThemeProvider, I18nProvider, and QueryClientProvider are mounted in __root.tsx
**And** the Container system (ContainerOuter > ContainerInner) is available for all child routes
**And** global styles (styles.css with Tailwind imports) and typography config (typography.ts) are applied

**Given** any page renders
**When** the visitor scrolls to the bottom
**Then** a Footer component is visible with navigation links and social icons
**And** the footer uses the design system spacing (mt-32) and zinc/teal color palette

**Given** the page renders on any viewport
**When** inspecting the CSS
**Then** only zinc and teal color families are used (UX-DR1, UX-DR2)
**And** all visual elements have dark: variants (UX-DR3)
**And** spacing follows the rhythm: page top mt-16 sm:mt-32, content after header mt-16 sm:mt-20 (UX-DR14)

### Story 1.2: Responsive Navigation

As a visitor,
I want a clear, responsive navigation bar to move between all sections,
So that I can explore Home, Blog, Projects, and About from any page.

**Acceptance Criteria:**

**Given** a visitor is on any page at desktop viewport (>=1024px)
**When** the page renders
**Then** a horizontal navigation bar is visible with links to Home, Blog, Projects, and About
**And** the header uses glass morphism (bg-white/90 dark:bg-zinc-800/90, backdrop-blur-sm, shadow-lg, ring-1) (UX-DR4)
**And** the nav pill uses rounded-full border radius (UX-DR15)

**Given** a visitor is on any page at mobile viewport (<768px)
**When** the page renders
**Then** a hamburger menu icon is visible
**And** tapping the hamburger opens a mobile navigation menu with all section links
**And** the mobile menu can be closed by tapping the icon again or outside the menu

**Given** a visitor is currently viewing a section (e.g., /en/posts)
**When** the navigation renders
**Then** the active section link is highlighted with teal color and gradient underline (UX-DR12)

**Given** a visitor uses keyboard navigation
**When** tabbing through the navigation
**Then** all nav items receive visible focus indicators
**And** all interactive elements are reachable via Tab key (NFR14)
**And** icon-only buttons have aria-label attributes (UX-DR16)

**Given** a visitor on a 375px viewport
**When** the navigation renders
**Then** no horizontal scroll occurs and no content is truncated (UX-DR17)

### Story 1.3: Dark/Light Mode Toggle

As a visitor,
I want to toggle between dark and light mode,
So that I can read content comfortably in any lighting condition.

**Acceptance Criteria:**

**Given** a visitor lands on the site for the first time
**When** the page renders
**Then** the theme matches the system preference (prefers-color-scheme)
**And** browser APIs for system preference are only accessed in useEffect (SSR safety)

**Given** a visitor clicks the theme toggle
**When** the mode switches
**Then** all visual elements update immediately (backgrounds, text, borders, rings)
**And** page bg changes zinc-50 <-> black, content bg white <-> zinc-900, headings zinc-800 <-> zinc-100 (UX-DR3)
**And** no layout shift occurs during the transition (CLS < 0.1)

**Given** a visitor has toggled to dark mode
**When** they navigate to another page or refresh the browser
**Then** the dark mode preference is preserved via localStorage
**And** no flash of wrong theme occurs on page load (FR19)

**Given** a visitor has prefers-reduced-motion enabled
**When** the theme toggles
**Then** transitions are suppressed (NFR16)

### Story 1.4: Bilingual Routing & Language Switch

As a visitor,
I want to switch between English and Vietnamese,
So that I can read the site in my preferred language.

**Acceptance Criteria:**

**Given** a visitor navigates to the root URL (/)
**When** the page loads
**Then** they are redirected to /$lang based on stored preference or default (en)

**Given** a visitor is on /en/posts
**When** they click the language switcher
**Then** the URL updates to /vi/posts (same path, different $lang prefix)
**And** all UI strings update to Vietnamese via the useTranslation hook
**And** no layout shift occurs during the switch (NFR6, CLS < 0.1)

**Given** a visitor switches to Vietnamese
**When** they navigate to other pages
**Then** the $lang prefix remains vi across all navigations (FR19)
**And** the language preference is persisted for future visits

**Given** a visitor navigates to an invalid $lang (e.g., /fr/posts)
**When** the route resolves
**Then** the visitor is redirected to the default language (/en/posts)

**Given** the locale files (en.ts, vi.ts)
**When** any UI string is rendered
**Then** it uses the t() function from useTranslation — no hardcoded text in JSX
**And** both en.ts and vi.ts contain entries for all base navigation and layout strings

### Story 1.5: Authentication & Admin Route Protection

As the admin,
I want to sign in via Clerk and access protected routes,
So that I can manage content while keeping admin pages secure from public visitors.

**Acceptance Criteria:**

**Given** an unauthenticated visitor navigates to any public page (/$lang, /$lang/posts, etc.)
**When** the page renders
**Then** the page loads normally without any auth requirements (FR22)

**Given** an unauthenticated visitor navigates to a protected route (/$lang/_protected/*)
**When** the _protected layout's beforeLoad runs
**Then** the visitor is redirected to the login page (/$lang/login) (NFR9)
**And** no broken UI state is displayed (NFR20)

**Given** the admin navigates to /$lang/login
**When** the page renders
**Then** a Clerk sign-in component is displayed
**And** after successful authentication, the admin is redirected back to the intended protected route

**Given** the admin is signed in
**When** they access a protected route
**Then** the page loads successfully
**And** the auth state is available via Clerk's context

**Given** a withAdmin() wrapper is applied to a server function
**When** a non-admin authenticated user calls that function
**Then** an UNAUTHORIZED error code is thrown
**And** the error is handled gracefully in the UI (toast or redirect)

**Given** the admin clicks sign out
**When** the sign-out completes
**Then** they are redirected to the public home page
**And** protected routes are no longer accessible

**Given** environment secrets (ADMIN_USER_ID, database URL, R2 credentials)
**When** the client bundle is built
**Then** none of these values are present in client-side JavaScript (NFR12)

---

## Epic 2: Portfolio & Landing Pages

Recruiters can explore Home, Projects, and About pages — forming an impression of engineering quality within 90 seconds. Standalone showcase pages with personal intro, GitHub info, project cards with thumbnails/tags/links, and About with skills visualization and contact CTA.

### Story 2.1: Home Page

As a recruiter or visitor,
I want to see a compelling landing page with a personal introduction and GitHub information,
So that I immediately understand who the author is and their engineering capabilities.

**Acceptance Criteria:**

**Given** a visitor navigates to /$lang
**When** the Home page renders
**Then** a personal introduction section is displayed with the author's name, role, and a brief bio
**And** GitHub information is visible (profile link, key stats or project highlights)
**And** the page is fully server-rendered with proper HTML structure

**Given** the Home page renders
**When** inspecting the layout
**Then** the page title uses text-4xl sm:text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 (UX-DR9)
**And** body text uses text-base text-zinc-600 dark:text-zinc-400 (UX-DR9)
**And** the Container system is used for layout (UX-DR6)
**And** page top spacing is mt-16 sm:mt-32 (UX-DR14)

**Given** a visitor on a 375px mobile viewport
**When** the Home page renders
**Then** all content is fully visible without horizontal scroll
**And** the layout adapts gracefully across 375/768/1024/1440px breakpoints (UX-DR17)

**Given** the Home page in dark mode
**When** comparing to light mode
**Then** all elements have proper dark: variants (UX-DR3)

**Given** a visitor views the Home page
**When** they want to explore further
**Then** clear navigation or CTAs guide them to Projects, Blog, or About sections

### Story 2.2: Projects Page

As a recruiter or visitor,
I want to browse project cards showing what the author has built,
So that I can assess their technical range and click through to source code.

**Acceptance Criteria:**

**Given** a visitor navigates to /$lang/projects
**When** the page renders
**Then** a page title and introduction describe the projects section
**And** project cards are displayed in a grid or list layout

**Given** each project card
**When** it renders
**Then** it shows a thumbnail image, project title, concise description, and tech stack tags (e.g., "TanStack Start", "Cloudflare Workers")
**And** a GitHub link is visible and clickable, opening in a new tab
**And** the card uses the group relative flex pattern from the design system

**Given** a visitor hovers over a project card (desktop)
**When** the cursor enters the card area
**Then** the card hover ghost pattern activates (absolute inset, scale-95->100, opacity-0->100, bg-zinc-50 dark:bg-zinc-800/50) (UX-DR5)

**Given** a visitor on mobile
**When** viewing project cards
**Then** cards stack vertically and remain fully readable
**And** thumbnails resize appropriately without cropping key content

**Given** project data
**When** rendering the page
**Then** all user-facing strings use t() for bilingual support
**And** both en.ts and vi.ts contain entries for project titles, descriptions, and UI labels

### Story 2.3: About Page with Contact CTA

As a recruiter,
I want to view the author's professional profile with skills and a clear way to get in touch,
So that I can evaluate their fit and reach out directly.

**Acceptance Criteria:**

**Given** a visitor navigates to /$lang/about
**When** the page renders
**Then** a professional summary section displays the author's background and expertise
**And** a skills visualization shows key technical competencies (e.g., grouped by category or proficiency)
**And** a contact CTA is prominently visible

**Given** the contact CTA
**When** a visitor views it
**Then** it uses the primary button pattern (bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600, rounded-md) (UX-DR10)
**And** the CTA links to an appropriate contact method (email, form, or external link)
**And** the CTA is keyboard-accessible with visible focus indicator (NFR14)

**Given** the About page on mobile (375px)
**When** the page renders
**Then** the skills visualization adapts to a single-column layout
**And** the contact CTA remains prominently visible without scrolling past the fold

**Given** the About page in both languages
**When** switching between en and vi
**Then** all text content (bio, skills labels, CTA text) updates to the selected language via t()
**And** no layout shift occurs during the language switch

**Given** the About page renders
**When** inspecting accessibility
**Then** semantic HTML is used (article, section, heading hierarchy)
**And** the page meets WCAG 2.1 AA contrast requirements in both light and dark mode (NFR15)

---

## Epic 3: Blog Reading Experience

Visitors can browse published posts, read articles with syntax-highlighted code blocks, and switch between English/Vietnamese versions. Post listing with pagination, post detail with Shiki code highlighting (lazy-loaded), bilingual content toggle with language fallback, per-page meta tags + hreflang, image lazy loading.

### Story 3.1: Blog Post Listing with Pagination

> **Note:** This story requires the database schema and seed data from Epic 4 Story 4.1 OR manual db:seed to have sample posts for display. If Epic 3 is implemented before Epic 4, run db:seed to populate test data.

As a visitor,
I want to browse a paginated list of published blog posts,
So that I can discover content and find articles that interest me.

**Acceptance Criteria:**

**Given** a visitor navigates to /$lang/posts
**When** the page renders
**Then** a list of published posts is displayed, ordered by publishedAt descending
**And** each post card shows title, description/excerpt, publication date, category, and featured image (if present)
**And** the queryKeys factory (shared/utils/queryKeys.ts) is used for all TanStack Query keys

**Given** more than 10 published posts exist
**When** the visitor views the post listing
**Then** pagination controls are visible (page numbers or next/previous)
**And** clicking a page loads the next set of posts without full page reload
**And** the URL reflects the current page state

**Given** the post listing renders
**When** hovering over a post card (desktop)
**Then** the card hover ghost pattern activates (UX-DR5)
**And** a "Read article" CTA with teal text and ChevronRight icon is visible

**Given** the post listing on mobile (375px)
**When** the page renders
**Then** post cards stack vertically in a readable single-column layout
**And** date decorators use the eyebrow pattern (text-sm text-zinc-400 dark:text-zinc-500) (UX-DR8)

**Given** no published posts exist for the current language
**When** the page renders
**Then** an empty state message is displayed using t() (bilingual)

**Given** the fetchPostsList server function
**When** it executes
**Then** it returns data matching the ListResponse format ({ data, pagination })
**And** only posts with status "published" and matching lang are returned
**And** DB queries live in server/db/queries/ (not inline)

### Story 3.2: Blog Post Detail with Markdown Rendering

As a visitor,
I want to read a full blog post with syntax-highlighted code blocks,
So that I can learn from well-formatted technical content.

**Acceptance Criteria:**

**Given** a visitor navigates to /$lang/posts/$slug
**When** the page renders
**Then** the full post is displayed: title, author info, publication date, category, tags, featured image, and markdown content
**And** the page is server-rendered with the markdown content in the initial HTML

**Given** the post contains code blocks
**When** the page hydrates on the client
**Then** Shiki syntax highlighting is applied via React.lazy() + Suspense (progressive enhancement)
**And** before hydration, code blocks display as plain <pre><code> (readable without JS)
**And** Shiki uses fine-grained imports only (shiki/core + shiki/engine/javascript, never bare shiki) (NFR5)
**And** the Shiki chunk does not exceed 500KB gzip

**Given** the post contains user-submitted markdown
**When** rendering via react-markdown + rehype-raw + remark-gfm
**Then** HTML/script injection is sanitized to prevent XSS (NFR11)

**Given** the post has a featured image
**When** the image is below the fold
**Then** it lazy-loads (loading="lazy") with no impact on LCP (NFR7, FR30)
**And** images use rounded-2xl or rounded-3xl border radius (UX-DR15)

**Given** the article content section
**When** it renders
**Then** it uses prose dark:prose-invert class with custom typography.ts config (UX-DR13)
**And** code blocks use rounded-3xl border radius (UX-DR15)

**Given** a visitor navigates to a slug that does not exist
**When** the fetchPost server function runs
**Then** a NOT_FOUND error is thrown
**And** the route errorComponent displays a user-friendly 404 message (bilingual via t())

### Story 3.3: Bilingual Content & SEO Meta Tags

As a visitor,
I want to switch between English and Vietnamese versions of a blog post,
So that I can read content in my preferred language.

As a search engine,
I want proper meta tags and hreflang attributes,
So that I can index and display the correct language version in search results.

**Acceptance Criteria:**

**Given** a visitor is reading a post at /en/posts/my-post
**When** a Vietnamese translation exists
**Then** the language switcher indicates the translation is available
**And** clicking it navigates to /vi/posts/my-post

**Given** a visitor requests /vi/posts/my-post
**When** no Vietnamese translation exists but an English version does
**Then** the English version is displayed with a fallback banner (e.g., "This post is only available in English")
**And** the fetchPost response includes isFallback: true and originalLang: "en"

**Given** any public page renders
**When** the HTML <head> is generated
**Then** it includes <title> with the page/post title
**And** <meta name="description"> with the post description or page summary
**And** Open Graph tags (og:title, og:description, og:image) for social sharing (FR24)

**Given** a blog post exists in both English and Vietnamese
**When** either version renders
**Then** the <head> includes hreflang tags linking both language versions (FR25)
**And** <html lang="en|vi"> is set correctly based on the current $lang

**Given** a public page (home, about, projects, post listing)
**When** the page renders
**Then** it includes appropriate meta tags (title, description, OG) for that specific page
**And** hreflang tags link the /en/ and /vi/ equivalents

**Given** a post with images
**When** images render
**Then** img tags include alt text for accessibility (NFR17)
**And** decorative images are marked aria-hidden="true" (UX-DR16)

---

## Epic 4: Content Authoring & Management

Admin can create, edit, preview, upload images, translate, and publish blog posts from a protected admin interface. Markdown editor with preview, R2 image upload with validation and error handling, post CRUD (draft->published), translation management, post management dashboard, delete with confirmation.

### Story 4.1: Database Schema & Create Blog Post (Draft)

As the admin,
I want to create a new blog post with title, content, and metadata,
So that I can start writing and save drafts before publishing.

**Acceptance Criteria:**

**Given** the database schema does not yet include blog tables
**When** this story is implemented
**Then** Drizzle schema files are created for posts, categories, tags, and post_tags tables (per data-model.md)
**And** migrations are generated (db:generate) and applied (db:push)
**And** seed data (db:seed) includes at least 3 sample categories

**Given** the admin navigates to /$lang/_protected/new
**When** the page renders
**Then** a post creation form is displayed with fields: title, slug (auto-generated from title), language selector (en/vi), content (basic textarea — upgraded to markdown editor in Story 4.2), description, and category selector
**And** the form uses TanStack Form with Zod validation (createPostSchema)

**Given** the admin fills in the title field
**When** they type a title
**Then** a slug is auto-generated from the title (lowercase, hyphenated)
**And** the slug can be manually overridden

**Given** the admin fills in all required fields (title, content, lang)
**When** they click "Save Draft"
**Then** createPostFn is called with the form data
**And** the post is saved with status "draft"
**And** a success toast is shown (via sonner)
**And** the admin is redirected to the post edit view or dashboard

**Given** the admin submits a post with a slug that already exists for that language
**When** createPostFn runs
**Then** a SLUG_TAKEN error is thrown
**And** the UI shows an inline error on the slug field (bilingual via t())

**Given** the admin submits invalid data (empty title, empty content)
**When** Zod validation runs
**Then** inline validation errors are displayed on the relevant fields
**And** error messages use t() for bilingual support

**Given** the form inputs
**When** they render
**Then** they follow the design system pattern: shadow-md, outline-zinc-900/10, focus:ring-teal-500/10 (UX-DR11)
**And** form fields use space-y-6 gap (UX-DR14)

**Given** the createPostFn server function
**When** it executes
**Then** it is wrapped with withAdmin() for authorization
**And** the DB query lives in server/db/queries/ (not inline)
**And** errors are thrown as error codes (not user-facing strings)

### Story 4.2: Markdown Editor with Live Preview

As the admin,
I want a markdown editor with live preview and code highlighting,
So that I can see how my post will look before publishing.

**Acceptance Criteria:**

**Given** the admin is on the post creation or edit form
**When** the editor component loads
**Then** @uiw/react-md-editor is rendered with a split view (editor + preview)
**And** the editor is loaded via React.lazy() + Suspense (code-split from public bundle)
**And** a loading skeleton is shown while the editor chunk loads

**Given** the admin types markdown in the editor
**When** the content updates
**Then** the preview pane renders the markdown in real-time
**And** code blocks in the preview show syntax highlighting

**Given** the editor component
**When** inspecting the production bundle
**Then** @uiw/react-md-editor is NOT included in any public route chunk
**And** it only loads on _protected/ routes (bundle boundary enforcement)

**Given** the admin is editing on a mobile device
**When** the editor renders
**Then** the editor adapts to a stacked layout (editor above, preview below or toggled)

**Given** the markdown preview
**When** rendering content
**Then** it uses prose dark:prose-invert styling consistent with the public post display (UX-DR13)

### Story 4.3: Image Upload to R2

As the admin,
I want to upload images from the post editor,
So that I can include visuals in my blog posts.

**Acceptance Criteria:**

**Given** the admin is in the post editor
**When** they click an upload button or drag an image into the editor
**Then** a file picker opens or the drag is accepted
**And** only image files are selectable (image/jpeg, image/png, image/gif, image/webp)

**Given** the admin selects a valid image (<=500KB, <=2000px width)
**When** the upload starts
**Then** a progress indicator or loading state is shown
**And** the image is uploaded to R2 via the /api/upload endpoint using aws4fetch
**And** on success, the image URL is inserted into the post content (markdown image syntax)
**And** the response includes url, filename, and size

**Given** the admin selects an image >500KB or >2000px width
**When** server-side validation runs
**Then** the upload is rejected with a clear error message (FILE_TOO_LARGE or INVALID_FILE_TYPE)
**And** the error is displayed as a toast (NFR18)

**Given** the R2 upload fails (network error, R2 outage)
**When** the error occurs
**Then** a clear error state with a retry button is displayed
**And** no draft content is lost (NFR18, NFR19)

**Given** the upload endpoint validates the file
**When** checking the file
**Then** both MIME type and magic bytes are verified server-side (NFR10)
**And** the user must be authenticated to upload

**Given** successfully uploaded images
**When** they are served from R2
**Then** appropriate cache headers are set (FR31)
**And** the storage path follows uploads/{userId}/{uuid}.{ext}

### Story 4.4: Edit & Publish Posts

As the admin,
I want to edit existing posts and control their publication status,
So that I can refine content and make it publicly available when ready.

**Acceptance Criteria:**

**Given** the admin navigates to the edit view for an existing post
**When** the page renders
**Then** the form is pre-populated with the post's current data (title, slug, content, description, category, tags, featured image)
**And** the markdown editor loads with the existing content

**Given** the admin modifies post fields and clicks "Save"
**When** updatePostFn runs
**Then** the post is updated in the database
**And** a success toast confirms the save
**And** if the slug was changed, the new slug+lang combination is validated for uniqueness

**Given** the admin views a draft post
**When** they click "Publish"
**Then** the post status changes from "draft" to "published"
**And** publishedAt is set to the current timestamp
**And** the post becomes visible on the public blog listing

**Given** the admin views a published post
**When** they click "Unpublish"
**Then** the post status changes from "published" to "draft"
**And** publishedAt is cleared
**And** the post is removed from the public blog listing

**Given** updatePostFn executes
**When** checking authorization
**Then** only the admin can edit posts (withAdmin() wrapper)
**And** errors are thrown as error codes

**Given** a database connection failure during save
**When** the error occurs
**Then** draft content is preserved client-side (NFR19)
**And** a recoverable error toast is shown with retry guidance

### Story 4.5: Post Management Dashboard

As the admin,
I want to see all my posts in one place with quick actions,
So that I can efficiently manage content across both languages and statuses.

**Acceptance Criteria:**

**Given** the admin navigates to /$lang/_protected/admin/queue (repurposed as post dashboard)
**When** the page renders
**Then** a table or list of all posts is displayed (drafts and published)
**And** each row shows: title, language, status, publishedAt (if published), and createdAt

**Given** the post dashboard
**When** viewing the list
**Then** posts can be filtered by status (draft, published, all)
**And** posts can be filtered by language (en, vi, all)
**And** posts are sorted by updatedAt descending by default

**Given** each post row
**When** viewing quick actions
**Then** "Edit" navigates to the post edit form
**And** "Delete" shows a confirmation dialog before deleting
**And** "Publish"/"Unpublish" toggles the post status inline

**Given** the admin clicks "Delete" on a post
**When** the confirmation dialog appears
**Then** the dialog clearly states the post title and that this action is irreversible
**And** confirming calls deletePostFn which cascades to post_tags
**And** a success toast confirms deletion
**And** the list refreshes (query invalidation)

**Given** the admin deletes a post that has a translation
**When** the delete completes
**Then** the translation remains unaffected (only the selected post is deleted)

**Given** the dashboard UI
**When** rendered
**Then** it uses the design system patterns (zinc/teal palette, dark mode variants, proper spacing)
**And** all text uses t() for bilingual admin UI

### Story 4.6: Translation Management

As the admin,
I want to create and manage translations of blog posts,
So that I can provide bilingual content to English and Vietnamese readers.

**Acceptance Criteria:**

**Given** the admin is viewing a post that has no translation
**When** they click "Create Translation"
**Then** a translation form opens pre-filled with: the same slug, the opposite language, and inherited category/tags
**And** title and content fields are empty (for the admin to write the translated version)

**Given** the admin fills in the translation content
**When** they submit the form
**Then** createTranslationFn creates a new post with the same translationGroupId as the original
**And** the new post starts in "draft" status
**And** the slug is shared with the original (unique per slug+lang)

**Given** a post already has a translation in the target language
**When** the admin tries to create another translation
**Then** the action is blocked with a message indicating a translation already exists
**And** an "Edit Translation" link is offered instead

**Given** the admin is on the post dashboard
**When** viewing posts
**Then** translation status is indicated (e.g., "EN only", "EN + VI", "VI only")
**And** clicking the translation indicator navigates to the linked translation

**Given** the admin edits a translation
**When** they modify content and save
**Then** the translation is updated independently (changes don't affect the original)
**And** the translationGroupId link is preserved

**Given** the admin publishes a translation
**When** the status changes to "published"
**Then** the public blog post detail page shows the language switcher as active
**And** hreflang tags are generated linking both versions

---

## Epic 5: SEO & Discoverability

Search engines can crawl, index, and display rich snippets for all content. Author can track engagement. Sitemap.xml generation (both languages), JSON-LD structured data, robots.txt, Cloudflare Analytics integration, CTA conversion tracking.

### Story 5.1: Sitemap.xml & Robots.txt

As a search engine crawler,
I want a sitemap.xml listing all public pages and a robots.txt guiding crawl behavior,
So that I can efficiently discover and index all content in both languages.

**Acceptance Criteria:**

**Given** a crawler requests /sitemap.xml
**When** the endpoint responds
**Then** it returns valid XML containing URLs for all public routes in both languages:
  - /$lang (home), /$lang/posts (listing), /$lang/projects, /$lang/about
  - /$lang/posts/$slug for every published post in each language
**And** each URL includes a <lastmod> timestamp (from updatedAt or publishedAt)
**And** each URL includes xhtml:link hreflang alternates pointing to the en/vi equivalents

**Given** a new post is published or an existing post is updated
**When** /sitemap.xml is next requested
**Then** the sitemap reflects the updated content (dynamic generation, not static file)

**Given** a crawler requests /robots.txt
**When** the endpoint responds
**Then** it returns a valid robots.txt that:
  - Allows crawling of all public routes (/$lang/*)
  - Disallows crawling of protected routes (/$lang/_protected/*, /api/*)
  - References the sitemap URL (Sitemap: https://{domain}/sitemap.xml)

### Story 5.2: Structured Data (JSON-LD)

As a search engine,
I want structured data embedded in page HTML,
So that I can display rich snippets (article info, author details) in search results.

**Acceptance Criteria:**

**Given** a blog post page renders (/$lang/posts/$slug)
**When** the HTML is generated (SSR)
**Then** a <script type="application/ld+json"> block is included with Article schema containing:
  - headline (post title)
  - author (name, url)
  - datePublished (ISO 8601)
  - dateModified (ISO 8601)
  - description
  - image (featured image URL if present)
  - inLanguage (en or vi)

**Given** the About page renders (/$lang/about)
**When** the HTML is generated
**Then** a <script type="application/ld+json"> block is included with Person schema containing:
  - name
  - jobTitle
  - url
  - sameAs (GitHub, LinkedIn, or other social profiles)

**Given** any JSON-LD output
**When** validated against schema.org
**Then** no errors or warnings are reported
**And** the structured data is embedded in SSR HTML (not injected client-side)

### Story 5.3: Analytics & Conversion Tracking

As the site owner,
I want to track page views and contact CTA interactions,
So that I can understand visitor behavior and measure conversion.

**Acceptance Criteria:**

**Given** Cloudflare Analytics is configured
**When** a visitor loads any page
**Then** page view data is captured server-side via Cloudflare Analytics (FR32)
**And** zero additional client-side JavaScript is loaded for analytics (NFR21)

**Given** a visitor clicks the contact CTA on the About page
**When** the interaction occurs
**Then** the CTA click is tracked as a conversion event (FR33)
**And** the tracking method does not add client-side JS overhead

**Given** the analytics integration
**When** reviewing the implementation
**Then** no personally identifiable information (PII) is collected or stored
**And** analytics operates within Cloudflare's built-in analytics capabilities

---

## Summary

| Epic | Stories | FRs Covered | Description |
|------|---------|-------------|-------------|
| Epic 1: Site Foundation & Navigation | 1.1 – 1.5 (5) | FR16-FR23 (8) | Layout, i18n, theme, auth, SSR |
| Epic 2: Portfolio & Landing Pages | 2.1 – 2.3 (3) | FR13-FR15 (3) | Home, Projects, About pages |
| Epic 3: Blog Reading Experience | 3.1 – 3.3 (3) | FR10-FR12, FR24-FR25, FR30 (6) | Post listing, detail, bilingual, SEO meta |
| Epic 4: Content Authoring & Management | 4.1 – 4.6 (6) | FR1-FR9, FR29, FR31 (11) | DB schema, post CRUD, editor, upload, translations |
| Epic 5: SEO & Discoverability | 5.1 – 5.3 (3) | FR26-FR28, FR32-FR33 (5) | Sitemap, JSON-LD, robots.txt, analytics |
| **Total** | **20 stories** | **33 FRs** | **100% coverage** |

### Dependency Graph

```
Epic 1 (Foundation) ──→ Epic 2 (Portfolio)  ──┐
                   ──→ Epic 3 (Blog Read)*  ──┤──→ Epic 5 (SEO)
                   ──→ Epic 4 (Authoring)   ──┘

* Epic 3 requires DB schema + seed data from Epic 4 Story 4.1 (or db:seed)
```

### Recommended Implementation Order

1. **Epic 1** — Foundation (must be first)
2. **Epic 4** — Authoring (creates DB schema + real content for Epic 3)
3. **Epic 3** — Blog Reading (reads content created by Epic 4)
4. **Epic 2** — Portfolio (independent, can be parallel with 3 or 4)
5. **Epic 5** — SEO (requires content pages to exist)
