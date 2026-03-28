import type { Page } from "@playwright/test";
import type { Language } from "../fixtures/i18n";

export async function navigateTo(
	page: Page,
	path: string,
	lang: Language = "en",
) {
	await page.goto(`/${lang}${path}`);
}

export async function switchLanguage(page: Page, targetLang: Language) {
	// Click the language switcher button for targetLang
	await page.getByRole("button", { name: new RegExp(targetLang, "i") }).click();
	await page.waitForURL(new RegExp(`^/${targetLang}/`));
}

export async function toggleTheme(page: Page) {
	await page.getByRole("button", { name: /switch to (dark|light) mode/i }).click();
}
