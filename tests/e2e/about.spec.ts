import { expect, test } from "../support/fixtures";

test.describe("About page", () => {
	test("renders heading and two bio paragraphs", async ({ page, localizedUrl }) => {
		// Given I visit the about page
		await page.goto(localizedUrl("/about"));

		// Then the h1 heading is visible
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

		// And at least two paragraphs of bio text exist
		const article = page.locator("article");
		const paragraphs = article.locator("p");
		await expect(paragraphs).toHaveCount(await paragraphs.count());
		expect(await paragraphs.count()).toBeGreaterThanOrEqual(2);
	});

	test("skills section renders with category headings", async ({ page, localizedUrl }) => {
		// Given I visit the about page
		await page.goto(localizedUrl("/about"));

		// Then the skills section has h2 category headings
		const skillsSection = page.locator("section");
		await expect(skillsSection).toBeVisible();

		const categoryHeadings = skillsSection.getByRole("heading", { level: 2 });
		await expect(categoryHeadings.first()).toBeVisible();
	});

	test("contact CTA is keyboard accessible", async ({ page, localizedUrl }) => {
		// Given I visit the about page
		await page.goto(localizedUrl("/about"));

		// When I tab to the CTA
		const cta = page.getByRole("link", { name: /get in touch|liên hệ/i });
		await cta.focus();

		// Then it is focused and visible
		await expect(cta).toBeFocused();
		await expect(cta).toBeVisible();
	});

	test("contact CTA links to mailto", async ({ page, localizedUrl }) => {
		// Given I visit the about page
		await page.goto(localizedUrl("/about"));

		// Then the CTA href is a mailto link
		const cta = page.getByRole("link", { name: /get in touch|liên hệ/i });
		await expect(cta).toHaveAttribute("href", /^mailto:/);
	});

	test("renders in Vietnamese with localized strings", async ({ page }) => {
		// Given I visit the Vietnamese about page
		await page.goto("/vi/about");

		// Then the CTA is in Vietnamese
		await expect(
			page.getByRole("link", { name: /liên hệ/i }),
		).toBeVisible();
	});
});
