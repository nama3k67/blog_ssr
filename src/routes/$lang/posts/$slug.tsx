import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "~/components/shared/Container";
import { Markdown } from "~/components/shared/Markdown";
import { Badge } from "~/components/ui/badge";
import { AUTHOR_NAME } from "~/shared/data/author";
import { SITE_URL } from "~/shared/data/site";
import { useI18n } from "~/shared/providers/i18n";
import { fetchPost } from "~/shared/services/post";
import { formatDate } from "~/shared/utils/date";

export const Route = createFileRoute("/$lang/posts/$slug")({
	loader: async ({ params }) => {
		return fetchPost({
			data: {
				slug: params.slug,
				lang: params.lang,
			},
		});
	},
	head: ({ loaderData, params }) => {
		const post = loaderData?.post;
		const translationSlug = loaderData?.translationSlug;
		const lang = params.lang as "en" | "vi";
		const slug = params.slug;
		const ogLocale = lang === "vi" ? "vi_VN" : "en_US";
		const canonicalUrl = `${SITE_URL}/${lang}/posts/${slug}`;
		const rawImage = post?.featuredImage || "/logo.png";
		const absoluteImage = rawImage.startsWith("http")
			? rawImage
			: `${SITE_URL}${rawImage}`;

		const hreflangLinks: Array<{
			rel: string;
			hreflang: string;
			href: string;
		}> = [];
		if (translationSlug) {
			const enSlug = lang === "en" ? slug : translationSlug;
			const viSlug = lang === "vi" ? slug : translationSlug;
			hreflangLinks.push(
				{
					rel: "alternate",
					hreflang: "en",
					href: `${SITE_URL}/en/posts/${enSlug}`,
				},
				{
					rel: "alternate",
					hreflang: "vi",
					href: `${SITE_URL}/vi/posts/${viSlug}`,
				},
				{
					rel: "alternate",
					hreflang: "x-default",
					href: `${SITE_URL}/en/posts/${enSlug}`,
				},
			);
		} else {
			hreflangLinks.push({
				rel: "alternate",
				hreflang: lang,
				href: canonicalUrl,
			});
		}

		return {
			meta: [
				{ title: `${post?.title || "Blog Post"} - My Blog` },
				{
					name: "description",
					content: post?.description || "Read this article on my blog.",
				},
				{ property: "og:title", content: post?.title || "Blog Post" },
				{
					property: "og:description",
					content: post?.description || "Read this article.",
				},
				{ property: "og:type", content: "article" },
				{ property: "og:image", content: absoluteImage },
				{ property: "og:url", content: canonicalUrl },
				{ property: "og:locale", content: ogLocale },
				{
					name: "article:published_time",
					content: post?.publishedAt || new Date().toISOString(),
				},
				{ name: "twitter:title", content: post?.title || "Blog Post" },
				{
					name: "twitter:description",
					content: post?.description || "Read this article.",
				},
				{ name: "twitter:image", content: absoluteImage },
			],
			links: [{ rel: "canonical", href: canonicalUrl }, ...hreflangLinks],
		};
	},
	errorComponent: PostError,
	component: RouteComponent,
});

function PostError() {
	const { lang } = Route.useParams();
	const { t } = useI18n();
	return (
		<Container className='mt-16 sm:mt-32'>
			<div className='mx-auto max-w-2xl text-center'>
				<h1 className='text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100'>
					{t.pages.posts.notFound}
				</h1>
				<p className='mt-4 text-base text-zinc-600 dark:text-zinc-400'>
					{t.pages.posts.notFoundMessage}
				</p>
				<Link
					to='/$lang/posts'
					params={{ lang }}
					search={{ page: 1 }}
					className='mt-8 inline-flex items-center text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
				>
					← {t.pages.posts.heading}
				</Link>
			</div>
		</Container>
	);
}

function RouteComponent() {
	const { post, isFallback, originalLang, translationSlug } =
		Route.useLoaderData();
	const { lang } = Route.useParams();
	const { t } = useI18n();

	const articleJsonLd = post
		? {
				"@context": "https://schema.org",
				"@type": "Article",
				headline: post.title,
				description: post.description || undefined,
				datePublished: post.publishedAt,
				dateModified: post.publishedAt,
				image: post.featuredImage
					? post.featuredImage.startsWith("http")
						? post.featuredImage
						: `${SITE_URL}${post.featuredImage}`
					: `${SITE_URL}/logo.png`,
				inLanguage: lang,
				author: {
					"@type": "Person",
					name: AUTHOR_NAME,
					url: `${SITE_URL}/en/about`,
				},
				publisher: {
					"@type": "Person",
					name: AUTHOR_NAME,
					url: `${SITE_URL}/en/about`,
				},
			}
		: null;

	return (
		<Container className='mt-16 sm:mt-32'>
			{articleJsonLd && (
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
				/>
			)}
			<div className='xl:relative'>
				<div className='mx-auto max-w-2xl'>
					{/* Fallback language banner */}
					{isFallback && (
						<div className='mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400'>
							{`${t.pages.posts.fallbackOnly} ${lang === "en" ? t.pages.posts.langVi : t.pages.posts.langEn}.`}
							{translationSlug && (
								<Link
									to='/$lang/posts/$slug'
									params={{ lang: originalLang, slug: translationSlug }}
									className='ml-2 underline'
								>
									{t.pages.posts.viewOriginal}
								</Link>
							)}
						</div>
					)}

					{/* Translation toggle */}
					{!isFallback && translationSlug && (
						<div className='mb-6 flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700/40 dark:bg-zinc-800/50'>
							<span className='text-sm text-zinc-600 dark:text-zinc-400'>
								{t.pages.posts.translationAvailable}
							</span>
							<Link
								to='/$lang/posts/$slug'
								params={{
									lang: lang === "en" ? "vi" : "en",
									slug: translationSlug,
								}}
								className='text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
							>
								{lang === "en" ? t.pages.posts.langVi : t.pages.posts.langEn}
							</Link>
						</div>
					)}

					<article>
						<header className='flex flex-col'>
							<h1 className='mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100'>
								{post.title}
							</h1>
							<time
								dateTime={post.publishedAt}
								className='order-first flex items-center text-base text-zinc-400 dark:text-zinc-500'
							>
								<span className='h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500' />
								<span className='ml-3'>{formatDate(post.publishedAt)}</span>
							</time>

							{/* Author info */}
							{post.author && (
								<div className='mt-4 flex items-center gap-3'>
									{post.author.imageUrl && (
										<img
											src={post.author.imageUrl}
											alt={[post.author.firstName, post.author.lastName]
												.filter(Boolean)
												.join(" ")}
											loading='eager'
											className='h-8 w-8 rounded-full object-cover'
										/>
									)}
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										{t.pages.posts.by}{" "}
										{[post.author.firstName, post.author.lastName]
											.filter(Boolean)
											.join(" ")}
									</span>
								</div>
							)}

							{post.description && (
								<p className='mt-4 text-base text-zinc-600 dark:text-zinc-400'>
									{post.description}
								</p>
							)}

							{/* Category and tags */}
							{(post.category || post.tags.length > 0) && (
								<div className='mt-4 flex flex-wrap gap-2'>
									{post.category && <Badge>{post.category.name}</Badge>}
									{post.tags.map((tag) => (
										<Badge key={tag.id} variant='outline'>
											#{tag.name}
										</Badge>
									))}
								</div>
							)}
						</header>

						{/* Featured image */}
						{post.featuredImage && (
							<img
								src={post.featuredImage}
								alt={post.title || "Post featured image"}
								loading='lazy'
								className='mt-8 w-full rounded-2xl object-cover'
							/>
						)}

						<div className='mt-8'>
							<Markdown content={post.content} />
						</div>
					</article>
				</div>
			</div>
		</Container>
	);
}
