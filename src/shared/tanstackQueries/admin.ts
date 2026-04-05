import { queryOptions } from "@tanstack/react-query";

import { getAdminPostsFn, getIsAdminFn } from "~/shared/services/admin";

export const adminPostsOptions = () =>
	queryOptions({
		queryKey: ["admin", "posts"],
		queryFn: () => getAdminPostsFn(),
	});

export const isAdminOptions = () =>
	queryOptions({
		queryKey: ["admin", "is-admin"],
		queryFn: () => getIsAdminFn(),
		staleTime: Number.POSITIVE_INFINITY, // admin status doesn't change during session
	});
