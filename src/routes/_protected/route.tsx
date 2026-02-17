import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const checkAuth = createServerFn().handler(async () => {
	const { userId, isAuthenticated } = await auth();

	if (!isAuthenticated) throw redirect({ to: "/" });
	return { userId };
});

export const Route = createFileRoute("/_protected")({
	beforeLoad: async () => await checkAuth(),
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
