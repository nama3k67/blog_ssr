import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db, withTransaction } from "./client";
import type { NewCategory, NewPost, NewTag, NewUser } from "./schema";
import { categories, posts, postTags, tags, users } from "./schema";

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
 * TODO Story 4.5: Remove this function when approval workflow is replaced by admin dashboard
 */
export async function getPendingPosts() {
	const result = await db.query.posts.findMany({
		// TODO Story 4.5: "pending" removed from enum — this query returns nothing until cleanup
		// biome-ignore lint/suspicious/noExplicitAny: "pending" removed from enum, cleanup in Story 4.5
		where: eq(posts.status as any, "pending"),
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

// ============ POST TAGS ============

export async function createPostTags(postId: string, tagIds: string[]) {
	if (tagIds.length === 0) return;
	await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
}

export async function createPostWithTags(post: NewPost, tagIds: string[]) {
	return withTransaction(async (tx) => {
		const [created] = await tx.insert(posts).values(post).returning();
		if (tagIds.length > 0) {
			await tx
				.insert(postTags)
				.values(tagIds.map((tagId) => ({ postId: created.id, tagId })));
		}
		return created;
	});
}

// ============ EDIT POST QUERIES ============

/**
 * Get a post by ID with category and tags — for admin edit form
 */
export async function getPostByIdForAdmin(postId: string) {
	return db.query.posts.findFirst({
		where: eq(posts.id, postId),
		with: {
			author: true,
			category: true,
			postTags: { with: { tag: true } },
		},
	});
}

/**
 * Update a post and atomically replace all its tags in a single transaction
 */
export async function updatePostWithTags(
	postId: string,
	data: Partial<Omit<NewPost, "id" | "userId">>,
	newTagIds: string[],
) {
	return withTransaction(async (tx) => {
		const [updated] = await tx
			.update(posts)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(posts.id, postId))
			.returning();
		if (!updated) throw new Error("POST_NOT_FOUND");
		// Replace all tags atomically — only runs if post exists
		await tx.delete(postTags).where(eq(postTags.postId, postId));
		if (newTagIds.length > 0) {
			await tx
				.insert(postTags)
				.values(newTagIds.map((tagId) => ({ postId, tagId })));
		}
		return updated;
	});
}

/**
 * Get any post (any status) by slug and language, optionally excluding a specific post
 * Used for slug uniqueness checks on edit
 */
export async function getAnyPostBySlugAndLang(
	slug: string,
	lang: string,
	excludePostId?: string,
) {
	const conditions = [eq(posts.slug, slug), eq(posts.lang, lang)];
	if (excludePostId) conditions.push(ne(posts.id, excludePostId));
	return db.query.posts.findFirst({ where: and(...conditions) });
}
