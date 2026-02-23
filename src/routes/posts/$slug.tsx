import { createFileRoute } from "@tanstack/react-router";

import { Markdown } from "~/components/shared/Markdown";
import { fetchPost } from "~/shared/services/post";

export const Route = createFileRoute("/posts/$slug")({
	loader: async ({ params }) => {
		return fetchPost({
			data: {
				repo: "Dicklesworthstone/yto_blog_posts",
				branch: "main",
				path: `${params.slug}.md`,
			},
		});
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.frontMatter?.title || "Blog Post"} - My Blog`,
			},
			{
				name: "description",
				content:
					loaderData?.frontMatter?.description ||
					"Read this article on my blog.",
			},
			{
				property: "og:title",
				content: loaderData?.frontMatter?.title || "Blog Post",
			},
			{
				property: "og:description",
				content: loaderData?.frontMatter?.description || "Read this article.",
			},
			{
				property: "og:type",
				content: "article",
			},
			{
				name: "article:published_time",
				content: loaderData?.frontMatter?.date || new Date().toISOString(),
			},
			{
				name: "twitter:title",
				content: loaderData?.frontMatter?.title || "Blog Post",
			},
			{
				name: "twitter:description",
				content: loaderData?.frontMatter?.description || "Read this article.",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<article className="max-w-4xl mx-auto p-8">
			{/* <MainLayout
				title={post.frontMatter?.title || "Untitled"}
				intro={post.frontMatter?.description || ""}
			> */}
			<Markdown content={post.content} />
			{/* </MainLayout> */}
		</article>
	);
}
