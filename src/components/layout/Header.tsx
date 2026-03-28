import { useUser } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

import useHeader from "~/shared/hooks/useHeader";
import { useI18n } from "~/shared/providers/i18n";
import { Container } from "../shared/Container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import I18nSwitcher from "./I18nSwitcher";
import UserMenu from "./menu";
import DesktopNavbar from "./navbar/desktop";
import MobileNavbar from "./navbar/mobile";
import ThemeToggle from "./ThemeToggle";

const Header: FC = () => {
	const { isHomePage, headerRef } = useHeader();
	const { user } = useUser();
	const { t, localizedPath } = useI18n();

	return (
		<>
			<header
				className='relative z-50 flex flex-none flex-col'
				style={{
					height: "var(--header-height)",
					marginBottom: "var(--header-mb)",
				}}
			>
				<div
					ref={headerRef}
					className='top-0 z-10 h-16 pt-6'
					style={{
						position: "var(--header-position)" as CSSProperties["position"],
					}}
				>
					<Container
						className='top-(--header-top,--spacing(6)) w-full'
						style={{
							position:
								"var(--header-inner-position)" as CSSProperties["position"],
						}}
					>
						<div className='relative flex gap-4 items-center'>
							<div className='flex flex-1'>
								{!isHomePage && (
									<Link to={localizedPath("/")} className='pointer-events-auto'>
										<Avatar>
											<AvatarImage alt='Logo' src='/logo.png' />
											<AvatarFallback>{user?.fullName}</AvatarFallback>
										</Avatar>
									</Link>
								)}
							</div>

							<div className='flex justify-end md:justify-center mx-auto'>
								<MobileNavbar className='pointer-events-auto md:hidden' />
								<DesktopNavbar className='pointer-events-auto hidden md:block' />
							</div>

							<div className='flex justify-end items-center gap-1 md:flex-1'>
								<div className='pointer-events-auto hidden md:block'>
									<ThemeToggle />
								</div>
								<div className='pointer-events-auto'>
									<I18nSwitcher />
								</div>

								{user ? (
									<UserMenu />
								) : (
									<Button variant='outline' className='rounded-full'>
										<Link
											className='pointer-events-auto text-zinc-800 dark:text-zinc-100 font-medium'
											to={localizedPath("/login")}
										>
											{t.userMenu.login}
										</Link>
									</Button>
								)}
							</div>
						</div>
					</Container>
				</div>
			</header>

			{isHomePage && (
				<div
					className='flex-none'
					style={{ height: "var(--content-offset)" }}
				/>
			)}
		</>
	);
};

export default Header;
