import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

const ThemeProviderContext = createContext<
	| {
			theme: Theme;
			setTheme: (theme: Theme) => void;
			resolvedTheme: ResolvedTheme;
	  }
	| undefined
>(undefined);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "theme",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		// During SSR → default (will be overridden on client)
		if (typeof window === "undefined") return defaultTheme;

		try {
			return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
		} catch {
			return defaultTheme;
		}
	});

	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

	useEffect(() => {
		const root = window.document.documentElement;

		// Persist theme choice to localStorage
		try {
			localStorage.setItem(storageKey, theme);
		} catch {
			// Ignore storage errors (private browsing, quota exceeded, etc.)
		}

		// Remove old classes first
		root.classList.remove("light", "dark");

		let finalTheme: ResolvedTheme;

		if (theme === "system") {
			finalTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		} else {
			finalTheme = theme;
		}

		root.classList.add(finalTheme);
		setResolvedTheme(finalTheme);

		// Listen for system changes when in "system" mode
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				const newTheme = mediaQuery.matches ? "dark" : "light";
				root.classList.remove("light", "dark");
				root.classList.add(newTheme);
				setResolvedTheme(newTheme);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, storageKey]);

	const value = { theme, setTheme, resolvedTheme };

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeProviderContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
