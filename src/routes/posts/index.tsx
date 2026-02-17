import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { fetchPost, fetchPostList } from "~/shared/services/post";

type PostSummary = {
	name: string;
	path: string;
	title?: string;
	description?: string;
	date?: string;
};

const getPostsList = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const posts = await fetchPostList({
			data: {
				repo: "Dicklesworthstone/yto_blog_posts",
				branch: "main",
				path: "", // repo root
			},
		})

		// Fetch frontmatter for each post
		const postsWithMetadata = await Promise.all(
			posts.map(async (post) => {
				try {
					const { frontMatter } = await fetchPost({
						data: {
							repo: "Dicklesworthstone/yto_blog_posts",
							branch: "main",
							path: post.path,
						},
					})
					return {
						...post,
						title: (frontMatter?.title as string) || post.name,
						description: frontMatter?.description as string,
						date: frontMatter?.date as string,
					}
				} catch (err) {
					console.error(`Failed to fetch frontmatter for ${post.name}:`, err);
					return {
						...post,
						title: post.name,
					}
				}
			}),
		)

		return postsWithMetadata;
	} catch (err) {
		console.error("Failed to fetch posts list:", err);
		return [];
	}
});

export const Route = createFileRoute("/posts/")({
	loader: async () => {
		return getPostsList();
	},
	component: RouteComponent,
});

function RouteComponent() {
	const posts = Route.useLoaderData() as PostSummary[];

	return (
		<div className="max-w-2xl mx-auto p-8">
			<h1 className="text-4xl font-bold mb-8">Blog Posts</h1>

			{posts.length === 0 ? (
				<p className="text-gray-500">No posts found.</p>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<Link
							key={post.path}
							to="/posts/$slug"
							params={{ slug: post.name }}
							className="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
						>
							<h2 className="text-2xl font-semibold">{post.title}</h2>
							{post.description && (
								<p className="text-gray-600 mt-2">{post.description}</p>
							)}
							{post.date && (
								<p className="text-sm text-gray-400 mt-2">
									{new Date(post.date).toLocaleDateString()}
								</p>
							)}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
