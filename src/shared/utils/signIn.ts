export function getSignInAppearance(isDark: boolean) {
	return {
		variables: {
			colorBackground: isDark ? "#18181b" : "#ffffff", // zinc-900 / white
			colorText: isDark ? "#f4f4f5" : "#27272a", // zinc-100 / zinc-800
			colorTextSecondary: isDark ? "#a1a1aa" : "#52525b", // zinc-400 / zinc-600
			colorInputBackground: isDark ? "#27272a" : "#ffffff", // zinc-800 / white
			colorInputText: isDark ? "#f4f4f5" : "#27272a", // zinc-100 / zinc-800
			borderRadius: "0.5rem",
			fontFamily: "inherit",
		},
		elements: {
			rootBox: "w-full",
			cardBox: "shadow-lg shadow-zinc-800/5",
			card: "ring-1 ring-zinc-900/5 dark:ring-white/10",
			header: "!hidden",
			footerAction: "!hidden",
			socialButtonsBlockButton:
				"border-0 !bg-zinc-50 !text-zinc-900 hover:!bg-zinc-100 dark:!bg-zinc-800/50 dark:!text-zinc-300 dark:hover:!bg-zinc-800",
			dividerLine: "bg-zinc-100 dark:bg-zinc-700/40",
			formButtonPrimary:
				"!bg-zinc-800 font-semibold !text-zinc-100 hover:!bg-zinc-700 dark:!bg-zinc-700 dark:hover:!bg-zinc-600",
		},
	} as const;
}
