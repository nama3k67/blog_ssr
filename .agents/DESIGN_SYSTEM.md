# Design System Instructions — Spotlight-Inspired Blog App

> This document defines the visual language, component patterns, and coding conventions
> for the blog application. All AI agents, human contributors, and automated linting
> must follow these rules to maintain visual and structural consistency.
>
> **Constitution Reference**: For broader engineering principles (testing, performance,
> documentation), see [`.specify/memory/constitution.md`](../.specify/memory/constitution.md).
> This design system focuses on UI/UX implementation details.

---

## 1. Color Palette

### Neutral Scale: **Zinc**

All neutral/gray colors MUST use the `zinc` palette. **Never** use `gray`, `slate`, `stone`, or `neutral`.

| Token                   | Light Mode Usage          | Dark Mode Usage            |
|-------------------------|---------------------------|----------------------------|
| `zinc-50`               | Page background (`bg`)    | —                          |
| `zinc-100`              | Borders, dividers, HR     | —                          |
| `zinc-200`              | Secondary borders         | —                          |
| `zinc-400`              | Captions, muted text      | Body text (prose)          |
| `zinc-500`              | Social icons, decorators  | Captions, muted text       |
| `zinc-600`              | Body text                 | —                          |
| `zinc-700`              | —                         | Borders `/40` opacity      |
| `zinc-800`              | Headings, nav text        | Nav/card background `/90`  |
| `zinc-900`              | Heading text, pre bg      | Content area ring          |
| `white`                 | Card/nav surfaces         | —                          |
| `black`                 | —                         | Page background            |

### Accent Scale: **Teal**

All interactive/accent colors MUST use `teal`. **Never** use `blue`, `indigo`, or `green` for accents.

| Token         | Usage                                |
|---------------|--------------------------------------|
| `teal-400`    | Dark mode links, active nav          |
| `teal-500`    | Light mode links, CTA text, accents  |
| `teal-600`    | Light mode link hover                |

### Semantic Colors (shadcn CSS Variables)

For shadcn/ui components, use the CSS variable system (`primary`, `secondary`, `muted`, etc.).
For custom components outside shadcn, use the zinc/teal palette directly.

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

Always use `prose dark:prose-invert` for article bodies. The custom typography config in
`typography.ts` handles all prose element styling (headings, links, code, blockquotes, etc.).

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

This creates the "content column" effect with a visible ring border.

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

Nav bar and theme toggle use "glass" style:

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

```
group relative flex flex-col items-start
```

Card hover effect:
```
absolute -inset-x-4 -inset-y-6 bg-zinc-50 dark:bg-zinc-800/50
scale-95 opacity-0 → group-hover:scale-100 group-hover:opacity-100
sm:-inset-x-6 sm:rounded-2xl
```

Card CTA pattern:
```
text-sm font-medium text-teal-500 + ChevronRight icon
```

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

### Forms/Inputs (Spotlight Style)

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

- ALWAYS provide dark mode variants for every visual element.
- Use `dark:` prefix, NOT media query approach.
- The dark variant class is applied via `&:is(.dark *)` selector.
- Page bg: `bg-zinc-50` → `dark:bg-black`
- Content area: `bg-white` → `dark:bg-zinc-900`
- Text defaults: `text-zinc-800` → `dark:text-zinc-100` (headings), `text-zinc-600` → `dark:text-zinc-400` (body)
- Borders: `border-zinc-100` → `dark:border-zinc-700/40`
- Rings: `ring-zinc-900/5` → `dark:ring-white/10` or `dark:ring-zinc-300/20`

---

## 6. Spacing & Rhythm

### Vertical Spacing

| Context              | Value               |
|----------------------|---------------------|
| Page top margin      | `mt-16 sm:mt-32`    |
| Content after header | `mt-16 sm:mt-20`    |
| Footer top margin    | `mt-32`             |
| Section gap          | `gap-16`            |
| Form field gap       | `space-y-6`         |

### Border Radius

- Nav pill: `rounded-full`
- Cards: `rounded-2xl` (on hover ghost)
- Buttons: `rounded-md` (primary) or `rounded-full` (icon)
- Images: `rounded-2xl` or `rounded-3xl`
- Code blocks: `rounded-3xl` (prose)

---

## 7. Transition & Animation

- Standard: `transition` (color changes, hovers)
- Active state: `active:transition-none`
- Duration: 150ms for link hover underlines
- Timing: `ease-in-out` for decorative transitions
- Scale: `scale-95 → scale-100` for card hover
- Opacity: `opacity-0 → opacity-100` for card hover

---

## 8. Accessibility

- Always include `aria-label` on icon-only buttons
- Use `aria-hidden="true"` on decorative SVG icons
- Use `sr-only` class for screen-reader-only labels
- Maintain visible focus rings via `outline-offset-2`
- Ensure adequate color contrast (zinc-600 on white, zinc-400 on black)

---

## 9. File Organization Conventions

```
src/
  components/
    layout/          # Header, Footer, ThemeToggle, I18nSwitcher, navbar/
    shared/          # Container, Card, Markdown, Prose – reusable across pages
    post/            # Blog post specific components
    ui/              # shadcn/ui primitives (button, input, dialog, etc.)
  routes/
    __root.tsx       # Root layout (ThemeProvider, ClerkProvider, I18n)
    $lang/           # Language-prefixed routes
  shared/
    constants/       # i18n constants, feature flags
    hooks/           # Custom hooks (useHeader, useTranslation)
    lib/             # Utilities (cn, etc.)
    providers/       # Context providers (theme, i18n)
    services/        # Data fetching (post service)
    types/           # TypeScript types
    utils/           # Pure utility functions
  locales/           # i18n dictionaries
```

---

## 10. Code Style Rules

**Constitution Compliance**: These rules implement Principle I (Code Quality) and Principle III (UX Consistency) from the [project constitution](../.specify/memory/constitution.md).

1. **Use `clsx` or `cn`** for conditional class composition — never string concatenation.
2. **Prefer Tailwind classes** over inline styles, except for CSS custom property bindings.
3. **Component typing**: Use generic `<T extends ElementType>` for polymorphic components.
4. **No hardcoded colors**: All colors must come from the zinc/teal palette or CSS variables.
5. **Always forward refs** on layout components (Container, etc.).
6. **Responsive**: Always think mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.
7. **Dark mode**: Every visual class must have a `dark:` counterpart.
8. **TypeScript strict**: No `any` types without explicit justification (see Constitution Principle I).
9. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation (see Constitution Principle III).

---

## Linting Checklist

When reviewing or generating UI code, verify:

- [ ] Only `zinc` and `teal` color families are used (no gray/slate/blue/green)
- [ ] Dark mode variants exist for all visual classes
- [ ] Text uses the correct hierarchy (h1→4xl/5xl, body→base, muted→sm)
- [ ] Container system is used for page layout (not arbitrary max-width)
- [ ] Card components use the hover ghost pattern
- [ ] Links use teal accent colors
- [ ] Glass morphism pattern for nav/floating elements
- [ ] Proper spacing rhythm (mt-16 sm:mt-32 for pages)
- [ ] `prose dark:prose-invert` for article content
- [ ] No inline color values (rgb/hex/oklch) in JSX — use Tailwind classes
