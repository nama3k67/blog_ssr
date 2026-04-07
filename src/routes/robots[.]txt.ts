import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "~/shared/data/site";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: async () => {
				const robots = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /en/admin/
Disallow: /vi/admin/
Disallow: /en/edit/
Disallow: /vi/edit/
Disallow: /en/new
Disallow: /vi/new
Disallow: /en/translate/
Disallow: /vi/translate/
Disallow: /en/login
Disallow: /vi/login

Sitemap: ${SITE_URL}/sitemap.xml`;

				return new Response(robots, {
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						"Cache-Control": "public, max-age=86400",
					},
				});
			},
		},
	},
});
