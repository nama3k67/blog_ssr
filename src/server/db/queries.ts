import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import type { NewCategory, NewPost, NewTag, NewUser } from "./schema";
import { categories, posts, tags, users } from "./schema";

// ============ USERS ============

export async function getUserById(userId: string) {
	const result = await db.query.users.findFirst({
		where: eq(users.id, userId),
		with: {
			posts: true,
		},
	});
	return result;
}

export async function getUserByClerkId(clerkId: string) {
	const result = await db.query.users.findFirst({
		where: eq(users.clerkId, clerkId),
		with: {
			posts: true,
		},
	});
	return result;
}

export async function createUser(user: NewUser) {
	const result = await db.insert(users).values(user).returning();
	return result[0];
}

export async function updateUser(
	userId: string,
	data: Partial<Omit<NewUser, "id" | "clerkId">>,
) {
	const result = await db
		.update(users)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning();
	return result[0];
}

export async function deleteUser(userId: string) {
	await db.delete(users).where(eq(users.id, userId));
}

// ============ POSTS ============

export async function getPostById(postId: string) {
	const result = await db.query.posts.findFirst({
		where: eq(posts.id, postId),
		with: {
			author: true,
		},
	});
	return result;
}

export async function getUserPosts(userId: string) {
	const result = await db.query.posts.findMany({
		where: eq(posts.userId, userId),
		with: {
			author: true,
		},
	});
	return result;
}

export async function getAllPosts() {
	const result = await db.query.posts.findMany({
		with: {
			author: true,
		},
	});
	return result;
}

export async function getPublishedPosts() {
	const result = await db.query.posts.findMany({
		where: eq(posts.status, "published"),
		with: {
			author: true,
			category: true,
		},
		orderBy: [desc(posts.publishedAt)],
	});
	return result;
}

// ============ I18N POSTS QUERIES ============

/**
 * Get all published posts for a specific language
 * Sorted by publishedAt date (newest first)
 */
export async function getPublishedPostsByLang(lang: string) {
	const result = await db.query.posts.findMany({
		where: and(eq(posts.status, "published"), eq(posts.lang, lang)),
		with: {
			author: true,
			category: true,
			postTags: {
				with: {
					tag: true,
				},
			},
		},
		orderBy: [desc(posts.publishedAt)],
	});
	return result;
}

/**
 * Get paginated published posts for a specific language
 */
export async function getPublishedPostsPaginated(
	lang: string,
	page: number = 1,
	pageSize: number = 10,
) {
	const offset = (page - 1) * pageSize;

	const result = await db.query.posts.findMany({
		where: and(eq(posts.status, "published"), eq(posts.lang, lang)),
		with: {
			author: true,
			category: true,
			postTags: {
				with: {
					tag: true,
				},
			},
		},
		orderBy: [desc(posts.publishedAt)],
		limit: pageSize,
		offset: offset,
	});

	return result;
}

/**
 * Count total published posts for pagination
 */
export async function countPublishedPosts(lang: string): Promise<number> {
	const result = await db.query.posts.findMany({
		where: and(eq(posts.status, "published"), eq(posts.lang, lang)),
		columns: { id: true },
	});
	return result.length;
}

/**
 * Get a post by slug and language
 * Returns published posts only
 */
export async function getPostBySlugAndLang(slug: string, lang: string) {
	const result = await db.query.posts.findFirst({
		where: and(
			eq(posts.slug, slug),
			eq(posts.lang, lang),
			eq(posts.status, "published"),
		),
		with: {
			author: true,
			category: true,
			postTags: {
				with: {
					tag: true,
				},
			},
		},
	});
	return result;
}

/**
 * Get post translation by translationGroupId and target language
 */
export async function getPostTranslation(
	translationGroupId: string,
	targetLang: string,
) {
	const result = await db.query.posts.findFirst({
		where: and(
			eq(posts.translationGroupId, translationGroupId),
			eq(posts.lang, targetLang),
			eq(posts.status, "published"),
		),
	});
	return result;
}

/**
 * Get all posts by language (including unpublished - for admin)
 */
export async function getAllPostsByLang(lang: string) {
	const result = await db.query.posts.findMany({
		where: eq(posts.lang, lang),
		with: {
			author: true,
		},
		orderBy: (posts, { desc }) => [desc(posts.createdAt)],
	});
	return result;
}

export async function createPost(post: NewPost) {
	const result = await db.insert(posts).values(post).returning();
	return result[0];
}

export async function updatePost(
	postId: string,
	data: Partial<Omit<NewPost, "id" | "userId">>,
) {
	const result = await db
		.update(posts)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
		.returning();
	return result[0];
}

export async function deletePost(postId: string) {
	await db.delete(posts).where(eq(posts.id, postId));
}

// ============ ADMIN QUERIES ============

/**
 * Get all posts with pending status for admin approval queue
 * Sorted by creation date (FIFO)
 */
export async function getPendingPosts() {
	const result = await db.query.posts.findMany({
		where: eq(posts.status, "pending"),
		with: {
			author: true,
			category: true,
		},
		orderBy: [asc(posts.createdAt)],
	});
	return result;
}

// ============ CATEGORIES ============

export async function getAllCategories() {
	try {
		const result = await db.query.categories.findMany({
			orderBy: [asc(categories.name)],
		});
		return result;
	} catch (error) {
		console.error("Error fetching categories:", error);
		throw error;
	}
}

export async function getCategoryBySlug(slug: string) {
	const result = await db.query.categories.findFirst({
		where: eq(categories.slug, slug),
	});
	return result;
}

export async function createCategory(category: NewCategory) {
	const result = await db.insert(categories).values(category).returning();
	return result[0];
}

// ============ TAGS ============

export async function getAllTags() {
	const result = await db.query.tags.findMany({
		orderBy: [asc(tags.name)],
	});
	return result;
}

export async function getTagBySlug(slug: string) {
	const result = await db.query.tags.findFirst({
		where: eq(tags.slug, slug),
	});
	return result;
}

export async function createTag(tag: NewTag) {
	const result = await db.insert(tags).values(tag).returning();
	return result[0];
}
