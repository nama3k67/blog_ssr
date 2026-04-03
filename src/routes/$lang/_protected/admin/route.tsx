import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { checkAdmin } from "~/shared/services/admin";

export const Route = createFileRoute("/$lang/_protected/admin")({
	beforeLoad: async ({ params }) => {
		try {
			return await checkAdmin();
		} catch {
			throw redirect({
				to: "/$lang",
				params: { lang: params.lang },
			});
		}
	},
	component: () => <Outlet />,
});
