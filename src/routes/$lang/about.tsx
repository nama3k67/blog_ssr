import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/shared/Container";
import { MailIcon, SocialLinkListItem } from "~/components/shared/SocialIcons";
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
		url: `${SITE_URL}/${language}/about`,
		sameAs: SOCIAL_LINKS.map((link) => link.href),
	};

	return (
		<Container className='mt-16 sm:mt-32'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(personJsonLd)
						.replace(/</g, "\\u003c")
						.replace(/>/g, "\\u003e")
						.replace(/&/g, "\\u0026"),
				}}
			/>
			<div className='grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12'>
				{/* Avatar */}
				<div className='lg:pl-20'>
					<div className='max-w-xs px-2.5 lg:max-w-none'>
						{AVATAR_URL ? (
							<img
								src={AVATAR_URL}
								alt={t.pages.about.heading}
								width={320}
								height={320}
								loading='eager'
								className='aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800'
							/>
						) : (
							<div className='aspect-square rotate-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800' />
						)}
					</div>
				</div>

				{/* Bio + skills */}
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
					</article>
				</div>

				{/* Social links */}
				<div className='lg:pl-20'>
					<ul className='list-none'>
						{SOCIAL_LINKS.map((link, index) => (
							<SocialLinkListItem
								key={link.label}
								{...link}
								label={`${t.pages.about.followOn} ${link.label}`}
								className={index > 0 ? "mt-4" : undefined}
							/>
						))}
						<li className='mt-8 flex border-t border-zinc-100 pt-8 dark:border-zinc-700/40'>
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								aria-label={t.pages.about.ctaAriaLabel}
								onClick={() => {
									// Fire-and-forget — don't await, don't block navigation
									trackCtaClickFn({ data: undefined }).catch(() => {});
								}}
								className='group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500'
							>
								<MailIcon className='h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500' />
								<span className='ml-4'>{CONTACT_EMAIL}</span>
							</a>
						</li>
					</ul>
				</div>
			</div>
		</Container>
	);
}
