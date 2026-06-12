/* =========================================================================
   Therra — Domain types
   -------------------------------------------------------------------------
   The single vocabulary shared by the mock-data layer, analytics, the map,
   and the UI. Every score/status/alert ultimately derives from an asset's
   ThermalObservation[] via the analytics in `~/lib/analytics` — see
   docs/MOCK_DATA.md for the believability contract.
   ========================================================================= */

/** The 14 monitored asset classes (docs/MOCK_DATA.md §5/§7). */
export type AssetType =
	| 'Desalination Plant'
	| 'LNG Terminal'
	| 'Oil Refinery'
	| 'Gas Flare Site'
	| 'Power Plant'
	| 'Electrical Substation'
	| 'Power Line Corridor'
	| 'Data Center'
	| 'Port / Logistics Hub'
	| 'Warehouse / Industrial'
	| 'Urban District'
	| 'Wildfire Risk Zone'
	| 'Solar Farm'
	| 'Pipeline Segment'

/** Operational status — the four mutually-distinct map/roster bands. */
export type Status = 'Normal' | 'Watch' | 'Warning' | 'Critical'

/** How strategically important an asset is (weights into risk). */
export type Criticality = 'Low' | 'Medium' | 'High' | 'Strategic'

/** Alert severity. */
export type Severity = 'Info' | 'Watch' | 'Warning' | 'Critical'

/** Alert vocabulary (docs/MOCK_DATA.md §7). An alert type must be valid for
    the asset type it is raised on. */
export type AlertType =
	| 'thermal spike'
	| 'thermal drop'
	| 'persistent overheating'
	| 'fire hotspot'
	| 'gas-flare increase'
	| 'cooling-discharge anomaly'
	| 'power-line overheating'
	| 'substation overheating'
	| 'urban heat stress'
	| 'abnormal night activity'
	| 'post-disaster damage signal'

export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved'

/** The anomaly shape injected into the recent window of the series. */
export type Scenario =
	| 'normal'
	| 'spike'
	| 'ramp'
	| 'drop'
	| 'flare'
	| 'plume'
	| 'volatility'

/** Detail facet tabs in the selection slide-over. */
export type Facet = 'thermal' | 'risk' | 'insurance' | 'operations' | 'data'

/** Customer-profile lenses that re-skin the workspace. */
export type LensId =
	| 'infra-operator'
	| 'insurer'
	| 'energy-gas'
	| 'water-desalination'
	| 'grid-operator'
	| 'climate-civil'

/** Geometry kind backing an asset on the map. */
export type AssetGeometryKind = 'point' | 'line' | 'zone'

/** A single Earth-observation pass for an asset (docs/MOCK_DATA.md §4). */
export interface ThermalObservation {
	id: string
	asset_id: string
	/** ISO date (UTC midnight) of the observation. */
	timestamp: string
	/** EO mission this composite sample is attributed to. */
	source: EOSourceId
	land_surface_temperature_c: number
	brightness_temperature_c: number
	baseline_temperature_c: number
	thermal_delta_c: number
	/** 0–1 normalized anomaly for this observation. */
	anomaly_score: number
	/** 0.4–0.98 measurement confidence. */
	confidence: number
	/** 0–95 percent cloud cover. */
	cloud_cover_percent: number
	notes?: string
}

/** A monitored asset — identity is hand-authored, scores are derived. */
export interface Asset {
	id: string
	name: string
	asset_type: AssetType
	country: string
	region: string
	latitude: number
	longitude: number
	/** Line/polygon geometry for corridors, pipelines, zones, districts.
	    Point assets omit this; the lat/lon is their representative point. */
	geometry_geojson?: GeoJSON.Geometry
	geometry_kind: AssetGeometryKind
	operator: string
	criticality: Criticality
	insurance_exposure_eur: number
	/** Derived from the series (never hand-set). */
	baseline_temperature_c: number
	current_temperature_c: number
	thermal_delta_c: number
	anomaly_score: number
	risk_score: number
	health_score: number
	status: Status
	last_observation_at: string
	tags: string[]
	description: string

	/* Lens metric fields (docs/MOCK_DATA.md §8) — drive radius + roster sort. */
	operational_load_pct: number
	capacity_utilization_pct: number
	flare_intensity_mw?: number
	hazard_proximity_score: number
}

/** A derived, evidenced alert pointing at a real event in the series. */
export interface Alert {
	id: string
	asset_id: string
	alert_type: AlertType
	severity: Severity
	title: string
	description: string
	detected_at: string
	confidence: number
	status: AlertStatus
	suggested_action: string
}

/** A composed risk assessment with a human-readable explanation. */
export interface RiskAssessment {
	id: string
	asset_id: string
	timestamp: string
	dynamic_risk_score: number
	fire_risk_index: number
	business_interruption_risk: number
	catastrophe_exposure_score: number
	thermal_volatility_score: number
	inspection_priority_score: number
	/** The "why" — cites the asset's actual numbers. */
	explanation: string
	recommendations: string[]
}

export type ReportType =
	| 'Infrastructure Health'
	| 'Insurance Risk'
	| 'Thermal Anomaly'
	| 'Urban Heat'
	| 'Wildfire Risk'
	| 'Gas Flare Activity'
	| 'Desalination Thermal Discharge'

export interface Report {
	id: string
	report_type: ReportType
	asset_id?: string
	created_at: string
	title: string
	summary: string
}

/** EO mission identifiers used as observation sources. */
export type EOSourceId =
	| 'landsat'
	| 'sentinel-3'
	| 'modis'
	| 'viirs'
	| 'ecostress'

/** Provenance record for an EO mission (docs/MOCK_DATA.md §9). */
export interface EOSource {
	id: EOSourceId
	name: string
	thermal_resolution: string
	revisit: string
	notes: string
}

/** A customer-profile lens config (pure data; see `~/lib/lenses`). */
export interface Lens {
	id: LensId
	/** Short label for the switcher. */
	label: string
	/** One-line description of who this lens serves. */
	tagline: string
	/** Roster radius/sort metric key on Asset. */
	metric: keyof Asset
	/** Human label + unit for that metric. */
	metricLabel: string
	metricUnit: string
	/** Asset types this lens emphasises (others dim / filter out). */
	assetTypes: AssetType[]
	/** Facet the lens leads with in the slide-over. */
	emphasisFacet: Facet
	/** Vocabulary swaps for KPI/roster copy. */
	vocabulary: {
		roster: string
		kpi: string
	}
}

/** The fully-assembled, deterministic dataset built once at module load. */
export interface Dataset {
	assets: Asset[]
	observations: Record<string, ThermalObservation[]>
	alerts: Alert[]
	riskAssessments: Record<string, RiskAssessment>
	sources: EOSource[]
}
