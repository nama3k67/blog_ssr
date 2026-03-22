/**
 * Vietnamese diacritics mapping for slug generation
 */
const vietnameseMap: Record<string, string> = {
	à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
	ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
	â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
	đ: "d",
	è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
	ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
	ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
	ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
	ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
	ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
	ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
	ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
	ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
};

/**
 * Generate a URL-friendly slug from a string.
 * Handles Vietnamese diacritics and special characters.
 *
 * @example
 * generateSlug("Hello World") // "hello-world"
 * generateSlug("Bài viết đầu tiên") // "bai-viet-dau-tien"
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		// Replace Vietnamese characters
		.replace(/[^\x20-\x7E]/g, (char) => vietnameseMap[char] || char)
		// Remove remaining non-ASCII characters
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		// Replace non-alphanumeric characters with hyphens
		.replace(/[^a-z0-9]+/g, "-")
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, "")
		// Collapse multiple hyphens
		.replace(/-{2,}/g, "-");
}
