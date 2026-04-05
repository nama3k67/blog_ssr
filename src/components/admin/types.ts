import type { getAdminPostsFn } from "~/shared/services/admin";

export type StatusFilter = "all" | "draft" | "published";
export type LangFilter = "all" | "en" | "vi";
export type AdminPost = Awaited<ReturnType<typeof getAdminPostsFn>>[number];
