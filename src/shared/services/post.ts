import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	countPublishedPosts,
	createPostWithTags,
	getAllCategories,
	getAllTags,
	getPostBySlugAndLang,
	getPostTranslation,
	getPublishedPostsPaginated,
	getUserByClerkId,
} from "~/server/db/queries";
import { withAdmin } from "~/server/utils/withAdmin";
import { type CreatePostInput, createPostSchema } from "~/shared/schemas/post";

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
		// Try requested language first
		let post = await getPostBySlugAndLang(slug, lang);
		let isFallback = false;
		let originalLang = lang;

		// If not found, try opposite language
		if (!post) {
			const fallbackLang = lang === "en" ? "vi" : "en";
			post = await getPostBySlugAndLang(slug, fallbackLang);

			if (post) {
				isFallback = true;
				originalLang = fallbackLang;
			}
		}

		if (!post) {
			throw new Error("Post not found");
		}

		// Check for translation
		const targetLang = lang === "en" ? "vi" : "en";
		const translation = await getPostTranslation(
			post.translationGroupId,
			targetLang,
		);

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
	.inputValidator((params: { slug: string; lang: string }) => params)
	.handler(async ({ data: { slug, lang } }) => {
		const existing = await getPostBySlugAndLang(slug, lang);
		return { available: !existing };
	});

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

export type { CreatePostInput } from "~/shared/schemas/post";

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
