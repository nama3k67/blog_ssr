import { auth } from "@clerk/tanstack-react-start/server";
import { isAdmin } from "~/env";

// biome-ignore lint/suspicious/noExplicitAny: handler ctx varies by server fn signature
type HandlerFn<TOutput> = (ctx: any) => Promise<TOutput>;

export function withAdmin<TOutput>(
	handler: HandlerFn<TOutput>,
): HandlerFn<TOutput> {
	return async (ctx) => {
		const { userId } = await auth();
		if (!isAdmin(userId)) {
			throw new Error("UNAUTHORIZED");
		}
		return handler(ctx);
	};
}
