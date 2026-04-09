import { expect, test } from "../support/fixtures";

test.describe("Epic 5.2 - Structured Data (JSON-LD)", () => {
	test.describe("Article schema on post detail pages", () => {
		test("renders valid BlogPosting JSON-LD on post detail page", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();
			await page.waitForSelector("article header h1");

			// Then valid BlogPosting JSON-LD is in the head
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			expect(jsonLd).not.toBeNull();
			expect(jsonLd["@context"]).toBe("https://schema.org");
			expect(jsonLd["@type"]).toBe("BlogPosting");
		});

		test("BlogPosting schema includes required fields", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();
			await page.waitForSelector("article header h1");

			// Then BlogPosting has headline, datePublished, author
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			expect(jsonLd.headline).toBeDefined();
			expect(jsonLd.headline).not.toBeNull();
			expect(jsonLd.datePublished).toBeDefined();
			expect(jsonLd.author).toBeDefined();
		});

		test("BlogPosting author is a Person object", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();
			await page.waitForSelector("article header h1");

			// Then author is a Person with name
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			expect(jsonLd.author["@type"]).toBe("Person");
			expect(jsonLd.author.name).toBeDefined();
			expect(typeof jsonLd.author.name).toBe("string");
		});

		test("BlogPosting includes publisher Organization", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();
			await page.waitForSelector("article header h1");

			// Then publisher is an Organization
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			expect(jsonLd.publisher["@type"]).toBe("Organization");
			expect(jsonLd.publisher.name).toBeDefined();
		});

		test("BlogPosting headline matches post title", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the posts listing
			await page.goto(localizedUrl("/posts"));
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a post
			await readMoreLinks.first().click();
			await page.waitForSelector("article header h1");

			// Then get the page title and JSON-LD headline
			const pageTitle = await page.locator("article header h1").textContent();
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			// They should match
			expect(jsonLd.headline).toBe(pageTitle);
		});
	});

	test.describe("Person schema on about page", () => {
		test("renders valid Person JSON-LD on about page", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the about page
			await page.goto(localizedUrl("/about"));

			// Then valid Person JSON-LD is in the head
			const jsonLd = await page.evaluate(() => {
				const scripts = Array.from(
					document.querySelectorAll('script[type="application/ld+json"]'),
				);
				// Find the Person schema (first one should be Person for about page)
				for (const script of scripts) {
					const data = JSON.parse(script.textContent || "");
					if (data["@type"] === "Person") {
						return data;
					}
				}
				return null;
			});

			expect(jsonLd).not.toBeNull();
			expect(jsonLd["@context"]).toBe("https://schema.org");
			expect(jsonLd["@type"]).toBe("Person");
		});

		test("Person schema includes required fields", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the about page
			await page.goto(localizedUrl("/about"));

			// Then Person has name and jobTitle
			const jsonLd = await page.evaluate(() => {
				const scripts = Array.from(
					document.querySelectorAll('script[type="application/ld+json"]'),
				);
				for (const script of scripts) {
					const data = JSON.parse(script.textContent || "");
					if (data["@type"] === "Person") {
						return data;
					}
				}
				return null;
			});

			expect(jsonLd.name).toBeDefined();
			expect(jsonLd.name).not.toBeNull();
			expect(jsonLd.jobTitle).toBeDefined();
		});

		test("Person schema is valid when rendered", async ({
			page,
			localizedUrl,
		}) => {
			// Given I visit the about page
			await page.goto(localizedUrl("/about"));

			// Then Person schema should be valid JSON with @context and @type
			const jsonLd = await page.evaluate(() => {
				const scripts = Array.from(
					document.querySelectorAll('script[type="application/ld+json"]'),
				);
				for (const script of scripts) {
					const data = JSON.parse(script.textContent || "");
					if (data["@type"] === "Person") {
						return data;
					}
				}
				return null;
			});

			expect(jsonLd["@context"]).toBe("https://schema.org");
			expect(jsonLd["@type"]).toBe("Person");
		});
	});

	test.describe("JSON-LD validation across languages", () => {
		test("BlogPosting JSON-LD is present on Vietnamese post pages", async ({
			page,
		}) => {
			// Given I visit the Vietnamese posts listing
			await page.goto("/vi/posts");
			const readMoreLinks = page.locator("article a");

			if ((await readMoreLinks.count()) === 0) {
				test.skip();
				return;
			}

			// When I navigate to a Vietnamese post
			await readMoreLinks.first().click();
			await page.waitForURL(/\/vi\/posts\/.+/);

			// Then BlogPosting JSON-LD is present
			const jsonLd = await page.evaluate(() => {
				const script = document.querySelector(
					'script[type="application/ld+json"]',
				);
				return script ? JSON.parse(script.textContent || "") : null;
			});

			expect(jsonLd["@type"]).toBe("BlogPosting");
		});

		test("Person JSON-LD is present on Vietnamese about page", async ({
			page,
		}) => {
			// Given I visit the Vietnamese about page
			await page.goto("/vi/about");

			// Then Person JSON-LD is present
			const jsonLd = await page.evaluate(() => {
				const scripts = Array.from(
					document.querySelectorAll('script[type="application/ld+json"]'),
				);
				for (const script of scripts) {
					const data = JSON.parse(script.textContent || "");
					if (data["@type"] === "Person") {
						return data;
					}
				}
				return null;
			});

			expect(jsonLd["@type"]).toBe("Person");
		});
	});
});
