# Story 1.2: Responsive Navigation

Status: review

## Story

As a visitor,
I want a clear, responsive navigation bar to move between all sections,
So that I can explore Home, Blog, Projects, and About from any page.

## Acceptance Criteria

1. **Desktop Nav:** At ≥1024px, horizontal nav with links to Home, Blog, Projects, About. Glass morphism applied to nav pill (UX-DR4). rounded-full pill radius (UX-DR15).

2. **Mobile Nav:** At <768px, hamburger button opens a Dialog with all section links. Menu closes on outside tap or repeated trigger.

3. **Active State:** Current section link highlighted teal with gradient underline (UX-DR12) on both desktop and mobile.

4. **Keyboard Accessibility:** All nav items reachable via Tab. Visible focus indicators. Icon-only buttons have aria-label (UX-DR16, NFR14).

5. **No Horizontal Scroll:** At 375px viewport, no content truncated or overflowed (UX-DR17).

## Context: Brownfield — ~85% Already Implemented

Core navigation components exist and are largely complete. Story focuses on **accessibility gaps and the missing glass morphism wrapper on Header.tsx**.

### What Already Exists (DO NOT recreate):
- `src/components/layout/Header.tsx` — Full sticky header structure, avatar scroll animation, responsive split (MobileNavbar/DesktopNavbar)
- `src/components/layout/navbar/desktop/index.tsx` — Nav pill with glass morphism, rounded-full, correct zinc/teal classes
- `src/components/layout/navbar/desktop/item.tsx` — Active state via `useLocation`, teal color + gradient underline
- `src/components/layout/navbar/mobile/index.tsx` — Dialog-based hamburger menu, open/close state
- `src/components/layout/navbar/mobile/item.tsx` — Active state detection added in Story 1.1
- `src/components/layout/navbar/constant.ts` — NAVBAR_ITEMS with Home, Projects, Blogs, About
- `src/shared/hooks/useHeader.tsx` — Scroll-driven avatar scaling, home page detection via regex

### What Is Missing:
- **Header.tsx line 32**: The `div` wrapping the header content is missing glass morphism classes
- **mobile/index.tsx**: Hamburger `<Button>` has no `aria-label`
- **I18nSwitcher.tsx**: `<SelectTrigger>` has no `aria-label`
- **desktop/item.tsx + mobile/item.tsx**: No visible focus ring styling on nav links

## Tasks / Subtasks

- [x] **Task 1: Fix Header.tsx glass morphism wrapper** (AC: #1)
  - [x] 1.1: Confirmed no change needed — Header.tsx is a transparent positioning container only.
  - [x] 1.2: Each floating element (nav pill, ThemeToggle, I18nSwitcher) carries its own glass morphism. Correct Spotlight pattern.

- [x] **Task 2: Add aria-label to hamburger button** (AC: #4)
  - [x] 2.1: Added dynamic `aria-label={open ? "Close navigation menu" : "Open navigation menu"}` to Button. Added `aria-hidden='true'` to List icon.

- [x] **Task 3: Add aria-label to I18nSwitcher** (AC: #4)
  - [x] 3.1: Added `aria-label='Switch language'` to `<SelectTrigger>`.

- [x] **Task 4: Add focus rings to nav items** (AC: #4)
  - [x] 4.1: Added `focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400` to desktop `<Link>`.
  - [x] 4.2: Same focus ring classes added to mobile `<Link>`.
  - [x] 4.3: Hamburger aria-label done in Task 2. shadcn Button has built-in focus-visible ring.

- [x] **Task 5: Verify all acceptance criteria** (AC: #1–5)
  - [x] 5.1: Glass morphism on nav pill confirmed present. 4 nav items in NAVBAR_ITEMS.
  - [x] 5.2: Mobile Dialog with hamburger trigger confirmed. Active teal state present.
  - [x] 5.3: Focus rings added to all nav Link elements.
  - [x] 5.4: `npm run build` passes (✓ built in 4.47s).
  - [x] 5.5: Biome passes — 1 auto-fix applied (quote normalization), 0 errors.

## Dev Notes

### Architecture Compliance
- **Glass morphism pattern**: Each floating element (nav pill, theme toggle, language switcher) carries its own `bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:ring-white/10`. The Header wrapper div is a positioning/layout container only.
- **SSR Safety**: No window/document access during render. `useHeader` hook already handles this.
- **Tailwind mobile-first**: Default styles for mobile, `md:` prefix for desktop-only elements.

### Key File Locations
- `src/components/layout/Header.tsx` — outer header layout and positioning
- `src/components/layout/navbar/desktop/item.tsx` — active state + teal color (add focus ring here)
- `src/components/layout/navbar/mobile/index.tsx` — hamburger trigger (add aria-label here)
- `src/components/layout/I18nSwitcher.tsx` — language switcher trigger (add aria-label here)
- `src/components/layout/ThemeToggle.tsx` — already has `aria-label`, reference for pattern

### Design System Reference
- Glass morphism (§4): `bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:ring-white/10`
- Active nav (§4 Links): `text-teal-500 dark:text-teal-400` + gradient underline
- Focus ring (§8): `outline-offset-2` with teal color

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- Header.tsx required no changes — glass morphism is per-element (Spotlight pattern), not on the wrapper
- Hamburger aria-label is dynamic: "Open/Close navigation menu" based on `open` state
- Focus rings use `focus-visible:` (not `focus:`) to avoid showing on mouse click — keyboard-only
- `aria-hidden='true'` added to decorative List icon inside hamburger button

### File List
- src/components/layout/navbar/mobile/index.tsx
- src/components/layout/navbar/desktop/item.tsx
- src/components/layout/navbar/mobile/item.tsx
- src/components/layout/I18nSwitcher.tsx
