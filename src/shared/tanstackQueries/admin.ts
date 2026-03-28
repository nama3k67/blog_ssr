import { queryOptions } from "@tanstack/react-query";

import { getPendingPostsFn } from "~/shared/services/admin";

export const pendingPostsOptions = () =>
	queryOptions({
		queryKey: ["admin", "pending-posts"],
		queryFn: () => getPendingPostsFn(),
	});
