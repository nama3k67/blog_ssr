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
