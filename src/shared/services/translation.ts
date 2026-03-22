import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	createPost,
	getPostById,
	getPostBySlugAndLang,
	getPostTranslation,
	getUserByClerkId,
} from "~/server/db/queries";

// ============ TRANSLATION MANAGEMENT ============

/**
 * Create translation of an existing post
 * Uses same slug and translationGroupId as original
 */
const createTranslationSchema = z.object({
	originalPostId: z.string().uuid(),
	targetLang: z.string(),
	title: z.string().min(1),
	content: z.string().min(1),
	description: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	tagIds: z.array(z.string().uuid()).max(10).optional(),
});

export const createTranslationFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof createTranslationSchema>) =>
		createTranslationSchema.parse(data),
	)
	.handler(async ({ data }) => {
		// Authenticate
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			throw new Error("UNAUTHORIZED");
		}

		// Get original post
		const originalPost = await getPostById(data.originalPostId);
		if (!originalPost) {
			throw new Error("NOT_FOUND");
		}

		// Validate target language is opposite of original
		if (originalPost.lang === data.targetLang) {
			throw new Error("VALIDATION_ERROR: Cannot translate to same language");
		}

		// Check if translation already exists
		const existingTranslation = await getPostBySlugAndLang(
			originalPost.slug,
			data.targetLang,
		);
		if (existingTranslation) {
			throw new Error("SLUG_TAKEN: Translation already exists");
		}

		// Resolve Clerk ID → DB user UUID
		const user = await getUserByClerkId(clerkId);
		if (!user) {
			throw new Error("User not found in database");
		}

		// Create translation post
		const translation = await createPost({
			userId: user.id,
			categoryId: data.categoryId || originalPost.categoryId,
			title: data.title,
			slug: originalPost.slug, // Same slug as original
			lang: data.targetLang,
			content: data.content,
			description: data.description || null,
			featuredImage: originalPost.featuredImage, // Inherit featured image
			translationGroupId: originalPost.translationGroupId, // Link to original
			status: "draft", // Start as draft, needs approval
		});

		// TODO: Copy tags from original if not provided, or use data.tagIds

		return {
			id: translation.id,
			slug: translation.slug,
			lang: translation.lang,
			translationGroupId: translation.translationGroupId,
			status: translation.status,
		};
	});

/**
 * Get translation of a post if it exists
 * Used to determine if language toggle should be shown
 */
const getPostTranslationSchema = z.object({
	postId: z.string().uuid(),
	targetLang: z.string(),
});

export const getPostTranslationFn = createServerFn({ method: "GET" })
	.inputValidator((data: z.infer<typeof getPostTranslationSchema>) =>
		getPostTranslationSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const post = await getPostById(data.postId);
		if (!post) {
			throw new Error("NOT_FOUND");
		}

		const translation = await getPostTranslation(
			post.translationGroupId,
			data.targetLang,
		);

		if (!translation) {
			return { translation: null };
		}

		return {
			translation: {
				id: translation.id,
				slug: translation.slug,
				lang: translation.lang,
				title: translation.title,
				status: translation.status,
			},
		};
	});
