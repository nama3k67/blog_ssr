import { Link } from "@tanstack/react-router";
import { useI18n } from "~/shared/providers/i18n";

import { getLocalizedPath } from "~/shared/utils/i18n";
import { ContainerInner, ContainerOuter } from "../shared/Container";
import { NAVBAR_ITEMS } from "./navbar/constant";

function NavLink({
	baseHref,
	children,
}: {
	baseHref: string;
	children: React.ReactNode;
}) {
	const { language } = useI18n();
	const href = getLocalizedPath(baseHref, language);

	return (
		<Link
			to={href}
			className="transition hover:text-teal-500 dark:hover:text-teal-400"
		>
			{children}
		</Link>
	);
}

export function Footer() {
	const { t } = useI18n();
	return (
		<footer className="mt-32 flex-none">
			<ContainerOuter>
				<div className="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
					<ContainerInner>
						<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
							<div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
								{NAVBAR_ITEMS.map((item) => (
									<NavLink key={item.baseHref} baseHref={item.baseHref}>
										{t.navbar[item.key]}
									</NavLink>
								))}
							</div>
							<p className="text-sm text-zinc-400 dark:text-zinc-500">
								&copy; {new Date().getFullYear()} Noah Tran. All rights
								reserved.
							</p>
						</div>
					</ContainerInner>
				</div>
			</ContainerOuter>
		</footer>
	);
}
