import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "~/shared/lib/utils";

type Props<T extends ElementType> = Omit<
	ComponentPropsWithoutRef<T>,
	"as" | "decorate"
> & {
	as?: T;
	decorate?: boolean;
	className?: string;
};

export const CardEyebrow = <T extends ElementType = "p">({
	as,
	decorate = false,
	className,
	children,
	...props
}: Props<T>) => {
	const Component = as ?? "p";

	return (
		<Component
			className={cn(
				className,
				"relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500",
				decorate && "pl-3.5",
			)}
			{...props}
		>
			{decorate && (
				<span
					className="absolute inset-y-0 left-0 flex items-center"
					aria-hidden="true"
				>
					<span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
				</span>
			)}
			{children}
		</Component>
	);
};
