import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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
 * Posts table - example blog/content data
 * Associated with users
 */
export const posts = pgTable("posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).unique().notNull(),
	content: text("content").notNull(),
	published: boolean("published").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
	author: one(users, {
		fields: [posts.userId],
		references: [users.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
