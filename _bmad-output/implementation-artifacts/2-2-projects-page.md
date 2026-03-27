# Story 2.2: Projects Page

Status: ready-for-dev

## Story

As a recruiter or visitor,
I want to browse project cards showing what the author has built,
So that I can assess their technical range and click through to source code.

## Acceptance Criteria

1. **Project Cards Grid:** `/$lang/projects` renders a grid of project cards with thumbnail, title, concise description, tech stack tags, and a GitHub link per card. Grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16` (existing structure).

2. **Card Hover Ghost:** On desktop hover, the card ghost pattern activates: `absolute -inset-x-4 -inset-y-6 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl` (UX-DR5).

3. **GitHub Link:** Each card has a GitHub link opening in `target="_blank" rel="noopener noreferrer"`. Link uses teal accent: `text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300`.

4. **Tech Stack Tags:** Tags render as inline badges using the zinc color system. Tag style: `inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400`.

5. **Static Data:** Project data (title, description, tags, githubUrl, thumbnailUrl) lives in `src/shared/data/projects.ts` — a static TypeScript array. No database queries.

6. **Bilingual:** Card titles, descriptions, and all UI strings use `t()`. Project data file exports bilingual records — each project has `en` and `vi` content fields. Tech stack tags are language-neutral (same in both languages).

7. **Mobile Responsive:** Cards stack to 1 column on 375px. Thumbnails render with `aspect-video` or fixed height without cropping key content. All text is fully readable at mobile width (UX-DR17).

8. **Dark Mode:** All card elements have `dark:` variants (UX-DR3). No raw oklch or hex values in className.

9. **Thumbnail:** Renders with `loading="lazy"` for below-fold images. If thumbnail is absent, a placeholder zinc gradient is shown instead of a broken image.

## Context: Brownfield — ~20% Already Implemented

Route and grid container exist. Project cards are explicitly missing (`{/* Project cards will go here */}`).

### What Already Exists (DO NOT recreate):
- `src/routes/$lang/projects.tsx` — route with `head()` meta, `MainLayout` with title/intro wired to locale, grid `<ul>` skeleton
- `src/components/layout/index.tsx` — `MainLayout` component (uses `Container` + header + children slot)
- `src/locales/en.ts` + `vi.ts` — `pages.projects.title`, `pages.projects.description`, `pages.projects.heading` keys exist
- `src/components/shared/Container.tsx` — do not rebuild

### What Is Missing:
- `ProjectCard` component — does not exist anywhere in the codebase
- `src/shared/data/projects.ts` — static data file does not exist
- No locale keys for GitHub link label or card CTA text
- Grid `<ul>` is empty

### Static Data Approach:
Projects are personal/static — no database table exists for projects (schema has posts, not projects). All project data lives in `src/shared/data/projects.ts` as a typed TS array. Bilingual content (title, description) is stored as `{ en: string; vi: string }` fields per project. The component selects the field matching the current `language` from `useI18n()`.

## Tasks / Subtasks

- [ ] **Task 1: Create static project data** (AC: #5, #6)
  - [ ] 1.1: Create `src/shared/data/projects.ts` with a `Project` interface:
    ```ts
    interface Project {
      id: string;
      title: { en: string; vi: string };
      description: { en: string; vi: string };
      tags: string[]; // language-neutral (e.g. ["TanStack Start", "Cloudflare Workers"])
      githubUrl: string;
      thumbnailUrl?: string;
    }
    export const PROJECTS: Project[] = [ /* fill with real data */ ];
    ```
  - [ ] 1.2: Add at least this blog-app project as a first entry; add others as relevant
  - [ ] 1.3: Import type `Language` from `~/shared/constants` — use it to index `title[language]`

- [ ] **Task 2: Add locale keys** (AC: #6)
  - [ ] 2.1: Add `pages.projects.githubLink` — "View on GitHub" (en) / Vietnamese equivalent (vi)
  - [ ] 2.2: Verify existing `pages.projects.heading` and `description` are adequate for the intro section

- [ ] **Task 3: Create ProjectCard component** (AC: #1–#4, #7–#9)
  - [ ] 3.1: Create `src/components/post/ProjectCard.tsx` (or `src/components/shared/ProjectCard.tsx` — check existing component structure)
  - [ ] 3.2: Props: `{ project: Project; language: Language; githubLabel: string }`
  - [ ] 3.3: Outer `<li>` uses `group relative flex flex-col items-start` (card pattern)
  - [ ] 3.4: Ghost hover span as first child: `<span className='absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl' />`
  - [ ] 3.5: Thumbnail: `<img loading='lazy' src={project.thumbnailUrl} alt='' className='w-full rounded-2xl object-cover aspect-video' />` — `alt=""` for decorative (aria-hidden effectively). If no thumbnail: `<div className='w-full rounded-2xl aspect-video bg-zinc-100 dark:bg-zinc-800' />`
  - [ ] 3.6: Title: `<h2 className='mt-4 text-base font-semibold tracking-tight text-foreground'>`
  - [ ] 3.7: Description: `<p className='mt-2 text-sm text-muted-foreground line-clamp-3'>`
  - [ ] 3.8: Tags: flex wrap row of badge spans
  - [ ] 3.9: GitHub link: `<a href={project.githubUrl} target='_blank' rel='noopener noreferrer' className='relative z-10 mt-4 ...'>`

- [ ] **Task 4: Wire ProjectCard into the route** (AC: #1)
  - [ ] 4.1: In `projects.tsx`, import `PROJECTS` and `ProjectCard`
  - [ ] 4.2: Map `PROJECTS` into `<ProjectCard>` inside the existing `<ul>`
  - [ ] 4.3: Pass `language` from `useI18n()` and `githubLabel` from `t.pages.projects.githubLink`

- [ ] **Task 5: Verify all acceptance criteria** (AC: #1–#9)
  - [ ] 5.1: Check hover ghost activates on desktop (visual check)
  - [ ] 5.2: Verify tags render correctly in both languages
  - [ ] 5.3: `npm run build` passes with no TypeScript errors
  - [ ] 5.4: Biome check passes

## Dev Notes

### Architecture Compliance
- **No server functions, no DB queries** — pure static component. Do not reach for `createServerFn`.
- **No new npm packages** — use existing lucide-react for icons, existing shadcn Badge or raw span elements for tags. Do not install `react-github-stars` or similar.
- **Bundle safety:** Static data array in TS is zero bundle overhead. Images are `<img>` with lazy loading — no Next.js `<Image>` or special loader.
- **SSR-compatible:** Component has no `useEffect` — all content is synchronous. Renders fine on Cloudflare Workers.

### Component Placement Decision
Check if `src/components/post/` (for post-related UI) or `src/components/shared/` (for generic reusable) is more appropriate. Prefer `src/components/shared/ProjectCard.tsx` since projects are not "posts". Do not put it in `src/components/ui/` (that's for shadcn primitives only).

### Key File Locations
- `src/routes/$lang/projects.tsx` — MODIFY: map PROJECTS into grid
- `src/shared/data/projects.ts` — NEW: static project array
- `src/components/shared/ProjectCard.tsx` — NEW: card component
- `src/locales/en.ts` + `vi.ts` — MODIFY: add `pages.projects.githubLink`

### Design System Patterns to Apply
```tsx
// Card outer — DO NOT use <article> for project cards (no blog context)
<li className='group relative flex flex-col items-start'>
  {/* Ghost hover */}
  <span className='absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0
                   transition group-hover:scale-100 group-hover:opacity-100
                   dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl' />

  {/* Tech tag */}
  <span className='inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5
                   text-xs font-medium text-zinc-600
                   dark:bg-zinc-800 dark:text-zinc-400'>
    {tag}
  </span>

  {/* GitHub CTA */}
  <a href={githubUrl} target='_blank' rel='noopener noreferrer'
     className='relative z-10 mt-4 flex items-center gap-1 text-sm font-medium
                text-teal-500 dark:text-teal-400
                hover:text-teal-600 dark:hover:text-teal-300
                focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-teal-500'>
    <GithubIcon className='h-4 w-4' aria-hidden='true' />
    {githubLabel}
  </a>
</li>
```

### Previous Story Intelligence (Epic 1 + Story 2.1)
- All `<Link>` for internal routes must use `localizedPath(path)` from `useI18n()` — not manual `/${language}/...`
- `language` from `useI18n()` is typed as `Language` (`'en' | 'vi'`) — use it directly to index bilingual fields: `project.title[language]`
- Biome: tabs for indentation, single quotes in JSX

### References
- [Source: epics.md#Epic2-Story2.2] — AC definitions
- [Source: .claude/rules/design-system.md#UX-DR5] — Card hover ghost pattern
- [Source: .claude/rules/design-system.md#4-Component-Patterns] — Cards section
- [Source: src/routes/$lang/projects.tsx] — existing shell (empty grid)

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
- src/routes/$lang/projects.tsx
- src/shared/data/projects.ts
- src/components/shared/ProjectCard.tsx
- src/locales/en.ts
- src/locales/vi.ts
