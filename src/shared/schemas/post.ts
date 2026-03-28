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
	featuredImage: z.string().optional(),
	published: z.boolean().default(false),
});

export const createPostFormSchema = z.object({
	...postBaseFields,
	description: z.string(),
	categoryId: z.uuid().or(z.literal(undefined)),
	tagIds: z.array(z.uuid()).max(10, "Maximum 10 tags"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreatePostFormInput = z.infer<typeof createPostFormSchema>;
