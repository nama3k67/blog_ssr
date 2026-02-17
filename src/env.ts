import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	server: {
		DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
		USE_LOCAL_DB: z
			.enum(["true", "false"])
			.default("true")
			.transform((val) => val === "true"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),

		CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
		CLERK_WEBHOOK_SIGNING_SECRET: z
			.string()
			.min(1, "CLERK_WEBHOOK_SIGNING_SECRET is required for webhooks")
			.optional(),
		GITHUB_TOKEN: z
			.string()
			.min(1, "GITHUB_TOKEN is required for GitHub API access")
			.optional(),
	},

	client: {
		VITE_CLERK_PUBLISHABLE_KEY: z
			.string()
			.min(1, "VITE_CLERK_PUBLISHABLE_KEY is required"),
	},

	// For Next.js / TanStack Start - provide runtime environment variables
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		USE_LOCAL_DB: process.env.USE_LOCAL_DB,
		NODE_ENV: process.env.NODE_ENV,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
		GITHUB_TOKEN: process.env.GITHUB_TOKEN,
		VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY,
	},

	// Only error about missing values if not in browser
	skipValidation: typeof window !== "undefined",
});
