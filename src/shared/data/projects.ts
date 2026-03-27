import type { Language } from "~/shared/constants/i18n";

export interface Project {
	id: string;
	title: { en: string; vi: string };
	description: { en: string; vi: string };
	tags: string[];
	githubUrl: string;
	thumbnailUrl?: string;
}

export const PROJECTS: Project[] = [
	{
		id: "portfolio-blog",
		title: {
			en: "Portfolio & Blog Platform",
			vi: "Nền tảng Portfolio & Blog",
		},
		description: {
			en: "A full-stack portfolio and blog platform built with TanStack Start, Drizzle ORM, and Cloudflare Workers. Features SSR, i18n (EN/VI), Clerk auth, R2 image storage, and Markdown rendering with syntax highlighting.",
			vi: "Nền tảng portfolio và blog full-stack được xây dựng với TanStack Start, Drizzle ORM và Cloudflare Workers. Hỗ trợ SSR, đa ngôn ngữ (EN/VI), xác thực Clerk, lưu trữ ảnh R2 và hiển thị Markdown với syntax highlighting.",
		},
		tags: [
			"TanStack Start",
			"React 19",
			"TypeScript",
			"Drizzle ORM",
			"Cloudflare Workers",
			"Tailwind CSS",
		],
		githubUrl: "https://github.com/nama3k67/blog-app",
	},
];

// Type helper for indexing bilingual fields
export function getLocalizedField(
	field: { en: string; vi: string },
	language: Language,
): string {
	return field[language];
}
