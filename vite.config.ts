import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // Resolve the `~/*` path alias from tsconfig.json.
    tsconfigPaths(),
    tanstackStart(),
    // Netlify official-partner plugin: configures the build for Netlify and
    // emulates the Netlify platform in local dev.
    netlify(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
})
