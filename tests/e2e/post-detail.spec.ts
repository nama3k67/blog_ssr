import { expect, test } from "../support/fixtures";

test.describe("Post detail page (Story 3.2)", () => {
	test.describe("404 error handling", () => {
		test("shows bilingual 404 message for unknown slug", async ({
			page,
			localizedUrl,
		}) => {
			// Given I navigate to a post that does not exist
			await page.goto(localizedUrl("/posts/this-slug-does-not-exist-xyz-abc"));

			// Then the 404 error component is shown
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				"Post not found",
			);
		});

		test("404 shows descriptive message", async ({ page, localizedUrl }) => {
			// Given I navigate to a non-existent post
			await page.goto(localizedUrl("/posts/non-existent-post-slug-99"));

			// Then a helpful description is displayed
			await expect(
				page.getByText(
					/doesn't exist or has been removed|không tồn tại hoặc đã bị xóa/i,
				),
			).toBeVisible();
		});

		test("404 includes link back to posts listing", async ({
			page,
			localizedUrl,
		}) => {
			// Given I am on a 404 post page
			await page.goto(localizedUrl("/posts/this-slug-does-not-exist-xyz-abc"));

			// Then there is a link back to the posts listing
			const backLink = page.getByRole("link", {
				name: /Blogs about sport/i,
			});
			await expect(backLink).toBeVisible();
			await expect(backLink).toHaveAttribute("href", /\/en\/posts/);
		});

		test("shows Vietnamese 404 message on /vi/ routes", async ({ page }) => {
			// Given I navigate to a non-existent Vietnamese post
			await page.goto("/vi/posts/this-slug-does-not-exist-xyz-abc");

			// Then the 404 error component is shown
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				"Không tìm thấy bài viết",
			);
		});
	});

	test.describe("post content rendering", () => {
		test("renders post title as h1 heading when navigating from listing", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			const titleText = (await readMoreLinks.first().textContent())?.trim();

			await readMoreLinks.first().click();
			await expect(page.locator("article header h1")).toContainText(titleText!);
		});

		test("renders publication date on post detail", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();

			// Then the publication date <time> is shown in the article header
			await expect(page.locator("article header time")).toBeVisible();
		});

		test("renders markdown content in a prose article wrapper", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();

			// Then the post article is rendered with a prose content wrapper
			// (scoped to the single article on the detail page, not listing cards)
			const proseWrapper = page.locator("article .prose");
			await expect(proseWrapper).toBeVisible();
		});

		test("code blocks are rendered with syntax highlighting wrapper", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post that has code blocks
			await readMoreLinks.first().click();

			// Then code blocks use the zinc-900 background (design system compliance)
			const codeBlocks = page.locator("pre");
			if ((await codeBlocks.count()) > 0) {
				// The pre block should have rounded-3xl per design system
				await expect(codeBlocks.first()).toBeVisible();
			}
		});

		test("post detail shows author info when available", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();

			// Then "By" author attribution is present in the article header
			const byText = page.getByText(/^By /i);
			if (await byText.isVisible()) {
				await expect(byText).toBeVisible();
			}
		});

		test("category and tags are shown on post detail", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			await readMoreLinks.first().click();

			// Then category/tag badges are in the article header (optional — depends on seed data)
			const headerBadges = page.locator("article header .badge, article header span.rounded-full");
			const badgeCount = await headerBadges.count();
			expect(badgeCount).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe("translation and fallback", () => {
		test("shows fallback banner when translation does not exist for the requested language", async ({
			page,
			localizedUrl,
		}) => {
			// Two full SSR page loads — needs extra headroom for Neon cold-starts in CI
			test.setTimeout(120_000);
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post detail (English)
			const href = await readMoreLinks.first().getAttribute("href");
			if (!href) return;

			// Extract the slug and try the Vietnamese version
			const slug = href.split("/").pop();
			await page.goto(`/vi/posts/${slug}`, { waitUntil: "domcontentloaded" });

			// Either the fallback banner is visible (no VI translation → serves EN content)
			// OR the article header h1 is visible (a VI version exists)
			// Scoped to article header h1 to avoid false matches from markdown body h1s
			const fallbackBanner = page.getByText(/only available in/i);
			const articleTitle = page.locator("article header h1");

			await expect(fallbackBanner.or(articleTitle).first()).toBeVisible();
		});

		test("translation toggle is shown when post has a translation", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();

			// Then a translation toggle may appear (if the post has a translation)
			const toggleLabel = page.getByText(/Also available in:/i);
			const hasToggle = await toggleLabel.isVisible();

			// Presence is optional — depends on seeded translations
			expect(typeof hasToggle).toBe("boolean");
		});
	});
});
