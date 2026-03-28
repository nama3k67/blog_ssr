import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultLanguage } from "~/shared/constants";
import { getBrowserLanguage, getValidLanguage } from "~/shared/utils/i18n";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		let preferredLang = defaultLanguage;

		if (typeof window !== "undefined") {
			// Priority: localStorage preference → browser language → default
			const stored = localStorage.getItem("language");
			preferredLang = stored ? getValidLanguage(stored) : getBrowserLanguage();
		}

		throw redirect({
			to: `/${preferredLang}/` as "/$lang",
			params: { lang: preferredLang },
		});
	},
});
