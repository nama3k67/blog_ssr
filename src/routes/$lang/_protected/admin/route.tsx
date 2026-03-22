import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { isAdmin } from "~/env";

export const Route = createFileRoute("/$lang/_protected/admin")({
	beforeLoad: async () => {
		const { userId: clerkId } = await auth();
		
		if (!isAdmin(clerkId)) {
			throw redirect({
				to: "/$lang",
				params: { lang: "en" },
			});
		}
	},
	component: () => <Outlet />,
});
