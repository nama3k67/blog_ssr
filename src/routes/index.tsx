import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Home - Nutrition, Training & Technology Blog",
			},
			{
				name: "description",
				content:
					"A passionate long-distance runner sharing knowledge about nutrition, training methods, and technology.",
			},
		],
	}),
	component: Home,
});

function Home() {
	return (
		<div>
			<h1>Index Route</h1>
			<SignedIn>
				<p>You are signed in</p>
				<UserButton />
			</SignedIn>
			<SignedOut>
				<p>You are signed out</p>
				<SignInButton />
			</SignedOut>
		</div>
	);
}
