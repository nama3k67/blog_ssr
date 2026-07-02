# DESIGN.md — Portfolio Blog Design System

The single source of truth for this project's **visual language**: colors, typography, layout,
component patterns, and the UI coding conventions that keep them consistent. All UI code (anything
under `src/components/`, `src/routes/`, `src/shared/providers/`) must follow these rules.

**Aesthetic:** Spotlight-inspired · **zinc** neutrals · **teal** accent · glass morphism · full dark mode.

**Token source:** color/radius/type tokens live in [`src/styles.css`](src/styles.css); prose styling in
[`src/typography.ts`](src/typography.ts). This doc explains *how to apply* them.

### Contents
1. [Color Palette](#1-color-palette) · 2. [Typography](#2-typography) · 3. [Layout System](#3-layout-system) ·
4. [Component Patterns](#4-component-patterns) · 5. [Dark Mode](#5-dark-mode-rules) ·
6. [Spacing & Rhythm](#6-spacing--rhythm) · 7. [Transitions](#7-transition--animation) ·
8. [Accessibility](#8-accessibility) · 9. [Code Rules](#9-code-rules) · [Pre-commit Checklist](#pre-commit-checklist)

---

## 1. Color Palette

### Neutral Scale: Zinc

All neutral/gray colors MUST use `zinc`. **Never** use `gray`, `slate`, `stone`, or `neutral`.

| Token      | Light Mode                | Dark Mode                  |
|------------|---------------------------|----------------------------|
| `zinc-50`  | Page background           | —                          |
| `zinc-100` | Borders, dividers, HR     | —                          |
| `zinc-200` | Secondary borders         | —                          |
| `zinc-400` | Captions, muted text      | Body text (prose)          |
| `zinc-500` | Social icons, decorators  | Captions, muted text       |
| `zinc-600` | Body text                 | —                          |
| `zinc-700` | —                         | Borders `/40` opacity      |
| `zinc-800` | Headings, nav text        | Nav/card background `/90`  |
| `zinc-900` | Heading text, pre bg      | Content area ring          |
| `white`    | Card/nav surfaces         | —                          |
| `black`    | —                         | Page background            |

### Accent Scale: Teal

All interactive/accent colors MUST use `teal`. **Never** use `blue`, `indigo`, or `green` for accents.

| Token      | Usage                                |
|------------|--------------------------------------|
| `teal-400` | Dark mode links, active nav          |
| `teal-500` | Light mode links, CTA text, accents  |
| `teal-600` | Light mode link hover                |

### shadcn/ui Components

Use the CSS variable system (`primary`, `secondary`, `muted`, etc.) for shadcn components. Use zinc/teal directly for custom components.

---

## 2. Typography

### Font Sizes

Use the custom Spotlight text scale defined in `@theme`:
- `text-xs` (0.8125rem), `text-sm` (0.875rem), `text-base` (1rem), `text-lg` (1.125rem)
- `text-xl` (1.25rem), `text-4xl` (2rem), `text-5xl` (3rem)

### Heading Patterns

```
Page Title:     text-4xl sm:text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100
Section Title:  text-sm font-semibold text-zinc-800 dark:text-zinc-100
Card Title:     text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100
```

### Body Text

```
Primary body:   text-base text-zinc-600 dark:text-zinc-400
Secondary:      text-sm text-zinc-600 dark:text-zinc-400
Muted/caption:  text-sm text-zinc-400 dark:text-zinc-500
Timestamp:      text-xs text-zinc-400 dark:text-zinc-500
```

### Prose (Article Content)

Always use `prose dark:prose-invert` for article bodies. The custom typography config in `typography.ts` handles all prose element styling.

---

## 3. Layout System

### Container Hierarchy

```
ContainerOuter: sm:px-8 → mx-auto w-full max-w-7xl lg:px-8
ContainerInner: relative px-4 sm:px-8 lg:px-12 → mx-auto max-w-2xl lg:max-w-5xl
Container:      ContainerOuter > ContainerInner (combined)
```

### Page Background Pattern (Spotlight)

Every page renders a fixed background layer:

```tsx
<div className="fixed inset-0 flex justify-center sm:px-8 -z-10">
  <div className="flex w-full max-w-7xl lg:px-8">
    <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
  </div>
</div>
```

### Page Layout Pattern

```tsx
<Container className="mt-16 sm:mt-32">
  <header className="max-w-2xl">
    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
      {title}
    </h1>
    <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
      {intro}
    </p>
  </header>
  {children && <div className="mt-16 sm:mt-20">{children}</div>}
</Container>
```

---

## 4. Component Patterns

### Glass Nav/Header Elements

```
bg-white/90 dark:bg-zinc-800/90
backdrop-blur-sm
shadow-lg shadow-zinc-800/5
ring-1 ring-zinc-900/5 dark:ring-white/10
```

### Buttons

**Primary:**
```
bg-zinc-800 text-zinc-100 hover:bg-zinc-700
dark:bg-zinc-700 dark:hover:bg-zinc-600
font-semibold rounded-md py-2 px-3 text-sm
```

**Secondary:**
```
bg-zinc-50 text-zinc-900 hover:bg-zinc-100
dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800
font-medium rounded-md py-2 px-3 text-sm
```

### Cards (Blog Post Cards)

Base: `group relative flex flex-col items-start`

Hover ghost:
```
absolute -inset-x-4 -inset-y-6 bg-zinc-50 dark:bg-zinc-800/50
scale-95 opacity-0 → group-hover:scale-100 group-hover:opacity-100
sm:-inset-x-6 sm:rounded-2xl
```

CTA: `text-sm font-medium text-teal-500 + ChevronRight icon`

### Eyebrow / Date Decorator

```
text-sm text-zinc-400 dark:text-zinc-500
Optional decorator: h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500
```

### Social Icons

```
h-6 w-6 fill-zinc-500 transition
group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300
```

### Links

```
Navigation:    hover:text-teal-500 dark:hover:text-teal-400
Active nav:    text-teal-500 dark:text-teal-400
              + gradient underline: bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0
Footer links:  transition hover:text-teal-500 dark:hover:text-teal-400
```

### Forms/Inputs

```
bg-white dark:bg-zinc-700/15
shadow-md shadow-zinc-800/5
outline outline-zinc-900/10 dark:outline-zinc-700
placeholder:text-zinc-400 dark:placeholder:text-zinc-500
focus:ring-4 focus:ring-teal-500/10 focus:outline-teal-500
dark:focus:ring-teal-400/10 dark:focus:outline-teal-400
```

### Bordered Section

```
rounded-2xl border border-zinc-100 dark:border-zinc-700/40 p-6
```

---

## 5. Dark Mode Rules

- ALWAYS provide `dark:` variants for every visual element — no exceptions.
- Use `dark:` prefix, NOT CSS media queries.
- Page bg: `bg-zinc-50` → `dark:bg-black`
- Content area: `bg-white` → `dark:bg-zinc-900`
- Headings: `text-zinc-800` → `dark:text-zinc-100`
- Body: `text-zinc-600` → `dark:text-zinc-400`
- Borders: `border-zinc-100` → `dark:border-zinc-700/40`
- Rings: `ring-zinc-900/5` → `dark:ring-white/10` or `dark:ring-zinc-300/20`

---

## 6. Spacing & Rhythm

| Context              | Value            |
|----------------------|------------------|
| Page top margin      | `mt-16 sm:mt-32` |
| Content after header | `mt-16 sm:mt-20` |
| Footer top margin    | `mt-32`          |
| Section gap          | `gap-16`         |
| Form field gap       | `space-y-6`      |

### Border Radius

- Nav pill: `rounded-full`
- Cards: `rounded-2xl` (hover ghost)
- Buttons: `rounded-md` (primary), `rounded-full` (icon)
- Images: `rounded-2xl` or `rounded-3xl`
- Code blocks: `rounded-3xl` (prose)

---

## 7. Transition & Animation

- Standard: `transition` for color/hover changes
- Active state: `active:transition-none`
- Link hover underline duration: 150ms, `ease-in-out`
- Card hover: `scale-95 → scale-100`, `opacity-0 → opacity-100`

---

## 8. Accessibility

- `aria-label` on all icon-only buttons
- `aria-hidden="true"` on decorative SVGs
- `sr-only` for screen-reader-only text
- Visible focus rings via `outline-offset-2`
- Adequate contrast: zinc-600 on white, zinc-400 on black

---

## 9. Code Rules

1. Use `cn` (or `clsx`) for conditional classes — never string concatenation.
2. Prefer Tailwind classes over inline styles (except CSS custom property bindings).
3. Polymorphic components: use `<T extends ElementType>` generics.
4. No hardcoded color values — zinc/teal palette or CSS variables only.
5. Forward refs on all layout components (Container, etc.).
6. Mobile-first: default styles for mobile, use `sm:` / `md:` / `lg:` for larger.
7. Every visual class needs a `dark:` counterpart.
8. No `any` types without explicit justification.
9. Semantic HTML + ARIA labels + keyboard navigation.

---

## Pre-commit Checklist

Review before committing any UI code:

- [ ] Only `zinc` and `teal` color families (no gray/slate/blue/green)
- [ ] Dark mode variants on all visual classes
- [ ] Correct text hierarchy (page→4xl/5xl, body→base, muted→sm)
- [ ] Container system used for layout (not arbitrary max-width)
- [ ] Card hover ghost pattern applied
- [ ] Links use teal accent colors
- [ ] Glass morphism on nav/floating elements
- [ ] Spacing rhythm correct (`mt-16 sm:mt-32` for pages)
- [ ] `prose dark:prose-invert` for article content
- [ ] No inline color values (rgb/hex/oklch) in JSX
