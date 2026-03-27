import { createFileRoute, Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Container } from "~/components/shared/Container";
import { dictionaries } from "~/locales";
import { GITHUB_URL } from "~/shared/data/author";
import { useI18n } from "~/shared/providers/i18n";

export const Route = createFileRoute("/$lang/")({
	head: ({ params }) => {
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{
					title: t.pages.home.title,
				},
				{
					name: "description",
					content: t.pages.home.description,
				},
			],
		};
	},
	component: Home,
});

function Home() {
	const { t, localizedPath } = useI18n();
	return (
		<Container className='mt-16 sm:mt-32'>
			<div className='max-w-2xl'>
				<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
					{t.pages.home.heading}
				</h1>
				<p className='mt-2 text-lg font-medium text-foreground'>
					{t.pages.home.role}
				</p>
				<p className='mt-6 text-base text-muted-foreground'>
					{t.pages.home.bio}
				</p>

				<div className='mt-6 flex items-center gap-4'>
					<a
						href={GITHUB_URL}
						target='_blank'
						rel='noopener noreferrer'
						className='group -m-1 flex items-center gap-2 p-1 text-sm text-zinc-600 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
					>
						<Github
							className='h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300'
							aria-hidden='true'
						/>
						{t.pages.home.github}
					</a>
				</div>

				<div className='mt-8 flex flex-wrap gap-3'>
					<Link
						to={localizedPath("/projects")}
						className='inline-flex items-center justify-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
					>
						{t.pages.home.ctaProjects}
					</Link>
					<Link
						to={localizedPath("/posts")}
						className='inline-flex items-center justify-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
					>
						{t.pages.home.ctaBlogs}
					</Link>
					<Link
						to={localizedPath("/about")}
						className='inline-flex items-center justify-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
					>
						{t.pages.home.ctaAbout}
					</Link>
				</div>
			</div>
		</Container>
	);
}
