export function getFirstNWords(
	str: string | null | undefined,
	n: number,
): string {
	if (!str) return "";

	const words = str.split(/\s+/).slice(0, n);
	return words.join(" ");
}

export function getFirstNCharacters(
	str: string | null | undefined,
	n: number,
): string {
	if (!str) return "";

	return str.slice(0, n);
}

export function capitalizeFirstLetter(
	string: string | null | undefined,
): string {
	if (typeof string !== "string" || string.length === 0) {
		return "";
	}
	return string.charAt(0).toUpperCase() + string.slice(1);
}
