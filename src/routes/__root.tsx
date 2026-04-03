/// <reference types="vite/client" />

import { ClerkProvider } from "@clerk/tanstack-react-start";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";

import { Footer } from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import { Toaster } from "~/components/ui/sonner";
import { I18nProvider } from "~/shared/providers/i18n";
import { TanstackQueryProvider } from "~/shared/providers/tanstackQuery";
import { ThemeProvider } from "~/shared/providers/theme";
import { getValidLanguage } from "~/shared/utils/i18n";

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
		links: [
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
	const location = useLocation();
	const pathname = location.pathname;

	const langFromPath = pathname.split("/")[1];
	const currentLanguage = getValidLanguage(langFromPath);

	return (
		<I18nProvider language={currentLanguage}>
			<html lang={currentLanguage}>
				<head>
					<HeadContent />
				</head>
				<body className='bg-zinc-50 dark:bg-black' suppressHydrationWarning>
					<ClerkProvider>
						<TanstackQueryProvider>
							<ThemeProvider defaultTheme='system' storageKey='my-app-theme'>
								<div className='flex min-h-screen w-full'>
									<div className='relative flex min-h-screen w-full flex-col'>
										{/* Spotlight background column */}
										<div className='fixed inset-0 flex justify-center sm:px-4'>
											<div className='flex w-full max-w-7xl lg:px-8'>
												<div className='w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20' />
											</div>
										</div>
										<div className='relative flex min-h-screen w-full flex-col'>
											<Header />
											<main className='flex-auto'>{children}</main>
											<Footer />
										</div>
									</div>
								</div>
								<Toaster richColors closeButton />
							</ThemeProvider>
						</TanstackQueryProvider>
					</ClerkProvider>

					<TanStackRouterDevtools position='bottom-right' />
					<Scripts />
				</body>
			</html>
		</I18nProvider>
	);
}
