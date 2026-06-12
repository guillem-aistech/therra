/* =========================================================================
   Therra — Mapbox paint/filter expressions (the lens re-ramp)
   -------------------------------------------------------------------------
   Pure expression builders. The lens re-ramp is implemented by feeding new
   results of these into setPaintProperty / setLayoutProperty / setFilter —
   never setData, setStyle, or a camera move (AGENTS.md → Map implementation).
   Status colour is always driven by ['get','status'], so it survives every
   lens switch. Mapbox expressions are nested arrays that don't map cleanly to
   the strict ExpressionSpecification tuple types, so each builder casts via
   `unknown` at the boundary (the shapes are validated by Mapbox at runtime).
   ========================================================================= */

import type { ExpressionSpecification } from 'mapbox-gl'

import type { Lens, Status } from '~/lib/types'

export type StatusColors = Record<Status, string>

const cast = (e: unknown): ExpressionSpecification =>
	e as ExpressionSpecification

/** Marker colour from the four status bands. */
export function colorExpression(c: StatusColors): ExpressionSpecification {
	return cast([
		'match',
		['get', 'status'],
		'Normal',
		c.Normal,
		'Watch',
		c.Watch,
		'Warning',
		c.Warning,
		'Critical',
		c.Critical,
		c.Normal,
	])
}

/** Normalize the lens's chosen metric to 0–1 for radius scaling. */
function metricNorm(lens: Lens): unknown {
	switch (lens.metric) {
		case 'insurance_exposure_eur':
			return ['min', 1, ['/', ['get', 'insurance_exposure_eur'], 2_000_000_000]]
		case 'flare_intensity_mw':
			return [
				'min',
				1,
				['/', ['coalesce', ['get', 'flare_intensity_mw'], 0], 60],
			]
		case 'hazard_proximity_score':
			return ['/', ['get', 'hazard_proximity_score'], 100]
		case 'capacity_utilization_pct':
			return ['/', ['get', 'capacity_utilization_pct'], 100]
		default:
			return ['/', ['get', 'operational_load_pct'], 100]
	}
}

/** Circle radius = zoom curve × (floor + lens-metric weight). The zoom
    interpolate must stay top-level, so the per-feature factor scales each
    stop's output rather than wrapping the interpolate. The floor keeps even
    low-metric markers glanceable at low zoom. */
export function radiusExpression(lens: Lens): ExpressionSpecification {
	const factor = ['+', 0.7, ['*', 0.85, metricNorm(lens)]]
	return cast([
		'interpolate',
		['linear'],
		['zoom'],
		2,
		['*', 3.4, factor],
		5,
		['*', 4.6, factor],
		9,
		['*', 8, factor],
		13,
		['*', 14, factor],
	])
}

/** Line width for corridor/pipeline assets, scaled by the lens metric. */
export function lineWidthExpression(lens: Lens): ExpressionSpecification {
	const factor = ['+', 0.7, ['*', 0.8, metricNorm(lens)]]
	return cast([
		'interpolate',
		['linear'],
		['zoom'],
		4,
		['*', 2, factor],
		9,
		['*', 4, factor],
		13,
		['*', 7, factor],
	])
}

/** Type filter for a lens (null = show all 14 types). Combined with a
    geometry-type guard per layer by the caller. */
export function lensTypeFilter(lens: Lens): ExpressionSpecification | null {
	if (lens.assetTypes.length >= 14) return null
	return cast(['match', ['get', 'type'], lens.assetTypes, true, false])
}

/** Combine an optional type filter with a required geometry type. */
export function layerFilter(
	geometry: 'Point' | 'LineString' | 'Polygon',
	typeFilter: ExpressionSpecification | null,
): ExpressionSpecification {
	const geom = ['==', ['geometry-type'], geometry]
	return cast(typeFilter ? ['all', geom, typeFilter] : geom)
}

/** Selection/hover ring colour via feature-state (survives lens re-ramp).
    Unselected markers keep a faint dark halo so they separate from the
    basemap. */
export function strokeColorExpression(accent: string): ExpressionSpecification {
	return cast([
		'case',
		['boolean', ['feature-state', 'selected'], false],
		accent,
		['boolean', ['feature-state', 'hover'], false],
		accent,
		'rgba(5,8,13,0.65)',
	])
}

/** Selection ring is thicker than hover ring; all markers keep a thin halo. */
export function strokeWidthExpression(): ExpressionSpecification {
	return cast([
		'case',
		['boolean', ['feature-state', 'selected'], false],
		3.5,
		['boolean', ['feature-state', 'hover'], false],
		2,
		1.2,
	])
}
