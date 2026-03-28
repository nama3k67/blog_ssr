import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { Container } from "~/components/shared/Container";
import { dictionaries } from "~/locales";
import { useI18n } from "~/shared/providers/i18n";

const searchSchema = z.object({
	redirect: z.string().optional().default("/new"),
});

export const Route = createFileRoute("/$lang/login")({
	validateSearch: searchSchema,
	head: ({ params }) => {
		const t = dictionaries[params.lang as keyof typeof dictionaries];
		return {
			meta: [
				{ title: t.common.login || "Login" },
				{
					name: "description",
					content: t.common.login || "Login to your account",
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { redirect } = useSearch({ from: Route.fullPath });
	const { t } = useI18n();

	return (
		<Container className='mt-16 sm:mt-32'>
			<div className='flex flex-col items-center'>
				<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
					{t.common.login || "Login"}
				</h1>
				<div className='mt-10'>
					<SignIn fallbackRedirectUrl={redirect} />
				</div>
			</div>
		</Container>
	);
}
