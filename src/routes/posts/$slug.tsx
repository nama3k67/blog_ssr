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
