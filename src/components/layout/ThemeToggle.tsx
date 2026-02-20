import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { useTheme } from "~/shared/providers/theme";

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const otherTheme = resolvedTheme === "dark" ? "light" : "dark";
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<Button
			variant="ghost"
			aria-label={mounted ? `Switch to ${otherTheme} theme` : "Toggle theme"}
			className="px-2 rounded-full"
			onClick={() => setTheme(otherTheme)}
		>
			<SunIcon className="h-6! w-6! fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden [@media(prefers-color-scheme:dark)]:fill-teal-50 [@media(prefers-color-scheme:dark)]:stroke-teal-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-teal-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-teal-600" />
			<MoonIcon className="hidden h-6! w-6! fill-zinc-700 stroke-zinc-500 transition dark:block [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-400 not-[@media_(prefers-color-scheme:dark)]:fill-teal-400/10 not-[@media_(prefers-color-scheme:dark)]:stroke-teal-500" />
		</Button>
	);
}
