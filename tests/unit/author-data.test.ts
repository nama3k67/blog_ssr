import { describe, expect, it } from "vitest";
import {
	CONTACT_EMAIL,
	GITHUB_URL,
	SKILLS,
	SOCIAL_LINKS,
} from "../../src/shared/data/author";

describe("Author static data", () => {
	it("GITHUB_URL is a valid URL", () => {
		expect(() => new URL(GITHUB_URL)).not.toThrow();
		expect(GITHUB_URL).toMatch(/^https:\/\/github\.com\//);
	});

	it("CONTACT_EMAIL is a valid email format", () => {
		expect(CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
	});

	it("SKILLS has at least one group", () => {
		expect(SKILLS.length).toBeGreaterThan(0);
	});

	it("every skill group has en and vi category labels", () => {
		for (const group of SKILLS) {
			expect(group.category.en, `Missing en label in group`).toBeTruthy();
			expect(group.category.vi, `Missing vi label in group`).toBeTruthy();
			expect(group.skills.length, `Group '${group.category.en}' has no skills`).toBeGreaterThan(0);
		}
	});

	it("every social link has a valid href", () => {
		for (const link of SOCIAL_LINKS) {
			expect(() => new URL(link.href), `Invalid URL in ${link.label}`).not.toThrow();
			expect(link.label).toBeTruthy();
		}
	});
});
