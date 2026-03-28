import { expect, test } from "../support/fixtures";

test.describe("Projects page", () => {
	test("renders project grid", async ({ page, localizedUrl }) => {
		// Given I visit the projects page
		await page.goto(localizedUrl("/projects"));

		// Then at least one project card is visible
		const cards = page.locator("main ul > li");
		await expect(cards.first()).toBeVisible();
	});

	test("project card has title, description, and tags", async ({ page, localizedUrl }) => {
		// Given I visit the projects page
		await page.goto(localizedUrl("/projects"));

		const firstCard = page.locator("main ul > li").first();

		// Then the card has an h2 title
		await expect(firstCard.getByRole("heading", { level: 2 })).toBeVisible();

		// And a description paragraph
		await expect(firstCard.locator("p")).toBeVisible();

		// And at least one tag badge
		await expect(firstCard.locator("span").first()).toBeVisible();
	});

	test("GitHub link has correct attributes when present", async ({ page, localizedUrl }) => {
		// Given I visit the projects page
		await page.goto(localizedUrl("/projects"));

		const githubLink = page.locator("main ul > li").first().getByRole("link", { name: /github/i });

		// Then the link opens in a new tab
		await expect(githubLink).toHaveAttribute("target", "_blank");
		await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("renders in Vietnamese", async ({ page }) => {
		// Given I visit the Vietnamese projects page
		await page.goto("/vi/projects");

		// Then the GitHub link label is localized
		await expect(
			page.getByRole("link", { name: /github/i }).first(),
		).toBeVisible();
	});
});
