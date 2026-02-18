import { Link, useNavigate } from "@tanstack/react-router";
import type { FileRoutesByTo } from "~/routeTree.gen";

interface IProps {
	href: keyof FileRoutesByTo;
	children: React.ReactNode;
	setOpen: (open: boolean) => void;
}

export default function MobileNavbarItem({ href, setOpen, children }: IProps) {
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
