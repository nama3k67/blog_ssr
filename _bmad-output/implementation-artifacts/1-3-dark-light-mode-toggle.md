# Story 1.3: Dark/Light Mode Toggle

Status: review

## Story

As a visitor,
I want to toggle between dark and light mode,
So that I can read content comfortably in any lighting condition.

## Acceptance Criteria

1. **System Preference:** On first visit, theme matches `prefers-color-scheme`. Browser APIs accessed in `useEffect` only (SSR safety).

2. **Instant Transition:** Clicking toggle updates all visual elements immediately. Page bg zinc-50↔black, content bg white↔zinc-900, headings zinc-800↔zinc-100 (UX-DR3). No layout shift (CLS < 0.1).

3. **Persistence:** Dark mode preference persists via localStorage across reloads. No flash of wrong theme on load (FR19).

4. **Reduced Motion:** When `prefers-reduced-motion: reduce`, transitions are suppressed (NFR16).

## Context: Brownfield — ~90% Already Implemented

Theme provider and toggle are fully functional. Only `prefers-reduced-motion` support is missing.

### What Already Exists (DO NOT recreate):
- `src/shared/providers/theme.tsx` — Full ThemeProvider: reads localStorage on init (SSR-safe), writes to localStorage on change, listens to system `prefers-color-scheme` via `matchMedia`, resolves system theme, applies `.dark`/`.light` class to `<html>`
- `src/components/layout/ThemeToggle.tsx` — Toggle button with Sun/Moon icons, `aria-label`, `mounted` guard to prevent hydration mismatch
- `src/styles.css` — `.dark` class defined, Tailwind `@custom-variant dark (&:is(.dark *))` registered
- `src/routes/__root.tsx` — `<ThemeProvider>` mounted with `storageKey="theme"` and `defaultTheme="system"`
- `src/components/layout/Header.tsx` — ThemeToggle rendered in header (desktop, `hidden md:block`)

### What Is Missing:
- **styles.css**: No `@media (prefers-reduced-motion: reduce)` rule to suppress transitions — NFR16 not met

### Minor Note:
- ThemeToggle is `hidden md:block` in `Header.tsx` — only visible on desktop. On mobile, theme is not user-controllable via a button. This is a deliberate design choice (mobile toggle can be added to the mobile nav dialog in a future story if needed). No action required for this story.

## Tasks / Subtasks

- [x] **Task 1: Add prefers-reduced-motion support** (AC: #4)
  - [x] 1.1: Added `@media (prefers-reduced-motion: reduce)` block inside `@layer base` in `src/styles.css`. Suppresses all animation-duration, transition-duration, and scroll-behavior.
  - [x] 1.2: Covers theme toggle transitions, card hover animations, and nav hover effects globally.

- [x] **Task 2: Verify all acceptance criteria** (AC: #1–4)
  - [x] 2.1: System preference via matchMedia in ThemeProvider useEffect — confirmed SSR-safe.
  - [x] 2.2: localStorage write on theme change confirmed in theme.tsx (Story 1.1 fix).
  - [x] 2.3: No FOUC — ThemeProvider reads localStorage synchronously in useState initializer.
  - [x] 2.4: `npm run build` passes (✓ built in 4.31s).
  - [x] 2.5: Biome passes — 0 errors.

## Dev Notes

### Architecture Compliance
- **SSR Safety**: `typeof window === "undefined"` guard in ThemeProvider's `useState` initializer ensures no localStorage access during SSR. The `useEffect` handles all client-side side effects.
- **No FOUC**: Theme is applied during `useState` initialization from localStorage — reads synchronously on first client render before paint.
- **CSS variables**: `styles.css` `:root`/`.dark` blocks define all semantic color tokens (e.g., `--foreground: var(--color-zinc-800)`). The `.dark` class on `<html>` triggers Tailwind's `dark:` variant via `@custom-variant dark (&:is(.dark *))`.

### prefers-reduced-motion Context
Tailwind 4 provides `motion-safe:` and `motion-reduce:` variants, but a global CSS rule is simpler and more complete. Place the media query in `@layer base` to avoid specificity issues.

### Key File Location
- `src/styles.css` — only file to change. Add inside `@layer base`.

### Design System Reference
- NFR16: "Animations and transitions respect prefers-reduced-motion media query"
- §7 Transitions: Standard `transition` for color/hover — these should be suppressed under reduced motion

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- Single file change: prefers-reduced-motion block added inside @layer base in styles.css
- Uses !important to override Tailwind's transition/animation utilities globally
- All other ACs (system pref, persistence, no FOUC) were already implemented from Story 1.1

### File List
- src/styles.css
