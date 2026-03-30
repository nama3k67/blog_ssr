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
		GITHUB_REPO: z.string().optional(),
		GITHUB_BRANCH: z.string().optional().default("main"),
		GITHUB_POSTS_PATH: z.string().optional().default("posts"),

		// R2 image storage
		R2_ACCOUNT_ID: z.string().optional(),
		R2_ACCESS_KEY_ID: z.string().optional(),
		R2_SECRET_ACCESS_KEY: z.string().optional(),
		R2_BUCKET_NAME: z.string().optional().default("blog-images"),
		R2_PUBLIC_URL: z.string().optional(),

		// Admin authorization
		ADMIN_USER_ID: z.string().optional(),
	},

	client: {
		VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
		VITE_SITE_URL: z.url().optional(),
	},

	// For Next.js / TanStack Start - provide runtime environment variables
	runtimeEnv: process.env,

	// Skip validation everywhere - Cloudflare Workers injects env differently
	// skipValidation: true,
});

/**
 * Check if a Clerk user ID matches the admin user
 * @param clerkId - The Clerk user ID to check
 * @returns true if the user is the admin, false otherwise
 */
export function isAdmin(clerkId: string | null | undefined): boolean {
	if (!clerkId || !env.ADMIN_USER_ID) return false;
	return clerkId === env.ADMIN_USER_ID;
}
