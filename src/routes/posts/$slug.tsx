import { createFileRoute } from "@tanstack/react-router";
import { Markdown } from "~/components/Markdown";
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
	component: RouteComponent,
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<article className="max-w-3xl mx-auto p-8">
			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">
					{post.frontMatter?.title || "Untitled"}
				</h1>
				{post.frontMatter?.date && (
					<time className="text-gray-500">
						{new Date(post.frontMatter.date as string).toLocaleDateString(
							"en-US",
							{
								year: "numeric",
								month: "long",
								day: "numeric",
							},
						)}
					</time>
				)}
				{post.frontMatter?.author && (
					<p className="text-gray-600 mt-2">By {post.frontMatter.author}</p>
				)}
			</header>

			<Markdown content={post.content} className="prose prose-lg max-w-none" />
		</article>
	);
}
