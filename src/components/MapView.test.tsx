import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MapView } from '~/components/MapView'

// vitest.config.ts forces VITE_MAPBOX_ACCESS_TOKEN to '' for the test run, so
// this exercises the graceful-degradation path documented in AGENTS.md: with no
// token, MapView renders a placeholder instead of booting mapbox-gl (which would
// need WebGL, unavailable in jsdom).
describe('MapView', () => {
	it('renders the missing-token placeholder when no token is set', () => {
		render(<MapView />)

		const placeholder = screen.getByTestId('map-missing-token')
		expect(placeholder).toBeInTheDocument()
		expect(placeholder).toHaveTextContent('Map unavailable.')
		expect(screen.queryByTestId('map')).not.toBeInTheDocument()
	})
})
