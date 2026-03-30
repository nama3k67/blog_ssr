/**
 * Absolute base URL for the site.
 * Set VITE_SITE_URL in .dev.vars for local dev and wrangler secret for production.
 * Falls back to production URL if env var is not set.
 */
export const SITE_URL =
	(import.meta.env.VITE_SITE_URL as string | undefined) ??
	"https://blog.nama3k67.com";
