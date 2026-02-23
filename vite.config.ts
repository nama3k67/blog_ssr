import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart(),
		viteReact(),
		tailwindcss(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
	],
	resolve: {
		alias: [
			{ find: "pg-native", replacement: "./pg-native-stub.js" },
			// See https://github.com/TanStack/router/issues/5738
			{ find: "use-sync-external-store/shim/index.js", replacement: "react" },
		],
	},
});
