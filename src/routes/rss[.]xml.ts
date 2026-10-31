import { createFileRoute } from "@tanstack/react-router";
import { getPublishedPostsForFeed } from "~/server/db/queries";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "~/shared/data/site";
import { buildRssXml } from "~/shared/utils/rss";

export const Route = createFileRoute("/rss.xml")({
	server: {
		handlers: {
			GET: async () => {
				try {
					const posts = await getPublishedPostsForFeed();
					const xml = buildRssXml(posts, {
						siteUrl: SITE_URL,
						title: SITE_NAME,
						description: SITE_DESCRIPTION,
					});
					return new Response(xml, {
						headers: {
							"Content-Type": "application/rss+xml; charset=utf-8",
							"Cache-Control": "public, max-age=3600",
						},
					});
				} catch {
					return new Response(
						'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel/></rss>',
						{
							status: 503,
							headers: {
								"Content-Type": "application/rss+xml; charset=utf-8",
								"Retry-After": "60",
							},
						},
					);
				}
			},
		},
	},
});
