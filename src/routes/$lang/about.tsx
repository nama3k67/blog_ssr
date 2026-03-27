import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Container } from "~/components/shared/Container";
import { dictionaries } from "~/locales";
import {
	AVATAR_URL,
	CONTACT_EMAIL,
	SKILLS,
	SOCIAL_LINKS,
} from "~/shared/data/author";
import { useI18n } from "~/shared/providers/i18n";

export const Route = createFileRoute("/$lang/about")({
	head: ({ params }) => {
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{
					title: t.pages.about.title,
				},
				{
					name: "description",
					content: t.pages.about.description,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { t, language } = useI18n();
	return (
		<Container className='mt-16 sm:mt-32'>
			<div className='grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12'>
				{/* Left column — bio, skills, CTA */}
				<div className='lg:order-first lg:row-span-2'>
					<article>
						<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
							{t.pages.about.heading}
						</h1>

						<div className='mt-6 flex flex-col gap-7 text-base text-muted-foreground'>
							<p>{t.pages.about.bio1}</p>
							<p>{t.pages.about.bio2}</p>
						</div>

						<section className='mt-8'>
							<h2 className='text-sm font-semibold text-foreground'>
								{t.pages.about.skills}
							</h2>
							<div className='mt-4 flex flex-col gap-4'>
								{SKILLS.map((group) => (
									<div key={group.category.en}>
										<h3 className='text-xs font-medium text-muted-foreground'>
											{group.category[language]}
										</h3>
										<div className='mt-2 flex flex-wrap gap-2'>
											{group.skills.map((skill) => (
												<span
													key={skill}
													className='inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
												>
													{skill}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</section>

						<div className='mt-8 flex flex-wrap items-center gap-4'>
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								aria-label={t.pages.about.ctaAriaLabel}
								className='inline-flex items-center justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:focus-visible:outline-teal-400'
							>
								{t.pages.about.cta}
							</a>

							<div className='flex items-center gap-3'>
								{SOCIAL_LINKS.map((link) => (
									<a
										key={link.label}
										href={link.href}
										target='_blank'
										rel='noopener noreferrer'
										aria-label={link.label}
										className='group -m-1 p-1'
									>
										{link.icon === "github" && (
											<Github
												className='h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300'
												aria-hidden='true'
											/>
										)}
									</a>
								))}
							</div>
						</div>
					</article>
				</div>

				{/* Right column — avatar */}
				<div className='lg:pl-20'>
					<div className='max-w-xs px-2.5 lg:max-w-none'>
						<img
							src={AVATAR_URL}
							alt=''
							loading='eager'
							className='aspect-square rounded-2xl object-cover bg-zinc-100 dark:bg-zinc-800'
						/>
					</div>
				</div>
			</div>
		</Container>
	);
}
