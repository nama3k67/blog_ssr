import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	countPublishedPosts,
	createPostWithTags,
	getAllCategories,
	getAllTags,
	getAnyPostBySlugAndLang,
	getAnyPostByTranslationGroupAndLang,
	getPostByIdForAdmin,
	getPostBySlugAndLang,
	getPublishedPostsPaginated,
	getUserByClerkId,
	updatePost,
	updatePostWithTags,
} from "~/server/db/queries";
import { withAdmin } from "~/server/utils/withAdmin";
import {
	type CreatePostInput,
	type CreateTranslationInput,
	createPostSchema,
	createTranslationSchema,
	type UpdatePostInput,
	updatePostSchema,
} from "~/shared/schemas/post";

// ============ READ ============

const fetchPostsListSchema = z.object({
	lang: z.string(),
	page: z.number().min(1).optional().default(1),
	pageSize: z.number().min(1).max(100).optional().default(10),
});

export const fetchPostsList = createServerFn({ method: "GET" })
	.inputValidator((data: z.infer<typeof fetchPostsListSchema>) =>
		fetchPostsListSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const { lang, page, pageSize } = data;

		const postsData = await getPublishedPostsPaginated(lang, page, pageSize);
		const totalCount = await countPublishedPosts(lang);
		const totalPages = Math.ceil(totalCount / pageSize);

		const mappedPosts = postsData.map((post) => ({
			slug: post.slug,
			title: post.title,
			description: post.description,
			date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
			path: `/${lang}/posts/${post.slug}`,
			category: post.category
				? { name: post.category.name, slug: post.category.slug }
				: null,
			featuredImage: post.featuredImage?.startsWith("https://")
				? post.featuredImage
				: null,
		}));

		return {
			posts: mappedPosts,
			totalCount,
			currentPage: page,
			totalPages,
		};
	});

export const fetchPost = createServerFn({ method: "GET" })
	.inputValidator((params: { slug: string; lang: string }) => params)
	.handler(async ({ data: { slug, lang } }) => {
		const fallbackLang = lang === "en" ? "vi" : "en";

		// Fetch both language variants in parallel — eliminates sequential Neon round-trips.
		// Because translations share the same slug (see createTranslationFn), the
		// fallbackPost IS the translation candidate, so no third query is needed.
		const [primaryPost, fallbackPost] = await Promise.all([
			getPostBySlugAndLang(slug, lang),
			getPostBySlugAndLang(slug, fallbackLang),
		]);

		let isFallback = false;
		let originalLang = lang;

		const post =
			primaryPost ??
			(() => {
				if (fallbackPost) {
					isFallback = true;
					originalLang = fallbackLang;
				}
				return fallbackPost;
			})();

		if (!post) {
			throw new Error("Post not found");
		}

		// fallbackPost is always the other-language variant (already fetched above).
		// In normal case: it's the translation to link to from the toggle.
		// In fallback case: it's the "original" linked from the fallback banner.
		const translation = fallbackPost;

		return {
			post: {
				id: post.id,
				slug: post.slug,
				title: post.title,
				lang: post.lang,
				content: post.content,
				description: post.description,
				publishedAt:
					post.publishedAt?.toISOString() || post.createdAt.toISOString(),
				featuredImage: post.featuredImage,
				translationGroupId: post.translationGroupId,
				author: post.author
					? {
							id: post.author.id,
							firstName: post.author.firstName,
							lastName: post.author.lastName,
							imageUrl: post.author.imageUrl,
						}
					: null,
				category: post.category
					? {
							id: post.category.id,
							name: post.category.name,
							slug: post.category.slug,
						}
					: null,
				tags: post.postTags.map((pt) => ({
					id: pt.tag.id,
					name: pt.tag.name,
					slug: pt.tag.slug,
				})),
			},
			isFallback,
			originalLang,
			translationSlug: translation?.slug,
		};
	});

// ============ CHECK ============

export const checkSlugAvailability = createServerFn({ method: "GET" })
	.inputValidator(
		(params: { slug: string; lang: string; excludePostId?: string }) => params,
	)
	.handler(
		withAdmin(async ({ data: { slug, lang, excludePostId } }) => {
			const existing = await getAnyPostBySlugAndLang(slug, lang, excludePostId);
			return { available: !existing };
		}),
	);

// ============ CATEGORIES & TAGS ============

export const getCategoriesList = createServerFn({ method: "GET" }).handler(
	async () => {
		const categories = await getAllCategories();
		return categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			slug: cat.slug,
		}));
	},
);

export const getTagsList = createServerFn({ method: "GET" }).handler(
	async () => {
		const tags = await getAllTags();
		return tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
			slug: tag.slug,
		}));
	},
);

// ============ WRITE ============

export type { CreatePostInput, UpdatePostInput } from "~/shared/schemas/post";

export const createPostFn = createServerFn({ method: "POST" })
	.inputValidator((data: CreatePostInput) => createPostSchema.parse(data))
	.handler(
		withAdmin(async ({ data }) => {
			// withAdmin() verified admin — resolve Clerk ID → DB user UUID
			const { userId: clerkId } = await auth();
			if (!clerkId) throw new Error("USER_NOT_FOUND");
			const user = await getUserByClerkId(clerkId);
			if (!user) throw new Error("USER_NOT_FOUND");

			// Check slug uniqueness
			const existing = await getPostBySlugAndLang(data.slug, data.lang);
			if (existing) throw new Error("SLUG_TAKEN");

			// Create post + link tags atomically
			const post = await createPostWithTags(
				{
					userId: user.id,
					categoryId: data.categoryId || null,
					title: data.title,
					slug: data.slug,
					lang: data.lang,
					description: data.description || null,
					content: data.content,
					featuredImage: data.featuredImage || null,
					status: data.published ? "published" : "draft",
					publishedAt: data.published ? new Date() : null,
				},
				data.tagIds,
			);

			return post;
		}),
	);

// ============ EDIT POST ============

export const getPostForEditFn = createServerFn({ method: "GET" })
	.inputValidator((params: { postId: string }) => params)
	.handler(
		withAdmin(async ({ data }) => {
			const post = await getPostByIdForAdmin(data.postId);
			if (!post) throw new Error("POST_NOT_FOUND");
			return {
				id: post.id,
				title: post.title,
				slug: post.slug,
				lang: post.lang,
				content: post.content,
				description: post.description ?? "",
				featuredImage: post.featuredImage ?? "",
				status: post.status,
				publishedAt: post.publishedAt?.toISOString() ?? null,
				translationGroupId: post.translationGroupId,
				categoryId: post.category?.id ?? undefined,
				tagIds: post.postTags.map((pt) => pt.tag.id),
			};
		}),
	);

export const updatePostFn = createServerFn({ method: "POST" })
	.inputValidator((data: UpdatePostInput) => updatePostSchema.parse(data))
	.handler(
		withAdmin(async ({ data }) => {
			const { postId, tagIds, slug, lang, ...fields } = data;
			// Check slug uniqueness (excluding current post, all statuses)
			const existing = await getAnyPostBySlugAndLang(slug, lang, postId);
			if (existing) throw new Error("SLUG_TAKEN");
			// POST_NOT_FOUND is thrown inside the transaction if postId doesn't exist
			const post = await updatePostWithTags(
				postId,
				{ ...fields, slug, lang },
				tagIds,
			);
			return { id: post.id, slug: post.slug, status: post.status };
		}),
	);

const publishPostSchema = z.object({ postId: z.string().uuid() });

export const publishPostFn = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof publishPostSchema>) =>
		publishPostSchema.parse(data),
	)
	.handler(
		withAdmin(async ({ data }) => {
			// Atomic publish: only transitions draft → published in a single UPDATE.
			// Eliminates TOCTOU between a status-read and a separate write.
			const updated = await updatePost(data.postId, {
				status: "published",
				publishedAt: new Date(),
			});
			if (!updated) throw new Error("POST_NOT_FOUND");
			if (updated.status !== "published") throw new Error("INVALID_STATE");
			return {
				id: updated.id,
				slug: updated.slug,
				status: updated.status,
				publishedAt: updated.publishedAt?.toISOString(),
			};
		}),
	);

// ============ TRANSLATION ============

/**
 * Check if a translation exists for a given translationGroupId + target language
 * Checks any status (draft or published) — for admin translation management
 */
export const checkTranslationExistsFn = createServerFn({ method: "GET" })
	.inputValidator(
		(params: { translationGroupId: string; targetLang: string }) => params,
	)
	.handler(
		withAdmin(async ({ data }) => {
			const existing = await getAnyPostByTranslationGroupAndLang(
				data.translationGroupId,
				data.targetLang,
			);
			return { exists: !!existing, postId: existing?.id ?? null };
		}),
	);

/**
 * Create a translation of an existing post
 * Shares the same translationGroupId and slug (unique per slug+lang)
 * Does NOT check slug uniqueness — shared slug is intentional
 */
export const createTranslationFn = createServerFn({ method: "POST" })
	.inputValidator((data: CreateTranslationInput) =>
		createTranslationSchema.parse(data),
	)
	.handler(
		withAdmin(async ({ data }) => {
			const { userId: clerkId } = await auth();
			if (!clerkId) throw new Error("USER_NOT_FOUND");
			const user = await getUserByClerkId(clerkId);
			if (!user) throw new Error("USER_NOT_FOUND");

			const original = await getPostByIdForAdmin(data.originalPostId);
			if (!original) throw new Error("POST_NOT_FOUND");

			const targetLang = original.lang === "en" ? "vi" : "en";

			// Guard: block if translation already exists (any status)
			const existing = await getAnyPostByTranslationGroupAndLang(
				original.translationGroupId,
				targetLang,
			);
			if (existing) throw new Error("TRANSLATION_EXISTS");

			const post = await createPostWithTags(
				{
					userId: user.id,
					title: data.title,
					slug: original.slug, // shared slug — unique per slug+lang
					lang: targetLang,
					content: data.content,
					description: data.description ?? null,
					featuredImage: data.featuredImage || null,
					categoryId: data.categoryId ?? original.categoryId,
					translationGroupId: original.translationGroupId, // copy from original
					status: "draft",
					publishedAt: null,
				},
				data.tagIds,
			);

			return {
				id: post.id,
				slug: post.slug,
				lang: post.lang,
				translationGroupId: post.translationGroupId,
			};
		}),
	);
