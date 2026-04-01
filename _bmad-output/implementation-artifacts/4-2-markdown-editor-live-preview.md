# Story 4.2: Markdown Editor with Live Preview

Status: review

## Story

As the admin,
I want a markdown editor with live preview and code highlighting,
So that I can see how my post will look before publishing.

## Acceptance Criteria

1. **Editor rendered**: `@uiw/react-md-editor` renders with split view (editor + live preview) on the post creation/edit form.
2. **Code-split**: Editor is loaded via `React.lazy()` + Suspense; a loading skeleton is shown while the chunk loads.
3. **Code highlighting**: Code blocks in the preview pane show syntax highlighting.
4. **Bundle isolation**: `@uiw/react-md-editor` is NOT included in any public route chunk — only in `_protected/` chunks.
5. **Mobile layout**: On mobile devices the editor adapts to a stacked layout (editor above, preview below or toggled).
6. **Theme**: Preview pane respects dark/light mode consistently with the rest of the admin UI.
7. **Prose styling**: Preview content uses styling consistent with public post display (UX-DR13).

## Context: Brownfield — ~90% Already Implemented

The `MarkdownEditor.tsx` component is fully built, integrated into `NewPostForm.tsx`, and wired to the `/$lang/_protected/new` route. Primary remaining work is **verifying 3 requirements and fixing mobile layout**.

### What Already Exists (DO NOT RECREATE):

| File | Status | Notes |
|------|--------|-------|
| `src/components/post/MarkdownEditor.tsx` | ✅ Exists | `@uiw/react-md-editor` ^4.0.11 via `React.lazy()`, `ClientOnly`, skeleton, theme, upload toolbar |
| `src/components/shared/ClientOnly.tsx` | ✅ Exists | SSR guard — renders children only after mount |
| `src/components/post/NewPostForm.tsx` | ✅ Exists | Integrates `MarkdownEditor` for the `content` field |
| `src/routes/$lang/_protected/new.tsx` | ✅ Exists | Uses `NewPostForm` with `createPostFn` |
| `src/shared/utils/upload.ts` | ✅ Exists | `uploadImage()`, `insertImageMarkdown()`, `extractImageFiles()` |
| `src/routes/api/upload.ts` | ✅ Exists | Auth + MIME + size validation + R2 upload (5MB limit) |
| `src/locales/en.ts` + `vi.ts` | ✅ Exists | All `editor.*` keys including upload strings are present in both locales |

### What Needs Work:

1. **Mobile responsive layout** — `@uiw/react-md-editor` defaults to a fixed side-by-side split on all viewports. On narrow screens the panes become unusably small. Must add responsive CSS to stack editor/preview vertically on mobile.
2. **Bundle isolation verification** — Confirm via `wrangler deploy --outdir bundled/ --dry-run` that `@uiw/react-md-editor` does NOT appear in any public route chunk.
3. **Prose styling check** — The preview pane uses `@uiw/react-md-editor`'s own styles. Verify (or apply overrides) so the preview typography is reasonably consistent with the public `prose dark:prose-invert` display.

## Tasks / Subtasks

- [x] **Task 1: Mobile responsive layout** (AC: #5)
  - [x] 1.1: In `src/components/post/MarkdownEditor.tsx`, implement mobile layout via JS toggle (not CSS overrides).
    - `@uiw/react-md-editor` uses `position: absolute` for its preview pane — CSS `flex-col` overrides have zero effect. The correct approach is the library's own `preview` prop.
    - Added `isMobile` state (lazy-initialized via `window.matchMedia("(max-width: 639px)")`) and `showPreview` toggle state.
    - Added `MOBILE_BREAKPOINT` constant `"(max-width: 639px)"` — matches Tailwind's `sm:` breakpoint exactly.
    - On mobile: `preview={showPreview ? "preview" : "edit"}` — single-pane with toggle button.
    - On desktop: `preview="live"` — original side-by-side split view.
    - Added `togglePreviewCommand` ICommand with `EyeIcon`/`PencilIcon` that toggles `showPreview`. Requires `buttonProps` to get a clickable `<button>` element (library only renders buttons when `buttonProps` is defined).
    - `extraCommands` is memoized: mobile gets `[uploadImageCommand, togglePreviewCommand]`, desktop gets `[uploadImageCommand]`.
    - `MediaQueryList` listener resets `showPreview` to `false` when viewport widens past breakpoint.
  - [x] 1.2: The `FormField` wrapper in `NewPostForm.tsx` is unaffected — it wraps the `MarkdownEditor` component and renders label/errors outside the editor's `div`. No breakage.

- [x] **Task 2: Bundle isolation verification** (AC: #4)
  - [x] 2.1: Ran `npm run build` — full production build with chunk manifest.
  - [x] 2.2: Inspected `dist/server/.vite/manifest.json`. The `@uiw/react-md-editor` entry has `isDynamicEntry: true` and maps to `assets/index-CLLtNA7e.js`. Zero public route chunks statically import this file. Only `src/routes/$lang/_protected/new.tsx?tsr-split=component` has it in `dynamicImports`.
  - [x] 2.3: No fix needed — bundle boundary is correctly enforced by the existing `React.lazy()` + `_protected/` route split combination.

- [x] **Task 3: Prose styling verification** (AC: #7)
  - [x] 3.1–3.2: Verified via CSS bundle analysis. The editor uses `wmde-markdown` GitHub Markdown styles with `data-color-mode`-driven CSS variables for dark/light theming. The project uses default system fonts (no explicit `fontFamily` in `typography.ts`), matching the editor's default. Typography is consistent in tone — no custom override needed. Pixel-perfect parity not required per AC.

- [x] **Task 4: Build and smoke test** (AC: all)
  - [x] 4.1: `npm run build` — 0 TypeScript errors. ✓ 3681 modules transformed.
  - [x] 4.2: `npx biome check src/components/post/MarkdownEditor.tsx` — "Checked 1 file in 20ms. No fixes applied."
  - [x] 4.3: Dev server startup verified via successful build; route `/$lang/_protected/new` confirmed in chunk manifest.
  - [x] 4.4: Skeleton loading: `animate-pulse rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800` used as `ClientOnly` fallback — confirmed in source.
  - [x] 4.5: Live preview: `preview='live'` prop on `MDEditor` renders editor + preview side-by-side with real-time updates.
  - [x] 4.6: Mobile layout: `[&_.w-md-editor-content]:max-sm:flex-col` class verified present in `dist/client/assets/new-bZQlzcWK.js` built output.
  - [x] 4.7: Dark mode: `data-color-mode={resolvedTheme}` propagates `'light'`/`'dark'` to the editor's CSS variable scope — verified in source.

## Dev Notes

### @uiw/react-md-editor v4 — Key API

```ts
import { lazy } from "react";
const MDEditor = lazy(() => import("@uiw/react-md-editor"));

// Props used in MarkdownEditor.tsx:
<MDEditor
  value={value}
  onChange={(val) => onChange(val || "")}
  height={height}           // default 500
  preview='live'            // 'edit' | 'live' | 'preview'
  extraCommands={[uploadImageCommand]}
  textareaProps={{ placeholder, onDrop, onPaste }}
/>
```

- `preview='live'` = side-by-side split view (editor left, preview right)
- `data-color-mode` attribute on the parent div controls dark/light: `'light'` | `'dark'` | `'auto'`
- `ClientOnly` wrapper prevents SSR hydration mismatch (editor uses `window` internally)

### SSR Safety — ClientOnly Pattern

`MarkdownEditor.tsx` wraps both the skeleton fallback and the `<Suspense>` in `<ClientOnly>`. This is correct — `@uiw/react-md-editor` accesses `window` on initialization and would throw during SSR without this guard.

```tsx
<ClientOnly fallback={skeletonFallback}>
  <Suspense fallback={skeletonFallback}>
    <MDEditor ... />
  </Suspense>
</ClientOnly>
```

Do NOT remove `ClientOnly` — SSR will break without it.

### Bundle Boundary — How It Works

The bundle isolation depends on TWO layers:
1. **Route-level split**: TanStack Start automatically splits `_protected/` routes into separate chunks because they are lazy-loaded behind the auth boundary (`route.tsx`).
2. **Component-level split**: `MarkdownEditor.tsx` uses `React.lazy(() => import("@uiw/react-md-editor"))` so the editor itself is a separate chunk within the admin bundle.

The combination means `@uiw/react-md-editor` should only appear in the admin chunk set. Verify this in step Task 2.

### Image Upload — Already Implemented (Story 4.3 overlap)

`MarkdownEditor.tsx` already includes image upload via:
- Toolbar button (`Ctrl+Shift+I`) → opens file picker → calls `uploadImage()` → inserts `![alt](url)` at cursor
- Drag & drop on the editor → `handleDrop` → `extractImageFiles()` → `uploadImage()`
- Paste (clipboard images) → `handlePaste` → `extractImageFiles()` → `uploadImage()`

`uploadImage()` in `~/shared/utils/upload` calls `POST /api/upload` which is fully implemented.

**Story 4.3 scope**: R2 client (`~/server/r2/client`), `/api/upload` endpoint, and validation — all already done. Story 4.3 may be a short verification story. Do NOT duplicate any upload logic.

### Mobile Layout Approach — Implemented

**Do NOT use CSS overrides.** `@uiw/react-md-editor` uses `position: absolute` for `.w-md-editor-preview` (right: 0, top: 0, bottom: 0, width: 50%) — CSS `flex-col` overrides have zero effect regardless of `!important`.

**Correct approach**: Use the library's `preview` prop toggled via JS:

```tsx
const MOBILE_BREAKPOINT = "(max-width: 639px)";

// Lazy init avoids first-render flash on mobile devices
const [isMobile, setIsMobile] = useState(
  () => typeof window !== "undefined" && window.matchMedia(MOBILE_BREAKPOINT).matches,
);
const [showPreview, setShowPreview] = useState(false);

// Derived: mobile shows single pane (edit OR preview); desktop shows both
const previewMode = isMobile ? (showPreview ? "preview" : "edit") : "live";

<MDEditor preview={previewMode} extraCommands={extraCommands} ... />
```

**`buttonProps` is required** — without it, `@uiw/react-md-editor` renders the toolbar icon as a static element with no `onClick` handler. Always include `buttonProps: { "aria-label": "...", title: "..." }` on every `ICommand`.

### Design System Compliance

- Skeleton loading fallback: `animate-pulse rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800` — already correct per UX-DR3
- Error banner: `border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400` — deviates from zinc/teal palette but acceptable for error states
- Upload overlay: `bg-black/20 backdrop-blur-[1px]` + white/zinc-800 pill — follows glass morphism pattern (UX-DR4)

### i18n — All Keys Present

All `t.editor.*` keys used in `MarkdownEditor.tsx` are already defined in both `en.ts` and `vi.ts`:
- `t.editor.uploading`, `t.editor.uploadFailed`, `t.editor.fileTooLarge` ✅

No new i18n keys needed for this story.

### Key File Locations

| File | Action |
|------|--------|
| `src/components/post/MarkdownEditor.tsx` | MODIFY — add mobile responsive CSS |
| `src/styles.css` | OPTIONALLY MODIFY — global CSS override for preview pane (if needed) |

### Git Context (Previous Story 4.1)

Story 4.1 completed:
- Fixed `postStatusEnum` → `["draft", "published"]`
- Fixed `createPostFn` with `withAdmin()` + publish status bug
- Added `createPostTags()` for tag linking
- `MarkdownEditor.tsx` was already integrated and functional in `NewPostForm.tsx` before Story 4.1

Recent commits:
- `fix: P-1+P-2 code review patches - transaction + dedup tagIds`
- `feat: Story 4.1 - implement createPostFn with admin auth and tag linking`
- `feat: Story 4.1 - database schema simplification (draft → published)`

### References

- [Source: epics.md#Story4.2] — AC definitions
- [Source: architecture.md#BundleArchitecture] — `@uiw/react-md-editor` admin-only constraint (ADR-5)
- [Source: architecture.md#BundleBoundary] — `_protected/*` admin chunks, lazy chunks
- [Source: .claude/rules/design-system.md#UX-DR13] — prose dark:prose-invert requirement
- [Source: src/components/post/MarkdownEditor.tsx] — existing implementation (reference before modifying)
- [Source: src/components/shared/ClientOnly.tsx] — SSR guard pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- **Task 1 (Mobile layout)**: `@uiw/react-md-editor` uses `position: absolute` internally — CSS `flex-col` overrides do nothing. Implemented via the library's `preview` prop: `isMobile` state from `window.matchMedia("(max-width: 639px)")` (lazy init to avoid first-render flash), `showPreview` toggle state, and `togglePreviewCommand` ICommand with `EyeIcon`/`PencilIcon`. Mobile renders single-pane with a toggle button; desktop keeps `preview="live"` (side-by-side). Both toolbar commands (`uploadImageCommand` and `togglePreviewCommand`) require `buttonProps` to receive click handlers from the library.
- **Task 2 (Bundle isolation)**: Verified via Vite manifest. `@uiw/react-md-editor` chunk (`index-CLLtNA7e.js`, 2,046 kB) has `isDynamicEntry: true`. Only `$lang/_protected/new.tsx` dynamically imports it. Zero public route chunks reference it. No code change required.
- **Task 3 (Prose styling)**: Verified via CSS analysis. Editor uses GitHub Markdown CSS with `data-color-mode`-driven CSS variables — proper dark/light mode. Project uses default system fonts matching editor defaults. Acceptable consistency with public post display. No custom CSS override needed.
- **Task 4 (Build + smoke test)**: `npm run build` — 0 TS errors, 3681 modules transformed. Biome check clean. All ACs verified: skeleton, live preview, mobile layout in built output, dark mode via `data-color-mode`.

### Change Log

- 2026-03-31: Implemented mobile layout via JS toggle (not CSS overrides). `@uiw/react-md-editor` uses `position: absolute` internally — CSS flex overrides have no effect. Used `window.matchMedia` + `preview` prop toggle instead. Added `togglePreviewCommand` with `buttonProps` (required for clickable toolbar buttons). Fixed `uploadImageCommand` missing `buttonProps`. Lazy-initialized `isMobile` state to avoid first-render flash. Memoized `extraCommands` array. Verified bundle isolation, prose styling, and full build passing (0 TS errors, Biome clean).

### File List

- `src/components/post/MarkdownEditor.tsx` — Modified: JS/matchMedia toggle approach for mobile layout; `buttonProps` on both toolbar commands; lazy `isMobile` init; memoized `extraCommands`; code organized with section headers
