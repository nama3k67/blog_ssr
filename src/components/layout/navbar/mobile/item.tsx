import { Link, useNavigate } from "@tanstack/react-router";
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
			<Link to={href} onClick={handleClick} className="block px-2 py-3">
				{children}
			</Link>
		</li>
	);
}
