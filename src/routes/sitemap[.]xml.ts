import { createFileRoute } from "@tanstack/react-router";
import { getPublishedPostsForSitemap } from "~/server/db/queries";
import { SITE_URL } from "~/shared/data/site";

function buildSitemapXml(
	posts: Array<{
		slug: string;
		lang: string;
		translationGroupId: string;
		publishedAt: Date | null;
		updatedAt: Date | null;
	}>,
): string {
	const LANGS = ["en", "vi"] as const;
	const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

	// 1. Static routes — same slug across both langs
	const staticPaths = ["", "/posts", "/projects", "/about"];
	const staticEntries = staticPaths.map((path) => {
		const enUrl = `${SITE_URL}/en${path}`;
		const viUrl = `${SITE_URL}/vi${path}`;
		return `
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${viUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>
  <url>
    <loc>${viUrl}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${viUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>`;
	});

	// 2. Build translationGroupId → { en: slug, vi: slug, date } map
	const groupMap = new Map<
		string,
		{ en?: string; vi?: string; date?: string }
	>();
	for (const post of posts) {
		const entry = groupMap.get(post.translationGroupId) ?? {};
		entry[post.lang as "en" | "vi"] = post.slug;
		const postDate = (post.updatedAt ?? post.publishedAt ?? new Date())
			.toISOString()
			.split("T")[0];
		if (!entry.date || postDate > entry.date) entry.date = postDate;
		groupMap.set(post.translationGroupId, entry);
	}

	// 3. Dynamic post entries
	const postEntries: string[] = [];
	for (const [, group] of groupMap) {
		const date = group.date ?? today;
		for (const lang of LANGS) {
			const slug = group[lang];
			if (!slug) continue;
			const loc = `${SITE_URL}/${lang}/posts/${slug}`;
			const otherLang = lang === "en" ? "vi" : "en";
			const otherSlug = group[otherLang];
			const hreflangLinks = otherSlug
				? `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en/posts/${group.en ?? slug}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_URL}/vi/posts/${group.vi ?? slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/posts/${group.en ?? slug}"/>`
				: `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}"/>`;
			postEntries.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>${hreflangLinks}
  </url>`);
		}
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries.join("")}
${postEntries.join("")}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const posts = await getPublishedPostsForSitemap();
				const xml = buildSitemapXml(posts);
				return new Response(xml, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
