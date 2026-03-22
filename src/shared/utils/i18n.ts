import type { FileRoutesByTo } from "~/routeTree.gen";
import { defaultLanguage, type Language, languages } from "../constants";

export function isValidLanguage(lang: string): lang is Language {
	return languages.includes(lang as Language);
}

export function getValidLanguage(lang?: string): Language {
	if (lang && isValidLanguage(lang)) {
		return lang;
	}
	return defaultLanguage;
}

export function getBrowserLanguage(): Language {
	if (typeof window === "undefined") return defaultLanguage;

	const browserLang = navigator.language.split("-")[0];
	return isValidLanguage(browserLang) ? browserLang : defaultLanguage;
}

export function getLocalizedPath(
	path: string,
	lang: Language,
): keyof FileRoutesByTo {
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;

	const pathWithoutLang = cleanPath.replace(/^(en|vi)\//, "");
	return `/${lang}/${pathWithoutLang}` as keyof FileRoutesByTo;
}

export function extractLanguageFromPath(path: string): Language | null {
	const match = path.match(/^\/(en|vi)(\/|$)/);
	return match ? (match[1] as Language) : null;
}
