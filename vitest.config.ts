import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Standalone Vitest config — intentionally does NOT load the TanStack Start or
// Netlify Vite plugins, which wire SSR/build concerns irrelevant (and harmful)
// to unit tests. Only React + the `~/` alias are needed here.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'~': new URL('./src', import.meta.url).pathname,
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		// Force a deterministic env so component tests don't depend on a local
		// `.env`. Components read VITE_-prefixed vars at module load.
		env: {
			VITE_MAPBOX_ACCESS_TOKEN: '',
		},
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
	},
})
