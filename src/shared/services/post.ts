import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";

import { env } from "~/env";
import type { FetchPostParams, GitHubContent } from "../types";

export const fetchPost = createServerFn({ method: "GET" })
	.inputValidator((params: FetchPostParams) => params)
	.handler(async ({ data: { repo, branch, path } }) => {
		const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;

		const headers: Record<string, string> = {};
		if (env.GITHUB_TOKEN) headers.Authorization = `token ${env.GITHUB_TOKEN}`;

		const response = await fetch(url, { headers });

		if (!response.ok) {
			throw new Error(
				`Failed to fetch file from GitHub: ${response.statusText}`,
			);
		}

		const rawContent = await response.text();
		const { data: frontMatter, content } = matter(rawContent);

		return {
			frontMatter,
			content,
			path,
		};
	});

export const fetchPostList = createServerFn({ method: "GET" })
	.inputValidator((params: FetchPostParams) => params)
	.handler(async (input) => {
		const { repo, branch, path } = input.data;
		const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

		const headers: Record<string, string> = {
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "TanStack-Start-App",
		};
		if (env.GITHUB_TOKEN) headers.Authorization = `token ${env.GITHUB_TOKEN}`;

		const response = await fetch(url, { headers });

		if (!response.ok) {
			throw new Error(`Failed to fetch contents: ${response.status}`);
		}

		const contents: Array<GitHubContent> = await response.json();

		return contents
			.filter((item) => item.type === "file" && item.name.endsWith(".md"))
			.map((item) => ({
				name: item.name.replace(/\.md$/, ""),
				path: item.path,
			}));
	});
