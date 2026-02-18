import clsx from "clsx";
import type { ComponentPropsWithoutRef, FC, ReactNode, Ref } from "react";

interface IProps extends ComponentPropsWithoutRef<"div"> {
	children: ReactNode;
	ref?: Ref<HTMLDivElement>;
}

export const ContainerOuter: FC<IProps> = ({
	className,
	children,
	ref,
	...props
}) => {
	return (
		<div ref={ref} className={clsx("sm:px-8", className)} {...props}>
			<div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
		</div>
	);
};

export const ContainerInner: FC<IProps> = ({
	className,
	children,
	ref,
	...props
}) => {
	return (
		<div
			ref={ref}
			className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
			{...props}
		>
			<div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
		</div>
	);
};

interface IContainerProps
	extends ComponentPropsWithoutRef<typeof ContainerOuter> {
	children: ReactNode;
	ref?: Ref<HTMLDivElement>;
}

export const Container: FC<IContainerProps> = ({ children, ref, ...props }) => {
	return (
		<ContainerOuter ref={ref} {...props}>
			<ContainerInner>{children}</ContainerInner>
		</ContainerOuter>
	);
};
