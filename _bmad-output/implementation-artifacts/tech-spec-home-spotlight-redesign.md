---
title: 'Home Page Spotlight Redesign'
slug: 'home-spotlight-redesign'
created: '2026-07-03'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['TanStack Start', 'React 19', 'Tailwind CSS 4', 'TypeScript', 'Drizzle ORM', 'lucide-react', 'clsx']
files_to_modify:
  - 'src/routes/$lang/index.tsx (rewrite)'
  - 'src/shared/data/author.ts (extend SOCIAL_LINKS)'
  - 'src/shared/data/resume.ts (NEW - RESUME data)'
  - 'src/components/shared/SocialIcons.tsx (NEW)'
  - 'src/components/public/home/Article.tsx (NEW)'
  - 'src/components/public/home/Newsletter.tsx (NEW, UI-only)'
  - 'src/components/public/home/Resume.tsx (NEW)'
  - 'src/components/public/home/index.ts (add exports)'
  - 'src/shared/images/logos/ (NEW dir + placeholder logos)'
  - 'src/locales/en.ts (new strings)'
  - 'src/locales/vi.ts (new strings)'
code_patterns:
  - 'Route loader + Route.useLoaderData() (see posts/index.tsx)'
  - 'Card compound component; dynamic links via Card.Link to+params'
  - 'useI18n() for t + localizedPath'
  - 'Bilingual data as { en; vi } objects'
  - 'Local image imports (clsx for rotations)'
test_patterns:
  - 'No unit test framework wired for routes; Playwright E2E exists under _bmad-output/test-artifacts'
  - 'Verification via bun run build (TS check) + manual/visual'
---

# Tech-Spec: Home Page Spotlight Redesign

**Created:** 2026-07-03

## Overview

### Problem Statement

The home page (`src/routes/$lang/index.tsx`) does not match the Spotlight design
reference (`tailwind-plus/spotlight-ts/src/app/page.tsx`). It currently shows a
heading + role subtitle + bio, the Photos strip, a single GitHub link, and three
ad-hoc CTA buttons. It is missing Spotlight's signature two-column content section
(latest articles + side column) and its social-icon row hero treatment.

### Solution

Rebuild the home route to mirror the Spotlight layout: a `max-w-2xl` hero
(heading + bio + social-icon row), the existing Photos strip, then a two-column
grid — latest 4 blog posts on the left, and a Newsletter (UI-only) + Work/Resume
card on the right — using existing project components, data, i18n, and the
`fetchPostsList` server function.

### Scope

**In Scope:**
- Rewrite `src/routes/$lang/index.tsx` to the Spotlight layout.
- Drop the `role` subtitle line and the 3 CTA buttons (match Spotlight exactly).
- Hero social-icon row: extend `SOCIAL_LINKS` with additional socials
  (X, LinkedIn, etc. — placeholder URLs) and create a `SocialIcons` component.
- Latest-articles column: fetch latest 4 posts via `fetchPostsList` and render
  them with the existing `Card` component (Title / Eyebrow / Description / Cta).
- Newsletter card: UI-only, visually faithful to Spotlight; submit is a no-op
  placeholder (no subscription backend).
- Work/Resume card: scaffold a `RESUME` data structure (companies, roles, dates,
  logos) + a `Resume` component + `Download CV` button (href from data).
- Add EN/VI locale strings for all new UI text (social aria-labels, Newsletter
  copy, Work heading, "Read article", "Download CV").

**Out of Scope:**
- A functional newsletter subscription backend/store.
- Other pages (Projects, Blog List, About) — separate specs.
- Real CV file hosting (Download CV button uses a data-provided href, may be `#`).

## Context for Development

### Codebase Patterns

- Routing: file-based TanStack Start under `src/routes/$lang/`; i18n via
  `useI18n()` (`t`, `localizedPath`). Route `head` sets meta from `dictionaries`.
- Components already present: `Container`, `Card` (+ Title/Eyebrow/Description/
  Cta/Link subcomponents), `HomePhotos`, shadcn `Button`.
- Data: `src/shared/data/author.ts` (`SOCIAL_LINKS`, `SKILLS`, author consts),
  `projects.ts`. Bilingual fields use `{ en; vi }` objects.
- Posts: `fetchPostsList` server fn (`src/shared/services/post.ts`) returns
  `{ posts: [{ slug, title, description, date, path, category, featuredImage }],
  totalCount, currentPage, totalPages }` — takes `{ lang, page, pageSize }`.
- Styling: Spotlight-inspired zinc/teal system (see `DESIGN.md`); Tailwind 4.
- Images: local imports from `src/shared/images/photos/` (already used by
  `HomePhotos`). New logos would live under `src/shared/images/logos/`.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| src/routes/$lang/index.tsx | Target file to rewrite |
| src/routes/$lang/posts/index.tsx | **Loader pattern to copy** (loader → fetchPostsList → try/catch fallback → Route.useLoaderData) |
| src/components/post/item.tsx | Reference `Card.Link to+params` pattern for dynamic post links; home Article is a leaner variant (no image/category/grid) |
| src/components/public/home/Photos.tsx | Already-ported Photos strip (`HomePhotos`), keep as-is |
| src/components/shared/card/*.tsx | Card + Title/Eyebrow(decorate)/Description/Cta/Link APIs |
| src/shared/services/post.ts | `fetchPostsList({data:{lang,page,pageSize}})` → `{posts:[{slug,title,description,date,path,category,featuredImage}],...}` |
| src/shared/utils/date.ts | `formatDate(dateString)` → **hard-coded en-US** long date (won't localize on /vi/ — known limitation, see Notes) |
| src/shared/data/author.ts | `SOCIAL_LINKS` (only GitHub today), `SKILLS`, `CONTACT_EMAIL` — extend socials here |
| src/locales/en.ts / vi.ts | Typed twins (EnDict/ViDict); add matching keys under `pages.home` to BOTH |
| src/shared/providers/i18n.tsx | `useI18n()` → `{ t, localizedPath, language }` |
| /Users/nama3k67/Downloads/tailwind-plus-spotlight/spotlight-ts/src/app/page.tsx | Design reference (Article, SocialLink, Newsletter, Role, Resume, Photos) — **outside the repo** |
| /Users/nama3k67/Downloads/tailwind-plus-spotlight/spotlight-ts/src/components/SocialIcons.tsx | Source SVGs for the 4 social icons to port |

### Technical Decisions

- **Newsletter**: UI-only. Adapt Spotlight `Newsletter` markup + `MailIcon` but
  replace its `action="/thank-you"` (a real navigation in the reference) with
  `onSubmit={(e)=>e.preventDefault()}`, no network call. Use a **raw `<input>`
  with Spotlight's exact classes** for visual fidelity (shadcn `Input` restyles
  and would break parity). "Join" is a `type="submit"` shadcn `Button` (fine).
- **Work section**: add new `src/shared/data/resume.ts` with `RESUME: Role[]`
  (`company: string`, `title: {en,vi}`, `start: string`, `end: string`,
  `logo?: string`). This is an **adaptation**, not a verbatim port — Spotlight's
  `Role.title` is a plain `string` and `start/end` allow a `{label,dateTime}`
  object; we simplify to strings + bilingual title. Logo optional with an
  initials-circle fallback (no logo assets yet). Render an adapted `Resume` card
  + `BriefcaseIcon` + `ArrowDownIcon`. **Download CV must be an `<a href={CV_URL}>`
  (or shadcn `Button asChild` wrapping an `<a>`) — the shadcn `Button` renders a
  `<button>` and has NO `href` prop, so Spotlight's `<Button href>` does not
  port directly.** `variant="secondary"` does exist in shadcn.
- **Socials**: extend `SOCIAL_LINKS` (add X, LinkedIn, Instagram with placeholder
  `#` URLs alongside real GitHub). Create `src/components/shared/SocialIcons.tsx`
  porting Spotlight's `GitHubIcon/LinkedInIcon/XIcon/InstagramIcon` SVGs. The
  `icon` field in `SocialLink` maps to these components.
- **Hero**: match Spotlight exactly — remove `role` line + 3 CTA buttons; hero =
  `max-w-2xl` heading + bio + social-icon row. `Container` `mt-9` (was mt-16/32).
- **Articles data fetch**: add route `loader` calling
  `fetchPostsList({data:{lang, page:1, pageSize:4}})` with try/catch fallback
  (mirror posts/index.tsx). Read via `Route.useLoaderData()`. Empty-state guard
  when `posts.length === 0` (hide the articles column gracefully).
- **Dynamic post links**: `CardTitle.href` is typed `keyof FileRoutesByTo`
  (static routes only). For posts use `Card.Link to="/$lang/posts/$slug"
  params={{ slug, lang }}` wrapping `Card.Title` — the PostItem pattern.
- **Bundle**: prefer inline SVG socials + `lucide-react` (already a dep) over new
  icon libs; keep under the 3 MB gzip Worker limit.

## Implementation Plan

### Tasks

Order: data/strings → leaf components → route wiring. Each is independently
compilable.

- [x] Task 1: Add social + resume data
  - File: `src/shared/data/author.ts`
  - Action: Widen `SocialLink.icon` union to `"github" | "linkedin" | "x" | "instagram"`. Add X/LinkedIn/Instagram entries to `SOCIAL_LINKS` with `href: "#"` placeholders (keep real GitHub). Add `export const CV_URL = "#"`.
  - File: `src/shared/data/resume.ts` (NEW)
  - Action: `export interface Role { company: string; title: { en: string; vi: string }; start: string; end: string; logo?: string }` and `export const RESUME: Role[]` with 2–3 placeholder entries for the user to fill. `logo` optional (no logos dir needed yet).
  - Notes: ponytail — no logo images; Resume renders an initials-circle fallback. Add real logos + imports later if wanted.

- [x] Task 2: Add EN/VI locale strings (both files, matching keys)
  - File: `src/locales/en.ts` and `src/locales/vi.ts`
  - Action: Under `pages.home`, add: `readArticle`, `newsletterHeading`, `newsletterBody`, `newsletterPlaceholder`, `newsletterCta`, `workHeading`, `downloadCv`, and social aria-labels `followOn: { github, linkedin, x, instagram }`. Add identical keys to both dicts (EnDict/ViDict are typed twins → build fails otherwise).
  - Notes: Keep existing `heading`/`bio`; delete now-unused `role`, `github`, `ctaProjects`, `ctaBlogs`, `ctaAbout` from both dicts. These keys are referenced ONLY in the component body of `index.tsx` (lines 46/70/79/85/91) — the `head` block (lines 13-32) uses only `title`/`description`, so there are **no `head` references to remove**. Delete the dict keys and the component-body refs together (Task 8).

- [x] Task 3: SocialIcons component
  - File: `src/components/shared/SocialIcons.tsx` (NEW)
  - Action: Port Spotlight's `GitHubIcon`, `LinkedInIcon`, `XIcon`, `InstagramIcon` SVGs (from reference page.tsx / SocialIcons.tsx). Export a `SocialIcon` map keyed by the `icon` union, plus a `SocialLink` wrapper (`<a>` with `group -m-1 p-1`, aria-label, `h-6 w-6 fill-zinc-500 ...` icon classes).
  - Notes: Inline SVGs only — no new dep (bundle limit).

- [x] Task 4: Home Article card
  - File: `src/components/public/home/Article.tsx` (NEW)
  - Action: Leaner variant of `PostItem`. `Card as="article"` → `Card.Link to="/$lang/posts/$slug" params={{ slug, lang }}` wrapping `Card.Title` → `Card.Eyebrow as="time" dateTime={date} decorate` with `formatDate(date)` → `Card.Description` → `Card.Cta>{t.pages.home.readArticle}`.
  - Prop type: derive from the loader, NOT `PostSummary`. `fetchPostsList` returns an inline-mapped object literal (it does not declare `PostSummary`), so type the prop as `type HomePost = Awaited<ReturnType<typeof fetchPostsList>>["posts"][number]` and use `{ post: HomePost; lang: string }`. (Structurally compatible with `PostSummary` but don't assert it.)
  - Notes: Use `Card.Link` (not `Card.Title href`) — dynamic slug isn't a static route key.

- [x] Task 5: Newsletter (UI-only)
  - File: `src/components/public/home/Newsletter.tsx` (NEW)
  - Action: Adapt Spotlight `Newsletter` + `MailIcon`. `<form onSubmit={(e)=>e.preventDefault()}>` (drop the reference's `action="/thank-you"`; no fetch). Text from `t.pages.home.newsletter*`. Use a **raw `<input>` with Spotlight's classes** (not shadcn `Input`) for fidelity; "Join" = shadcn `Button type="submit"`.
  - Notes: ponytail — no-op submit; wire a real handler in a later spec.

- [x] Task 6: Resume card
  - File: `src/components/public/home/Resume.tsx` (NEW)
  - Action: Adapt Spotlight `Resume` + `Role` + `BriefcaseIcon` + `ArrowDownIcon` (adaptation, not verbatim — see Technical Decisions for the `Role` shape divergence). Map `RESUME`; logo → `<img>` if present else initials-circle fallback. Localize role `title` via `language`. Heading `t.pages.home.workHeading`.
  - **Download CV = `<a href={CV_URL}>` styled as the secondary button (or shadcn `Button asChild` wrapping `<a>`), NOT `<Button href>`** — shadcn `Button` has no `href` prop.

- [x] Task 7: Barrel exports
  - File: `src/components/public/home/index.ts`
  - Action: Export `Article`, `Newsletter`, `Resume` alongside existing `HomePhotos`.

- [x] Task 8: Rewrite the route
  - File: `src/routes/$lang/index.tsx`
  - Action: Add `loader` calling `fetchPostsList({ data: { lang: params.lang, page: 1, pageSize: 4 } })` with try/catch → `{posts:[],...}` fallback (copy posts/index.tsx). In component: `const { posts } = Route.useLoaderData()`, `const { lang } = Route.useParams()`. Hero: `Container mt-9` → `div.max-w-2xl` → `h1` (`t.pages.home.heading`) + bio `p` + social row (`SOCIAL_LINKS.map` → `SocialLink`). Then `<HomePhotos />`. Then `Container mt-24 md:mt-28` → grid `mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2`: left `flex flex-col gap-16` of `Article` (guard `posts.length`), right `space-y-10 lg:pl-16 xl:pl-24` with `Newsletter` + `Resume`. Remove role line + CTA buttons + old GitHub `<a>` AND its now-dead `import { Github } from "lucide-react"` (line 2). Leave `head` untouched (it never referenced the dropped keys).
  - Notes: Match Spotlight zinc tokens; existing file uses `text-foreground`/`text-muted-foreground` — keep whichever matches DESIGN.md (zinc-800/600 per Spotlight).

### Acceptance Criteria

- [x] AC 1: Given the home route at `/en/` or `/vi/`, when it loads, then the hero shows heading + bio (no role subtitle, no CTA buttons) and a social-icon row.
- [x] AC 2: Given published posts exist, when home loads, then the left column lists the latest ≤4 as Article cards, each linking to `/$lang/posts/$slug` with a formatted date and "Read article" CTA.
- [x] AC 3: Given `fetchPostsList` throws, when home loads, then the loader returns the empty fallback and the page renders without the articles column (no crash).
- [x] AC 4: Given the Newsletter form, when submitted, then the page does not navigate or fetch (preventDefault) — UI only.
- [x] AC 5: Given `RESUME` data, when home loads, then the right column shows the Work card (localized role titles, logo-or-initials, Download CV button linking to `CV_URL`).
- [x] AC 6: Given a new string added to `en.ts`, when omitted from `vi.ts` (or vice-versa), then `bun run build` fails type-check — both dicts stay in sync.
- [x] AC 7: Given `bun run build`, when run after changes, then it passes (TS + no unused-import/removed-key errors from dropped `role`/`cta*`).

## Additional Context

### Dependencies

- No new npm deps. Reuses: `@tanstack/react-router`, `clsx` (Resume rotations if
  needed), existing `Card`/`Container`/`Button`, `fetchPostsList`, `formatDate`,
  `useI18n`. Social icons are inline SVG (no icon lib); `lucide-react` not needed
  for the new code. `Newsletter` uses a raw `<input>` (not shadcn `Input`).
- Data authored by user: real social URLs, `RESUME` entries, `CV_URL`.

### Testing Strategy

- Primary gate: `bun run build` (TS strict + Vite). Catches locale-twin drift,
  removed-key references, and dynamic-link typing.
- Manual: load `/en/` and `/vi/`, verify hero/social row, article links resolve
  to post pages, Newsletter submit is inert, Resume renders with fallback logos,
  dark mode intact.
- Optional: extend existing Playwright suite (`_bmad-output/test-artifacts`) with
  a home smoke test — out of scope for this spec.

### Notes

- **Risk — locale twins:** every new key must land in both `en.ts` and `vi.ts`
  or the build breaks. Add them together.
- **Risk — dropped keys:** removing `role`/`ctaProjects`/`ctaBlogs`/`ctaAbout`/
  `github` from dicts requires removing their **component-body** references in
  `index.tsx` in the same pass (the `head` block never used them), plus the dead
  `Github` lucide import — else TS/unused errors.
- **Known limitation — dates:** `formatDate` hard-codes `en-US`, so article dates
  show English month names even on `/vi/`. Pre-existing; out of scope to fix here.
- **ponytail simplifications (deliberate):** Newsletter is inert (raw input, no
  backend); Resume logos are initials-circle fallbacks (no image assets); social
  + CV URLs are `#` placeholders. Download CV is a plain styled `<a>` (shadcn
  Button has no `href`). Upgrade paths: real newsletter handler, logo imports,
  real URLs — each a small follow-up, none blocking this redesign.
- Bundle: inline SVGs + existing deps keep this well under the 3 MB gzip limit.
- Future (out of scope): apply the same Spotlight pass to Projects, Blog List,
  About (separate specs).
