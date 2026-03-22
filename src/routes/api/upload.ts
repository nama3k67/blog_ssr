import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";

import { uploadToR2 } from "~/server/r2/client";

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function generateKey(filename: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const ext = filename.split(".").pop()?.toLowerCase() || "png";
	const safeName = filename
		.replace(/\.[^/.]+$/, "") // remove extension
		.replace(/[^a-zA-Z0-9-_]/g, "-") // sanitize
		.replace(/-+/g, "-") // collapse dashes
		.substring(0, 50); // limit length

	return `posts/${timestamp}-${random}-${safeName}.${ext}`;
}

export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					// Authenticate
					const { userId } = await auth();
					if (!userId) {
						return Response.json(
							{ error: "Unauthorized" },
							{ status: 401 },
						);
					}

					// Parse multipart form data
					const formData = await request.formData();
					const file = formData.get("file");

					if (!file || !(file instanceof File)) {
						return Response.json(
							{ error: "No file provided" },
							{ status: 400 },
						);
					}

					// Validate file type
					if (!ALLOWED_TYPES.includes(file.type)) {
						return Response.json(
							{
								error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
							},
							{ status: 400 },
						);
					}

					// Validate file size
					if (file.size > MAX_FILE_SIZE) {
						return Response.json(
							{
								error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
							},
							{ status: 400 },
						);
					}

					// Generate unique key
					const key = generateKey(file.name);

					// Upload to R2
					const buffer = await file.arrayBuffer();
					const url = await uploadToR2(buffer, key, file.type);

					return Response.json({ url, key });
				} catch (err) {
					console.error("[Upload] Error:", err);
					return Response.json(
						{
							error:
								err instanceof Error
									? err.message
									: "Upload failed",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
