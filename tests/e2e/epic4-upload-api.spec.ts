import { expect, test } from "../support/fixtures";

/**
 * Epic 4 — Image upload API (Story 4.3)
 *
 * The /api/upload endpoint requires admin authentication and validates
 * file type, size, and image dimensions. These tests verify the
 * unauthenticated/invalid-input behavior.
 */

test.describe("Image upload API (Story 4.3)", () => {
	test("POST /api/upload without auth returns a non-2xx response", async ({
		request,
	}) => {
		// Given an unauthenticated request
		const response = await request.post("/api/upload", {
			multipart: {
				// Minimal form data — no real file content
				file: {
					name: "test.png",
					mimeType: "image/png",
					buffer: Buffer.from("not-a-real-image"),
				},
			},
		});

		// Then the endpoint rejects the request (401 / 403 / 400)
		expect(response.ok()).toBe(false);
		expect(response.status()).toBeLessThan(500);
	});

	test("POST /api/upload with no body returns a non-2xx response", async ({
		request,
	}) => {
		// Given a request with no form data at all
		const response = await request.post("/api/upload");

		// Then the endpoint returns an error
		expect(response.ok()).toBe(false);
	});

	test("POST /api/upload with wrong content type returns error", async ({
		request,
	}) => {
		// Given a request with JSON body instead of multipart
		const response = await request.post("/api/upload", {
			headers: { "Content-Type": "application/json" },
			data: JSON.stringify({ file: "data" }),
		});

		expect(response.ok()).toBe(false);
	});
});
