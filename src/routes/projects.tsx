import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects")({
	head: () => ({
		meta: [
			{
				title: "Projects - Portfolio & Work Samples",
			},
			{
				name: "description",
				content:
					"Explore my projects and portfolio showcasing my work in technology and web development.",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/projects"!</div>;
}
