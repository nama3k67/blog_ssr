export const en = {
	navbar: {
		home: "Home",
		projects: "Projects",
		blogs: "Blogs",
		about: "About",
	},
	userMenu: {
		userInfo: "User Info",
		blogCreate: "Create a post",
		login: "Login",
		logout: "Logout",
	},
	theme: {
		switchToDark: "Switch to dark mode",
		switchToLight: "Switch to light mode",
		light: "Light",
		dark: "Dark",
	},
	i18n: {
		vi: "Vietnamese",
		en: "English",
	},
	pages: {
		home: {
			title: "Home - Nutrition, Training & Technology Blog",
			description:
				"A passionate long-distance runner sharing knowledge about nutrition, training methods, and technology.",
			heading: "Index Route",
			signedIn: "You are signed in",
			signedOut: "You are signed out",
		},
		about: {
			title: "About - Long-Distance Runner & Tech Enthusiast",
			description:
				"Learn about my journey as a long-distance runner and my passion for nutrition, training, and technology.",
			heading: "About",
		},
		projects: {
			title: "Projects - Portfolio & Work Samples",
			description:
				"Explore my projects and portfolio showcasing my work in technology and web development.",
			heading: "Projects",
		},
		posts: {
			title: "Blog - Articles on Nutrition, Training & Technology",
			description:
				"Read articles about running nutrition, training methods, and technology insights from a passionate long-distance runner.",
			ogDescription:
				"Read articles about running nutrition, training methods, and technology insights.",
			heading: "Blogs about sport, health, and technology",
			intro:
				"As a passionate long-distance runner, I want to share my knowledge about nutrition, training methods, and technology",
			noPostsFound: "No posts found.",
		},
	},
	common: {
		readMore: "Read more",
		loading: "Loading...",
		error: "An error occurred",
		login: "Login",
		newPost: "New Post",
		previous: "Previous",
		next: "Next",
		cancel: "Cancel",
		save: "Save",
		delete: "Delete",
		edit: "Edit",
		submit: "Submit",
		approve: "Approve",
		reject: "Reject",
	},
	editor: {
		title: "Title",
		titlePlaceholder: "Enter post title...",
		slug: "Slug (URL)",
		slugPlaceholder: "auto-generated-from-title",
		description: "Description",
		descriptionPlaceholder: "A short summary of the post...",
		content: "Content",
		contentPlaceholder: "Write your post in Markdown...",
		language: "Language",
		saveDraft: "Save Draft",
		publish: "Publish",
		saving: "Saving...",
		publishing: "Publishing...",
		draftSaved: "Draft saved successfully!",
		published: "Post published successfully!",
		errorSaving: "Failed to save post. Please try again.",
		slugTaken: "This slug is already taken for this language.",
		titleRequired: "Title is required.",
		contentRequired: "Content is required.",
		preview: "Preview",
		write: "Write",
		uploading: "Uploading...",
		uploadFailed: "Failed to upload image. Please try again.",
		uploadImage: "Upload image",
		dragDropOrPaste: "Drag & drop, paste, or click to upload images",
		maxFileSize: "Max file size: 5MB",
		fileTooLarge: "File is too large. Maximum size is 5MB.",
	},
};
export type EnDict = typeof en;
