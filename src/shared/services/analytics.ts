import { createServerFn } from "@tanstack/react-start";

export const trackCtaClickFn = createServerFn({ method: "POST" }).handler(
	async () => {
		// Server-side log — visible in Cloudflare Workers logs (wrangler tail)
		// No PII: only event name + timestamp
		console.log(
			JSON.stringify({
				event: "cta_click",
				ts: new Date().toISOString(),
			}),
		);
		return { ok: true };
	},
);
