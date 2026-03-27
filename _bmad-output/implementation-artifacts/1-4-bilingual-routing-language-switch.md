# Story 1.4: Bilingual Routing & Language Switch

Status: review

## Story

As a visitor,
I want to switch between English and Vietnamese,
So that I can read the site in my preferred language.

## Acceptance Criteria

1. **Root Redirect:** Navigating to `/` redirects to `/$lang` based on stored preference or browser language, defaulting to `en`.

2. **Language Switch:** Clicking the switcher updates the URL from `/en/posts` to `/vi/posts`. All UI strings update via `useI18n()`. No layout shift (NFR6, CLS < 0.1).

3. **Preference Persistence:** After switching to `vi`, the `$lang` prefix stays `vi` across all navigations. Language preference is persisted for future visits (FR19).

4. **Invalid Lang Redirect:** Navigating to `/fr/posts` resolves to English content (default fallback).

5. **No Hardcoded Text:** All UI strings use `t()` from `useI18n()`. Both `en.ts` and `vi.ts` contain all navigation and layout strings.

## Context: Brownfield — ~85% Already Implemented

Bilingual routing and the switcher UI are fully implemented. Only localStorage persistence of the language preference is missing.

### What Already Exists (DO NOT recreate):
- `src/routes/$lang/` — all public routes use `$lang` param
- `src/routes/index.tsx` — redirects `/` to `/$lang` using `getBrowserLanguage()` or default `en`
- `src/shared/providers/i18n.tsx` — `I18nProvider` provides `language`, `t`, `localizedPath()`, `useI18n()`
- `src/components/layout/I18nSwitcher.tsx` — Select dropdown that calls `getLocalizedPath(pathname, newLang)` and navigates
- `src/shared/utils/i18n.ts` — `isValidLanguage()`, `getValidLanguage()`, `getLocalizedPath()`
- `src/shared/constants/i18n.ts` — `SUPPORTED_LANGUAGES = ['en', 'vi']`, `defaultLanguage = 'en'`
- `src/locales/en.ts`, `vi.ts` — complete translation dictionaries (navbar, userMenu, theme, i18n, pages, common, editor)
- `src/routes/__root.tsx` — extracts `$lang` from pathname, calls `getValidLanguage()`, passes to `I18nProvider`

### What Is Missing:
- **`src/shared/providers/i18n.tsx`**: Language preference is NOT persisted to localStorage. On page reload, language falls back to browser detection (via `routes/index.tsx`), not the user's explicit choice. FR19 requires persistence.
- **`src/routes/index.tsx`**: Should prefer localStorage-stored preference over browser language detection.

### Current Persistence Flow (broken):
```
User selects 'vi' → URL changes to /vi/... → useI18n() reads from URL ✓
User refreshes → routes/index.tsx reads browser language → may redirect to /en/ ✗
```

### Target Persistence Flow:
```
User selects 'vi' → URL changes to /vi/... → write 'vi' to localStorage
User refreshes → routes/index.tsx reads localStorage first → redirects to /vi/ ✓
```

## Tasks / Subtasks

- [x] **Task 1: Persist language preference to localStorage** (AC: #3)
  - [x] 1.1: Read i18n.tsx — simple provider, language comes from URL param via __root.tsx.
  - [x] 1.2: Added `useEffect(() => { localStorage.setItem('language', language) }, [language])` with try/catch in `I18nProvider`.
  - [x] 1.3: Fires whenever URL $lang changes, persisting the user's current language.

- [x] **Task 2: Read localStorage preference in root redirect** (AC: #1, #3)
  - [x] 2.1: Read routes/index.tsx — simple beforeLoad with getBrowserLanguage().
  - [x] 2.2: Updated priority: localStorage → getBrowserLanguage() → defaultLanguage.
  - [x] 2.3: SSR-safe: wrapped in `typeof window !== 'undefined'` check.
  - [x] 2.4: Stored value passed through `getValidLanguage()` before use.

- [x] **Task 3: Verify all acceptance criteria** (AC: #1–5)
  - [x] 3.1: URL stays /vi/... across navigation ✓ (existing behaviour).
  - [x] 3.2: Switch to vi → reload → stays /vi/ (new persistence flow).
  - [x] 3.3: Invalid lang /fr/ falls back to English via getValidLanguage ✓.
  - [x] 3.4: / redirects to /$lang with stored preference ✓.
  - [x] 3.5: `npm run build` passes (✓ built in 4.93s).
  - [x] 3.6: Biome passes — 1 auto-fix (quote normalization), 0 errors.

## Dev Notes

### Architecture Compliance
- **SSR Safety**: Never access `localStorage` during SSR render. All `localStorage` reads/writes must be in `useEffect` or guarded by `typeof window !== 'undefined'`. TanStack Router's `beforeLoad` runs server-side on initial SSR request — guard it.
- **Language validation**: Always pass user-supplied language through `getValidLanguage()` before using. The function returns `'en'` for any unsupported value.
- **i18n source of truth**: The URL `$lang` param IS the source of truth for the current language. `localStorage` is only used as a preference hint for the root `/` redirect. Never override the URL-provided language from localStorage.

### Correct Storage Key
Use `'language'` as the localStorage key (mirrors the `'theme'` key pattern in `theme.tsx`).

### Key File Locations
- `src/shared/providers/i18n.tsx` — add useEffect to persist language (Task 1)
- `src/routes/index.tsx` — update redirect priority to prefer localStorage (Task 2)
- `src/shared/utils/i18n.ts` — `getValidLanguage()` utility (use, don't modify)
- `src/shared/constants/i18n.ts` — `defaultLanguage`, `SUPPORTED_LANGUAGES` (read-only reference)

### Previous Story Intelligence
- Story 1.1 fixed `theme.tsx` persistence using the same pattern: `useEffect` + `localStorage.setItem` with try/catch. Follow the exact same pattern for i18n.
- Biome enforces exhaustive deps — add `language` to the `useEffect` dependency array.

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- i18n.tsx: useEffect pattern mirrors theme.tsx persistence (Story 1.1) exactly
- routes/index.tsx: localStorage guard handles SSR — beforeLoad runs server-side on initial request
- getValidLanguage() prevents stale/invalid stored values from causing routing errors

### File List
- src/shared/providers/i18n.tsx
- src/routes/index.tsx
