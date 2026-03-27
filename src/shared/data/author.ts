export const GITHUB_URL = "https://github.com/nama3k67";

export const AVATAR_URL = "/avatar.jpg";

export const CONTACT_EMAIL = "nama3k67@gmail.com";

export interface SkillGroup {
	category: { en: string; vi: string };
	skills: string[];
}

export const SKILLS: SkillGroup[] = [
	{
		category: { en: "Frontend", vi: "Giao diện" },
		skills: ["React", "TanStack Start", "Tailwind CSS", "TypeScript"],
	},
	{
		category: { en: "Backend", vi: "Phía máy chủ" },
		skills: ["Node.js", "Drizzle ORM", "PostgreSQL", "Cloudflare Workers"],
	},
	{
		category: { en: "Tools & Infra", vi: "Công cụ & Hạ tầng" },
		skills: ["Vite", "Biome", "Git", "Cloudflare R2"],
	},
];

export interface SocialLink {
	label: string;
	href: string;
	icon: "github" | "linkedin";
}

export const SOCIAL_LINKS: SocialLink[] = [
	{ label: "GitHub", href: GITHUB_URL, icon: "github" },
];
