import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/shared/Container";
import { Button } from "~/components/ui/button";
import { useI18n } from "~/shared/providers/i18n";
import { dictionaries } from "~/locales";

export const Route = createFileRoute("/$lang/")({
	head: ({ params }) => {
		const t = dictionaries[params.lang as keyof typeof dictionaries] || dictionaries.en;
		return {
			meta: [
				{
					title: t.pages.home.title,
				},
				{
					name: "description",
					content: t.pages.home.description,
				},
			],
		};
	},
	component: Home,
});

function Home() {
	const { t } = useI18n();
	return (
		<Container className="mt-16 sm:mt-32">
			<div className="max-w-2xl">
				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					{t.pages.home.heading}
				</h1>
				<p className="mt-6 text-base text-muted-foreground">
					{t.pages.home.description}
				</p>
				<div className="mt-6 flex gap-6">
					<SignedIn>
						<div className="flex items-center gap-4">
							<p className="text-sm text-muted-foreground">
								{t.pages.home.signedIn}
							</p>
							<UserButton />
						</div>
					</SignedIn>
					<SignedOut>
						<SignInButton>
							<Button>
								{t.common.login}
							</Button>
						</SignInButton>
					</SignedOut>
				</div>
			</div>
		</Container>
	);
}
