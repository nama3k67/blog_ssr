import { describe, expect, it } from "vitest";
import { trackCtaClickFn } from "../../src/shared/services/analytics";

describe("Analytics service (Story 5.3)", () => {
	it("exports trackCtaClickFn as a callable server function", () => {
		// trackCtaClickFn is created by createServerFn and should be callable
		expect(trackCtaClickFn).toBeDefined();
		expect(typeof trackCtaClickFn).toBe("function");
	});

	it("trackCtaClickFn is imported from analytics.ts without errors", () => {
		// Simple import test - ensures module is syntactically valid
		// and the server function is exported correctly
		const analyticsModule = { trackCtaClickFn };
		expect(analyticsModule.trackCtaClickFn).toBeDefined();
	});
});
