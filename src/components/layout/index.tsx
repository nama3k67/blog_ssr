import type { ReactNode } from "react";

import { Container } from "../shared/Container";

type Props = {
	title: string;
	intro: string;
	children?: ReactNode;
};

export const MainLayout = ({ title, intro, children }: Props) => {
	return (
		<Container className="mt-16 sm:mt-32">
			<div className="fixed inset-0 flex justify-center sm:px-8 -z-10">
				<div className="flex w-full max-w-7xl lg:px-8">
					<div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
				</div>
			</div>

			<header className="max-w-2xl">
				<h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
					{title}
				</h1>
				<p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
					{intro}
				</p>
			</header>
			{children && <div className="mt-16 sm:mt-20">{children}</div>}
		</Container>
	);
};
