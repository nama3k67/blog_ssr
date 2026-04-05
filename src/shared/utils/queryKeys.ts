export type PostListParams = { lang: string; page: number };

export const queryKeys = {
	posts: {
		list: (params: PostListParams) => ["posts", "list", params] as const,
		detail: (params: { slug: string; lang: string }) =>
			["posts", "detail", params] as const,
	},
	categories: {
		list: () => ["categories", "list"] as const,
	},
	tags: {
		list: () => ["tags", "list"] as const,
	},
} as const;
