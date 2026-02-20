import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { MainLayout } from "~/components/layout";
import { PostItem } from "~/components/post/item";

import { fetchPost, fetchPostList } from "~/shared/services/post";

export type PostSummary = {
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
		});

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
					});
					return {
						...post,
						title: (frontMatter?.title as string) || post.name,
						description: frontMatter?.description as string,
						date: frontMatter?.date as string,
					};
				} catch (err) {
					console.error(`Failed to fetch frontmatter for ${post.name}:`, err);
					return {
						...post,
						title: post.name,
					};
				}
			}),
		);

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
		<MainLayout
			title="Blogs about sport, health, and technology"
			intro="As a passionate long-distance runner, I want to share my knowledge about nutrition, training methods, and technology"
		>
			<div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
				{posts.length === 0 ? (
					<p className="text-gray-500">No posts found.</p>
				) : (
					<div className="flex flex-col gap-16">
						{posts.map((post) => (
							<PostItem
								key={post.path}
								data={post}
								linkProps={{ to: "/posts/$slug", params: { slug: post.name } }}
							/>
						))}
					</div>
				)}
			</div>
		</MainLayout>
	);
}
