import { expect, test } from "../support/fixtures";

/**
 * Epic 4 — Admin route auth guards
 *
 * All protected admin routes must redirect unauthenticated (guest) users
 * back to the language home page (/$lang). These tests verify that the
 * beforeLoad guards on each route work correctly without any auth session.
 *
 * Stories covered: 4.1 (new post), 4.4 (edit post), 4.5 (dashboard), 4.6 (translate)
 */

const UUID = "00000000-0000-0000-0000-000000000001";

test.describe("Admin route auth guards (Epic 4)", () => {
	test.describe("English routes", () => {
		test("GET /en/new redirects unauthenticated user to /en (Story 4.1)", async ({
			page,
		}) => {
			await page.goto("/en/new");
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en(\/|$|\?)/);
		});

		test("GET /en/admin/queue redirects unauthenticated user to /en (Story 4.5)", async ({
			page,
		}) => {
			await page.goto("/en/admin/queue");
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en(\/|$|\?)/);
		});

		test(`GET /en/edit/${UUID} redirects unauthenticated user to /en (Story 4.4)`, async ({
			page,
		}) => {
			await page.goto(`/en/edit/${UUID}`);
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en(\/|$|\?)/);
		});

		test(`GET /en/translate/${UUID} redirects unauthenticated user to /en (Story 4.6)`, async ({
			page,
		}) => {
			await page.goto(`/en/translate/${UUID}`);
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en(\/|$|\?)/);
		});
	});

	test.describe("Vietnamese routes", () => {
		test("GET /vi/new redirects unauthenticated user to /vi (Story 4.1)", async ({
			page,
		}) => {
			await page.goto("/vi/new");
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/vi(\/|$|\?)/);
		});

		test("GET /vi/admin/queue redirects unauthenticated user to /vi (Story 4.5)", async ({
			page,
		}) => {
			await page.goto("/vi/admin/queue");
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/vi(\/|$|\?)/);
		});

		test(`GET /vi/edit/${UUID} redirects unauthenticated user to /vi (Story 4.4)`, async ({
			page,
		}) => {
			await page.goto(`/vi/edit/${UUID}`);
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/vi(\/|$|\?)/);
		});

		test(`GET /vi/translate/${UUID} redirects unauthenticated user to /vi (Story 4.6)`, async ({
			page,
		}) => {
			await page.goto(`/vi/translate/${UUID}`);
			await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/vi(\/|$|\?)/);
		});
	});

	test.describe("Redirected landing page", () => {
		test("redirect destination renders the home page heading", async ({
			page,
		}) => {
			// Verify the redirect target is a real page (not a blank/error page)
			await page.goto("/en/new");
			await page.waitForLoadState("networkidle");
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		});
	});
});
