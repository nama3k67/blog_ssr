import { describe, expect, it } from "vitest";
import { buildRssXml, type FeedPost } from "../../src/shared/utils/rss";

const channel = {
	siteUrl: "https://example.com",
	title: "Blog - Nutrition, Training & Technology",
	description: "Runner & engineer",
};

const post = (overrides: Partial<FeedPost> = {}): FeedPost => ({
	title: "Hello World",
	description: "First post",
	slug: "hello-world",
	lang: "en",
	publishedAt: new Date("2026-10-01T00:00:00Z"),
	updatedAt: new Date("2026-10-02T00:00:00Z"),
	...overrides,
});

describe("buildRssXml", () => {
	it("produces a valid RSS 2.0 envelope with escaped channel fields", () => {
		const xml = buildRssXml([], channel, new Date("2026-10-30T00:00:00Z"));
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain(
			"<title>Blog - Nutrition, Training &amp; Technology</title>",
		);
		expect(xml).toContain("<description>Runner &amp; engineer</description>");
		expect(xml).toContain(
			'<atom:link href="https://example.com/rss.xml" rel="self"',
		);
	});

	it("falls back to `now` for lastBuildDate when there are no posts", () => {
		const now = new Date("2026-10-30T00:00:00Z");
		const xml = buildRssXml([], channel, now);
		expect(xml).toContain(
			`<lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
		);
		expect(xml).not.toContain("<item>");
	});

	it("renders one item per post with a language-scoped permalink", () => {
		const xml = buildRssXml(
			[post(), post({ slug: "xin-chao", lang: "vi", title: "Xin chào" })],
			channel,
		);
		expect(xml.match(/<item>/g)).toHaveLength(2);
		expect(xml).toContain(
			"<link>https://example.com/en/posts/hello-world</link>",
		);
		expect(xml).toContain(
			'<guid isPermaLink="true">https://example.com/vi/posts/xin-chao</guid>',
		);
		expect(xml).toContain("<dc:language>vi</dc:language>");
	});

	it("escapes XML special characters in post title and description", () => {
		const xml = buildRssXml(
			[post({ title: 'A <b> & "c"', description: null })],
			channel,
		);
		expect(xml).toContain("<title>A &lt;b&gt; &amp; &quot;c&quot;</title>");
		expect(xml).toContain("<description></description>");
	});

	it("uses publishedAt for pubDate and the latest update for lastBuildDate", () => {
		const xml = buildRssXml(
			[
				post({
					publishedAt: new Date("2026-10-10T00:00:00Z"),
					updatedAt: new Date("2026-10-10T00:00:00Z"),
				}),
				post({
					slug: "older",
					publishedAt: new Date("2026-09-01T00:00:00Z"),
					updatedAt: new Date("2026-10-20T00:00:00Z"),
				}),
			],
			channel,
		);
		expect(xml).toContain(
			`<pubDate>${new Date("2026-09-01T00:00:00Z").toUTCString()}</pubDate>`,
		);
		expect(xml).toContain(
			`<lastBuildDate>${new Date("2026-10-20T00:00:00Z").toUTCString()}</lastBuildDate>`,
		);
	});
});
