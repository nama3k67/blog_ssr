import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Container } from "~/components/shared/Container";
import { dictionaries } from "~/locales";
import {
	AUTHOR_JOB_TITLE,
	AUTHOR_NAME,
	AVATAR_URL,
	CONTACT_EMAIL,
	SKILLS,
	SOCIAL_LINKS,
} from "~/shared/data/author";
import { SITE_URL } from "~/shared/data/site";
import { useI18n } from "~/shared/providers/i18n";
import { trackCtaClickFn } from "~/shared/services/analytics";

export const Route = createFileRoute("/$lang/about")({
	head: ({ params }) => {
		const lang = params.lang as "en" | "vi";
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{ title: t.pages.about.title },
				{ name: "description", content: t.pages.about.description },
				{ property: "og:title", content: t.pages.about.title },
				{ property: "og:description", content: t.pages.about.description },
				{ property: "og:image", content: `${SITE_URL}/logo.png` },
				{ property: "og:url", content: `${SITE_URL}/${lang}/about` },
			],
			links: [
				{ rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/about` },
				{ rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/about` },
				{
					rel: "alternate",
					hreflang: "x-default",
					href: `${SITE_URL}/en/about`,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { t, language } = useI18n();

	const personJsonLd = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: AUTHOR_NAME,
		jobTitle: AUTHOR_JOB_TITLE,
		url: `${SITE_URL}/en/about`,
		sameAs: SOCIAL_LINKS.map((link) => link.href),
	};

	return (
		<Container className='mt-16 sm:mt-32'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
			/>
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
							<p className='text-sm font-semibold text-foreground'>
								{t.pages.about.skills}
							</p>
							<div className='mt-4 flex flex-col gap-4'>
								{SKILLS.map((group) => (
									<div key={group.category.en}>
										<h2 className='text-xs font-medium text-muted-foreground'>
											{group.category[language]}
										</h2>
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
								onClick={() => {
									// Fire-and-forget — don't await, don't block navigation
									trackCtaClickFn({ data: undefined }).catch(() => {});
								}}
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
				<div className='lg:order-none lg:pl-20'>
					<div className='max-w-xs px-2.5 lg:max-w-none'>
						{AVATAR_URL ? (
							<img
								src={AVATAR_URL}
								alt={t.pages.about.heading}
								width={320}
								height={320}
								loading='eager'
								className='aspect-square rounded-2xl object-cover'
							/>
						) : (
							<div className='aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800' />
						)}
					</div>
				</div>
			</div>
		</Container>
	);
}
