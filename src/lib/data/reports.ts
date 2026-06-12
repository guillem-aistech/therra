/* =========================================================================
   Therra — Report generation (on demand)
   -------------------------------------------------------------------------
   Composes a print-friendly report for an asset from the already-derived
   dataset (docs/MOCK_DATA.md §2, TODO §9). Nothing new is invented here —
   every figure traces back to the asset's series.
   ========================================================================= */

import type { Asset, AssetType, Report, ReportType } from '../types'
import {
	getAlertForAsset,
	getAsset,
	getObservations,
	getRiskAssessment,
} from './index'
import { PHASE0_LIMITATIONS } from './provenance'

export const REPORT_TYPES: ReportType[] = [
	'Infrastructure Health',
	'Insurance Risk',
	'Thermal Anomaly',
	'Urban Heat',
	'Wildfire Risk',
	'Gas Flare Activity',
	'Desalination Thermal Discharge',
]

/** Pick the most relevant report type for an asset. */
export function reportTypeForAsset(assetType: AssetType): ReportType {
	switch (assetType) {
		case 'Urban District':
			return 'Urban Heat'
		case 'Wildfire Risk Zone':
			return 'Wildfire Risk'
		case 'Gas Flare Site':
			return 'Gas Flare Activity'
		case 'Desalination Plant':
			return 'Desalination Thermal Discharge'
		case 'Oil Refinery':
		case 'LNG Terminal':
		case 'Power Plant':
			return 'Thermal Anomaly'
		default:
			return 'Infrastructure Health'
	}
}

export interface ReportSection {
	heading: string
	body: string[]
}

export interface AssetReport {
	meta: Report
	sections: ReportSection[]
}

const fmtEur = (eur: number): string =>
	eur >= 1e9
		? `€${(eur / 1e9).toFixed(1)}B`
		: eur >= 1e6
			? `€${Math.round(eur / 1e6)}M`
			: `€${Math.round(eur / 1e3)}k`

/** Build the full structured report for an asset. */
export function buildAssetReport(assetId: string): AssetReport | undefined {
	const asset = getAsset(assetId)
	if (!asset) return undefined
	const risk = getRiskAssessment(assetId)
	const alert = getAlertForAsset(assetId)
	const obs = getObservations(assetId)
	const reportType = reportTypeForAsset(asset.asset_type)

	const meta: Report = {
		id: `${assetId}-REPORT`,
		report_type: reportType,
		asset_id: assetId,
		created_at: asset.last_observation_at,
		title: `${reportType} — ${asset.name}`,
		summary: summarize(asset),
	}

	const sections: ReportSection[] = [
		{
			heading: 'Executive summary',
			body: [summarize(asset)],
		},
		{
			heading: 'Thermal status',
			body: [
				`Current land-surface temperature: ${asset.current_temperature_c} °C.`,
				`90-day baseline: ${asset.baseline_temperature_c} °C.`,
				`Thermal delta: ${signed(asset.thermal_delta_c)} °C.`,
				`Health score: ${asset.health_score} / 100.`,
			],
		},
		{
			heading: 'Anomaly assessment',
			body: [
				`Anomaly score: ${asset.anomaly_score.toFixed(2)} (0–1).`,
				alert
					? `Active alert: ${alert.title} (${alert.severity}), detected ${alert.detected_at.slice(0, 10)}.`
					: 'No active alert — thermal signature within baseline tolerance.',
			],
		},
		{
			heading: 'Risk interpretation',
			body: risk
				? [
						risk.explanation,
						`Fire-risk index: ${risk.fire_risk_index}. Business-interruption risk: ${risk.business_interruption_risk}. Catastrophe exposure: ${risk.catastrophe_exposure_score}.`,
					]
				: [`Risk score ${asset.risk_score} (${asset.status}).`],
		},
		{
			heading: 'Insurance & infrastructure implications',
			body: [
				`Insured exposure: ${fmtEur(asset.insurance_exposure_eur)} (${asset.criticality} criticality).`,
				`Inspection priority: ${risk?.inspection_priority_score ?? '—'} / 100.`,
				asset.status === 'Critical' || asset.status === 'Warning'
					? 'Elevated thermal signature materially raises near-term loss probability for this asset class.'
					: 'No material change to the underwriting profile at this time.',
			],
		},
		{
			heading: 'Recommended actions',
			body: risk?.recommendations ?? ['Continue monitoring.'],
		},
		{
			heading: 'Data sources',
			body: [
				`Synthesized near-daily composite over ${obs.length} observations from public EO missions (Landsat, Sentinel-3, MODIS, VIIRS, ECOSTRESS).`,
			],
		},
		{
			heading: 'Confidence & limitations (Phase 0)',
			body: [...PHASE0_LIMITATIONS],
		},
	]

	return { meta, sections }
}

function summarize(asset: Asset): string {
	const trend =
		asset.thermal_delta_c >= 2.5
			? 'running above'
			: asset.thermal_delta_c <= -2.5
				? 'running below'
				: 'tracking'
	return (
		`${asset.name} (${asset.asset_type}, ${asset.region}, ${asset.country}) is ${asset.status} ` +
		`with a risk score of ${asset.risk_score}. Land-surface temperature is ${trend} its 90-day baseline ` +
		`at ${asset.current_temperature_c} °C (${signed(asset.thermal_delta_c)} °C).`
	)
}

const signed = (n: number): string => `${n >= 0 ? '+' : ''}${n}`
