/* =========================================================================
   Therra — Dataset assembly & typed selectors
   -------------------------------------------------------------------------
   Builds the deterministic dataset once at module load. Every asset's
   current/baseline/delta/anomaly/risk/health/status is DERIVED from its
   generated series via the analytics — never hand-set (docs/MOCK_DATA.md).
   ========================================================================= */

import {
	calculateAnomalyScore,
	calculateHealthScore,
	calculateRiskScore,
	calculateThermalVolatility,
	classifyStatus,
} from '../analytics'
import type {
	Alert,
	Asset,
	Dataset,
	RiskAssessment,
	Status,
	ThermalObservation,
} from '../types'
import { deriveAlert } from './alerts'
import { type AssetSeed, CATALOG, lineString, rectPolygon } from './catalog'
import { EO_SOURCES } from './provenance'
import { buildRiskAssessment } from './risk'
import { generateSeries } from './thermal'

function geometryFor(seed: AssetSeed): GeoJSON.Geometry | undefined {
	if (seed.geometry_kind === 'line' && seed.line) return lineString(seed.line)
	if (seed.geometry_kind === 'zone' && seed.zoneHalf)
		return rectPolygon(seed.longitude, seed.latitude, seed.zoneHalf)
	return undefined
}

function buildAsset(seed: AssetSeed): {
	asset: Asset
	observations: ThermalObservation[]
	volatilityC: number
	series: ReturnType<typeof generateSeries>
} {
	const series = generateSeries(seed)
	const anomaly = calculateAnomalyScore(series.deltas)
	const volatilityC = calculateThermalVolatility(series.deltas)
	const riskScore = calculateRiskScore({
		anomalyScore: anomaly,
		criticality: seed.criticality,
		exposureEur: seed.insurance_exposure_eur,
		volatilityC,
		assetType: seed.asset_type,
	})
	const status = classifyStatus(riskScore)
	const health = calculateHealthScore(riskScore, anomaly)

	const asset: Asset = {
		id: seed.id,
		name: seed.name,
		asset_type: seed.asset_type,
		country: seed.country,
		region: seed.region,
		latitude: seed.latitude,
		longitude: seed.longitude,
		geometry_geojson: geometryFor(seed),
		geometry_kind: seed.geometry_kind,
		operator: seed.operator,
		criticality: seed.criticality,
		insurance_exposure_eur: seed.insurance_exposure_eur,
		baseline_temperature_c: series.baseline_temperature_c,
		current_temperature_c: series.current_temperature_c,
		thermal_delta_c: series.thermal_delta_c,
		anomaly_score: Math.round(anomaly * 100) / 100,
		risk_score: riskScore,
		health_score: health,
		status,
		last_observation_at: series.last_observation_at,
		tags: seed.tags,
		description: seed.description,
		operational_load_pct: seed.operational_load_pct,
		capacity_utilization_pct: seed.capacity_utilization_pct,
		flare_intensity_mw: seed.flare_intensity_mw,
		hazard_proximity_score: seed.hazard_proximity_score,
	}

	return { asset, observations: series.observations, volatilityC, series }
}

function buildDataset(): Dataset {
	const assets: Asset[] = []
	const observations: Record<string, ThermalObservation[]> = {}
	const alerts: Alert[] = []
	const riskAssessments: Record<string, RiskAssessment> = {}

	for (const seed of CATALOG) {
		const { asset, observations: obs, volatilityC, series } = buildAsset(seed)
		assets.push(asset)
		observations[asset.id] = obs
		riskAssessments[asset.id] = buildRiskAssessment(
			seed,
			asset,
			series,
			volatilityC,
		)
		const alert = deriveAlert(seed, asset, series)
		if (alert) alerts.push(alert)
	}

	return { assets, observations, alerts, riskAssessments, sources: EO_SOURCES }
}

/** The single, deterministic dataset — assembled once at module load. */
export const dataset: Dataset = buildDataset()

/* --- typed selectors -------------------------------------------------- */

export function getAssets(): readonly Asset[] {
	return dataset.assets
}

export function getAsset(id: string): Asset | undefined {
	return dataset.assets.find(a => a.id === id)
}

export function getObservations(id: string): readonly ThermalObservation[] {
	return dataset.observations[id] ?? []
}

export function getRiskAssessment(id: string): RiskAssessment | undefined {
	return dataset.riskAssessments[id]
}

export function getAlerts(filter?: {
	assetId?: string
	severity?: Alert['severity']
}): readonly Alert[] {
	let out = dataset.alerts
	if (filter?.assetId) out = out.filter(a => a.asset_id === filter.assetId)
	if (filter?.severity) out = out.filter(a => a.severity === filter.severity)
	return out
}

export function getAlertForAsset(id: string): Alert | undefined {
	return dataset.alerts.find(a => a.asset_id === id)
}

const STATUS_ORDER: Record<Status, number> = {
	Critical: 0,
	Warning: 1,
	Watch: 2,
	Normal: 3,
}

/** Assets sorted by severity (Critical first) then descending risk. */
export function getAssetsBySeverity(): Asset[] {
	return [...dataset.assets].sort(
		(a, b) =>
			STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
			b.risk_score - a.risk_score,
	)
}

/** Count of assets in each status band. */
export function getStatusCounts(
	assets: readonly Asset[] = dataset.assets,
): Record<Status, number> {
	const counts: Record<Status, number> = {
		Normal: 0,
		Watch: 0,
		Warning: 0,
		Critical: 0,
	}
	for (const a of assets) counts[a.status]++
	return counts
}
