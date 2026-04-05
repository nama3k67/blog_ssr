const CLIENT_ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
]);

export function isImageFile(file: File): boolean {
	return CLIENT_ALLOWED_TYPES.has(file.type);
}

export type UploadProgress = {
	status: "idle" | "uploading" | "success" | "error";
	progress?: number;
	url?: string;
	error?: string;
};

/**
 * Upload an image file to the server.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		const message =
			data && typeof data === "object" && "error" in data
				? (data as { error: string }).error
				: `Upload failed (${response.status})`;
		throw new Error(message);
	}

	const data = (await response.json()) as {
		url: string;
		key: string;
		size: number;
	};
	return data.url;
}

/**
 * Insert a markdown image tag at the cursor position in a textarea,
 * or append to the end of the current value.
 */
export function insertImageMarkdown(
	currentValue: string,
	imageUrl: string,
	altText = "image",
): string {
	const imageTag = `![${altText}](${imageUrl})`;
	// Append on a new line
	if (currentValue && !currentValue.endsWith("\n")) {
		return `${currentValue}\n${imageTag}\n`;
	}
	return `${currentValue}${imageTag}\n`;
}

/**
 * Extract files from a paste or drop event that are images.
 */
export function extractImageFiles(dataTransfer: DataTransfer | null): File[] {
	if (!dataTransfer) return [];

	const files: File[] = [];
	for (let i = 0; i < dataTransfer.files.length; i++) {
		const file = dataTransfer.files[i];
		if (file && isImageFile(file)) {
			files.push(file);
		}
	}
	return files;
}
