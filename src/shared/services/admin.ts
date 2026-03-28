import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isAdmin } from "~/env";
import { getPendingPosts, getPostById, updatePost } from "~/server/db/queries";

// ============ ADMIN APPROVAL WORKFLOW ============

/**
 * Get all posts pending admin approval
 * Ordered by creation date (FIFO)
 */
export const getPendingPostsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		// Authenticate and check admin
		const { userId: clerkId } = await auth();
		if (!isAdmin(clerkId)) {
			throw new Error("UNAUTHORIZED");
		}

		const pendingPosts = await getPendingPosts();

		return pendingPosts.map((post) => ({
			id: post.id,
			title: post.title,
			slug: post.slug,
			lang: post.lang,
			description: post.description,
			createdAt: post.createdAt.toISOString(),
			author: post.author
				? {
						id: post.author.id,
						firstName: post.author.firstName,
						lastName: post.author.lastName,
						email: post.author.email,
					}
				: null,
			category: post.category
				? {
						name: post.category.name,
						slug: post.category.slug,
					}
				: null,
		}));
	},
);

/**
 * Approve a pending post (transition: pending → published)
 */
const approvePostSchema = z.object({
	postId: z.string().uuid(),
});

export const approvePostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof approvePostSchema>) =>
		approvePostSchema.parse(data),
	)
	.handler(async ({ data }) => {
		// Authenticate and check admin
		const { userId: clerkId } = await auth();
		if (!isAdmin(clerkId)) {
			throw new Error("UNAUTHORIZED");
		}

		// Get current post state
		const post = await getPostById(data.postId);
		if (!post) {
			throw new Error("NOT_FOUND");
		}

		if (post.status !== "pending") {
			throw new Error("INVALID_STATE");
		}

		// Update to published
		const updated = await updatePost(data.postId, {
			status: "published",
			publishedAt: new Date(),
			reviewedBy: clerkId, // Store Clerk ID temporarily
			reviewedAt: new Date(),
			adminFeedback: null, // Clear any previous feedback
		});

		return {
			id: updated.id,
			status: updated.status,
			publishedAt: updated.publishedAt?.toISOString(),
			reviewedAt: updated.reviewedAt?.toISOString(),
		};
	});

/**
 * Reject a pending post with feedback (transition: pending → rejected)
 */
const rejectPostSchema = z.object({
	postId: z.string().uuid(),
	feedback: z.string().min(1).max(1000),
});

export const rejectPostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof rejectPostSchema>) =>
		rejectPostSchema.parse(data),
	)
	.handler(async ({ data }) => {
		// Authenticate and check admin
		const { userId: clerkId } = await auth();
		if (!isAdmin(clerkId)) {
			throw new Error("UNAUTHORIZED");
		}

		// Get current post state
		const post = await getPostById(data.postId);
		if (!post) {
			throw new Error("NOT_FOUND");
		}

		if (post.status !== "pending") {
			throw new Error("INVALID_STATE");
		}

		// Update to rejected with feedback
		const updated = await updatePost(data.postId, {
			status: "rejected",
			adminFeedback: data.feedback,
			reviewedBy: clerkId, // Store Clerk ID temporarily
			reviewedAt: new Date(),
		});

		return {
			id: updated.id,
			status: updated.status,
			adminFeedback: updated.adminFeedback,
			reviewedAt: updated.reviewedAt?.toISOString(),
		};
	});

/**
 * Submit draft post for approval (transition: draft → pending)
 */
const submitForApprovalSchema = z.object({
	postId: z.string().uuid(),
});

export const submitForApproval = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof submitForApprovalSchema>) =>
		submitForApprovalSchema.parse(data),
	)
	.handler(async ({ data }) => {
		// Authenticate
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			throw new Error("UNAUTHORIZED");
		}

		// Get current post state
		const post = await getPostById(data.postId);
		if (!post) {
			throw new Error("NOT_FOUND");
		}

		if (post.status !== "draft" && post.status !== "rejected") {
			throw new Error("INVALID_STATE");
		}

		// Update to pending
		const updated = await updatePost(data.postId, {
			status: "pending",
			adminFeedback: null, // Clear rejection feedback
		});

		return {
			id: updated.id,
			status: updated.status,
		};
	});

/**
 * Unpublish a post (transition: published → draft)
 * Admin only
 */
const unpublishPostSchema = z.object({
	postId: z.string().uuid(),
});

export const unpublishPostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof unpublishPostSchema>) =>
		unpublishPostSchema.parse(data),
	)
	.handler(async ({ data }) => {
		// Authenticate and check admin
		const { userId: clerkId } = await auth();
		if (!isAdmin(clerkId)) {
			throw new Error("UNAUTHORIZED");
		}

		// Get current post state
		const post = await getPostById(data.postId);
		if (!post) {
			throw new Error("NOT_FOUND");
		}

		if (post.status !== "published") {
			throw new Error("INVALID_STATE");
		}

		// Update to draft
		const updated = await updatePost(data.postId, {
			status: "draft",
			publishedAt: null,
		});

		return {
			id: updated.id,
			status: updated.status,
		};
	});
