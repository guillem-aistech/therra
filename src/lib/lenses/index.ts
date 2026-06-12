/* =========================================================================
   Therra — Customer lenses
   -------------------------------------------------------------------------
   Pure data + tiny helpers (no React, no CSS). A lens is a customer-profile
   config that re-skins the workspace: it swaps the roster/marker metric, the
   asset-type filter, the emphasised facet, and the KPI/roster vocabulary so
   one map "talks to" each customer. See docs/MOCK_DATA.md §8 and AGENTS.md
   ("UX architecture — map-first workspace").
   ========================================================================= */

import type { AssetType, Lens, LensId } from '~/lib/types'

/** Every asset type — the insurer lens watches the whole portfolio. */
const ALL_ASSET_TYPES: AssetType[] = [
	'Desalination Plant',
	'LNG Terminal',
	'Oil Refinery',
	'Gas Flare Site',
	'Power Plant',
	'Electrical Substation',
	'Power Line Corridor',
	'Data Center',
	'Port / Logistics Hub',
	'Warehouse / Industrial',
	'Urban District',
	'Wildfire Risk Zone',
	'Solar Farm',
	'Pipeline Segment',
]

/** One config per lens id (docs/MOCK_DATA.md §8). */
export const LENSES: Record<LensId, Lens> = {
	'infra-operator': {
		id: 'infra-operator',
		label: 'Infrastructure Operator',
		tagline: 'For operators keeping critical infrastructure running.',
		metric: 'operational_load_pct',
		metricLabel: 'Operational load',
		metricUnit: '%',
		assetTypes: ALL_ASSET_TYPES,
		emphasisFacet: 'operations',
		vocabulary: {
			roster: 'Assets',
			kpi: 'Operational status',
		},
	},
	insurer: {
		id: 'insurer',
		label: 'Insurer / Underwriter',
		tagline: 'For underwriters pricing and monitoring insured exposure.',
		metric: 'insurance_exposure_eur',
		metricLabel: 'Insured exposure',
		metricUnit: '€',
		assetTypes: ALL_ASSET_TYPES,
		emphasisFacet: 'insurance',
		vocabulary: {
			roster: 'Exposures',
			kpi: 'Portfolio risk',
		},
	},
	'energy-gas': {
		id: 'energy-gas',
		label: 'Energy & Gas',
		tagline: 'For energy operators tracking refining, LNG and flaring.',
		metric: 'flare_intensity_mw',
		metricLabel: 'Flare intensity',
		metricUnit: 'MW',
		assetTypes: [
			'Oil Refinery',
			'LNG Terminal',
			'Gas Flare Site',
			'Pipeline Segment',
		],
		emphasisFacet: 'operations',
		vocabulary: {
			roster: 'Facilities',
			kpi: 'Throughput status',
		},
	},
	'water-desalination': {
		id: 'water-desalination',
		label: 'Water / Desalination',
		tagline: 'For water utilities watching desalination capacity.',
		metric: 'capacity_utilization_pct',
		metricLabel: 'Capacity utilization',
		metricUnit: '%',
		assetTypes: ['Desalination Plant'],
		emphasisFacet: 'operations',
		vocabulary: {
			roster: 'Plants',
			kpi: 'Capacity status',
		},
	},
	'grid-operator': {
		id: 'grid-operator',
		label: 'Grid Operator',
		tagline: 'For grid operators balancing generation and load.',
		metric: 'capacity_utilization_pct',
		metricLabel: 'Load utilization',
		metricUnit: '%',
		assetTypes: [
			'Power Plant',
			'Electrical Substation',
			'Power Line Corridor',
			'Solar Farm',
		],
		emphasisFacet: 'operations',
		vocabulary: {
			roster: 'Grid assets',
			kpi: 'Load status',
		},
	},
	'climate-civil': {
		id: 'climate-civil',
		label: 'Climate / Civil Protection',
		tagline: 'For civil-protection teams tracking climate hazards.',
		metric: 'hazard_proximity_score',
		metricLabel: 'Hazard proximity',
		metricUnit: 'score',
		assetTypes: ['Wildfire Risk Zone', 'Urban District'],
		emphasisFacet: 'risk',
		vocabulary: {
			roster: 'Hazard zones',
			kpi: 'Hazard status',
		},
	},
}

/** The lenses in canonical order (infra-operator first). */
export const LENS_LIST: Lens[] = [
	LENSES['infra-operator'],
	LENSES.insurer,
	LENSES['energy-gas'],
	LENSES['water-desalination'],
	LENSES['grid-operator'],
	LENSES['climate-civil'],
]

/** The lens the workspace boots into. */
export const DEFAULT_LENS_ID: LensId = 'infra-operator'

/** Look up a lens config by id. */
export function getLens(id: LensId): Lens {
	return LENSES[id]
}

/** Narrow an arbitrary string to a known lens id. */
export function isLensId(v: string): v is LensId {
	return Object.hasOwn(LENSES, v)
}
