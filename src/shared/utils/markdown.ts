import { codeToHtml } from "shiki";

export async function highlightCode(
	code: string,
	language: string,
): Promise<string> {
	const html = await codeToHtml(code, {
		lang: language,
		theme: "nord",
	});

	// Remove inline background-color style to use container's background
	return html.replace(/background-color:[^;]*;?/g, "");
}
