import { expect, test } from "../support/fixtures";

/**
 * Epic 6 — Story 6.1: Post Views Counter
 *
 * ACs:
 * 1. View count increments on page load (fire-and-forget POST, never blocks SSR)
 * 2. View count displayed as "N views" (EN) / "N lượt xem" (VI)
 * 3. Session-storage debounce — second load in same session skips increment
 * 4. Admin dashboard displays view count per post row (guard: redirects to login, checked indirectly)
 *
 * DOM shape:
 *   <div class="mt-1 flex items-center gap-1.5 …">
 *     <span>{viewCount}</span>   ← number
 *     <span>{t.pages.posts.views}</span>  ← label ("views" / "lượt xem")
 *   </div>
 * getByText() won't match across sibling spans — use the parent div instead.
 */

/** Shared helper: navigate to first post in listing and return its href. */
async function goToFirstPost(page: import("@playwright/test").Page, listingUrl: string) {
	await page.goto(listingUrl);
	const links = page.locator("article a");
	if ((await links.count()) === 0) return null;
	const href = await links.first().getAttribute("href");
	await links.first().click();
	return href;
}

test.describe("Post views counter (Story 6.1)", () => {
	test.describe("AC2 — view count display on post detail", () => {
		test("shows view count label 'views' on English post detail", async ({
			page,
			localizedUrl,
		}) => {
			const href = await goToFirstPost(page, localizedUrl("/posts"));
			if (!href) { test.skip(); return; }

			// The parent div contains both the numeric span and the label span.
			// Match any div inside article header whose text content contains "views".
			const viewBlock = page
				.locator("article header div")
				.filter({ hasText: /views/ });
			await expect(viewBlock).toBeVisible();
		});

		test("shows Vietnamese view count label on /vi/ post detail", async ({
			page,
		}) => {
			const href = await goToFirstPost(page, "/vi/posts");
			if (!href) { test.skip(); return; }

			const viewBlock = page
				.locator("article header div")
				.filter({ hasText: /lượt xem/ });
			await expect(viewBlock).toBeVisible();
		});

		test("view count value is a non-negative integer", async ({
			page,
			localizedUrl,
		}) => {
			const href = await goToFirstPost(page, localizedUrl("/posts"));
			if (!href) { test.skip(); return; }

			const viewBlock = page
				.locator("article header div")
				.filter({ hasText: /views/ });
			await expect(viewBlock).toBeVisible();

			const text = await viewBlock.textContent();
			const match = text?.match(/(\d+)/);
			expect(match).not.toBeNull();
			expect(Number(match![1])).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe("AC1 — fire-and-forget increment POST", () => {
		test("navigating to a post fires a POST to _serverFn", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
			const links = page.locator("article a");
			if ((await links.count()) === 0) { test.skip(); return; }

			// Clear session so the dedup guard doesn't suppress the first call
			await page.evaluate(() => sessionStorage.clear());

			let incrementCalled = false;
			await page.route("**/_serverFn/**", async (route) => {
				if (route.request().method() === "POST") {
					incrementCalled = true;
					await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
				} else {
					await route.continue();
				}
			});

			await links.first().click();

			await expect
				.poll(() => incrementCalled, { timeout: 8000 })
				.toBe(true);
		});

		test("article heading renders without waiting for the increment POST", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
			const links = page.locator("article a");
			if ((await links.count()) === 0) { test.skip(); return; }

			// Stall every POST to _serverFn indefinitely — SSR must not depend on it
			await page.route("**/_serverFn/**", async (route) => {
				if (route.request().method() === "POST") {
					// Never resolve — simulates unreachable server function
					await new Promise<void>(() => {});
				} else {
					await route.continue();
				}
			});

			await links.first().click();

			await expect(page.locator("article header h1")).toBeVisible({
				timeout: 15_000,
			});
		});
	});

	test.describe("AC3 — session-storage deduplication", () => {
		test("second visit to same post in same session does not fire a second POST", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
			const links = page.locator("article a");
			if ((await links.count()) === 0) { test.skip(); return; }

			const href = await links.first().getAttribute("href");

			// Start fresh session so first visit definitely triggers increment
			await page.evaluate(() => sessionStorage.clear());

			let postCallCount = 0;
			await page.route("**/_serverFn/**", async (route) => {
				if (route.request().method() === "POST") {
					postCallCount++;
					await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
				} else {
					await route.continue();
				}
			});

			// First visit — wait until the POST is actually fired
			await page.goto(href!);
			await expect(page.locator("article header h1")).toBeVisible();
			await expect.poll(() => postCallCount, { timeout: 8000 }).toBeGreaterThanOrEqual(1);
			const countAfterFirst = postCallCount;

			// Second visit — sessionStorage flag set, increment must be skipped
			await page.goto(href!);
			await expect(page.locator("article header h1")).toBeVisible();
			// Wait long enough for any (unwanted) second POST to appear
			await page.waitForTimeout(1500);

			expect(postCallCount).toBe(countAfterFirst);
		});
	});
});
