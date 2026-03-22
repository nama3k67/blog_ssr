"use client";

import { useRouter } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { type Language, languages } from "~/shared/constants";
import { useI18n } from "~/shared/providers/i18n";
import { getLocalizedPath } from "~/shared/utils/i18n";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from "../ui/select";

function I18nSwitcher() {
	const router = useRouter();
	const { language: currentLang, t } = useI18n();

	const onLocaleChange = (newLang: Language) => {
		const newPath = getLocalizedPath(router.state.location.pathname, newLang);

		router.navigate({ to: newPath });
	};

	return (
		<Select defaultValue={currentLang} onValueChange={onLocaleChange}>
			<SelectTrigger
				showIcon={false}
				className="border-none shadow-none w-fit hover:bg-accent hover:text-accent-foreground rounded-full px-2"
			>
				<Globe
					strokeWidth={1.5}
					className="size-6! stroke-teal-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:fill-teal-50 dark:group-hover:stroke-teal-600"
				/>
			</SelectTrigger>

			<SelectContent position="popper" align="end" sideOffset={1}>
				<SelectGroup>
					{languages.map((lang) => (
						<SelectItem key={lang} value={lang}>
							{t.i18n[lang]}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

export default I18nSwitcher;
