import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import { useI18n } from "~/shared/providers/i18n";
import { getLocalizedPath } from "~/shared/utils/i18n";

interface IProps {
	baseHref: string;
	children: React.ReactNode;
}

export default function NavItem({ baseHref, children }: IProps) {
	const { language } = useI18n();
	const href = getLocalizedPath(baseHref, language);
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const isActive = pathname === `/${language}${baseHref}`;

	return (
		<li>
			<Link
				to={href}
				className={clsx(
					"relative block px-3 py-2 transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400",
					isActive
						? "text-teal-500 dark:text-teal-400"
						: "hover:text-teal-500 dark:hover:text-teal-400",
				)}
			>
				{children}
				{isActive && (
					<span className='absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0' />
				)}
			</Link>
		</li>
	);
}
