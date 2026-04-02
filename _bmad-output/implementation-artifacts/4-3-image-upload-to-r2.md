# Story 4.3: Image Upload to R2

Status: done

## Story

As the admin,
I want to upload images from the post editor,
So that I can include visuals in my blog posts.

## Context: Brownfield — ~70% Already Implemented

The upload pipeline (R2 client, API endpoint, client utilities, MarkdownEditor UX) was built during Stories 4.1/4.2. The remaining work is **fixing spec deviations and implementing missing server-side validations**.

**DO NOT recreate any existing logic.** The upload infrastructure is working end-to-end. Patch the gaps listed below.

### What Already Exists (DO NOT RECREATE):

| File | Status | Notes |
|------|--------|-------|
| `src/server/r2/client.ts` | ✅ Exists | `uploadToR2(buffer, key, contentType)`, `deleteFromR2(key)` via `aws4fetch` |
| `src/routes/api/upload.ts` | ✅ Exists | Auth, MIME type check, size check, R2 upload, returns `{ url, key }` |
| `src/shared/utils/upload.ts` | ✅ Exists | `uploadImage()`, `insertImageMarkdown()`, `extractImageFiles()`, `isImageFile()` |
| `src/components/post/MarkdownEditor.tsx` | ✅ Exists | Toolbar button, drag & drop, paste, uploading overlay, error banner, file input |
| i18n keys `t.editor.*` | ✅ Exists | `uploading`, `uploadFailed`, `fileTooLarge`, `maxFileSize`, `uploadImage`, `dragDropOrPaste` |

### What Needs Fixing / Adding:

| Gap | Severity | Location |
|-----|----------|----------|
| File size limit is 5MB — spec requires 500KB | HIGH | `upload.ts` + `MarkdownEditor.tsx` + `en.ts` + `vi.ts` |
| No magic bytes validation (NFR10 requires MIME + magic bytes) | HIGH | `upload.ts` |
| No image width validation (spec: reject >2000px) | MEDIUM | `upload.ts` |
| No Cache-Control header on R2 PUT (FR31) | MEDIUM | `src/server/r2/client.ts` |
| Storage path doesn't include userId or use UUID (spec: `uploads/{userId}/{uuid}.{ext}`) | HIGH | `upload.ts` |
| Response missing `filename` and `size` fields (AC6) | LOW | `upload.ts` + `src/shared/utils/upload.ts` |
| Error banner has no retry button (NFR18: "retry capability") | MEDIUM | `MarkdownEditor.tsx` |

## Acceptance Criteria

1. **File picker / drag accepted**: Clicking the upload toolbar button or dragging an image into the editor accepts the file and begins upload.
2. **Image-only filter**: Only `image/*` files are selectable via the file picker; non-image drops/pastes are silently ignored.
3. **Progress indicator**: An uploading overlay is shown while the upload is in-flight.
4. **R2 upload via aws4fetch**: Valid images are uploaded to R2 via `POST /api/upload` → `uploadToR2()`.
5. **URL insertion**: On success, `![altText](url)` is inserted at cursor (toolbar/paste/drop) or appended (fallback).
6. **Response includes url, filename, and size**: `POST /api/upload` returns `{ url, filename, size }`.
7. **500KB size limit enforced**: Files >500KB are rejected server-side (error code `FILE_TOO_LARGE`). Client-side check aligned to 500KB.
8. **2000px width limit enforced**: Files >2000px wide are rejected server-side (error code `IMAGE_TOO_WIDE`).
9. **MIME + magic bytes validated**: Server rejects mismatched MIME types or invalid magic bytes (`INVALID_FILE_TYPE`). Toast displayed on rejection (NFR18).
10. **Authenticated uploads only**: Unauthenticated requests to `/api/upload` return 401.
11. **Cache headers set (FR31)**: `Cache-Control: public, max-age=31536000, immutable` added to R2 PUT request.
12. **Storage path**: Uploaded objects stored at `uploads/{userId}/{uuid}.{ext}`.
13. **Retry button**: Error banner includes a "Retry" action that re-triggers the last failed upload (NFR18).

## Tasks / Subtasks

- [x] **Task 1: Fix file size limit to 500KB** (AC: #7)
  - [x] 1.1: In `src/routes/api/upload.ts`, change `MAX_FILE_SIZE = 5 * 1024 * 1024` → `512 * 1024` (500KB).
  - [x] 1.2: In `src/components/post/MarkdownEditor.tsx`, change `MAX_FILE_SIZE = 5 * 1024 * 1024` → `512 * 1024`.
  - [x] 1.3: In `src/locales/en.ts` + `vi.ts`, update `editor.maxFileSize` and `editor.fileTooLarge` strings from "5MB" to "500KB".

- [x] **Task 2: Add magic bytes validation** (AC: #9, NFR10)
  - [x] 2.1: In `src/routes/api/upload.ts`, after `await file.arrayBuffer()`, run `validateMagicBytes(buffer, file.type)` before calling `uploadToR2`.
  - [x] 2.2: Implement `validateMagicBytes(buffer: ArrayBuffer, declaredType: string): boolean` inline in `upload.ts` — check the first 12 bytes against known signatures (see Dev Notes for byte patterns). Return `false` if MIME/bytes mismatch.
  - [x] 2.3: If validation fails, return `{ error: "INVALID_FILE_TYPE" }` with status 400.

- [x] **Task 3: Add image width validation** (AC: #8)
  - [x] 3.1: After magic bytes check, call `getImageWidth(buffer, file.type): number | null` inline in `upload.ts`.
  - [x] 3.2: Implement `getImageWidth` with binary header parsing per format (see Dev Notes). Return `null` if width cannot be determined (allow-through — don't block on parse failure).
  - [x] 3.3: If width > 2000, return `{ error: "IMAGE_TOO_WIDE" }` with status 400.
  - [x] 3.4: Add `editor.imageTooWide: "Image is too wide. Maximum width is 2000px."` to `en.ts` + `vi.ts`.

- [x] **Task 4: Fix storage path** (AC: #12)
  - [x] 4.1: In `upload.ts`, replace the `generateKey(filename)` helper with `generateKey(filename, userId)` that produces `uploads/${userId}/${crypto.randomUUID()}.${ext}`. The `crypto` global is available in Cloudflare Workers without import.
  - [x] 4.2: Pass `userId` (already obtained from `auth()`) into `generateKey`.

- [x] **Task 5: Add cache headers to R2 PUT** (AC: #11, FR31)
  - [x] 5.1: In `src/server/r2/client.ts`, add `"Cache-Control": "public, max-age=31536000, immutable"` to the headers of the PUT request in `uploadToR2`. Images are content-addressed (UUID key) so immutable is safe.

- [x] **Task 6: Update response format** (AC: #6)
  - [x] 6.1: In `upload.ts`, update success response from `{ url, key }` to `{ url, filename: file.name, size: file.size }`.
  - [x] 6.2: In `src/shared/utils/upload.ts`, update the `uploadImage()` response type from `{ url: string; key: string }` to `{ url: string; filename: string; size: number }`. The function still returns just `data.url` (caller only needs URL).

- [x] **Task 7: Add retry button to error banner** (AC: #13, NFR18)
  - [x] 7.1: In `MarkdownEditor.tsx`, store the last-failed files in a `failedFilesRef = useRef<File[]>([])`. Populate it in the `catch` block of `handleUploadFiles`.
  - [x] 7.2: Alongside the dismiss `✕` button in the error banner, add a "Retry" button: `onClick={() => { setUploadError(null); handleUploadFiles(failedFilesRef.current, textApiRef.current); }}`.
  - [x] 7.3: Add `editor.retry: "Retry"` to `en.ts` + `vi.ts`.

- [x] **Task 8: Build verification** (AC: all)
  - [x] 8.1: `npm run build` — 0 TypeScript errors.
  - [x] 8.2: `npx biome check src/routes/api/upload.ts src/server/r2/client.ts src/components/post/MarkdownEditor.tsx src/shared/utils/upload.ts` — no errors.
  - [ ] 8.3: Manual test: upload a valid <500KB image via toolbar button, drag & drop, and paste — confirm URL inserted into editor.
  - [ ] 8.4: Manual test: try uploading a 600KB file — confirm "File is too large" toast appears with Retry button.
  - [x] 8.5: Bundle size verified: `wrangler deploy --dry-run` → 1,601 KB gzip (under 3 MB limit).

## Dev Notes

### Architecture Constraints (MUST follow)

- **Cloudflare Workers runtime**: No Node.js `fs`, `Buffer`, `path`. Use Web APIs only (`ArrayBuffer`, `DataView`, `Uint8Array`, `crypto.randomUUID()`).
- **No external image libraries**: `sharp`, `jimp`, `image-size` — NOT Workers-compatible. Binary header parsing only.
- **Never expose R2 credentials client-side** (NFR12). All upload logic stays server-side in `upload.ts`.
- **aws4fetch is the ONLY R2 client** — do not switch to `fetch` directly or any other S3 SDK.
- **Bundle size**: No new heavy dependencies. The `aws4fetch` package is already in the bundle.
- **Biome**: tabs + double quotes (not single) for TS/TSX, single quotes for JSX strings. Run `npx biome check --fix` before committing.

### Magic Bytes Reference (Cloudflare Workers safe)

```ts
function validateMagicBytes(buffer: ArrayBuffer, declaredType: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  switch (declaredType) {
    case "image/jpeg":
      return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    case "image/png":
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E &&
             bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A &&
             bytes[6] === 0x1A && bytes[7] === 0x0A;
    case "image/gif":
      return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
             bytes[3] === 0x38; // "GIF8"
    case "image/webp":
      // RIFF....WEBP: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
      return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
             bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 &&
             bytes[10] === 0x42 && bytes[11] === 0x50;
    case "image/svg+xml":
      // SVG is text — skip magic bytes, trust MIME
      return true;
    case "image/avif":
      // AVIF: bytes 4-7 = "ftyp", bytes 8-11 = "avif" or "avis"
      return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 &&
             bytes[7] === 0x70;
    default:
      return false;
  }
}
```

### Image Width Parsing (binary, Workers-safe)

```ts
function getImageWidth(buffer: ArrayBuffer, mimeType: string): number | null {
  try {
    const view = new DataView(buffer);
    switch (mimeType) {
      case "image/png":
        // PNG: 8 magic bytes + 4 length + 4 "IHDR" + 4 width = bytes 16-19 (big-endian)
        return view.getUint32(16, false); // false = big-endian
      case "image/gif":
        // GIF header: bytes 6-7 = width (little-endian uint16)
        return view.getUint16(6, true); // true = little-endian
      case "image/jpeg":
        // Scan for SOF0/SOF1/SOF2 marker (0xFF 0xC0/0xC1/0xC2)
        let offset = 2; // skip SOI marker
        while (offset < buffer.byteLength - 9) {
          if (view.getUint8(offset) !== 0xFF) break;
          const marker = view.getUint8(offset + 1);
          if (marker >= 0xC0 && marker <= 0xC2) {
            // SOF: 2 marker + 2 length + 1 precision + 2 height + 2 width
            return view.getUint16(offset + 7, false);
          }
          const segLen = view.getUint16(offset + 2, false);
          offset += 2 + segLen;
        }
        return null;
      case "image/webp":
        // VP8 (lossy): bytes 12-15 = "VP8 ", width at offset 26 (bits 0-13, little-endian uint16, minus 1)
        // VP8L (lossless): bytes 12-15 = "VP8L", width at offset 21 (bits 0-13)
        // VP8X: bytes 12-15 = "VP8X", canvas width at offset 24 (3 bytes LE, minus 1)
        // For simplicity, only parse VP8 (lossy, most common):
        const chunkFCC = String.fromCharCode(
          view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15)
        );
        if (chunkFCC === "VP8 ") {
          return (view.getUint16(26, true) & 0x3FFF) + 1;
        }
        return null; // VP8L/VP8X: allow-through
      default:
        return null; // SVG, AVIF: skip width check
    }
  } catch {
    return null; // parse failure → allow-through
  }
}
```

**Width validation rule**: If `getImageWidth` returns `null` (parse failure or unsupported format), allow the upload — do not block. Only block when we get a definitive width > 2000.

### Storage Path Pattern

```ts
// In upload.ts — replace generateKey() with:
function generateKey(filename: string, userId: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  return `uploads/${userId}/${crypto.randomUUID()}.${ext}`;
}
// Usage: const key = generateKey(file.name, userId);
```

`crypto.randomUUID()` is a Cloudflare Workers global — no import needed.

### Cache Headers on R2 PUT

```ts
// In src/server/r2/client.ts → uploadToR2():
const response = await client.fetch(url, {
  method: "PUT",
  headers: {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  },
  body: file,
});
```

Images use UUID-based keys so the content never changes → `immutable` is correct.

### Response Format Update

```ts
// upload.ts success response:
return Response.json({ url, filename: file.name, size: file.size });

// src/shared/utils/upload.ts — update type annotation only:
const data = (await response.json()) as { url: string; filename: string; size: number };
return data.url; // caller still gets only the URL
```

### Retry Button UX

```tsx
// In MarkdownEditor.tsx — add inside the component:
const failedFilesRef = useRef<File[]>([]);

// In handleUploadFiles catch block, add:
failedFilesRef.current = files; // store for retry

// In error banner JSX:
<button type="button" onClick={() => {
  setUploadError(null);
  handleUploadFiles(failedFilesRef.current, textApiRef.current);
}} className="ml-2 font-medium underline">
  {t.editor.retry}
</button>
<button type="button" onClick={() => setUploadError(null)} className="ml-2 font-medium underline">
  ✕
</button>
```

### i18n Keys Required

Add to `src/locales/en.ts` (and `vi.ts` Vietnamese translation) under the `editor` object:

```ts
// Update existing:
maxFileSize: "Max file size: 500KB",
fileTooLarge: "File is too large. Maximum size is 500KB.",
// Add new:
imageTooWide: "Image is too wide. Maximum width is 2000px.",
retry: "Retry",
```

### Error Code Mapping in MarkdownEditor

The `uploadImage()` utility throws `Error(message)` where `message` comes from the server's `error` field. Map known codes to i18n keys:

```ts
// In handleUploadFiles, update the catch block:
} catch (err) {
  const raw = err instanceof Error ? err.message : "";
  const message =
    raw.includes("FILE_TOO_LARGE") ? t.editor.fileTooLarge :
    raw.includes("IMAGE_TOO_WIDE") ? t.editor.imageTooWide :
    raw.includes("INVALID_FILE_TYPE") ? t.editor.uploadFailed :
    raw || t.editor.uploadFailed;
  setUploadError(message);
  failedFilesRef.current = files;
}
```

### Previous Story Intelligence (Story 4.2)

- `ClientOnly` wrapper in MarkdownEditor is **required** — do NOT remove it. `@uiw/react-md-editor` uses `window` on init.
- `textApiRef.current` is set via the toolbar command's `execute` callback — always pass it to `handleUploadFiles` for cursor-based insertion.
- `valueRef` + `onChangeRef` patterns avoid stale closure in upload handlers.
- Bundle boundary is enforced by `React.lazy()` + `_protected/` route split — no action needed.
- `data-color-mode={resolvedTheme}` prop is how dark/light theming works for the editor.

### Key File Locations

| File | Action |
|------|--------|
| `src/routes/api/upload.ts` | MODIFY — size limit, magic bytes, width check, storage path, response format |
| `src/server/r2/client.ts` | MODIFY — add Cache-Control header to PUT |
| `src/components/post/MarkdownEditor.tsx` | MODIFY — update MAX_FILE_SIZE, add failedFilesRef, add Retry button |
| `src/shared/utils/upload.ts` | MODIFY — update response type annotation |
| `src/locales/en.ts` | MODIFY — update size strings, add imageTooWide + retry keys |
| `src/locales/vi.ts` | MODIFY — same changes in Vietnamese |

### References

- [Source: epics.md#Story4.3] — All acceptance criteria
- [Source: architecture.md#SecurityRequirements] — MIME + magic bytes, 500KB / 2000px limits
- [Source: architecture.md#TechStack] — `aws4fetch ^1.0.20`, Cloudflare Workers runtime constraints
- [Source: architecture.md#InfrastructureDeployment] — FR31 cache headers
- [Source: CLAUDE.md#Constraints] — 3MB bundle limit, never bare shiki, lazy-load heavy components
- [Source: src/routes/api/upload.ts] — current upload endpoint (read before modifying)
- [Source: src/server/r2/client.ts] — current R2 client (read before modifying)
- [Source: src/components/post/MarkdownEditor.tsx] — existing upload UX (read before modifying)
- [Source: _bmad-output/implementation-artifacts/4-2-markdown-editor-live-preview.md#DevNotes] — `ClientOnly` pattern, bundle boundary

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Tasks 1-6 were already implemented in a prior session (Stories 4.1/4.2 groundwork).
- Task 7 (retry button) completed in this session: added `failedFilesRef`, improved error code mapping in `handleUploadFiles` catch block, added Retry + dismiss buttons to error banner.
- All i18n keys (`imageTooWide`, `retry`) were already present in en.ts and vi.ts.

#### Code Review Fixes (2026-04-02)

- [P1] Removed SVG from ALLOWED_TYPES — no longer accepted for upload (stored XSS risk).
- [P2] `generateKey` now derives extension from validated MIME type, not attacker-controlled filename.
- [P5] `getImageWidth` now handles WebP VP8L (lossless) and VP8X (extended/animated) formats.
- [P6] Retry button now only re-uploads files that actually failed, not the entire batch.
- [P10] AVIF magic bytes now verify brand bytes 8-11 (`avif`/`avis`/`mif1`), not just `ftyp` box.
- [P15] JPEG width parser guards against `segLen < 2` to prevent infinite loop on malformed files.
- [P16] Upload response now includes `key` alongside `url`, `filename`, `size` for future R2 deletion.
- [P17] `isImageFile()` now only checks `file.type.startsWith("image/")` — no extension fallback.
- [P21] Added `invalidFileType` i18n key — distinct from generic `uploadFailed` toast.
- [P23] JPEG SOF3 (marker 0xC3, lossless sequential) now handled in width parser.

#### Second-Pass Code Review Fixes (2026-04-01)

- [P9] Client-side size rejection now uses `toast.error()` instead of the error banner — consistent with AC5 "toast displayed" requirement.
- [P10] `isImageFile()` changed from `file.type.startsWith("image/")` to explicit `Set` of 5 allowed types — avoids accepting any `image/*` MIME the server would reject.
- [P12] Upload response: `filename` field removed (exposes attacker-controlled input, XSS risk); response is now `{ url, key, size }`.
- [P15] `MAX_FILE_SIZE` constants changed to `500_000` (500,000 bytes) to match the "500KB" label consistently across upload.ts and MarkdownEditor.tsx.
- [P16] GIF magic bytes now validates full `GIF87a` / `GIF89a` signature (bytes 0–5), not just `GIF8` prefix.
- [P1 (VP8L)] `getImageWidth` VP8L offset corrected from 21 → 20 (0x2f signature byte); width bits extracted as `(bits >> 8) & 0x3fff` + 1.

### File List

- `src/components/post/MarkdownEditor.tsx`
- `src/routes/api/upload.ts`
- `src/server/r2/client.ts`
- `src/shared/utils/upload.ts`
- `src/locales/en.ts`
- `src/locales/vi.ts`
