import { useUser } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import type { ComponentProps, CSSProperties, FC } from "react";

import useHeader from "~/shared/hooks/useHeader";
import { cn } from "~/shared/lib/utils";
import { useI18n } from "~/shared/providers/i18n";

import { Container } from "../shared/Container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import I18nSwitcher from "./I18nSwitcher";
import UserMenu from "./menu";
import DesktopNavbar from "./navbar/desktop";
import MobileNavbar from "./navbar/mobile";
import ThemeToggle from "./ThemeToggle";

const AvatarContainer: FC<ComponentProps<"div">> = ({
	className,
	...props
}) => {
	return (
		<div
			className={cn(
				"h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 ring-zinc-900/5 shadow-zinc-800/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:ring-white/10",
				className,
			)}
			{...props}
		/>
	);
};

const LogoAvatar: FC<
	ComponentProps<typeof Avatar> & { fullName?: string | null }
> = ({ fullName, ...props }) => {
	return (
		<Avatar {...props}>
			<AvatarImage alt='Logo' src='/logo.png' />
			<AvatarFallback>{fullName}</AvatarFallback>
		</Avatar>
	);
};

const stickyPosition = "var(--header-position)" as CSSProperties["position"];
const innerFixedPosition =
	"var(--header-inner-position)" as CSSProperties["position"];

const Header: FC = () => {
	const { isHomePage, headerRef, avatarRef } = useHeader();
	const { user } = useUser();
	const { t, localizedPath } = useI18n();

	return (
		<>
			<header
				className='pointer-events-none relative z-50 flex flex-none flex-col'
				style={{
					height: "var(--header-height)",
					marginBottom: "var(--header-mb)",
				}}
			>
				{isHomePage && (
					<>
						<div
							ref={avatarRef}
							className='order-last mt-[calc(--spacing(16)-(--spacing(3)))]'
						/>
						<Container
							className='top-0 order-last -mb-3 pt-3'
							style={{ position: stickyPosition }}
						>
							<div
								className='top-(--avatar-top,--spacing(3)) w-full'
								style={{ position: innerFixedPosition }}
							>
								<div className='relative'>
									<AvatarContainer
										className='absolute top-3 left-0 origin-left transition-opacity'
										style={{
											opacity: "var(--avatar-border-opacity, 0)",
											transform: "var(--avatar-border-transform)",
										}}
									/>
									<Link to={localizedPath("/")} className='pointer-events-auto'>
										<LogoAvatar
											fullName={user?.fullName}
											className='block h-16 w-16 origin-left'
											style={{ transform: "var(--avatar-image-transform)" }}
										/>
									</Link>
								</div>
							</div>
						</Container>
					</>
				)}

				<div
					ref={headerRef}
					className='top-0 z-10 h-16 pt-6'
					style={{ position: stickyPosition }}
				>
					<Container
						className='top-(--header-top,--spacing(6)) w-full'
						style={{ position: innerFixedPosition }}
					>
						<div className='relative flex gap-4 items-center'>
							<div className='flex flex-1'>
								{!isHomePage && (
									<Link to={localizedPath("/")} className='pointer-events-auto'>
										<AvatarContainer>
											<LogoAvatar fullName={user?.fullName} />
										</AvatarContainer>
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
									<Link
										className='pointer-events-auto text-zinc-800 dark:text-zinc-100 font-medium'
										to={localizedPath("/login")}
									>
										<Button variant='outline' className='rounded-full'>
											{t.userMenu.login}
										</Button>
									</Link>
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
