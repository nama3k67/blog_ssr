# Story 2.1: Home Page

Status: review

## Story

As a recruiter or visitor,
I want to see a compelling landing page with a personal introduction and GitHub information,
So that I immediately understand who the author is and their engineering capabilities.

## Acceptance Criteria

1. **Personal Introduction:** Visiting `/$lang` shows the author's name, role, and a short bio. Content is driven by locale strings (no hardcoded text). Heading uses `text-4xl sm:text-5xl font-bold tracking-tight text-foreground` (UX-DR9). Body uses `text-base text-muted-foreground` (UX-DR9).

2. **GitHub Info:** A GitHub section shows a profile link and at least key stats or project highlights. Link opens in a new tab with `target="_blank" rel="noopener noreferrer"`. Social icon uses `h-6 w-6 fill-zinc-500 transition hover:fill-zinc-600 dark:fill-zinc-400 dark:hover:fill-zinc-300`.

3. **Navigation CTAs:** Clear links guide visitors toward Projects, Blog, and About. CTA buttons follow secondary pattern: `bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium rounded-md py-2 px-3 text-sm`.

4. **Responsive Layout:** All content is fully visible on 375px mobile without horizontal scroll. Layout adapts across 375/768/1024/1440px breakpoints (UX-DR17). `Container` system wraps all content (UX-DR6).

5. **Dark Mode:** Every visual element has a `dark:` variant (UX-DR3). No zinc/teal rule violations (UX-DR1, UX-DR2).

6. **Bilingual:** All user-visible strings come from `t()` via `useI18n()`. Both `en.ts` and `vi.ts` updated with all new keys.

7. **Clerk widget removed:** Remove the `SignedIn`/`SignedOut`/`SignInButton`/`UserButton` debug block from the home component. Auth state is managed by the header user menu, not the home page.

8. **Page top spacing:** `mt-16 sm:mt-32` on the outer Container (UX-DR14).

## Context: Brownfield — ~25% Already Implemented

The route shell exists. Only layout structure and meta wiring are done. The actual content (intro, GitHub, CTAs) is placeholder.

### What Already Exists (DO NOT recreate):
- `src/routes/$lang/index.tsx` — route with `head()` meta (title, description) and `useI18n()` wired
- `src/components/shared/Container.tsx` — Container system for layout
- `src/locales/en.ts` + `vi.ts` — `pages.home.title`, `pages.home.description` keys already present
- `src/shared/providers/i18n.tsx` — `useI18n()` for `t` object

### What Is Missing:
- `pages.home.heading` = `"Index Route"` — placeholder, must be replaced with real author intro heading
- No locale keys for: author name/role, GitHub URL, GitHub label, CTA labels
- No GitHub section in the component
- No navigation CTAs
- `SignedIn`/`SignedOut` debug block must be removed
- `t.pages.home.signedIn` / `signedOut` locale keys become unused after cleanup

### Static Data Approach:
GitHub profile URL, author name, role, and bio are personal/static — store them as locale strings (bilingual content) in `en.ts`/`vi.ts`. No database or environment variable needed. GitHub URL can be a hardcoded constant in a `src/shared/data/author.ts` config file (URL is the same in both languages).

## Tasks / Subtasks

- [x] **Task 1: Update locale strings** (AC: #1, #2, #3, #6)
  - [x] 1.1: Replace `pages.home.heading` from `"Index Route"` → author's actual intro heading (e.g., `"Hi, I'm [Name]"`)
  - [x] 1.2: Add `pages.home.role` — author's professional role (both en/vi)
  - [x] 1.3: Add `pages.home.bio` — 2–3 sentence bio paragraph (both en/vi)
  - [x] 1.4: Add `pages.home.github` — label for GitHub link (both en/vi)
  - [x] 1.5: Add `pages.home.ctaProjects`, `ctaBlogs`, `ctaAbout` — CTA button labels (both en/vi)
  - [x] 1.6: Remove unused `pages.home.signedIn` / `signedOut` keys from both locale files

- [x] **Task 2: Create author static data** (AC: #2)
  - [x] 2.1: Create `src/shared/data/author.ts` exporting `GITHUB_URL` constant (e.g., `export const GITHUB_URL = "https://github.com/..."`)
  - [x] 2.2: Keep URL a single source of truth — do not duplicate in locale files

- [x] **Task 3: Rewrite Home component** (AC: #1–#8)
  - [x] 3.1: Remove `SignedIn`, `SignedOut`, `SignInButton`, `UserButton` imports and JSX block
  - [x] 3.2: Render intro section: heading (`text-4xl sm:text-5xl font-bold tracking-tight text-foreground`), role subtitle (`text-lg font-medium text-foreground`), bio paragraph (`text-base text-muted-foreground`)
  - [x] 3.3: Render GitHub link with GitHub icon (lucide-react `Github` or SVG), `target="_blank" rel="noopener noreferrer"`, social icon classes
  - [x] 3.4: Render CTA links to `localizedPath("/projects")`, `localizedPath("/posts")`, `localizedPath("/about")` using secondary button style
  - [x] 3.5: Use `localizedPath()` from `useI18n()` for all internal links (NOT hardcoded `/$lang/...`)
  - [x] 3.6: Wrap all content in `<Container className='mt-16 sm:mt-32'>`
  - [x] 3.7: Ensure `max-w-2xl` on inner content container per Spotlight layout

- [x] **Task 4: Verify all acceptance criteria** (AC: #1–#8)
  - [x] 4.1: Check all text is via `t()` — no hardcoded English strings in JSX
  - [x] 4.2: Verify `dark:` variants on all visual classes
  - [x] 4.3: Check Biome passes: `npm run biome check` (or `npx biome check src/`)
  - [x] 4.4: Check build passes: `npm run build`

## Dev Notes

### Architecture Compliance
- **No server functions** — home page is 100% static content from locale strings + constants. No DB calls, no `createServerFn`.
- **SSR-safe** — no `useEffect` needed here; all content is synchronous from context/locale.
- **i18n:** Always use `localizedPath(path)` from `useI18n()` for internal `<Link>` hrefs (NOT manual `/${language}/...` construction). Import `Link` from `@tanstack/react-router`.
- **Clerk imports removed:** Do not re-import Clerk components in home page. Auth UI lives in `src/components/layout/Header.tsx` and `menu.tsx`.

### Key File Locations
- `src/routes/$lang/index.tsx` — home route (MODIFY: remove Clerk block, add content)
- `src/locales/en.ts` — add new `pages.home.*` keys (MODIFY)
- `src/locales/vi.ts` — same keys in Vietnamese (MODIFY)
- `src/shared/data/author.ts` — NEW static config file for GITHUB_URL and any other author constants

### Design System Patterns to Apply
```tsx
// Page title
<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>

// Role/subtitle
<p className='text-lg font-medium text-foreground'>

// Bio/body
<p className='mt-6 text-base text-muted-foreground'>

// GitHub social icon link
<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
   className='group -m-1 p-1'>
  <GithubIcon className='h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600
                          dark:fill-zinc-400 dark:group-hover:fill-zinc-300' />
</a>

// Secondary CTA button
<Link to={localizedPath("/projects")}
  className='inline-flex items-center justify-center rounded-md bg-zinc-50
             px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100
             dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800
             focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2
             focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'>
  {t.pages.home.ctaProjects}
</Link>
```

### Previous Story Intelligence (Epic 1)
- `useI18n()` returns `{ t, language, localizedPath }` — use `localizedPath(path)` for all internal links
- SSR-safe meta: `head()` function in route file using `dictionaries[params.lang]` (not `useI18n`) — already wired, do not modify
- Biome enforces tabs + single quotes in JSX (double in TS) — match exactly

### References
- [Source: epics.md#Epic2-Story2.1] — AC definitions
- [Source: .claude/rules/design-system.md#4-Component-Patterns] — Social icons, buttons
- [Source: .claude/rules/design-system.md#3-Layout-System] — Container, page layout
- [Source: src/routes/$lang/index.tsx] — existing shell to modify

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References

### Completion Notes List
- All tasks completed. Locale files updated with heading, role, bio, github, ctaProjects, ctaBlogs, ctaAbout keys. Removed signedIn/signedOut keys.
- Created `src/shared/data/author.ts` with `GITHUB_URL` constant.
- Rewrote `src/routes/$lang/index.tsx`: removed Clerk debug block, added personal intro + GitHub link + 3 CTA links.
- Biome auto-fixed import sort (`createFileRoute, Link` → alphabetical). Build passed (4.60s).

### File List
- src/routes/$lang/index.tsx
- src/locales/en.ts
- src/locales/vi.ts
- src/shared/data/author.ts
