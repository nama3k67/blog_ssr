import { ChevronRight } from "lucide-react";
import type { FC, ReactNode } from "react";

interface Props {
	children: ReactNode;
}

export const CardCta: FC<Props> = ({ children }) => {
	return (
		<div
			className='relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500'
			aria-hidden='true'
		>
			{children}
			<ChevronRight className='ml-1 h-4 w-4 stroke-current' />
		</div>
	);
};
