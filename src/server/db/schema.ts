import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

/**
 * Post status enum for approval workflow
 */
export const postStatusEnum = pgEnum("post_status", [
	"draft",
	"pending",
	"published",
	"rejected",
]);

/**
 * Users table - synced from Clerk
 * Stores user profile information
 */
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
	email: varchar("email", { length: 255 }).unique().notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Categories table - broad topic grouping
 */
export const categories = pgTable("categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 100 }).unique().notNull(),
	slug: varchar("slug", { length: 100 }).unique().notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Tags table - fine-grained topic labeling
 */
export const tags = pgTable("tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 50 }).unique().notNull(),
	slug: varchar("slug", { length: 50 }).unique().notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Posts table - i18n blog content with approval workflow
 * Each row represents one language version
 */
export const posts = pgTable(
	"posts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").references(() => users.id, {
			onDelete: "set null",
		}),
		categoryId: uuid("category_id").references(() => categories.id, {
			onDelete: "set null",
		}),

		// Content fields
		title: varchar("title", { length: 255 }).notNull(),
		slug: varchar("slug", { length: 255 }).notNull(),
		lang: varchar("lang", { length: 10 }).notNull(),
		content: text("content").notNull(),
		description: text("description"),
		featuredImage: text("featured_image"),

		// Translation linking
		translationGroupId: uuid("translation_group_id").defaultRandom().notNull(),

		// Approval workflow
		status: postStatusEnum("status").default("draft").notNull(),
		adminFeedback: text("admin_feedback"),
		reviewedBy: uuid("reviewed_by").references(() => users.id, {
			onDelete: "set null",
		}),
		reviewedAt: timestamp("reviewed_at"),

		// Timestamps
		publishedAt: timestamp("published_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		// Unique constraint: same slug can exist per language
		uniqueIndex("slug_lang_idx").on(table.slug, table.lang),

		// Performance indexes
		index("status_lang_published_idx").on(
			table.status,
			table.lang,
			table.publishedAt,
		),
		index("translation_group_idx").on(table.translationGroupId),
		index("category_idx").on(table.categoryId),
		index("author_idx").on(table.userId),
	],
);

/**
 * Post-Tags junction table - many-to-many relationship
 */
export const postTags = pgTable(
	"post_tags",
	{
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.tagId] }),
		index("post_tags_post_idx").on(table.postId),
		index("post_tags_tag_idx").on(table.tagId),
	],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts, { relationName: "author" }),
	reviewedPosts: many(posts, { relationName: "reviewer" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.userId],
		references: [users.id],
		relationName: "author",
	}),
	reviewer: one(users, {
		fields: [posts.reviewedBy],
		references: [users.id],
		relationName: "reviewer",
	}),
	category: one(categories, {
		fields: [posts.categoryId],
		references: [categories.id],
	}),
	postTags: many(postTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
	post: one(posts, {
		fields: [postTags.postId],
		references: [posts.id],
	}),
	tag: one(tags, {
		fields: [postTags.tagId],
		references: [tags.id],
	}),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;

// Domain types with relations
export type PostWithAuthor = Post & { author: User | null };
export type PostWithDetails = Post & {
	author: User | null;
	category: Category | null;
	postTags: Array<PostTag & { tag: Tag }>;
};
export type PostWithTranslation = Post & {
	translation: Post | null;
};
