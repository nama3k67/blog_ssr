# Performance Optimizations

## Cloudflare Worker Bundle Size

Cloudflare Workers free tier has a **3 MB compressed (gzip) limit** for worker size. Our blog app exceeded this during initial development.

### Optimization History

| Date | Change | Modules | Raw Size | Gzipped | Reduction |
|------|--------|---------|----------|---------|-----------|
| 2026-03-22 | Baseline (all Shiki bundled) | 333 | 15,420 KiB | 3,072 KiB | — |
| 2026-03-22 | Fine-grained Shiki imports (9 langs, 1 theme, JS regex engine) | 37 | 7,140 KiB | 1,589 KiB | **-48.3%** |
| 2026-03-22 | Lazy-load Markdown + Shiki on `$slug` route | 37 | 7,140 KiB | 1,589 KiB | Same total, faster initial load |

### What We Changed

#### 1. Shiki Tree-Shaking (saved ~8,280 KiB raw / ~1,483 KiB gzip)

**Problem:** Importing `codeToHtml` from `"shiki"` bundles ALL 250+ language grammars, 40+ themes, and the Oniguruma WASM engine (~14,300 KiB).

**Solution:** Switched to Shiki's fine-grained bundle API:
- `createHighlighterCoreSync` from `"shiki/core"` — only core, no auto-loaded languages
- `createJavaScriptRegexEngine` from `"shiki/engine/javascript"` — replaces the 608 KiB Oniguruma WASM with a pure JS regex engine
- Explicit imports of only 9 languages (`css`, `html`, `javascript`, `json`, `markdown`, `shellscript`, `sql`, `tsx`, `typescript`) and 1 theme (`nord`)
- Made `highlightCode` synchronous — no more `useEffect` + `useState` dance in `CodeBlock`

**File:** `src/shared/utils/markdown.ts`

#### 2. Lazy-Loading Markdown Renderer

**Problem:** The `Markdown` component (react-markdown + rehype + remark + Shiki) was statically imported in `$slug.tsx`, adding ~3 MB to the route chunk.

**Solution:** Lazy-load via `React.lazy()` with a `Suspense` skeleton fallback. The heavy markdown/syntax-highlighting code only loads when a user actually navigates to a blog post.

**File:** `src/routes/$lang/posts/$slug.tsx`

### Current Bundle Breakdown (top modules)

| Module | Size | Content |
|--------|------|---------|
| `index-*.js` | 2,047 KiB | react-markdown / remark / rehype unified ecosystem |
| `worker-entry-*.js` | 1,205 KiB | Cloudflare worker runtime + framework SSR |
| `Markdown-*.js` | 1,074 KiB | Shiki highlighter (9 langs + nord theme + JS engine) — lazy loaded |
| `router-*.js` | 862 KiB | TanStack Router |
| `index-*.js` | 799 KiB | React / core framework |

### Future Optimization Opportunities

| Opportunity | Impact | Effort | Notes |
|-------------|--------|--------|-------|
| Server-side pre-highlighting | High | Medium | Highlight at post save/publish time, store rendered HTML. Eliminates Shiki from client entirely |
| Replace react-markdown | High | High | The remark/rehype ecosystem is ~2 MB. A lighter parser (e.g., `marked` + `DOMPurify`) could cut this significantly |
| Add more Shiki languages on-demand | Low | Low | If users request syntax highlighting for additional languages, import them individually in `markdown.ts` |
| Code-split TanStack Router | Medium | Low | Investigate if route-level code splitting reduces the 862 KiB router chunk |
| Compress with brotli | Low | Low | Check if Cloudflare applies brotli instead of gzip — could further reduce compressed size |

### Best Practices Established

1. **Never use bare `"shiki"` imports** — always use `"shiki/core"` with explicit lang/theme imports
2. **Use `shiki/engine/javascript`** instead of the default Oniguruma WASM engine for Cloudflare Workers (saves ~608 KiB, avoids WASM compatibility issues)
3. **Lazy-load heavy rendering components** — Markdown rendering, code editors, and syntax highlighters should use `React.lazy()` + `Suspense`
4. **Monitor worker size with `--dry-run`** — run `npx wrangler deploy --outdir bundled/ --dry-run` before deploying to catch size regressions
5. **Keep `bundled/` gitignored** — it's a build artifact from `--outdir`
