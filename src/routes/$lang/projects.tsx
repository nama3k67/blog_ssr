import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "~/components/layout";
import { ProjectCard } from "~/components/shared/ProjectCard";
import { dictionaries } from "~/locales";
import { PROJECTS } from "~/shared/data/projects";
import { SITE_URL } from "~/shared/data/site";
import { useI18n } from "~/shared/providers/i18n";

export const Route = createFileRoute("/$lang/projects")({
	head: ({ params }) => {
		const lang = params.lang as "en" | "vi";
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{ title: t.pages.projects.title },
				{ name: "description", content: t.pages.projects.description },
				{ property: "og:title", content: t.pages.projects.title },
				{ property: "og:description", content: t.pages.projects.description },
				{ property: "og:image", content: `${SITE_URL}/logo.png` },
				{ property: "og:url", content: `${SITE_URL}/${lang}/projects` },
			],
			links: [
				{ rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/projects` },
				{ rel: "alternate", hreflang: "vi", href: `${SITE_URL}/vi/projects` },
				{
					rel: "alternate",
					hreflang: "x-default",
					href: `${SITE_URL}/en/projects`,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { t, language } = useI18n();
	return (
		<MainLayout
			title={t.pages.projects.heading}
			intro={t.pages.projects.description}
		>
			<ul className='grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3'>
				{PROJECTS.map((project) => (
					<ProjectCard
						key={project.id}
						project={project}
						language={language}
						githubLabel={t.pages.projects.githubLink}
					/>
				))}
			</ul>
		</MainLayout>
	);
}
