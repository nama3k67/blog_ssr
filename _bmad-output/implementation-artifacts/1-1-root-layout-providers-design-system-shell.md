# Story 1.1: Root Layout, Providers & Design System Shell

Status: ready-for-dev

## Story

As a visitor,
I want the site to load with a polished, consistent visual shell and server-rendered HTML,
so that I get an instant, professional first impression regardless of which page I land on.

## Acceptance Criteria

1. **SSR Rendering:** All public pages return fully server-rendered HTML (no client-only content gates). The Spotlight background pattern (fixed inset-0 content area with `bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20`) renders on every page.

2. **Providers Mounted:** `__root.tsx` mounts `I18nProvider > ClerkProvider > TanstackQueryProvider > ThemeProvider` correctly. Container system (`ContainerOuter > ContainerInner`) is available for all child routes.

3. **Global Styles Applied:** `styles.css` imports Tailwind 4, `tw-animate-css`, `@tailwindcss/typography`, and the Spotlight custom theme tokens. `typography.ts` config is loaded.

4. **Footer Visible:** Footer renders on all pages with navigation links, social icons, `mt-32` spacing, and zinc/teal palette with dark mode variants.

5. **Design System Compliance:** Only `zinc` and `teal` color families used (UX-DR1, UX-DR2). All visual elements have `dark:` variants (UX-DR3). Spacing follows rhythm: page top `mt-16 sm:mt-32`, content after header `mt-16 sm:mt-20` (UX-DR14).

6. **Theme Persistence:** Dark/light mode toggle persists across page reloads via localStorage (FR19).

7. **Mobile Nav Active State:** Mobile navigation items show active state with teal accent, matching desktop behavior.

8. **No Regressions:** All existing functionality (navigation, auth, i18n, theme toggle) continues to work after changes.

## Context: Brownfield Project — Most of Story 1.1 Already Exists

**CRITICAL:** This is NOT a greenfield story. The codebase audit reveals that ~95% of Story 1.1 is already implemented and functional. The story focuses on **fixing bugs and aligning existing code with the design system spec**.

### What Already Exists (DO NOT recreate):
- `src/routes/__root.tsx` — Full root layout with providers, Spotlight bg, `<head>` meta tags
- `src/shared/providers/theme.tsx` — Theme provider (has a bug, see tasks)
- `src/shared/providers/i18n.tsx` — I18n provider, fully functional
- `src/shared/providers/tanstackQuery.tsx` — Query provider, SSR-aware
- `src/components/shared/Container.tsx` — ContainerOuter/Inner, matches spec exactly
- `src/components/layout/Footer.tsx` — Complete with zinc/teal, dark mode
- `src/components/layout/Header.tsx` — Full sticky header with glass morphism
- `src/components/layout/index.tsx` — MainLayout wrapper
- `src/components/layout/navbar/` — Desktop + mobile navigation
- `src/components/layout/ThemeToggle.tsx` — Toggle button
- `src/components/layout/I18nSwitcher.tsx` — Language switcher with route update
- `src/components/layout/menu.tsx` — User menu with Clerk
- `src/shared/hooks/useHeader.tsx` — Scroll-driven header animation
- `src/shared/hooks/useTranslation.ts` — Deprecated shim (use `useI18n()` instead)
- `src/shared/constants/i18n.ts` — Language config
- `src/locales/en.ts`, `vi.ts`, `index.ts` — Full translation dictionaries
- `src/styles.css` — Global styles with Spotlight theme tokens
- `typography.ts` — Tailwind typography config
- `src/env.ts` — Type-safe env vars with `isAdmin()` helper
- `src/start.ts`, `src/router.tsx` — TanStack Start entry + router config

## Tasks / Subtasks

- [ ] **Task 1: Fix theme persistence bug** (AC: #6)
  - [ ] 1.1: In `src/shared/providers/theme.tsx`, add `localStorage.setItem(storageKey, newTheme)` when theme changes. The current `setTheme` only updates React state but never writes to localStorage, so theme resets on page reload.
  - [ ] 1.2: Verify the `useEffect` that applies `.dark`/`.light` classes also persists. Consider adding the localStorage write in the `useEffect` that runs when `theme` changes.
  - [ ] 1.3: Test: toggle to dark mode → refresh page → dark mode should persist.

- [ ] **Task 2: Fix mobile nav active state** (AC: #7)
  - [ ] 2.1: In `src/components/layout/navbar/mobile/item.tsx`, add active route detection (same pattern as `src/components/layout/navbar/desktop/item.tsx`).
  - [ ] 2.2: Apply `text-teal-500 dark:text-teal-400` to active mobile nav item, matching desktop behavior.
  - [ ] 2.3: Test: navigate to /en/posts → open mobile menu → "Blog" should be highlighted in teal.

- [ ] **Task 3: Fix `useHeader` home page detection** (AC: #8)
  - [ ] 3.1: In `src/shared/hooks/useHeader.tsx` line 16, change `pathname === "/"` to account for i18n-prefixed routes. All routes are `/{lang}/...`, so the home page path is `/{lang}` or `/{lang}/`, never `/`.
  - [ ] 3.2: Use a check like `pathname === `/${lang}/` || pathname === `/${lang}`` where `lang` is extracted from the path, OR compare against the known home route pattern.
  - [ ] 3.3: Test: visit /en/ → avatar scale animation should work on scroll.

- [ ] **Task 4: Design system alignment fixes** (AC: #5)
  - [ ] 4.1: In `src/components/layout/navbar/desktop/index.tsx`, change `backdrop-blur` to `backdrop-blur-sm` per design system spec (`.claude/rules/design-system.md` §4 Glass Nav).
  - [ ] 4.2: In `src/components/layout/index.tsx` (`MainLayout`), replace `text-foreground` with `text-zinc-800 dark:text-zinc-100` and `text-muted-foreground` with `text-zinc-600 dark:text-zinc-400` per design system convention (use direct zinc classes for custom components, CSS vars only for shadcn primitives).

- [ ] **Task 5: Code cleanup** (AC: #8)
  - [ ] 5.1: In `src/components/layout/navbar/mobile/index.tsx`, remove the commented-out block in `<DialogHeader>` (dead code referencing undefined `navigation.title`).
  - [ ] 5.2: In `src/components/layout/I18nSwitcher.tsx`, remove the `"use client"` directive on line 1 (Next.js artifact, no effect in TanStack Start).
  - [ ] 5.3: In `src/shared/providers/tanstackQuery.tsx`, reformat from 2-space indent to tabs to match project convention (Biome: tabs).

- [ ] **Task 6: Verify all acceptance criteria** (AC: #1-8)
  - [ ] 6.1: Run `npm run build` — verify no TypeScript errors.
  - [ ] 6.2: Run Biome format check — verify all modified files pass.
  - [ ] 6.3: Manual smoke test: visit `/en/`, `/en/posts`, `/en/projects`, `/en/about` — verify layout, Spotlight bg, footer, dark mode, and language switch all work.
  - [ ] 6.4: Test mobile viewport (375px) — verify no horizontal scroll, hamburger menu works, active state shows.

## Dev Notes

### Architecture Compliance
- **SSR Safety:** Never access `window`/`document`/`localStorage` during render — `useEffect` only. The theme provider already follows this for reads, but the persistence fix (Task 1) must also be in `useEffect`.
- **Bundle Boundary:** All layout components are in the main bundle (not lazy-loaded). This is correct — they render on every page.
- **Biome:** Tabs, double quotes for JS/TS, single quotes for JSX attributes. Run `npx biome check --apply` after changes.
- **i18n:** Use `useI18n()` (not the deprecated `useTranslation` hook) for all new code. Every user-facing string must use `t()`.

### Design System Reference
- Full spec: `.claude/rules/design-system.md`
- Colors: zinc (neutrals), teal (accents) — NEVER gray/slate/blue/green
- Glass nav: `bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:ring-white/10`
- Active nav: `text-teal-500 dark:text-teal-400` + gradient underline
- Container: `ContainerOuter > ContainerInner` (max-w-7xl > max-w-2xl/5xl)
- Page spacing: `mt-16 sm:mt-32` (top), `mt-16 sm:mt-20` (after header), `mt-32` (footer)

### Key Library Versions
- TanStack Start: ^1.159.5 | React: ^19.2.0 | Tailwind CSS: ^4.1.18
- Clerk: ^0.27.17 | Drizzle: ^0.45.1 | Zod: ^4.3.6

### Project Structure Notes
- All changes are within existing files — no new files needed for this story
- `src/shared/providers/theme.tsx` — bug fix (localStorage write)
- `src/shared/hooks/useHeader.tsx` — bug fix (home page detection)
- `src/components/layout/navbar/mobile/item.tsx` — enhancement (active state)
- `src/components/layout/navbar/desktop/index.tsx` — design system fix (backdrop-blur-sm)
- `src/components/layout/navbar/mobile/index.tsx` — cleanup (dead code)
- `src/components/layout/index.tsx` — design system fix (zinc classes)
- `src/components/layout/I18nSwitcher.tsx` — cleanup (remove "use client")
- `src/shared/providers/tanstackQuery.tsx` — formatting (tabs)

### References
- [Source: .claude/rules/design-system.md#4 — Glass Nav pattern]
- [Source: .claude/rules/design-system.md#5 — Dark Mode Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — SSR Safety Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1 — Acceptance Criteria]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
- src/shared/providers/theme.tsx
- src/shared/hooks/useHeader.tsx
- src/components/layout/navbar/mobile/item.tsx
- src/components/layout/navbar/desktop/index.tsx
- src/components/layout/navbar/mobile/index.tsx
- src/components/layout/index.tsx
- src/components/layout/I18nSwitcher.tsx
- src/shared/providers/tanstackQuery.tsx
