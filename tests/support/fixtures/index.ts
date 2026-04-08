import { test as baseTest } from "@playwright/test";

// Define custom fixtures and chain them properly
export const test = baseTest
	.extend<{ asGuest: void }>({
		// eslint-disable-next-line no-empty-pattern
		asGuest: async ({}, use) => {
			// Guest: no auth setup needed
			await use();
		},
	})
	.extend<{ lang: "en" | "vi"; localizedUrl: (path: string) => string }>({
		lang: ["en", { option: true }],
		localizedUrl: async ({ lang }, use) => {
			await use((path: string) => `/${lang}${path}`);
		},
	});

export { expect } from "@playwright/test";
