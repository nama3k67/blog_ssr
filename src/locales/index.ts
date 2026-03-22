import { type EnDict, en } from "./en";
import { type ViDict, vi } from "./vi";

export const dictionaries = {
	en,
	vi,
} as const;

export type SupportedLanguage = keyof typeof dictionaries;
export type Dictionary = EnDict | ViDict;
