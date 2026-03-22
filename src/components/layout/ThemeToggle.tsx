import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "~/shared/providers/theme";

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const otherTheme = resolvedTheme === "dark" ? "light" : "dark";
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<button
			type="button"
			aria-label={mounted ? `Switch to ${otherTheme} theme` : "Toggle theme"}
			className="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-sm transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
			onClick={() => setTheme(otherTheme)}
		>
			<SunIcon className="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden" />
			<MoonIcon className="hidden h-6 w-6 fill-zinc-700 stroke-zinc-500 transition dark:block" />
		</button>
	);
}
