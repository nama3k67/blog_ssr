import { queryOptions } from "@tanstack/react-query";

import {
	checkSlugAvailability,
	fetchPost,
	fetchPostsList,
	getCategoriesList,
	getTagsList,
} from "~/shared/services/post";

// ============ Post List Queries ============

export const postListOptions = (lang: string, page = 1, pageSize = 10) =>
	queryOptions({
		queryKey: ["posts", "list", { lang, page, pageSize }],
		queryFn: () => fetchPostsList({ data: { lang, page, pageSize } }),
	});

// ============ Single Post Queries ============

export const postDetailOptions = (slug: string, lang: string) =>
	queryOptions({
		queryKey: ["posts", "detail", { slug, lang }],
		queryFn: () => fetchPost({ data: { slug, lang } }),
	});

// ============ Slug Availability ============

export const slugCheckOptions = (slug: string, lang: string) =>
	queryOptions({
		queryKey: ["posts", "slug-check", { slug, lang }],
		queryFn: () => checkSlugAvailability({ data: { slug, lang } }),
		staleTime: Number.POSITIVE_INFINITY,
	});

// ============ Categories & Tags ============

export const categoriesOptions = () =>
	queryOptions({
		queryKey: ["categories", "list"],
		queryFn: () => getCategoriesList(),
		staleTime: 5 * 60 * 1000, // 5 min — rarely changes
	});

export const tagsOptions = () =>
	queryOptions({
		queryKey: ["tags", "list"],
		queryFn: () => getTagsList(),
		staleTime: 5 * 60 * 1000,
	});
