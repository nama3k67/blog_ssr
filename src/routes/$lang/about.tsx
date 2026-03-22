import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/shared/Container";
import { dictionaries } from "~/locales";
import { useI18n } from "~/shared/providers/i18n";

export const Route = createFileRoute("/$lang/about")({
	head: ({ params }) => {
		const t =
			dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{
					title: t.pages.about.title,
				},
				{
					name: "description",
					content: t.pages.about.description,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useI18n();
	return (
		<Container className="mt-16 sm:mt-32">
			<div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
				<div className="lg:order-first lg:row-span-2">
					<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
						{t.pages.about.heading}
					</h1>
					<div className="mt-6 flex flex-col gap-7 text-base text-muted-foreground">
						<p>{t.pages.about.description}</p>
					</div>
				</div>
			</div>
		</Container>
	);
}
