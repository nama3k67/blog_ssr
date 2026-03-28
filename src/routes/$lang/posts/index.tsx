import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { MainLayout } from "~/components/layout";
import { PostItem } from "~/components/post/item";
import { Button } from "~/components/ui/button";
import { dictionaries } from "~/locales";
import { useI18n } from "~/shared/providers/i18n";

import { fetchPostsList } from "~/shared/services/post";

const PostsSearchSchema = z.object({
	page: z.number().min(1).optional().default(1),
});

export const Route = createFileRoute("/$lang/posts/")({
	validateSearch: (search) => PostsSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: async ({ params, deps }) => {
		try {
			return await fetchPostsList({
				data: {
					lang: params.lang,
					page: deps.page,
					pageSize: 10,
				},
			});
		} catch (err) {
			console.error("Failed to fetch posts list:", err);
			return {
				posts: [],
				totalCount: 0,
				currentPage: 1,
				totalPages: 0,
			};
		}
	},
	head: ({ params }) => {
		const t = dictionaries[params.lang as keyof typeof dictionaries];
		return {
			meta: [
				{
					title: t.pages.posts.title,
				},
				{
					name: "description",
					content: t.pages.posts.description,
				},
				{
					property: "og:title",
					content: t.pages.posts.title,
				},
				{
					property: "og:description",
					content: t.pages.posts.description,
				},
				{
					name: "twitter:title",
					content: t.pages.posts.title,
				},
				{
					name: "twitter:description",
					content: t.pages.posts.description,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { posts, totalPages, currentPage } = Route.useLoaderData();
	const { lang } = Route.useParams();
	const { t } = useI18n();
	const navigate = Route.useNavigate();

	return (
		<MainLayout title={t.pages.posts.heading} intro={t.pages.posts.intro}>
			<div className='md:border-l md:border-border md:pl-6'>
				{posts.length === 0 ? (
					<p className='text-muted-foreground'>{t.pages.posts.noPostsFound}</p>
				) : (
					<>
						<div className='flex flex-col gap-16'>
							{posts.map((post) => (
								<PostItem
									key={post.slug}
									data={post}
									linkProps={{
										to: "/$lang/posts/$slug" as const,
										params: { slug: post.slug, lang },
									}}
								/>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='mt-16 flex items-center justify-center gap-4'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() =>
										navigate({ search: { page: currentPage - 1 } })
									}
									disabled={currentPage === 1}
								>
									← {t.common.previous}
								</Button>
								<span className='text-sm text-muted-foreground'>
									{t.pages.posts.pageNum} {currentPage} {t.pages.posts.pageOf}{" "}
									{totalPages}
								</span>
								<Button
									variant='ghost'
									size='sm'
									onClick={() =>
										navigate({ search: { page: currentPage + 1 } })
									}
									disabled={currentPage === totalPages}
								>
									{t.common.next} →
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</MainLayout>
	);
}
