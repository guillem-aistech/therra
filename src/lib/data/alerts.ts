/* =========================================================================
   Therra — Alert derivation
   -------------------------------------------------------------------------
   Every alert is evidenced: it points at the real event injected into the
   asset's series, with detected_at inside that window, a type valid for the
   asset type, and a severity tied to the anomaly (docs/MOCK_DATA.md §3/§7).
   ========================================================================= */

import { generateAssetRecommendations, severityFromAnomaly } from '../analytics'
import type { Alert, AlertType, Asset, AssetType } from '../types'
import type { AssetSeed } from './catalog'
import type { GeneratedSeries } from './thermal'

const ANOMALY_THRESHOLD_C = 2.5

/** Primary alert type for each asset type (must be valid for that type). */
const PRIMARY_ALERT: Record<AssetType, AlertType> = {
	'Oil Refinery': 'persistent overheating',
	'LNG Terminal': 'persistent overheating',
	'Gas Flare Site': 'gas-flare increase',
	'Power Plant': 'persistent overheating',
	'Electrical Substation': 'substation overheating',
	'Power Line Corridor': 'power-line overheating',
	'Data Center': 'thermal spike',
	'Port / Logistics Hub': 'abnormal night activity',
	'Warehouse / Industrial': 'thermal spike',
	'Desalination Plant': 'cooling-discharge anomaly',
	'Urban District': 'urban heat stress',
	'Wildfire Risk Zone': 'fire hotspot',
	'Solar Farm': 'thermal drop',
	'Pipeline Segment': 'thermal spike',
}

const TITLE: Record<AlertType, string> = {
	'thermal spike': 'Thermal Spike Detected',
	'thermal drop': 'Thermal Drop Detected',
	'persistent overheating': 'Persistent Overheating',
	'fire hotspot': 'Active Fire Hotspot',
	'gas-flare increase': 'Gas-Flare Increase',
	'cooling-discharge anomaly': 'Cooling-Discharge Anomaly',
	'power-line overheating': 'Power-Line Overheating',
	'substation overheating': 'Substation Overheating',
	'urban heat stress': 'Urban Heat Stress',
	'abnormal night activity': 'Abnormal Night Activity',
	'post-disaster damage signal': 'Post-Disaster Damage Signal',
}

/** Build the single evidenced alert for an asset, or null if Normal. */
export function deriveAlert(
	seed: AssetSeed,
	asset: Asset,
	series: GeneratedSeries,
): Alert | null {
	if (asset.status === 'Normal') return null

	const obs = series.observations
	const windowStart = Math.max(0, obs.length - Math.max(seed.scenarioWindow, 7))

	// detected_at = first observation in the event window over the threshold.
	let detectedIdx = windowStart
	for (let i = windowStart; i < obs.length; i++) {
		const o = obs[i]
		if (o && Math.abs(o.thermal_delta_c) > ANOMALY_THRESHOLD_C) {
			detectedIdx = i
			break
		}
	}
	const detected = obs[detectedIdx] ?? obs[obs.length - 1]
	if (!detected) return null

	const alertType = PRIMARY_ALERT[asset.asset_type]
	const severity = maxSeverity(
		severityFromAnomaly(asset.anomaly_score),
		asset.status,
	)
	const action =
		generateAssetRecommendations(asset.asset_type, asset.status)[0] ??
		'Continue monitoring.'

	const dir = asset.thermal_delta_c >= 0 ? '+' : ''
	const detail =
		alertType === 'gas-flare increase'
			? `Brightness temperature elevated to ${detected.brightness_temperature_c} °C with sustained flaring signal.`
			: alertType === 'cooling-discharge anomaly'
				? `Discharge plume running ${dir}${asset.thermal_delta_c} °C above the sea-surface baseline.`
				: `Land-surface temperature ${dir}${asset.thermal_delta_c} °C above baseline (current ${asset.current_temperature_c} °C).`

	return {
		id: `${seed.id}-ALERT-01`,
		asset_id: seed.id,
		alert_type: alertType,
		severity,
		title: TITLE[alertType],
		description: `${detail} ${seasonNote(asset)}`,
		detected_at: detected.timestamp,
		confidence: detected.confidence,
		status: asset.status === 'Critical' ? 'Open' : 'Acknowledged',
		suggested_action: action,
	}
}

function seasonNote(asset: Asset): string {
	return asset.asset_type === 'Urban District'
		? 'Coincides with elevated regional heat.'
		: 'Trend persists across recent passes.'
}

/** Don't let a Critical asset show a sub-Critical severity. */
function maxSeverity(
	fromAnomaly: Alert['severity'],
	status: Asset['status'],
): Alert['severity'] {
	const order: Alert['severity'][] = ['Info', 'Watch', 'Warning', 'Critical']
	const floor: Alert['severity'] =
		status === 'Critical'
			? 'Critical'
			: status === 'Warning'
				? 'Warning'
				: status === 'Watch'
					? 'Watch'
					: 'Info'
	return order.indexOf(fromAnomaly) >= order.indexOf(floor)
		? fromAnomaly
		: floor
}
