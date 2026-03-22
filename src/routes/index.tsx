import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultLanguage } from "~/shared/constants";
import { getBrowserLanguage } from "~/shared/utils/i18n";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		// Try to detect browser language, fallback to default
		const preferredLang =
			typeof window !== "undefined" ? getBrowserLanguage() : defaultLanguage;

		throw redirect({
			to: `/${preferredLang}/` as '/$lang',
			params: { lang: preferredLang },
		});
	},
});
