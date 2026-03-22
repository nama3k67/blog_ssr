import { AwsClient } from "aws4fetch";

import { env } from "~/env";

let r2Client: AwsClient | null = null;

function getR2Client(): AwsClient {
	if (r2Client) return r2Client;

	const accessKeyId = env.R2_ACCESS_KEY_ID;
	const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

	if (!accessKeyId || !secretAccessKey) {
		throw new Error(
			"R2 credentials not configured. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.",
		);
	}

	r2Client = new AwsClient({
		accessKeyId,
		secretAccessKey,
		service: "s3",
		region: "auto",
	});

	return r2Client;
}

function getR2Endpoint(): string {
	const accountId = env.R2_ACCOUNT_ID;
	if (!accountId) {
		throw new Error("R2_ACCOUNT_ID is not configured.");
	}
	return `https://${accountId}.r2.cloudflarestorage.com`;
}

function getBucketName(): string {
	return env.R2_BUCKET_NAME || "blog-images";
}

/**
 * Upload a file to R2.
 * Returns the public URL of the uploaded object.
 */
export async function uploadToR2(
	file: ArrayBuffer,
	key: string,
	contentType: string,
): Promise<string> {
	const client = getR2Client();
	const endpoint = getR2Endpoint();
	const bucket = getBucketName();

	const url = `${endpoint}/${bucket}/${key}`;

	const response = await client.fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": contentType,
		},
		body: file,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`R2 upload failed (${response.status}): ${text}`);
	}

	// Return public URL
	const publicUrl = env.R2_PUBLIC_URL;
	if (publicUrl) {
		return `${publicUrl}/${key}`;
	}

	// Fallback: return the S3 endpoint URL (not publicly accessible without custom domain)
	return url;
}

/**
 * Delete an object from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
	const client = getR2Client();
	const endpoint = getR2Endpoint();
	const bucket = getBucketName();

	const url = `${endpoint}/${bucket}/${key}`;

	const response = await client.fetch(url, {
		method: "DELETE",
	});

	if (!response.ok && response.status !== 404) {
		const text = await response.text();
		throw new Error(`R2 delete failed (${response.status}): ${text}`);
	}
}
