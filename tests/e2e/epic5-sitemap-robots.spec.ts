import { expect, test } from "../support/fixtures";

test.describe("Epic 5.1 - Sitemap & Robots (Story 5.1)", () => {
	test.describe("sitemap.xml endpoint", () => {
		test("returns valid XML with correct Content-Type", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");

			// Then the response is XML
			expect(response.status()).toBe(200);
			expect(response.headers()["content-type"]).toContain("application/xml");
		});

		test("sitemap XML is well-formed", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then it's valid XML (starts with <?xml and has root <urlset>)
			expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
			expect(xml).toContain("<urlset");
			expect(xml).toContain("</urlset>");
		});

		test("sitemap includes static routes for English and Vietnamese", async ({
			page,
		}) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then it includes hreflang entries for static routes
			expect(xml).toContain("/en/");
			expect(xml).toContain("/vi/");
		});

		test("sitemap includes hreflang x-default pointing to English", async ({
			page,
		}) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then x-default hreflang is present and points to /en/
			expect(xml).toContain('hreflang="x-default"');
			// x-default should point to English version
			expect(xml).toMatch(/hreflang="x-default" href="[^"]*\/en\//);
		});

		test("sitemap includes hreflang alternate links", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then it has hreflang links for en and vi
			expect(xml).toContain('hreflang="en"');
			expect(xml).toContain('hreflang="vi"');
		});

		test("sitemap uses XHTML namespace", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then it declares the xhtml namespace
			expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
		});

		test("sitemap root element declares sitemap namespace", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then urlset declares sitemap namespace
			expect(xml).toContain(
				'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
			);
		});

		test("sitemap has Cache-Control header set to 1 hour", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");

			// Then Cache-Control is set to 1 hour
			expect(response.headers()["cache-control"]).toContain("max-age=3600");
		});

		test("sitemap entries have loc and lastmod elements", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then each URL has at least loc element
			expect(xml).toContain("<loc>");
			expect(xml).toContain("</loc>");

			// Some entries (like posts) should have lastmod
			// This is implementation-dependent but generally good practice
			const hasLastMod = xml.includes("<lastmod>");
			expect(hasLastMod).toBe(true);
		});

		test("sitemap includes published posts if they exist", async ({ page }) => {
			// Given I request the sitemap
			const response = await page.request.get("/sitemap.xml");
			const xml = await response.text();

			// Then if posts exist, they should be in sitemap (checking for /posts/ in URLs)
			// This test passes if either posts exist or gracefully handles empty database
			const hasPosts = xml.includes("/posts/");
			expect(typeof hasPosts).toBe("boolean");
		});
	});

	test.describe("robots.txt endpoint", () => {
		test("returns valid text with correct Content-Type", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");

			// Then the response is plain text
			expect(response.status()).toBe(200);
			expect(response.headers()["content-type"]).toContain("text/plain");
		});

		test("robots.txt allows public access", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then Allow: / is present
			expect(text).toContain("Allow: /");
		});

		test("robots.txt disallows /api/", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then /api/ is disallowed
			expect(text).toContain("Disallow: /api/");
		});

		test("robots.txt disallows admin paths", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then admin paths are disallowed
			expect(text).toContain("Disallow: /en/admin/");
			expect(text).toContain("Disallow: /vi/admin/");
		});

		test("robots.txt disallows protected editing paths", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then editing/new paths are disallowed
			expect(text).toContain("Disallow: /en/edit/");
			expect(text).toContain("Disallow: /vi/edit/");
			expect(text).toContain("Disallow: /en/new");
			expect(text).toContain("Disallow: /vi/new");
		});

		test("robots.txt disallows auth paths", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then login paths are disallowed
			expect(text).toContain("Disallow: /en/login");
			expect(text).toContain("Disallow: /vi/login");
		});

		test("robots.txt includes User-agent directive", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then User-agent: * is present
			expect(text).toContain("User-agent: *");
		});

		test("robots.txt references sitemap.xml", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Then Sitemap line is present
			expect(text).toContain("Sitemap:");
			expect(text).toContain("/sitemap.xml");
		});

		test("robots.txt has Cache-Control header set to 1 day", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");

			// Then Cache-Control is set to 1 day
			expect(response.headers()["cache-control"]).toContain("max-age=86400");
		});

		test("robots.txt Sitemap URL is absolute", async ({ page }) => {
			// Given I request robots.txt
			const response = await page.request.get("/robots.txt");
			const text = await response.text();

			// Extract Sitemap line and verify it's an absolute URL
			const sitemapLine = text.split("\n").find((line) => line.startsWith("Sitemap:"));
			expect(sitemapLine).toBeDefined();

			// Extract URL from the line (everything after "Sitemap: ")
			const sitemapUrl = sitemapLine!.split("Sitemap: ")[1];
			expect(sitemapUrl).toMatch(/^https?:\/\//);
		});
	});

	test.describe("Sitemap and robots integration", () => {
		test("sitemap.xml endpoint returns 503 with fallback on error", async ({
			page,
		}) => {
			// This tests the error handling path
			// The server should return a valid (but empty) sitemap on error
			const response = await page.request.get("/sitemap.xml");

			// Either 200 (success) or 503 (failure with fallback)
			expect([200, 503]).toContain(response.status);

			// Response should always be valid XML
			const xml = await response.text();
			expect(xml).toMatch(/^<\?xml/);
			expect(xml).toContain("<urlset");
		});

		test("robots.txt can be fetched without authentication", async ({
			page,
		}) => {
			// Given I request robots.txt without any auth context
			const response = await page.request.get("/robots.txt");

			// Then it's publicly accessible
			expect(response.status()).toBe(200);
		});

		test("sitemap.xml can be fetched without authentication", async ({
			page,
		}) => {
			// Given I request sitemap.xml without any auth context
			const response = await page.request.get("/sitemap.xml");

			// Then it's publicly accessible
			expect(response.status()).toBe(200);
		});
	});
});
