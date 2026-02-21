import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	server: {
		DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
		USE_LOCAL_DB: z
			.string()
			.optional()
			.default("false")
			.transform((val) => val === "true"),
		NODE_ENV: z.string().optional().default("production"),

		CLERK_SECRET_KEY: z.string().optional(),
		CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
		GITHUB_TOKEN: z.string().optional(),
	},

	client: {
		VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
	},

	// For Next.js / TanStack Start - provide runtime environment variables
	runtimeEnv: process.env,

	// Skip validation everywhere - Cloudflare Workers injects env differently
	skipValidation: true,
});
