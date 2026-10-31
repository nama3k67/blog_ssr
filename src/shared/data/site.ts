/**
 * Absolute base URL for the site.
 * Set VITE_SITE_URL in .dev.vars for local dev and wrangler secret for production.
 * Falls back to production URL if env var is not set.
 */
export const SITE_URL =
	(import.meta.env.VITE_SITE_URL as string | undefined) ??
	"https://blog.nama3k67.com";

/** Site-wide title, reused by the root <head> and the RSS feed. */
export const SITE_NAME = "Blog - Nutrition, Training & Technology";

/** Site-wide description, reused by the root <head> and the RSS feed. */
export const SITE_DESCRIPTION =
	"A passionate long-distance runner sharing knowledge about nutrition, training methods, and technology.";
