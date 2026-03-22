import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const { userId, isAuthenticated } = await auth();

	if (!isAuthenticated) {
		// Redirect to login - will be a 401 response
		// Client will need to handle language prefix
		throw new Error("UNAUTHORIZED");
	}
	return { userId };
});

export const Route = createFileRoute("/$lang/_protected")({
	beforeLoad: async ({ params }) => {
		try {
			return await checkAuth();
		} catch {
			// Redirect to language-specific login page
			throw redirect({
				to: "/$lang/login" as const,
				params: { lang: params.lang },
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
