import { UserConfig, defineConfig } from "vite";
import path from "path";
import builtins from "builtin-modules";
import react from "@vitejs/plugin-react";

export default defineConfig(async ({ mode }) => {
	const { resolve } = path;
	const prod = mode === "production";

	return {
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			lib: {
				entry: resolve(__dirname, "src/main.ts"),
				name: "main",
				fileName: () => "main.js",
				formats: ["cjs"],
			},
			minify: prod,
			sourcemap: prod ? false : "inline",
			outDir: "./",
			// Enable CSS code splitting to better handle scoping
			cssCodeSplit: true,
			css: {
				// Ensure CSS modules for better scoping
				modules: {
					scopeBehaviour: 'local',
				},
			},
			emptyOutDir: false,
			rollupOptions: {
				input: {
					main: resolve(__dirname, "src/main.ts"),
				},
				output: {
					entryFileNames: "main.js",
					assetFileNames: "styles.css",
				},
				external: [
					"obsidian",
					"electron",
					"@codemirror/autocomplete",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/highlight",
					"@lezer/lr",
					...builtins,
				],
			},
		},
	} as UserConfig;
});
