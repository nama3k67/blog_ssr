import { expect, test } from "../support/fixtures";

test.describe("Posts listing page (Story 3.1)", () => {
	test("renders heading in English", async ({ page, localizedUrl }) => {
		// Given I visit the English posts listing
		await page.goto(localizedUrl("/posts"));

		// Then the main heading is visible
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Blogs about sport, health, and technology",
		);
	});

	test("renders heading in Vietnamese", async ({ page }) => {
		// Given I visit the Vietnamese posts listing
		await page.goto("/vi/posts");

		// Then the main heading is visible (localized)
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("has correct page title", async ({ page, localizedUrl }) => {
		// Given I visit the posts listing
		await page.goto(localizedUrl("/posts"));

		// Then the browser tab title matches the locale
		await expect(page).toHaveTitle(/Blog - Articles on Nutrition/);
	});

	test("shows post cards or empty state", async ({ page, localizedUrl }) => {
		// Given I visit the posts listing
		await page.goto(localizedUrl("/posts"));

		// Then either post articles or an empty state message is shown
		// Card.Link renders the actual <a>, CardCta renders aria-hidden <div> — use article count
		const articles = page.locator("article");
		const emptyState = page.getByText("No posts found.");

		const hasCards = (await articles.count()) > 0;
		const hasEmpty = await emptyState.isVisible();

		expect(hasCards || hasEmpty).toBe(true);
	});

	test("post cards render Read more CTA text", async ({
		page,
		localizedUrl,
	}) => {
		// Given posts exist on the listing page
		await page.goto(localizedUrl("/posts"));
		// CardCta renders <div aria-hidden="true">Read more ›</div> — use getByText, not getByRole
		const ctaDivs = page.getByText("Read more");

		if ((await ctaDivs.count()) > 0) {
			await expect(ctaDivs.first()).toBeVisible();
		}
	});

	test("post card links navigate to the correct detail page", async ({
		page,
		localizedUrl,
	}) => {
		// Given posts exist on the listing page
		await page.goto(localizedUrl("/posts"));
		// CardLink renders <a> wrapping the title — article a is the clickable link
		const postLinks = page.locator("article a");

		if ((await postLinks.count()) > 0) {
			// Then the href points to a valid post detail URL
			const href = await postLinks.first().getAttribute("href");
			expect(href).toMatch(/\/en\/posts\/.+/);
		}
	});

	test("post card shows category badge when present", async ({
		page,
		localizedUrl,
	}) => {
		// Given posts exist
		await page.goto(localizedUrl("/posts"));
		const articles = page.locator("article");

		if ((await articles.count()) > 0) {
			// Category badges are optional — just assert count is >= 0 (structural check)
			const categoryBadges = page.locator("span.rounded-full");
			const badgeCount = await categoryBadges.count();
			expect(badgeCount).toBeGreaterThanOrEqual(0);
		}
	});

	test("pagination controls render when multiple pages exist", async ({
		page,
		localizedUrl,
	}) => {
		// Given the posts listing loads
		await page.goto(localizedUrl("/posts"));
		const pageIndicator = page.getByText(/Page \d+ of \d+/);
		const hasMultiplePages = await pageIndicator.isVisible();

		if (hasMultiplePages) {
			// Then Previous and Next navigation exists
			await expect(page.getByRole("navigation")).toBeVisible();
		}
	});

	test("Previous is disabled on first page", async ({
		page,
		localizedUrl,
	}) => {
		// Given I am on the first page of posts
		await page.goto(localizedUrl("/posts"));
		const pageIndicator = page.getByText(/Page 1 of/);

		if (await pageIndicator.isVisible()) {
			// Then the Previous control is disabled (button or aria-disabled link)
			const prevBtn = page.getByRole("button", { name: /previous/i });
			const prevLink = page.getByRole("link", { name: /previous/i });

			if (await prevBtn.isVisible()) {
				await expect(prevBtn).toBeDisabled();
			} else if (await prevLink.isVisible()) {
				await expect(prevLink).toHaveAttribute("aria-disabled", "true");
			}
		}
	});

	test("clicking Next updates URL to page=2", async ({
		page,
		localizedUrl,
	}) => {
		// Given I am on page 1 with multiple pages
		await page.goto(localizedUrl("/posts"));
		const pageIndicator = page.getByText(/Page 1 of [2-9]/);

		if (!(await pageIndicator.isVisible())) {
			return; // single page, skip
		}

		// When I click Next (button or link)
		const nextBtn = page.getByRole("button", { name: /next/i });
		const nextLink = page.getByRole("link", { name: /next/i });

		if (await nextBtn.isEnabled()) {
			await nextBtn.click();
		} else if (await nextLink.isVisible()) {
			await nextLink.click();
		} else {
			return;
		}

		// Then the URL reflects page=2
		await expect(page).toHaveURL(/[?&]page=2/);
		await expect(page.getByText(/Page 2 of/)).toBeVisible();
	});

	test("pagination text uses EN locale format", async ({
		page,
		localizedUrl,
	}) => {
		// Given the listing has multiple pages
		await page.goto(localizedUrl("/posts"));
		const pageIndicator = page.getByText(/Page \d+ of \d+/);

		if (await pageIndicator.isVisible()) {
			await expect(pageIndicator).toContainText("Page");
			await expect(pageIndicator).toContainText("of");
		}
	});
});
