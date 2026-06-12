/* =========================================================================
   Therra — EO source / provenance catalog
   -------------------------------------------------------------------------
   Real public missions (approx specs) cited per observation and on the Data
   facet / report provenance panel. The demo presents a near-daily composite
   synthesized from these, which justifies the cadence AND the honest Phase 0
   limits (docs/MOCK_DATA.md §9).
   ========================================================================= */

import type { EOSource } from '../types'

export const EO_SOURCES: EOSource[] = [
	{
		id: 'landsat',
		name: 'Landsat 8/9 TIRS',
		thermal_resolution: '~100 m (delivered 30 m)',
		revisit: '~8 d combined',
		notes: 'Thermal infrared bands 10/11; multi-day delivery latency.',
	},
	{
		id: 'sentinel-3',
		name: 'Sentinel-3 SLSTR',
		thermal_resolution: '~1 km',
		revisit: '~1 d',
		notes: 'Operational land-surface-temperature product.',
	},
	{
		id: 'modis',
		name: 'MODIS (Terra/Aqua)',
		thermal_resolution: '~1 km',
		revisit: '1–2 / day',
		notes: 'MOD11/MYD11 land-surface-temperature product.',
	},
	{
		id: 'viirs',
		name: 'VIIRS (S-NPP/NOAA-20)',
		thermal_resolution: '375 m / 750 m',
		revisit: '~daily',
		notes: 'Active-fire detection (thermal hotspots).',
	},
	{
		id: 'ecostress',
		name: 'ECOSTRESS (ISS)',
		thermal_resolution: '~70 m',
		revisit: 'irregular',
		notes: 'High-resolution LST acquired opportunistically from the ISS.',
	},
]

export function getSource(id: EOSource['id']): EOSource {
	const s = EO_SOURCES.find(x => x.id === id)
	if (!s) throw new Error(`Unknown EO source: ${id}`)
	return s
}

/** Honest Phase 0 limitations copy — sells the dedicated-satellite roadmap. */
export const PHASE0_LIMITATIONS = [
	'Public Earth-observation only — no tasking and no guaranteed revisit.',
	'Revisit is limited and irregular; clear-sky passes can be days apart.',
	'Resolution is coarse (mostly ~1 km; best ~70 m), so a single small asset is often a mixed pixel.',
	'Cloud cover causes data gaps and lower-confidence passes.',
	'Cross-sensor thermal calibration varies between missions.',
] as const

/** What Therra's dedicated constellation improves — the bridge to the pitch. */
export const THERRA_IMPROVEMENTS = [
	'Daily / sub-daily revisit with tasking on demand.',
	'10–30 m thermal resolution — individual assets, not mixed pixels.',
	'Night thermal imaging for 24/7 operational signatures.',
	'Radiometric stability and near-real-time latency.',
] as const
