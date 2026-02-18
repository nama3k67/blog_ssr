import type { FileRoutesByTo } from "~/routeTree.gen";

type NavbarItem = {
	name: string;
	href: keyof FileRoutesByTo;
};

export const NAVBAR_ITEMS: NavbarItem[] = [
	{
		name: "Home",
		href: "/",
	},
	{
		name: "Projects",
		href: "/projects",
	},
	{
		name: "Blogs",
		href: "/posts",
	},
	{
		name: "About",
		href: "/about",
	},
];
