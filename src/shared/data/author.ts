export const GITHUB_URL = "https://github.com/nama3k67";

export const AUTHOR_NAME = "Nam Tran";
export const AUTHOR_JOB_TITLE = "Software Developer";

export const AVATAR_URL: string | undefined = "/about.jpg";

export const CONTACT_EMAIL = "nama3k67@gmail.com";

export const CV_URL = "/Nam Tran's CV - Frontend Software Engineer.pdf";

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
	icon: "github" | "linkedin" | "x" | "instagram";
}

// ponytail: X/LinkedIn/Instagram use "#" placeholders — fill real URLs later.
export const SOCIAL_LINKS: SocialLink[] = [
	{ label: "X", href: "#", icon: "x" },
	{ label: "Instagram", href: "#", icon: "instagram" },
	{ label: "GitHub", href: GITHUB_URL, icon: "github" },
	{ label: "LinkedIn", href: "#", icon: "linkedin" },
];
