import { describe, expect, it } from "vitest";
import {
	createPostSchema,
	createTranslationFormSchema,
	createTranslationSchema,
	updatePostFormSchema,
	updatePostSchema,
} from "../../src/shared/schemas/post";

// ─────────────────────────────────────────────────────────────────────────────
// createPostSchema (Story 4.1)
// ─────────────────────────────────────────────────────────────────────────────
describe("createPostSchema (Story 4.1)", () => {
	const valid = {
		title: "Test Post",
		slug: "test-post",
		lang: "en",
		content: "Some content",
		tagIds: [],
	};

	it("accepts a minimal valid post", () => {
		expect(() => createPostSchema.parse(valid)).not.toThrow();
	});

	it("rejects empty title", () => {
		expect(() =>
			createPostSchema.parse({ ...valid, title: "" }),
		).toThrow();
	});

	it("rejects empty content", () => {
		expect(() =>
			createPostSchema.parse({ ...valid, content: "" }),
		).toThrow();
	});

	it("rejects more than 10 tagIds", () => {
		const ids = Array.from(
			{ length: 11 },
			(_, i) => `a0eebc99-9c0b-4ef8-bb6d-6bb9bd3800${String(i).padStart(2, "0")}`,
		);
		expect(() =>
			createPostSchema.parse({ ...valid, tagIds: ids }),
		).toThrow();
	});

	it("deduplicates tagIds via transform", () => {
		const id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		const result = createPostSchema.parse({ ...valid, tagIds: [id, id] });
		expect(result.tagIds).toHaveLength(1);
	});

	it("trims leading/trailing whitespace from title", () => {
		const result = createPostSchema.parse({ ...valid, title: "  trimmed  " });
		expect(result.title).toBe("trimmed");
	});

	it("defaults published to false", () => {
		const result = createPostSchema.parse(valid);
		expect(result.published).toBe(false);
	});

	it("accepts published: true", () => {
		const result = createPostSchema.parse({ ...valid, published: true });
		expect(result.published).toBe(true);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// updatePostSchema (Story 4.4)
// ─────────────────────────────────────────────────────────────────────────────
describe("updatePostSchema (Story 4.4)", () => {
	const valid = {
		postId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		title: "Updated",
		slug: "updated",
		lang: "en",
		content: "content",
		tagIds: [],
	};

	it("accepts a valid update payload", () => {
		expect(() => updatePostSchema.parse(valid)).not.toThrow();
	});

	it("requires a valid UUID for postId", () => {
		expect(() =>
			updatePostSchema.parse({ ...valid, postId: "not-a-uuid" }),
		).toThrow();
	});

	it("deduplicates tagIds via transform", () => {
		const id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		const result = updatePostSchema.parse({ ...valid, tagIds: [id, id] });
		expect(result.tagIds).toHaveLength(1);
	});

	it("transforms empty featuredImage to undefined", () => {
		const result = updatePostSchema.parse({
			...valid,
			featuredImage: "",
		});
		expect(result.featuredImage).toBeUndefined();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// createTranslationSchema (Story 4.6 — includes code review fix P3)
// ─────────────────────────────────────────────────────────────────────────────
describe("createTranslationSchema (Story 4.6)", () => {
	const validId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const valid = {
		originalPostId: validId,
		title: "Translated Title",
		content: "Translated content",
	};

	it("accepts a minimal valid translation input", () => {
		expect(() => createTranslationSchema.parse(valid)).not.toThrow();
	});

	it("accepts optional description and featuredImage", () => {
		expect(() =>
			createTranslationSchema.parse({
				...valid,
				description: "A description",
				featuredImage: "https://example.com/img.jpg",
			}),
		).not.toThrow();
	});

	// P3 fix: categoryId and tagIds are now part of the schema
	it("accepts optional categoryId (UUID)", () => {
		expect(() =>
			createTranslationSchema.parse({
				...valid,
				categoryId: validId,
			}),
		).not.toThrow();
	});

	it("accepts categoryId: undefined", () => {
		expect(() =>
			createTranslationSchema.parse({
				...valid,
				categoryId: undefined,
			}),
		).not.toThrow();
	});

	it("rejects a non-UUID categoryId", () => {
		expect(() =>
			createTranslationSchema.parse({
				...valid,
				categoryId: "not-a-uuid",
			}),
		).toThrow();
	});

	it("accepts tagIds array", () => {
		const result = createTranslationSchema.parse({
			...valid,
			tagIds: [validId],
		});
		expect(result.tagIds).toEqual([validId]);
	});

	it("defaults tagIds to empty array when omitted", () => {
		const result = createTranslationSchema.parse(valid);
		expect(result.tagIds).toEqual([]);
	});

	it("rejects tagIds with more than 10 entries", () => {
		const ids = Array.from(
			{ length: 11 },
			(_, i) => `a0eebc99-9c0b-4ef8-bb6d-6bb9bd3800${String(i).padStart(2, "0")}`,
		);
		expect(() =>
			createTranslationSchema.parse({ ...valid, tagIds: ids }),
		).toThrow();
	});

	it("rejects empty title", () => {
		expect(() =>
			createTranslationSchema.parse({ ...valid, title: "" }),
		).toThrow();
	});

	it("rejects empty content", () => {
		expect(() =>
			createTranslationSchema.parse({ ...valid, content: "" }),
		).toThrow();
	});

	it("requires a valid UUID for originalPostId", () => {
		expect(() =>
			createTranslationSchema.parse({ ...valid, originalPostId: "bad" }),
		).toThrow();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// createTranslationFormSchema (Story 4.6 — form-level schema)
// ─────────────────────────────────────────────────────────────────────────────
describe("createTranslationFormSchema (Story 4.6)", () => {
	const validId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const valid = {
		originalPostId: validId,
		title: "Title",
		slug: "my-slug",
		lang: "vi",
		description: "",
		content: "Content",
		categoryId: undefined,
		tagIds: [],
		featuredImage: "",
	};

	it("accepts a complete valid form payload", () => {
		expect(() => createTranslationFormSchema.parse(valid)).not.toThrow();
	});

	it("rejects empty slug", () => {
		expect(() =>
			createTranslationFormSchema.parse({ ...valid, slug: "" }),
		).toThrow();
	});

	it("rejects empty lang", () => {
		expect(() =>
			createTranslationFormSchema.parse({ ...valid, lang: "" }),
		).toThrow();
	});

	it("allows categoryId as undefined", () => {
		expect(() =>
			createTranslationFormSchema.parse({
				...valid,
				categoryId: undefined,
			}),
		).not.toThrow();
	});

	it("allows categoryId as a valid UUID string", () => {
		expect(() =>
			createTranslationFormSchema.parse({
				...valid,
				categoryId: validId,
			}),
		).not.toThrow();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// updatePostFormSchema (Story 4.4)
// ─────────────────────────────────────────────────────────────────────────────
describe("updatePostFormSchema (Story 4.4)", () => {
	const validId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const valid = {
		postId: validId,
		title: "Title",
		slug: "slug",
		lang: "en",
		description: "",
		content: "Content",
		categoryId: undefined,
		tagIds: [],
		featuredImage: "",
	};

	it("accepts a valid update form payload", () => {
		expect(() => updatePostFormSchema.parse(valid)).not.toThrow();
	});

	it("allows categoryId as undefined (no selection)", () => {
		expect(() =>
			updatePostFormSchema.parse({ ...valid, categoryId: undefined }),
		).not.toThrow();
	});

	it("accepts up to 10 tagIds", () => {
		const ids = Array.from(
			{ length: 10 },
			(_, i) => `a0eebc99-9c0b-4ef8-bb6d-6bb9bd3800${String(i).padStart(2, "0")}`,
		);
		expect(() =>
			updatePostFormSchema.parse({ ...valid, tagIds: ids }),
		).not.toThrow();
	});
});
