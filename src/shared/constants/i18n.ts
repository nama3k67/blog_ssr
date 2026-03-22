export const languages = ["en", "vi"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";

export const languageNames: Record<Language, string> = {
	en: "English",
	vi: "Tiếng Việt",
};

export const languageNativeNames: Record<Language, string> = {
	en: "English",
	vi: "Tiếng Việt",
};
