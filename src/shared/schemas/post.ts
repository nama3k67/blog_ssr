import { z } from "zod";

const postBaseFields = {
	title: z.string().trim().min(1, "Title is required"),
	slug: z.string().trim().min(1, "Slug is required"),
	lang: z.string().min(1, "Language is required"),
	description: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	categoryId: z.uuid().optional(),
	tagIds: z.array(z.uuid()).max(10, "Maximum 10 tags").default([]),
};

export const createPostSchema = z.object({
	...postBaseFields,
	tagIds: z
		.array(z.uuid())
		.max(10, "Maximum 10 tags")
		.default([])
		.transform((ids) => [...new Set(ids)]),
	featuredImage: z.string().optional(),
	published: z.boolean().default(false),
});

export const createPostFormSchema = z.object({
	...postBaseFields,
	description: z.string(),
	categoryId: z.union([z.uuid(), z.undefined()]),
	tagIds: z.array(z.uuid()).max(10, "Maximum 10 tags"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreatePostFormInput = z.infer<typeof createPostFormSchema>;

export const updatePostSchema = z.object({
	postId: z.string().uuid(),
	title: z.string().trim().min(1, "Title is required"),
	slug: z.string().trim().min(1, "Slug is required"),
	lang: z.string().min(1),
	description: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	categoryId: z.string().uuid().optional(),
	tagIds: z
		.array(z.string().uuid())
		.max(10)
		.default([])
		.transform((ids) => [...new Set(ids)]),
	featuredImage: z
		.string()
		.optional()
		.transform((v) => v || undefined),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const createTranslationSchema = z.object({
	originalPostId: z.string().uuid(),
	title: z.string().trim().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	description: z.string().optional(),
	featuredImage: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	tagIds: z.array(z.string().uuid()).max(10).default([]),
});
export type CreateTranslationInput = z.infer<typeof createTranslationSchema>;

export const createTranslationFormSchema = z.object({
	originalPostId: z.string().uuid(),
	title: z.string().trim().min(1, "Title is required"),
	slug: z.string().min(1),
	lang: z.string().min(1),
	description: z.string(),
	content: z.string().min(1, "Content is required"),
	categoryId: z.union([z.string().uuid(), z.undefined()]),
	tagIds: z.array(z.string().uuid()).max(10),
	featuredImage: z.string(),
});
export type CreateTranslationFormInput = z.infer<
	typeof createTranslationFormSchema
>;

export const updatePostFormSchema = z.object({
	postId: z.string().uuid(),
	title: z.string().trim().min(1, "Title is required"),
	slug: z.string().trim().min(1, "Slug is required"),
	lang: z.string().min(1),
	description: z.string(),
	content: z.string().min(1, "Content is required"),
	categoryId: z.union([z.string().uuid(), z.undefined()]),
	tagIds: z.array(z.string().uuid()).max(10),
	featuredImage: z.string(),
});
export type UpdatePostFormInput = z.infer<typeof updatePostFormSchema>;
