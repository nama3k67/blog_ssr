import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{
				title: "About - Long-Distance Runner & Tech Enthusiast",
			},
			{
				name: "description",
				content:
					"Learn about my journey as a long-distance runner and my passion for nutrition, training, and technology.",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/about"!</div>;
}
