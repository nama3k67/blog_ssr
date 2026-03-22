import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "~/components/layout";
import { dictionaries } from "~/locales";
import { useI18n } from "~/shared/providers/i18n";

export const Route = createFileRoute("/$lang/projects")({
	head: ({ params }) => {
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{
					title: t.pages.projects.title,
				},
				{
					name: "description",
					content: t.pages.projects.description,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useI18n();
	return (
		<MainLayout
			title={t.pages.projects.heading}
			intro={t.pages.projects.description}
		>
			<ul
				className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
			>
				{/* Project cards will go here */}
			</ul>
		</MainLayout>
	);
}
