import netlify from '@netlify/vite-plugin-tanstack-start'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		port: 3000,
	},
	// Resolve the `~/*` path alias from tsconfig.json (native to Vite 8+).
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tanstackStart(),
		// Netlify official-partner plugin: configures the build for Netlify and
		// emulates the Netlify platform in local dev.
		netlify(),
		// react's vite plugin must come after start's vite plugin
		viteReact(),
	],
})
