import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isAdmin } from "~/env";
import {
	deletePost,
	getAllAdminPosts,
	getPostById,
	updatePost,
} from "~/server/db/queries";
import { withAdmin } from "~/server/utils/withAdmin";

// ============ ADMIN DASHBOARD ============

/**
 * Get all posts (both languages, all statuses) for the admin dashboard
 */
export const getAdminPostsFn = createServerFn({ method: "GET" }).handler(
	withAdmin(async () => {
		const posts = await getAllAdminPosts();
		return posts.map((post) => ({
			id: post.id,
			title: post.title,
			slug: post.slug,
			lang: post.lang,
			status: post.status,
			translationGroupId: post.translationGroupId,
			publishedAt: post.publishedAt?.toISOString() ?? null,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
			category: post.category
				? { id: post.category.id, name: post.category.name }
				: null,
			viewCount: post.viewCount,
		}));
	}),
);

const deletePostSchema = z.object({ postId: z.uuid() });

/**
 * Delete a post by ID (postTags cascade via DB FK onDelete: "cascade")
 */
export const deletePostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof deletePostSchema>) =>
		deletePostSchema.parse(data),
	)
	.handler(
		withAdmin(async ({ data }) => {
			const post = await getPostById(data.postId);
			if (!post) throw new Error("NOT_FOUND");
			await deletePost(data.postId);
			return { id: data.postId };
		}),
	);

/**
 * Unpublish a post (transition: published → draft)
 * Admin only
 */
const unpublishPostSchema = z.object({
	postId: z.uuid(),
});

export const unpublishPostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof unpublishPostSchema>) =>
		unpublishPostSchema.parse(data),
	)
	.handler(
		withAdmin(async ({ data }) => {
			const post = await getPostById(data.postId);
			if (!post) {
				throw new Error("NOT_FOUND");
			}

			if (post.status !== "published") {
				throw new Error("INVALID_STATE");
			}

			const updated = await updatePost(data.postId, {
				status: "draft",
				publishedAt: null,
			});
			if (!updated) throw new Error("NOT_FOUND");

			return {
				id: updated.id,
				status: updated.status,
			};
		}),
	);

// ============ ADMIN STATUS ============

/**
 * Check if the currently authenticated user is admin
 * Returns { isAdmin: boolean } without exposing ADMIN_USER_ID to the client
 */
export const getIsAdminFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { userId: clerkId } = await auth();
		return { isAdmin: isAdmin(clerkId) };
	},
);

export const checkAdmin = createServerFn({ method: "GET" }).handler(
	async () => {
		const { userId: clerkId } = await auth();
		if (!isAdmin(clerkId)) {
			throw new Error("NOT_ADMIN");
		}
		return { clerkId };
	},
);
