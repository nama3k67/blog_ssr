import type { ComponentPropsWithoutRef } from "react";

import { Button } from "~/components/ui/button";
import { useI18n } from "~/shared/providers/i18n";

function MailIcon(props: ComponentPropsWithoutRef<"svg">) {
	return (
		<svg
			viewBox='0 0 24 24'
			fill='none'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
			{...props}
		>
			<path
				d='M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z'
				className='fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500'
			/>
			<path
				d='m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6'
				className='stroke-zinc-400 dark:stroke-zinc-500'
			/>
		</svg>
	);
}

// ponytail: UI-only — submit is inert. Wire a real subscription handler later.
export function Newsletter() {
	const { t } = useI18n();

	return (
		<form
			onSubmit={(e) => e.preventDefault()}
			className='rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40'
		>
			<h2 className='flex text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
				<MailIcon className='h-6 w-6 flex-none' />
				<span className='ml-3'>{t.pages.home.newsletterHeading}</span>
			</h2>
			<p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
				{t.pages.home.newsletterBody}
			</p>
			<div className='mt-6 flex items-center'>
				<span className='flex min-w-0 flex-auto p-px'>
					<input
						type='email'
						placeholder={t.pages.home.newsletterPlaceholder}
						aria-label={t.pages.home.newsletterPlaceholder}
						required
						className='w-full appearance-none rounded-[calc(var(--radius-md)-1px)] bg-white px-3 py-[calc(--spacing(2)-1px)] shadow-md shadow-zinc-800/5 outline outline-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 focus:ring-teal-500/10 focus:outline-teal-500 sm:text-sm dark:bg-zinc-700/15 dark:text-zinc-200 dark:outline-zinc-700 dark:placeholder:text-zinc-500 dark:focus:ring-teal-400/10 dark:focus:outline-teal-400'
					/>
				</span>
				<Button type='submit' className='ml-4 flex-none'>
					{t.pages.home.newsletterCta}
				</Button>
			</div>
		</form>
	);
}
