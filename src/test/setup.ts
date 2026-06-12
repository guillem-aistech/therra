// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and auto-cleans the DOM between tests. Loaded via `setupFiles` in
// vitest.config.ts, so it runs once before every test file.
import '@testing-library/jest-dom/vitest'
