/* =========================================================================
   Therra — Status token helpers (primitives)
   -------------------------------------------------------------------------
   Maps a domain `Status` to its `--status-*` CSS custom-property suffix and,
   on the client, reads the resolved color string (recharts/SVG need concrete
   colors, not `var()`). All guarded for SSR.
   ========================================================================= */

import type { Status } from '~/lib/types'

/** Lowercase token suffix for a status (`'Normal'` → `'normal'`). */
export type StatusKey = 'normal' | 'watch' | 'warning' | 'critical'

export function statusKey(status: Status): StatusKey {
	switch (status) {
		case 'Normal':
			return 'normal'
		case 'Watch':
			return 'watch'
		case 'Warning':
			return 'warning'
		case 'Critical':
			return 'critical'
	}
}

/** Hard fallbacks (dark scheme) used during SSR / before hydration. */
const FALLBACK: Record<string, string> = {
	'--status-normal': '#5cd99a',
	'--status-watch': '#7fc0ff',
	'--status-warning': '#ff9d5c',
	'--status-critical': '#ff7d82',
	'--color-primary': '#ffba38',
	'--color-outline': '#9b8f80',
	'--color-on-surface': '#eae1d9',
	'--color-on-surface-variant': '#d2c4b4',
	'--color-surface-container-high': '#2d2924',
	'--color-outline-variant': '#4e4539',
}

/**
 * Resolve a CSS custom property to a concrete color string. Reads the live
 * computed value on the client; returns a sensible dark-scheme fallback under
 * SSR or when the property is unset.
 */
export function readCssVar(name: string): string {
	if (typeof window !== 'undefined') {
		const v = getComputedStyle(document.documentElement)
			.getPropertyValue(name)
			.trim()
		if (v) return v
	}
	return FALLBACK[name] ?? 'currentColor'
}

/** Resolve the line/stroke color for a status (fallback to amber primary). */
export function statusColor(status?: Status): string {
	if (!status) return readCssVar('--color-primary')
	return readCssVar(`--status-${statusKey(status)}`)
}
