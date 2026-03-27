import { expect, test } from "../support/fixtures";

test.describe("Home page", () => {
	test("renders personal introduction in English", async ({ page, localizedUrl }) => {
		// Given I visit the English home page
		await page.goto(localizedUrl("/"));

		// Then the heading is visible
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Hi, I'm Nama",
		);

		// And the role subtitle is visible
		await expect(page.getByText("Full-Stack Developer")).toBeVisible();
	});

	test("renders personal introduction in Vietnamese", async ({ page }) => {
		// Given I visit the Vietnamese home page
		await page.goto("/vi/");

		// Then the heading is localized
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Xin chào",
		);
	});

	test("GitHub link opens in new tab", async ({ page, localizedUrl }) => {
		// Given I am on the home page
		await page.goto(localizedUrl("/"));

		// Then the GitHub link has correct attributes
		const githubLink = page.getByRole("link", { name: /github/i });
		await expect(githubLink).toHaveAttribute("target", "_blank");
		await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("CTA buttons navigate to correct pages", async ({ page, localizedUrl }) => {
		// Given I am on the home page
		await page.goto(localizedUrl("/"));

		// When I click the Projects CTA
		await page.getByRole("link", { name: /projects/i }).first().click();

		// Then I am on the projects page
		await expect(page).toHaveURL(/\/en\/projects/);
	});

	test("has correct page title", async ({ page, localizedUrl }) => {
		// Given I visit the English home page
		await page.goto(localizedUrl("/"));

		// Then the page title matches the locale
		await expect(page).toHaveTitle(/Nutrition, Training & Technology/);
	});
});
