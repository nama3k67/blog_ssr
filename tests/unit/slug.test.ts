import { describe, expect, it } from "vitest";
import { generateSlug } from "../../src/shared/utils/slug";

describe("generateSlug (Story 4.1)", () => {
	describe("English text", () => {
		it("lowercases and hyphenates a simple title", () => {
			expect(generateSlug("Hello World")).toBe("hello-world");
		});

		it("handles numbers in title", () => {
			expect(generateSlug("Version 2.0 Release")).toBe("version-2-0-release");
		});

		it("strips leading and trailing whitespace", () => {
			expect(generateSlug("  trimmed  ")).toBe("trimmed");
		});

		it("collapses multiple spaces into one hyphen", () => {
			expect(generateSlug("too   many   spaces")).toBe("too-many-spaces");
		});

		it("removes punctuation and special characters", () => {
			// apostrophe is treated as a separator → "it-s" not "its"
			expect(generateSlug("Hello, World! It's a test.")).toBe(
				"hello-world-it-s-a-test",
			);
		});

		it("removes leading and trailing hyphens", () => {
			expect(generateSlug("--edge-case--")).toBe("edge-case");
		});

		it("collapses multiple consecutive hyphens", () => {
			expect(generateSlug("a---b")).toBe("a-b");
		});

		it("handles em-dashes and en-dashes", () => {
			expect(generateSlug("state—of—the—art")).toBe("state-of-the-art");
		});

		it("returns an empty string for empty input", () => {
			expect(generateSlug("")).toBe("");
		});

		it("handles all-numeric input", () => {
			expect(generateSlug("2024")).toBe("2024");
		});
	});

	describe("Vietnamese diacritics", () => {
		it("converts a full Vietnamese title to ASCII slug", () => {
			expect(generateSlug("Bài viết đầu tiên")).toBe("bai-viet-dau-tien");
		});

		it("converts đ → d", () => {
			expect(generateSlug("đường chạy")).toBe("duong-chay");
		});

		it("converts vowels with tones (à á ả ã ạ)", () => {
			expect(generateSlug("à á ả ã ạ")).toBe("a-a-a-a-a");
		});

		it("converts ă variants (ằ ắ ẳ ẵ ặ)", () => {
			expect(generateSlug("ằ ắ ẳ ẵ ặ")).toBe("a-a-a-a-a");
		});

		it("converts â variants (ầ ấ ẩ ẫ ậ)", () => {
			expect(generateSlug("ầ ấ ẩ ẫ ậ")).toBe("a-a-a-a-a");
		});

		it("converts ê variants (ề ế ể ễ ệ)", () => {
			expect(generateSlug("ề ế ể ễ ệ")).toBe("e-e-e-e-e");
		});

		it("converts ô variants (ồ ố ổ ỗ ộ)", () => {
			expect(generateSlug("ồ ố ổ ỗ ộ")).toBe("o-o-o-o-o");
		});

		it("converts ơ variants (ờ ớ ở ỡ ợ)", () => {
			expect(generateSlug("ờ ớ ở ỡ ợ")).toBe("o-o-o-o-o");
		});

		it("converts ư variants (ừ ứ ử ữ ự)", () => {
			expect(generateSlug("ừ ứ ử ữ ự")).toBe("u-u-u-u-u");
		});

		it("converts ý and ỳ variants", () => {
			expect(generateSlug("ý ỳ ỷ ỹ ỵ")).toBe("y-y-y-y-y");
		});

		it("handles mixed Vietnamese and English", () => {
			expect(generateSlug("Chạy marathon 42km")).toBe("chay-marathon-42km");
		});

		it("produces the same output for uppercase Vietnamese input", () => {
			const lower = generateSlug("bài viết");
			const upper = generateSlug("BÀI VIẾT");
			// Both should reduce to the same ASCII slug
			expect(upper).toBe(lower);
		});
	});
});
