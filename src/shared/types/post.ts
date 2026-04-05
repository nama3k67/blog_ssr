export type PostSummary = {
	slug: string;
	title: string;
	description?: string | null;
	date: string;
	path: string;
	category: { name: string; slug: string } | null;
	featuredImage: string | null;
};
