import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import type { FileRoutesByTo } from "~/routeTree.gen";

interface IProps {
	href: keyof FileRoutesByTo;
	children: React.ReactNode;
}

export default function NavItem({ href, children }: IProps) {
	const isActive =
		useLocation({
			select: (location) => location.pathname,
		}) === href;

	return (
		<li>
			<Link
				to={href}
				className={clsx(
					"relative block px-3 py-2 transition",
					isActive
						? "text-teal-500 dark:text-teal-400"
						: "hover:text-teal-500 dark:hover:text-teal-400",
				)}
			>
				{children}
				{isActive && (
					<span className="absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0" />
				)}
			</Link>
		</li>
	);
}
