import { test as base } from "@playwright/test";

type AuthFixtures = {
	authenticatedPage: ReturnType<typeof base["extend"]> extends { page: infer P }
		? P
		: never;
};

// Auth fixture — extend when Clerk test helpers are configured.
// See: https://clerk.com/docs/testing/playwright
export const authFixtures = base.extend<{ asGuest: void }>({
	asGuest: async ({ page }, use) => {
		// Guest: no auth setup needed, just use the page as-is
		await use();
	},
});
