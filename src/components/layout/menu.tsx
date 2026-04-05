import { SignOutButton, useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useI18n } from "~/shared/providers/i18n";
import { isAdminOptions } from "~/shared/tanstackQueries/admin";
import { capitalizeFirstLetter } from "~/shared/utils/string";

export default function UserMenu() {
	const { t, localizedPath } = useI18n();
	const { user } = useUser();
	const { data: adminData } = useQuery({
		...isAdminOptions(),
		enabled: !!user, // skip query until Clerk confirms user is signed in
	});

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				asChild
				className='pointer-events-auto rounded-full shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20'
			>
				<Button variant='ghost' className='border-none'>
					<div>{capitalizeFirstLetter(user?.firstName)}</div>
					<ChevronDown />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className='pointer-events-auto' align='end'>
				<DropdownMenuItem>{t.userMenu.userInfo}</DropdownMenuItem>
				{adminData?.isAdmin === true && (
					<>
						<DropdownMenuItem asChild>
							<Link to={localizedPath("/new")}>{t.userMenu.blogCreate}</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to={localizedPath("/admin/queue")}>
								{t.userMenu.dashboard}
							</Link>
						</DropdownMenuItem>
					</>
				)}
				<SignOutButton redirectUrl={localizedPath("/")}>
					<DropdownMenuItem>{t.userMenu.logout}</DropdownMenuItem>
				</SignOutButton>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
