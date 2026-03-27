import { Github } from "lucide-react";
import type { Language } from "~/shared/constants/i18n";
import type { Project } from "~/shared/data/projects";

interface Props {
	project: Project;
	language: Language;
	githubLabel: string;
}

export const ProjectCard = ({ project, language, githubLabel }: Props) => {
	return (
		<li className='group relative flex flex-col items-start'>
			<span className='absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl' />

			{project.thumbnailUrl ? (
				<img
					loading='lazy'
					src={project.thumbnailUrl}
					alt=''
					width={800}
					height={450}
					className='relative z-10 w-full rounded-2xl object-cover aspect-video'
				/>
			) : (
				<div className='relative z-10 w-full rounded-2xl aspect-video bg-zinc-100 dark:bg-zinc-800' />
			)}

			<h2 className='relative z-10 mt-4 text-base font-semibold tracking-tight text-foreground'>
				{project.title[language]}
			</h2>

			<p className='relative z-10 mt-2 text-sm text-muted-foreground line-clamp-3'>
				{project.description[language]}
			</p>

			{project.tags.length > 0 && (
				<div className='relative z-10 mt-3 flex flex-wrap gap-2'>
					{project.tags.map((tag) => (
						<span
							key={tag}
							className='inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
						>
							{tag}
						</span>
					))}
				</div>
			)}

			{project.githubUrl && (
				<a
					href={project.githubUrl}
					target='_blank'
					rel='noopener noreferrer'
					aria-label={`${githubLabel} — ${project.title[language]}`}
					className='relative z-10 mt-4 flex items-center gap-1 text-sm font-medium text-teal-500 transition hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
				>
					<Github className='h-4 w-4' aria-hidden='true' />
					{githubLabel}
				</a>
			)}
		</li>
	);
};
