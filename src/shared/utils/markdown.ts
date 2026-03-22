import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import nord from "shiki/themes/nord.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import shell from "shiki/langs/shellscript.mjs";
import sql from "shiki/langs/sql.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";

const highlighter = createHighlighterCoreSync({
	themes: [nord],
	langs: [
		css,
		html,
		javascript,
		json,
		markdown,
		shell,
		sql,
		tsx,
		typescript,
	],
	engine: createJavaScriptRegexEngine(),
});

const supportedLangs = new Set(highlighter.getLoadedLanguages());

export function highlightCode(code: string, language: string): string {
	const lang = supportedLangs.has(language) ? language : "text";

	const html = highlighter.codeToHtml(code, {
		lang,
		theme: "nord",
	});

	return html.replace(/background-color:[^;]*;?/g, "");
}
