import type { FC, ReactNode } from "react";

interface IProps {
	children: ReactNode;
}

export const CardDescription: FC<IProps> = ({ children }) => {
	return (
		<p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
			{children}
		</p>
	);
};
