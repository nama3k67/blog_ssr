import { type ReactNode, useEffect, useState } from "react";

type ClientOnlyProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

/**
 * Renders children only on the client side.
 * Useful for components that depend on browser APIs (e.g., markdown editors).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return mounted ? children : fallback;
}
