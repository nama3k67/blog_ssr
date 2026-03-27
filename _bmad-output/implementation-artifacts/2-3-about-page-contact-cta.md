# Story 2.3: About Page with Contact CTA

Status: ready-for-dev

## Story

As a recruiter,
I want to view the author's professional profile with skills and a clear way to get in touch,
So that I can evaluate their fit and reach out directly.

## Acceptance Criteria

1. **Professional Summary:** `/$lang/about` displays a bio section with the author's background and expertise. Uses `text-4xl sm:text-5xl font-bold tracking-tight text-foreground` for heading and `text-base text-muted-foreground` for body paragraphs (UX-DR9). Minimum 2 bio paragraphs.

2. **Skills Visualization:** A skills section groups technical competencies by category (e.g., Frontend, Backend, Infra). Each group shows a category label and a list of skills. On mobile (375px), stacks to single column. On desktop, renders in the right column of the existing two-column grid layout.

3. **Contact CTA:** A prominent CTA button uses primary pattern: `bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 font-semibold rounded-md py-2 px-3 text-sm` (UX-DR10). Links to email (`mailto:`) or external contact method. Keyboard-accessible with `focus-visible` ring (NFR14).

4. **Avatar/Profile Image:** A profile photo renders in the top-right area of the two-column layout (right column, `lg:order-none`). Image uses `rounded-2xl object-cover` and `loading="eager"` (above-fold). If no image, renders a zinc gradient placeholder.

5. **Semantic HTML:** Page uses `<article>` for the bio content, `<section>` for skills, proper heading hierarchy (`h1` → `h2` for skill categories). WCAG 2.1 AA compliance (NFR13, NFR15).

6. **Bilingual:** All user-visible strings use `t()` from `useI18n()`. Both `en.ts` and `vi.ts` updated with bio, skills, and CTA text. Skill category labels are localized; skill names (tech names) are language-neutral.

7. **Dark Mode:** Every visual element has `dark:` variant (UX-DR3). Skills section uses zinc palette only (UX-DR1).

8. **Responsive:** Existing two-column grid `grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12` is preserved. Skills list adapts to available column width. CTA is visible without scrolling on mobile.

## Context: Brownfield — ~20% Already Implemented

Route shell with two-column grid skeleton exists. Skills and CTA are entirely missing. Bio is a single placeholder paragraph.

### What Already Exists (DO NOT recreate):
- `src/routes/$lang/about.tsx` — route with `head()` meta, `Container`, two-column grid div, heading + single description paragraph wired to locale
- `src/locales/en.ts` + `vi.ts` — `pages.about.title`, `pages.about.description`, `pages.about.heading` keys already present
- `src/shared/providers/i18n.tsx` — `useI18n()` for `{ t, language, localizedPath }`
- `src/components/shared/Container.tsx` — existing Container

### What Is Missing:
- Skills visualization (no component, no data, no locale keys)
- Contact CTA (no button, no locale key for CTA text)
- Avatar image (right column is empty)
- Bio is a single `<p>` — needs expansion to multiple paragraphs
- Semantic HTML: current `<div>` wrappers need to become `<article>`/`<section>`
- Social links (GitHub, LinkedIn etc.) — should live here per Spotlight pattern

### Static Data Approach:
Skills, social links, and contact email are personal/static data. Store in `src/shared/data/author.ts` (same file as Story 2.1's GITHUB_URL). Export `SKILLS`, `SOCIAL_LINKS`, `CONTACT_EMAIL` constants. Locale strings hold the category labels and CTA text — skill names (React, TypeScript, etc.) are language-neutral constants.

## Tasks / Subtasks

- [ ] **Task 1: Update/create static author data** (AC: #2, #3, #4)
  - [ ] 1.1: In `src/shared/data/author.ts` (created in Story 2.1), add or extend:
    ```ts
    export const AVATAR_URL = "/avatar.jpg"; // or external URL
    export const CONTACT_EMAIL = "name@example.com";
    export interface SkillGroup {
      category: { en: string; vi: string };
      skills: string[]; // language-neutral tech names
    }
    export const SKILLS: SkillGroup[] = [
      { category: { en: "Frontend", vi: "Giao diện" }, skills: ["React", "TanStack Start", "Tailwind CSS", "TypeScript"] },
      { category: { en: "Backend", vi: "Phía máy chủ" }, skills: ["Node.js", "Drizzle ORM", "PostgreSQL", "Cloudflare Workers"] },
      // ... add relevant skill groups
    ];
    export interface SocialLink { label: string; href: string; icon: string }
    export const SOCIAL_LINKS: SocialLink[] = [
      { label: "GitHub", href: GITHUB_URL, icon: "github" },
      { label: "LinkedIn", href: "https://linkedin.com/in/...", icon: "linkedin" },
    ];
    ```
  - [ ] 1.2: If Story 2.1 has not been implemented yet, create the full `author.ts` file including `GITHUB_URL`

- [ ] **Task 2: Add locale keys** (AC: #6)
  - [ ] 2.1: Add `pages.about.bio1` and `pages.about.bio2` — first and second bio paragraph (en + vi)
  - [ ] 2.2: Add `pages.about.skills` — "Skills" section heading (en + vi)
  - [ ] 2.3: Add `pages.about.cta` — CTA button text, e.g. "Get in touch" / "Liên hệ" (en + vi)
  - [ ] 2.4: Add `pages.about.ctaAriaLabel` — screen reader label for CTA, e.g. "Send an email to [Name]" (en + vi)
  - [ ] 2.5: Keep existing `pages.about.heading` and `pages.about.description` (used in `head()` meta only — do not remove)

- [ ] **Task 3: Rewrite About component** (AC: #1–#8)
  - [ ] 3.1: Preserve the outer `<Container className='mt-16 sm:mt-32'>` and two-column grid div structure — do NOT replace
  - [ ] 3.2: Left column (`lg:order-first lg:row-span-2`): change inner `<div>` to `<article>`, add heading + bio paragraphs + skills section + CTA
  - [ ] 3.3: Right column: add avatar `<img>` with `rounded-2xl object-cover loading="eager"` (or placeholder div if no image)
  - [ ] 3.4: Heading: `<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>`
  - [ ] 3.5: Bio: `<p className='mt-6 text-base text-muted-foreground'>{t.pages.about.bio1}</p>` (+ bio2)
  - [ ] 3.6: Skills `<section>`: heading `<h2 className='text-sm font-semibold text-foreground'>`, skill groups map
  - [ ] 3.7: CTA: `<a href={\`mailto:${CONTACT_EMAIL}\`}` with primary button classes + `focus-visible` ring
  - [ ] 3.8: Social links row: GitHub + LinkedIn icons using lucide-react with social icon classes

- [ ] **Task 4: Verify all acceptance criteria** (AC: #1–#8)
  - [ ] 4.1: Check heading hierarchy (h1 → h2 for skill categories) with browser inspector
  - [ ] 4.2: Verify contact CTA is reachable via Tab key and shows focus ring
  - [ ] 4.3: Toggle language — confirm all strings update
  - [ ] 4.4: `npm run build` — no TypeScript errors
  - [ ] 4.5: Biome check passes

## Dev Notes

### Architecture Compliance
- **No server functions, no DB queries** — entirely static/SSR content. No `createServerFn`.
- **SSR-safe** — no `useEffect` needed; all data is synchronous from constants + locale.
- **Avatar image:** If using a local asset, place in `public/` directory (served as static by Vite/Cloudflare). Do not import as JS module (that bloats the bundle). Use `src="/avatar.jpg"` string.
- **`mailto:` CTA:** Use `<a href="mailto:...">` — not a `<Link>` (not an internal route). Do not use a `<Button>` component (that's for `<button>` elements). Render as `<a>` with button styling classes applied directly.

### Key File Locations
- `src/routes/$lang/about.tsx` — MODIFY: replace placeholder with full content
- `src/shared/data/author.ts` — MODIFY or CREATE: add SKILLS, SOCIAL_LINKS, CONTACT_EMAIL, AVATAR_URL
- `src/locales/en.ts` + `vi.ts` — MODIFY: add bio1, bio2, skills, cta, ctaAriaLabel keys

### Design System Patterns to Apply
```tsx
// Contact CTA — use <a> with button classes, NOT <Button> component
<a
  href={`mailto:${CONTACT_EMAIL}`}
  aria-label={t.pages.about.ctaAriaLabel}
  className='inline-flex items-center justify-center rounded-md bg-zinc-800 px-3 py-2
             text-sm font-semibold text-zinc-100 hover:bg-zinc-700
             dark:bg-zinc-700 dark:hover:bg-zinc-600
             focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2
             focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
>
  {t.pages.about.cta}
</a>

// Social icon link
<a href={link.href} target='_blank' rel='noopener noreferrer'
   aria-label={link.label} className='group -m-1 p-1'>
  <GithubIcon className='h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600
                          dark:fill-zinc-400 dark:group-hover:fill-zinc-300'
              aria-hidden='true' />
</a>

// Skill category heading
<h2 className='text-sm font-semibold text-foreground'>{group.category[language]}</h2>

// Skill tag (within a group)
<span className='inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5
                 text-xs font-medium text-zinc-600
                 dark:bg-zinc-800 dark:text-zinc-400'>
  {skill}
</span>

// Skills section
<section className='mt-6'>
  <h2 className='text-sm font-semibold text-foreground'>{t.pages.about.skills}</h2>
  <div className='mt-4 flex flex-col gap-4'>
    {SKILLS.map(group => (
      <div key={group.category.en}>
        <h3 className='text-xs font-medium text-muted-foreground'>{group.category[language]}</h3>
        <div className='mt-2 flex flex-wrap gap-2'>
          {group.skills.map(skill => <span key={skill} ...>{skill}</span>)}
        </div>
      </div>
    ))}
  </div>
</section>
```

### Previous Story Intelligence
- `language` from `useI18n()` is `'en' | 'vi'` — safe to use as index: `group.category[language]`
- `localizedPath()` from `useI18n()` for internal `<Link>` hrefs — but CTA is `mailto:`, not a router Link
- For social icon links: use lucide-react `Github`, `Linkedin` icons. Check `import { Github, Linkedin } from 'lucide-react'` — these exist in the existing codebase (lucide-react is already installed)
- Biome: aria-label strings can use double quotes in JSX (Biome enforces single quotes for className/src but double for string props — check biome.json: `"jsxQuoteStyle": "single"` means single quotes for JSX props; aria-label should be `aria-label='...'`)

### References
- [Source: epics.md#Epic2-Story2.3] — AC definitions
- [Source: .claude/rules/design-system.md#UX-DR10] — Button patterns
- [Source: .claude/rules/design-system.md#UX-DR16] — ARIA requirements
- [Source: src/routes/$lang/about.tsx] — existing shell (two-column grid to preserve)
- [Source: src/shared/data/author.ts] — created in Story 2.1 (extends same file)

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
- src/routes/$lang/about.tsx
- src/shared/data/author.ts
- src/locales/en.ts
- src/locales/vi.ts
