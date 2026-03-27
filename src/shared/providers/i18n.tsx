import { createContext, type ReactNode, useContext, useEffect } from "react";

import { type Dictionary, dictionaries } from "../../locales";
import { defaultLanguage, type Language } from "../constants";
import { getLocalizedPath } from "../utils/i18n";

interface I18nContextProps {
	language: Language;
	localizedPath: (path: string) => string;
	t: Dictionary;
}
const I18nContext = createContext<I18nContextProps>({
	language: defaultLanguage,
	localizedPath: (path: string) => `/${defaultLanguage}${path}`,
	t: dictionaries[defaultLanguage],
});

interface I18nProviderProps {
	language: Language;
	children: ReactNode;
}
export function I18nProvider({ language, children }: I18nProviderProps) {
	useEffect(() => {
		try {
			localStorage.setItem("language", language);
		} catch {
			// Ignore storage errors (private browsing, quota exceeded, etc.)
		}
	}, [language]);

	return (
		<I18nContext.Provider
			value={{
				language,
				localizedPath: (path: string) => getLocalizedPath(path, language),
				t: dictionaries[language],
			}}
		>
			{children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
