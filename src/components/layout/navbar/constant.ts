import type { Dictionary } from "~/locales";

type NavbarKey = keyof Dictionary["navbar"];

export const NAVBAR_ITEMS: { key: NavbarKey; baseHref: string }[] = [
	{ key: "home", baseHref: "/" },
	{ key: "projects", baseHref: "/projects" },
	{ key: "blogs", baseHref: "/posts" },
	{ key: "about", baseHref: "/about" },
];
