import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";

import { Button } from "~/components/ui/button";
import { CV_URL } from "~/shared/data/author";
import { RESUME, type Role } from "~/shared/data/resume";
import { useI18n } from "~/shared/providers/i18n";

function BriefcaseIcon(props: ComponentPropsWithoutRef<"svg">) {
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
				d='M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z'
				className='fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500'
			/>
			<path
				d='M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5'
				className='stroke-zinc-400 dark:stroke-zinc-500'
			/>
		</svg>
	);
}

function ArrowDownIcon(props: ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox='0 0 16 16' fill='none' aria-hidden='true' {...props}>
			<path
				d='M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
}

function RoleItem({ role, lang }: { role: Role; lang: "en" | "vi" }) {
	const initials = role.company.slice(0, 2).toUpperCase();

	return (
		<li className='flex gap-4'>
			<div className='relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-white dark:ring-0'>
				{role.logo ? (
					<img src={role.logo} alt={role.company} className='h-7 w-7' />
				) : (
					<span className='text-xs font-semibold text-zinc-500 dark:text-zinc-400'>
						{initials}
					</span>
				)}
			</div>
			<dl className='flex flex-auto flex-wrap gap-x-2'>
				<dt className='sr-only'>Company</dt>
				<dd className='w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100'>
					<Link
						to={role.url}
						target='_blank'
						rel='noopener noreferrer'
						className='hover:underline'
					>
						{role.company}
					</Link>
				</dd>
				<dt className='sr-only'>Role</dt>
				<dd className='text-xs text-zinc-500 dark:text-zinc-400'>
					{role.title[lang]}
				</dd>
				<dt className='sr-only'>Date</dt>
				<dd className='ml-auto text-xs text-zinc-400 dark:text-zinc-500'>
					<time dateTime={role.start}>{role.start}</time>{" "}
					<span aria-hidden='true'>—</span>{" "}
					<time dateTime={role.end}>{role.end}</time>
				</dd>
			</dl>
		</li>
	);
}

export function Resume() {
	const { t, language } = useI18n();

	return (
		<div className='rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40'>
			<h2 className='flex text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
				<BriefcaseIcon className='h-6 w-6 flex-none' />
				<span className='ml-3'>{t.pages.home.workHeading}</span>
			</h2>
			<ol className='mt-6 space-y-4'>
				{RESUME.map((role) => (
					<RoleItem key={role.company} role={role} lang={language} />
				))}
			</ol>
			<Button asChild variant='secondary' className='group mt-6 w-full'>
				<a href={CV_URL} download>
					{t.pages.home.downloadCv}
					<ArrowDownIcon className='h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50' />
				</a>
			</Button>
		</div>
	);
}
