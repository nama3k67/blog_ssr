import { createFileRoute } from "@tanstack/react-router";

import {
	Article,
	HomePhotos,
	Newsletter,
	Resume,
} from "~/components/public/home";
import { Container } from "~/components/shared/Container";
import { SocialLink } from "~/components/shared/SocialIcons";
import { dictionaries } from "~/locales";
import type { Language } from "~/shared/constants";
import { SOCIAL_LINKS } from "~/shared/data/author";
import { SITE_URL } from "~/shared/data/site";
import { useI18n } from "~/shared/providers/i18n";
import { fetchPostsList } from "~/shared/services/post";

export const Route = createFileRoute("/$lang/")({
	loader: async ({ params }) => {
		try {
			return await fetchPostsList({
				data: { lang: params.lang, page: 1, pageSize: 4 },
			});
		} catch (err) {
			console.error("Failed to fetch posts list:", err);
			return { posts: [], totalCount: 0, currentPage: 1, totalPages: 0 };
		}
	},
	head: ({ params }) => {
		const lang = params.lang as Language;
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{ title: t.pages.home.title },
				{ name: "description", content: t.pages.home.description },
				{ property: "og:title", content: t.pages.home.title },
				{ property: "og:description", content: t.pages.home.description },
				{ property: "og:image", content: `${SITE_URL}/logo.png` },
				{ property: "og:url", content: `${SITE_URL}/${lang}/` },
			],
			links: [
				{ rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/` },
				{ rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/` },
				{ rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/en/` },
			],
		};
	},
	component: Home,
});

function Home() {
	const { t } = useI18n();
	const { posts } = Route.useLoaderData();
	const { lang } = Route.useParams();

	return (
		<>
			<Container className='mt-9'>
				<div className='max-w-2xl'>
					<h1 className='text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100'>
						{t.pages.home.heading}
					</h1>
					<p className='mt-6 text-base text-zinc-600 dark:text-zinc-400'>
						{t.pages.home.bio}
					</p>
					<div className='mt-6 flex gap-6'>
						{SOCIAL_LINKS.map((social) => (
							<SocialLink
								key={social.icon}
								{...social}
								label={t.pages.home.followOn[social.icon]}
							/>
						))}
					</div>
				</div>
			</Container>

			<HomePhotos />

			<Container className='mt-24 md:mt-28'>
				<div className='mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2'>
					<div className='flex flex-col gap-16'>
						{posts.map((post) => (
							<Article key={post.slug} post={post} lang={lang} />
						))}
					</div>
					<div className='space-y-10 lg:pl-16 xl:pl-24'>
						<Newsletter />
						<Resume />
					</div>
				</div>
			</Container>
		</>
	);
}
