import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Container } from "~/components/shared/Container";
import { Badge } from "~/components/ui/badge";
import { fetchPost } from "~/shared/services/post";
import { formatDate } from "~/shared/utils/date";

const Markdown = lazy(() =>
	import("~/components/shared/Markdown").then((m) => ({
		default: m.Markdown,
	})),
);

export const Route = createFileRoute("/$lang/posts/$slug")({
	loader: async ({ params }) => {
		return fetchPost({
			data: {
				slug: params.slug,
				lang: params.lang,
			},
		});
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.post.title || "Blog Post"} - My Blog`,
			},
			{
				name: "description",
				content:
					loaderData?.post.description || "Read this article on my blog.",
			},
			{
				property: "og:title",
				content: loaderData?.post.title || "Blog Post",
			},
			{
				property: "og:description",
				content: loaderData?.post.description || "Read this article.",
			},
			{
				property: "og:type",
				content: "article",
			},
			{
				name: "article:published_time",
				content: loaderData?.post.publishedAt || new Date().toISOString(),
			},
			{
				name: "twitter:title",
				content: loaderData?.post.title || "Blog Post",
			},
			{
				name: "twitter:description",
				content: loaderData?.post.description || "Read this article.",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { post, isFallback, originalLang, translationSlug } =
		Route.useLoaderData();
	const { lang } = Route.useParams();

	return (
		<Container className='mt-16 sm:mt-32'>
			<div className='xl:relative'>
				<div className='mx-auto max-w-2xl'>
					{/* Fallback language banner */}
					{isFallback && (
						<div className='mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'>
							{lang === "en"
								? `This article is not available in English. Showing Vietnamese version.`
								: `Bài viết này không có bản tiếng Việt. Đang hiển thị bản tiếng Anh.`}
							{translationSlug && (
								<Link
									to='/$lang/posts/$slug'
									params={{ lang: originalLang, slug: translationSlug }}
									className='ml-2 underline'
								>
									{lang === "en" ? "View original" : "Xem bản gốc"}
								</Link>
							)}
						</div>
					)}

					{/* Translation toggle */}
					{!isFallback && translationSlug && (
						<div className='mb-6 flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4'>
							<span className='text-sm text-muted-foreground'>
								{lang === "en" ? "Also available in:" : "Cũng có sẵn bằng:"}
							</span>
							<Link
								to='/$lang/posts/$slug'
								params={{
									lang: lang === "en" ? "vi" : "en",
									slug: translationSlug,
								}}
								className='text-sm font-medium text-primary hover:text-primary/80'
							>
								{lang === "en" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
							</Link>
						</div>
					)}

					<article>
						<header className='flex flex-col'>
							<h1 className='mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
								{post.title}
							</h1>
							<time
								dateTime={post.publishedAt}
								className='order-first flex items-center text-base text-zinc-400 dark:text-zinc-500'
							>
								<span className='h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500' />
								<span className='ml-3'>{formatDate(post.publishedAt)}</span>
							</time>
							{post.description && (
								<p className='mt-4 text-base text-muted-foreground'>
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
						<div className='mt-8'>
							<Suspense
								fallback={
									<div className='animate-pulse space-y-4'>
										<div className='h-4 w-3/4 rounded bg-muted' />
										<div className='h-4 w-full rounded bg-muted' />
										<div className='h-4 w-5/6 rounded bg-muted' />
									</div>
								}
							>
								<Markdown content={post.content} />
							</Suspense>
						</div>
					</article>
				</div>
			</div>
		</Container>
	);
}
