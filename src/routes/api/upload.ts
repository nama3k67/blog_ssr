import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";

import { isAdmin } from "~/env";
import { uploadToR2 } from "~/server/r2/client";

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
];

const MIME_TO_EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
	"image/avif": "avif",
};

const MAX_FILE_SIZE = 500_000; // 500 KB (500,000 bytes)

function validateMagicBytes(
	buffer: ArrayBuffer,
	declaredType: string,
): boolean {
	const bytes = new Uint8Array(buffer.slice(0, 12));
	switch (declaredType) {
		case "image/jpeg":
			return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
		case "image/png":
			return (
				bytes[0] === 0x89 &&
				bytes[1] === 0x50 &&
				bytes[2] === 0x4e &&
				bytes[3] === 0x47 &&
				bytes[4] === 0x0d &&
				bytes[5] === 0x0a &&
				bytes[6] === 0x1a &&
				bytes[7] === 0x0a
			);
		case "image/gif":
			// GIF87a: 47 49 46 38 37 61 | GIF89a: 47 49 46 38 39 61
			return (
				bytes[0] === 0x47 &&
				bytes[1] === 0x49 &&
				bytes[2] === 0x46 &&
				bytes[3] === 0x38 &&
				(bytes[4] === 0x37 || bytes[4] === 0x39) &&
				bytes[5] === 0x61
			);
		case "image/webp":
			return (
				bytes[0] === 0x52 &&
				bytes[1] === 0x49 &&
				bytes[2] === 0x46 &&
				bytes[3] === 0x46 &&
				bytes[8] === 0x57 &&
				bytes[9] === 0x45 &&
				bytes[10] === 0x42 &&
				bytes[11] === 0x50
			);
		case "image/avif": {
			// ISO BMFF: bytes 4-7 = "ftyp", bytes 8-11 = brand
			const isFtyp =
				bytes[4] === 0x66 &&
				bytes[5] === 0x74 &&
				bytes[6] === 0x79 &&
				bytes[7] === 0x70;
			if (!isFtyp) return false;
			const brand = String.fromCharCode(
				bytes[8],
				bytes[9],
				bytes[10],
				bytes[11],
			);
			return brand === "avif" || brand === "avis" || brand === "mif1";
		}
		default:
			return false;
	}
}

function getImageWidth(buffer: ArrayBuffer, mimeType: string): number | null {
	try {
		const view = new DataView(buffer);
		switch (mimeType) {
			case "image/png":
				return view.getUint32(16, false);
			case "image/gif":
				return view.getUint16(6, true);
			case "image/jpeg": {
				let offset = 2;
				while (offset < buffer.byteLength - 9) {
					if (view.getUint8(offset) !== 0xff) break;
					const marker = view.getUint8(offset + 1);
					if (marker >= 0xc0 && marker <= 0xc3) {
						return view.getUint16(offset + 7, false);
					}
					const segLen = view.getUint16(offset + 2, false);
					if (segLen < 2) return null;
					offset += 2 + segLen;
				}
				return null;
			}
			case "image/webp": {
				const chunkFCC = String.fromCharCode(
					view.getUint8(12),
					view.getUint8(13),
					view.getUint8(14),
					view.getUint8(15),
				);
				if (chunkFCC === "VP8 ") {
					return (view.getUint16(26, true) & 0x3fff) + 1;
				}
				if (chunkFCC === "VP8L") {
					// VP8L chunk data starts at offset 20 (12-byte RIFF header + 4 FCC + 4 size).
					// Byte 20 is the 0x2f signature; width−1 is in bits 8–21 of the LE uint32 at 20.
					const bits = view.getUint32(20, true);
					return ((bits >> 8) & 0x3fff) + 1;
				}
				if (chunkFCC === "VP8X") {
					// Extended: canvas width−1 is a 24-bit LE value at chunk data offset 4–6
					// (file offset 24–26). Reconstruct via uint16 + uint8.
					const lo = view.getUint16(24, true);
					const hi = view.getUint8(26);
					return (lo | (hi << 16)) + 1;
				}
				return null;
			}
			case "image/avif":
				// AVIF width requires full ISO Base Media file format box traversal.
				// Width check is approximated by the 500KB size limit for this type.
				return null;
			default:
				return null;
		}
	} catch {
		return null;
	}
}

function generateKey(mimeType: string, userId: string): string {
	const ext = MIME_TO_EXT[mimeType] || "bin";
	return `uploads/${userId}/${crypto.randomUUID()}.${ext}`;
}

export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					// Authenticate + authorize: image uploads are admin-only
					const { userId } = await auth();
					if (!userId) {
						return Response.json({ error: "Unauthorized" }, { status: 401 });
					}
					if (!isAdmin(userId)) {
						return Response.json({ error: "Forbidden" }, { status: 403 });
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
						return Response.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
					}

					// Read buffer
					const buffer = await file.arrayBuffer();

					// Validate magic bytes
					if (!validateMagicBytes(buffer, file.type)) {
						return Response.json(
							{ error: "INVALID_FILE_TYPE" },
							{ status: 400 },
						);
					}

					// Validate image width
					const imageWidth = getImageWidth(buffer, file.type);
					if (imageWidth !== null && imageWidth > 2000) {
						return Response.json({ error: "IMAGE_TOO_WIDE" }, { status: 400 });
					}

					// Generate unique key
					const key = generateKey(file.type, userId);

					// Upload to R2
					const url = await uploadToR2(buffer, key, file.type);

					return Response.json({ url, key, size: file.size });
				} catch (err) {
					console.error("[Upload] Error:", err);
					return Response.json(
						{
							error: err instanceof Error ? err.message : "Upload failed",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
