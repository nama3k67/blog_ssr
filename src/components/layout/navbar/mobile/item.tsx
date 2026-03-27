import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useI18n } from "~/shared/providers/i18n";
import { getLocalizedPath } from "~/shared/utils/i18n";

interface IProps {
	baseHref: string;
	children: React.ReactNode;
	setOpen: (open: boolean) => void;
}

export default function MobileNavbarItem({
	baseHref,
	setOpen,
	children,
}: IProps) {
	const { language } = useI18n();
	const href = getLocalizedPath(baseHref, language);
	const navigate = useNavigate();
	const pathname = useLocation({ select: (location) => location.pathname });
	const isActive = pathname === `/${language}${baseHref}`;

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setOpen(false);
		// Allow the dialog animation to complete before navigating
		setTimeout(() => {
			navigate({ to: href });
		}, 100);
	};

	return (
		<li>
			<Link
				to={href}
				onClick={handleClick}
				className={clsx(
					"block px-2 py-3 transition",
					isActive
						? "text-teal-500 dark:text-teal-400"
						: "hover:text-teal-500 dark:hover:text-teal-400",
				)}
			>
				{children}
			</Link>
		</li>
	);
}
