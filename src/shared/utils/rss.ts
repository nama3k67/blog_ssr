import { escapeXml } from "~/shared/utils/xml";

export type FeedPost = {
	title: string;
	description: string | null;
	slug: string;
	lang: string;
	publishedAt: Date | null;
	updatedAt: Date | null;
};

type FeedChannel = {
	siteUrl: string;
	title: string;
	description: string;
};

/**
 * Build an RSS 2.0 document for the given published posts.
 * Pure function (no I/O) so it can be unit-tested; the route handler
 * is responsible for fetching posts and wrapping the result in a Response.
 */
export function buildRssXml(
	posts: FeedPost[],
	channel: FeedChannel,
	now: Date = new Date(),
): string {
	const { siteUrl, title, description } = channel;

	// lastBuildDate = most recent change across all items (not just the newest publish)
	const latest = posts.reduce<Date | null>((acc, post) => {
		const d = post.updatedAt ?? post.publishedAt;
		return d && (!acc || d > acc) ? d : acc;
	}, null);
	const lastBuild = (latest ?? now).toUTCString();

	const items = posts
		.map((post) => {
			const link = escapeXml(`${siteUrl}/${post.lang}/posts/${post.slug}`);
			const pubDate = (post.publishedAt ?? post.updatedAt ?? now).toUTCString();
			return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${escapeXml(post.description ?? "")}</description>
    <pubDate>${pubDate}</pubDate>
    <dc:language>${escapeXml(post.lang)}</dc:language>
  </item>`;
		})
		.join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;
}
