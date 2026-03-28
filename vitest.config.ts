import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		include: ["tests/unit/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.ts", "src/**/*.tsx"],
			exclude: ["src/**/*.d.ts", "src/routes/**"],
		},
	},
});
