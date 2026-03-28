import { test as base } from "@playwright/test";

export type Language = "en" | "vi";

type I18nFixtures = {
	lang: Language;
	localizedUrl: (path: string) => string;
};

export const i18nFixtures = base.extend<I18nFixtures>({
	lang: ["en", { option: true }],

	localizedUrl: async ({ lang }, use) => {
		await use((path: string) => `/${lang}${path}`);
	},
});
