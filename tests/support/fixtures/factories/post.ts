/**
 * Post factory — generates test post data for future E2E tests
 * that create/edit posts via the admin UI.
 *
 * Usage:
 *   const post = postFactory.build();
 *   const draftPost = postFactory.build({ status: "draft" });
 */

type Language = "en" | "vi";

interface TestPost {
	title: string;
	slug: string;
	description: string;
	content: string;
	language: Language;
	status: "draft" | "published";
}

let counter = 0;

export const postFactory = {
	build(overrides: Partial<TestPost> = {}): TestPost {
		counter += 1;
		return {
			title: `Test Post ${counter}`,
			slug: `test-post-${counter}`,
			description: `Description for test post ${counter}`,
			content: `# Test Post ${counter}\n\nContent goes here.`,
			language: "en",
			status: "draft",
			...overrides,
		};
	},

	reset() {
		counter = 0;
	},
};
