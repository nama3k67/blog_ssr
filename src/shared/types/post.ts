export type GitHubContent = {
	name: string;
	path: string;
	type: "file" | "dir";
};

export type FetchPostParams = {
	repo: string;
	branch: string;
	path: string;
};
