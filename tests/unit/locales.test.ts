import { describe, expect, it } from "vitest";
import { en } from "../../src/locales/en";
import { vi } from "../../src/locales/vi";

/**
 * Recursively collects all dot-notation keys from a nested object.
 */
function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
	return Object.entries(obj).flatMap(([key, value]) => {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			return collectKeys(value as Record<string, unknown>, fullKey);
		}
		return [fullKey];
	});
}

describe("Locale completeness", () => {
	const enKeys = collectKeys(en as unknown as Record<string, unknown>);
	const viKeys = collectKeys(vi as unknown as Record<string, unknown>);

	it("en.ts and vi.ts have identical key sets", () => {
		const missingInVi = enKeys.filter((k) => !viKeys.includes(k));
		const missingInEn = viKeys.filter((k) => !enKeys.includes(k));

		expect(missingInVi, `Keys in en but missing in vi: ${missingInVi.join(", ")}`).toHaveLength(0);
		expect(missingInEn, `Keys in vi but missing in en: ${missingInEn.join(", ")}`).toHaveLength(0);
	});

	it("no locale value is an empty string", () => {
		const emptyInEn = enKeys.filter((k) => {
			const parts = k.split(".");
			// biome-ignore lint/suspicious/noExplicitAny: traversing typed locale
			let val: any = en;
			for (const p of parts) val = val?.[p];
			return val === "";
		});

		expect(emptyInEn, `Empty strings in en: ${emptyInEn.join(", ")}`).toHaveLength(0);
	});
});
