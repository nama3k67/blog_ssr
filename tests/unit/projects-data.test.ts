import { describe, expect, it } from "vitest";
import { PROJECTS } from "../../src/shared/data/projects";

describe("Projects static data", () => {
	it("has at least one project", () => {
		expect(PROJECTS.length).toBeGreaterThan(0);
	});

	it("every project has required fields", () => {
		for (const project of PROJECTS) {
			expect(project.id, "Missing id").toBeTruthy();
			expect(project.title.en, `Missing en title in ${project.id}`).toBeTruthy();
			expect(project.title.vi, `Missing vi title in ${project.id}`).toBeTruthy();
			expect(project.description.en, `Missing en description in ${project.id}`).toBeTruthy();
			expect(project.description.vi, `Missing vi description in ${project.id}`).toBeTruthy();
			expect(Array.isArray(project.tags), `tags must be array in ${project.id}`).toBe(true);
		}
	});

	it("project ids are unique", () => {
		const ids = PROJECTS.map((p) => p.id);
		const unique = new Set(ids);
		expect(unique.size).toBe(ids.length);
	});

	it("when githubUrl is present it is a valid URL", () => {
		for (const project of PROJECTS) {
			if (project.githubUrl) {
				expect(
					() => new URL(project.githubUrl as string),
					`Invalid githubUrl in ${project.id}`,
				).not.toThrow();
			}
		}
	});
});
