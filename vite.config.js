import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This is required for Vite to work correctly with CodeSandbox
const server = process.env.APP_ENV === "sandbox" ? { hmr: { clientPort: 443 } } : {};

// https://vitejs.dev/config/
export default defineConfig({
  server: server,
  resolve: {
    alias: {
      "@src": resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), import("vite-plugin-glsl").then(glsl => glsl.default({
		include: [                   // Glob pattern, or array of glob patterns to import
			'**/*.glsl', '**/*.wgsl',
			'**/*.vert', '**/*.frag',
			'**/*.vs', '**/*.fs'
		],
		exclude: undefined,          // Glob pattern, or array of glob patterns to ignore
		warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
		defaultExtension: 'glsl',    // Shader suffix when no extension is specified
		compress: true,              // Compress output shader code
		watch: true,                 // Recompile shader on change
		root: '/src/shaders/' 			 // Root directory to resolve imports from
	}))],
});
