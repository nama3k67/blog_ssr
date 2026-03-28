import { Link, type LinkProps } from "@tanstack/react-router";

type Props = LinkProps;

export const CardLink = ({ children, ...props }: Props) => {
	return (
		<>
			<div className='absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50' />
			<Link {...props}>
				{(linkState) => (
					<>
						<span className='absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl' />
						<span className='relative z-10'>
							{typeof children === "function" ? children(linkState) : children}
						</span>
					</>
				)}
			</Link>
		</>
	);
};
