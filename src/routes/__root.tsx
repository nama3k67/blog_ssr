/// <reference types="vite/client" />

import { ClerkProvider } from "@clerk/tanstack-react-start";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { Footer } from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import { ThemeProvider } from "~/shared/providers/theme";

import "~/styles.css";

export const Route = createRootRoute({
	component: RootComponent,
	head: () => ({
		meta: [
			{ charSet: "UTF-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
			{
				name: "description",
				content:
					"A passionate long-distance runner sharing knowledge about nutrition, training methods, and technology.",
			},
			{ name: "theme-color", content: "#000000" },
			{ name: "robots", content: "index, follow" },
			{ name: "author", content: "Nam Tran" },
			{ property: "og:type", content: "website" },
			{
				property: "og:title",
				content: "Blog - Nutrition, Training & Technology",
			},
			{
				property: "og:description",
				content:
					"A passionate long-distance runner sharing knowledge about nutrition, training methods, and technology.",
			},
			{ property: "og:image", content: "/logo.png" },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:locale", content: "en_US" },
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: "Blog - Nutrition, Training & Technology",
			},
			{
				name: "twitter:description",
				content: "Knowledge about nutrition, training, and technology.",
			},
			{ name: "twitter:image", content: "/logo.png" },
		],
		link: [
			{ rel: "icon", type: "image/png", href: "/logo.png" },
			{ rel: "apple-touch-icon", href: "/logo.png" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{ rel: "dns-prefetch", href: "https://api.github.com" },
		],
	}),
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body
				className="relative flex flex-col min-h-screen bg-zinc-50 dark:bg-black"
				suppressHydrationWarning
			>
				<ClerkProvider>
					<ThemeProvider defaultTheme="system" storageKey="my-app-theme">
						<Header />
						<main className="flex-auto">{children}</main>
						<Footer />
					</ThemeProvider>
				</ClerkProvider>

				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
