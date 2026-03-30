import { expect, test } from "../support/fixtures";

/**
 * Helpers to query <meta> and <link> tags from document head.
 */
async function getMetaContent(page: import("@playwright/test").Page, selector: string): Promise<string | null> {
	return page.evaluate((sel) => {
		const el = document.querySelector(sel);
		return el ? (el.getAttribute("content") ?? el.getAttribute("href")) : null;
	}, selector);
}

async function getLinkHref(page: import("@playwright/test").Page, selector: string): Promise<string | null> {
	return page.evaluate((sel) => {
		const el = document.querySelector(sel);
		return el ? el.getAttribute("href") : null;
	}, selector);
}

test.describe("SEO meta tags (Story 3.3)", () => {
	test.describe("home page OG and hreflang", () => {
		test("has og:title meta tag", async ({ page, localizedUrl }) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then og:title is present in the head
			const ogTitle = await getMetaContent(
				page,
				'meta[property="og:title"]',
			);
			expect(ogTitle).not.toBeNull();
			expect(ogTitle!.length).toBeGreaterThan(0);
		});

		test("has og:description meta tag", async ({ page, localizedUrl }) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then og:description is present
			const ogDesc = await getMetaContent(
				page,
				'meta[property="og:description"]',
			);
			expect(ogDesc).not.toBeNull();
		});

		test("has og:image meta tag", async ({ page, localizedUrl }) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then og:image is present and points to an absolute URL
			const ogImage = await getMetaContent(page, 'meta[property="og:image"]');
			expect(ogImage).not.toBeNull();
			expect(ogImage).toMatch(/^https?:\/\//);
		});

		test("has hreflang en link", async ({ page, localizedUrl }) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then hreflang="en" alternate link is present
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="en"]',
			);
			expect(href).not.toBeNull();
			expect(href).toMatch(/\/en\//);
		});

		test("has hreflang vi link", async ({ page, localizedUrl }) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then hreflang="vi" alternate link is present
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="vi"]',
			);
			console.log("🚀 ~ href:", href)
			expect(href).not.toBeNull();
			expect(href).toMatch(/\/vi\//);
		});

		test("has hreflang x-default link pointing to English version", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the English home page
			await page.goto(localizedUrl("/"));

			// Then hreflang="x-default" points to the English URL
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="x-default"]',
			);
			expect(href).not.toBeNull();
			expect(href).toMatch(/\/en\//);
		});
	});

	test.describe("about page OG and hreflang", () => {
		test("has og:title meta tag", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/about"));
			const ogTitle = await getMetaContent(page, 'meta[property="og:title"]');
			expect(ogTitle).not.toBeNull();
			expect(ogTitle).toContain("About");
		});

		test("has og:image meta tag with absolute URL", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/about"));
			const ogImage = await getMetaContent(page, 'meta[property="og:image"]');
			expect(ogImage).not.toBeNull();
			expect(ogImage).toMatch(/^https?:\/\//);
		});

		test("has hreflang en and vi links", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/about"));

			const hrefEn = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="en"]',
			);
			const hrefVi = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="vi"]',
			);

			expect(hrefEn).toMatch(/\/en\/about/);
			expect(hrefVi).toMatch(/\/vi\/about/);
		});

		test("has hreflang x-default link", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/about"));
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="x-default"]',
			);
			expect(href).not.toBeNull();
			expect(href).toMatch(/\/en\/about/);
		});
	});

	test.describe("projects page OG and hreflang", () => {
		test("has og:title meta tag", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/projects"));
			const ogTitle = await getMetaContent(page, 'meta[property="og:title"]');
			expect(ogTitle).not.toBeNull();
			expect(ogTitle).toContain("Projects");
		});

		test("has og:image meta tag with absolute URL", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/projects"));
			const ogImage = await getMetaContent(page, 'meta[property="og:image"]');
			expect(ogImage).not.toBeNull();
			expect(ogImage).toMatch(/^https?:\/\//);
		});

		test("has hreflang en and vi links", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/projects"));

			const hrefEn = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="en"]',
			);
			const hrefVi = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="vi"]',
			);

			expect(hrefEn).toMatch(/\/en\/projects/);
			expect(hrefVi).toMatch(/\/vi\/projects/);
		});
	});

	test.describe("posts listing page hreflang", () => {
		test("has hreflang en link pointing to /en/posts", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="en"]',
			);
			expect(href).toMatch(/\/en\/posts/);
		});

		test("has hreflang vi link pointing to /vi/posts", async ({
			page,
			localizedUrl,
		}) => {
			await page.goto(localizedUrl("/posts"));
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="vi"]',
			);
			expect(href).toMatch(/\/vi\/posts/);
		});

		test("has hreflang x-default link", async ({ page, localizedUrl }) => {
			await page.goto(localizedUrl("/posts"));
			const href = await getLinkHref(
				page,
				'link[rel="alternate"][hreflang="x-default"]',
			);
			expect(href).toMatch(/\/en\/posts/);
		});
	});

	test.describe("post detail page OG and hreflang", () => {
		test("has og:type = article on post detail", async ({
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

			// Then og:type is "article"
			const ogType = await getMetaContent(page, 'meta[property="og:type"]');
			expect(ogType).toBe("article");
		});

		test("has og:title matching the post title", async ({
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

			// Then og:title is present
			const ogTitle = await getMetaContent(page, 'meta[property="og:title"]');
			expect(ogTitle).not.toBeNull();
			expect(ogTitle!.length).toBeGreaterThan(0);
		});

		test("has og:locale = en_US for English posts", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing in English
			await page.goto(localizedUrl("/posts"));
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to an English post
			await readMoreLinks.first().click();

			// Then og:locale is en_US
			const ogLocale = await getMetaContent(
				page,
				'meta[property="og:locale"]',
			);
			expect(ogLocale).toBe("en_US");
		});

		test("has og:image with absolute URL on post detail", async ({
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

			// Then og:image is an absolute URL
			const ogImage = await getMetaContent(page, 'meta[property="og:image"]');
			expect(ogImage).not.toBeNull();
			expect(ogImage).toMatch(/^https?:\/\//);
		});

		test("has at least one hreflang link on post detail", async ({
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

			// Then at least one hreflang alternate link is in the head
			const hreflangCount = await page.evaluate(() => {
				return document.querySelectorAll('link[rel="alternate"][hreflang]')
					.length;
			});
			expect(hreflangCount).toBeGreaterThanOrEqual(1);
		});

		test("has og:locale = vi_VN for Vietnamese posts", async ({ page }) => {
			// Given I visit the posts listing in Vietnamese
			await page.goto("/vi/posts");
			// CardLink renders <a> around the title; CardCta is aria-hidden <div> — use "article a"
		const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a Vietnamese post
			await readMoreLinks.first().click();
			await page.waitForURL(/\/vi\/posts\/.+/);

			// Then og:locale is vi_VN
			const ogLocale = await getMetaContent(
				page,
				'meta[property="og:locale"]',
			);
			expect(ogLocale).toBe("vi_VN");
		});
	});
});
