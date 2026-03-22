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
			<header className="max-w-2xl">
				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					{title}
				</h1>
				<p className="mt-6 text-base text-muted-foreground">
					{intro}
				</p>
			</header>
			{children && <div className="mt-16 sm:mt-20">{children}</div>}
		</Container>
	);
};
