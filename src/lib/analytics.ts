/* =========================================================================
   Therra — Explainable analytics (no black-box AI)
   -------------------------------------------------------------------------
   Every score is a transparent, deterministic function of an asset's thermal
   series plus a few authored attributes. The same functions produce both the
   numbers and the human-readable "why" (see docs/MOCK_DATA.md §3/§10).
   ========================================================================= */

import type { Asset, AssetType, Criticality, Severity, Status } from './types'

/* --- small numeric helpers -------------------------------------------- */

export function clamp(n: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, n))
}

export function mean(xs: number[]): number {
	if (xs.length === 0) return 0
	return xs.reduce((a, b) => a + b, 0) / xs.length
}

export function stdDev(xs: number[]): number {
	if (xs.length < 2) return 0
	const m = mean(xs)
	return Math.sqrt(mean(xs.map(x => (x - m) ** 2)))
}

export function median(xs: number[]): number {
	if (xs.length === 0) return 0
	const s = [...xs].sort((a, b) => a - b)
	const mid = Math.floor(s.length / 2)
	const hi = s[mid] ?? 0
	if (s.length % 2) return hi
	return ((s[mid - 1] ?? hi) + hi) / 2
}

const round = (n: number, dp = 0): number => {
	const f = 10 ** dp
	return Math.round(n * f) / f
}

/* --- calibration tables ----------------------------------------------- */

/** Status bands on risk_score (docs/MOCK_DATA.md §4). */
export const STATUS_THRESHOLDS = {
	watch: 30,
	warning: 55,
	critical: 75,
} as const

/** How much each criticality weighs into risk. */
const CRITICALITY_WEIGHT: Record<Criticality, number> = {
	Low: 0.25,
	Medium: 0.5,
	High: 0.75,
	Strategic: 1,
}

/** Per-type risk / fire / business-interruption factors (docs/MOCK_DATA.md §7). */
interface TypeFactors {
	risk: number
	fire: number
	bi: number
}
const TYPE_FACTORS: Record<AssetType, TypeFactors> = {
	'Oil Refinery': { risk: 1, fire: 1, bi: 1 },
	'LNG Terminal': { risk: 0.95, fire: 0.7, bi: 1 },
	'Gas Flare Site': { risk: 0.85, fire: 1, bi: 0.6 },
	'Power Plant': { risk: 0.8, fire: 0.6, bi: 1 },
	'Electrical Substation': { risk: 0.8, fire: 1, bi: 0.6 },
	'Power Line Corridor': { risk: 0.75, fire: 1, bi: 0.6 },
	'Data Center': { risk: 0.85, fire: 0.6, bi: 1 },
	'Port / Logistics Hub': { risk: 0.6, fire: 0.6, bi: 1 },
	'Warehouse / Industrial': { risk: 0.6, fire: 1, bi: 0.6 },
	'Desalination Plant': { risk: 0.65, fire: 0.3, bi: 0.6 },
	'Urban District': { risk: 0.6, fire: 0.6, bi: 0.6 },
	'Wildfire Risk Zone': { risk: 0.7, fire: 1, bi: 0.3 },
	'Solar Farm': { risk: 0.5, fire: 0.6, bi: 0.3 },
	'Pipeline Segment': { risk: 0.7, fire: 1, bi: 0.6 },
}

/** Reference scales used to normalize raw magnitudes into 0–1. */
const MAGNITUDE_REF_C = 12 // °C of |delta| that saturates the magnitude term
const VOLATILITY_REF_C = 4 // °C of std that saturates the volatility term
const PERSISTENCE_REF = 14 // observations of sustained anomaly that saturate
const ANOMALY_THRESHOLD_C = 2.5 // |delta| beyond which an obs counts as anomalous
const EXPOSURE_REF_EUR = 2_000_000_000 // €2B exposure saturates the exposure term

const RECENT_WINDOW = 21 // observations considered "recent"
const STATE_WINDOW = 7 // observations defining the current state

const SEVERITY_WEIGHT: Record<Severity, number> = {
	Info: 0.15,
	Watch: 0.4,
	Warning: 0.7,
	Critical: 1,
}

/* --- core analytics --------------------------------------------------- */

export function calculateThermalDelta(
	current: number,
	baseline: number,
): number {
	return current - baseline
}

/** Std of recent thermal deltas, in °C. */
export function calculateThermalVolatility(deltas: number[]): number {
	return stdDev(deltas.slice(-RECENT_WINDOW))
}

/**
 * 0–1 anomaly from magnitude (how far), persistence (how long), and
 * volatility (how erratic) of the recent deltas.
 */
export function calculateAnomalyScore(deltas: number[]): number {
	if (deltas.length === 0) return 0
	const recent = deltas.slice(-RECENT_WINDOW)
	const state = deltas.slice(-STATE_WINDOW)

	const magnitude = clamp(Math.abs(mean(state)) / MAGNITUDE_REF_C, 0, 1)

	// Count trailing observations that stay over the anomaly threshold.
	let consecutive = 0
	for (let i = recent.length - 1; i >= 0; i--) {
		const v = recent[i]
		if (v !== undefined && Math.abs(v) > ANOMALY_THRESHOLD_C) consecutive++
		else break
	}
	const persistence = clamp(consecutive / PERSISTENCE_REF, 0, 1)
	const volatility = clamp(stdDev(recent) / VOLATILITY_REF_C, 0, 1)

	return clamp(0.55 * magnitude + 0.3 * persistence + 0.15 * volatility, 0, 1)
}

/** Map a 0–1 anomaly to an alert severity (docs/MOCK_DATA.md §7). */
export function severityFromAnomaly(anomaly: number): Severity {
	if (anomaly >= 0.75) return 'Critical'
	if (anomaly >= 0.55) return 'Warning'
	if (anomaly >= 0.3) return 'Watch'
	return 'Info'
}

export interface RiskInputs {
	anomalyScore: number
	criticality: Criticality
	exposureEur: number
	volatilityC: number
	assetType: AssetType
}

/**
 * Weighted 0–100 risk. The thermal HAZARD (anomaly + volatility + alert
 * severity) is the driver; criticality, exposure and asset-type act as an
 * AMPLIFIER on top of it. A calm asset therefore stays Normal no matter how
 * strategic or valuable it is — only a thermal signal moves the score.
 */
export function calculateRiskScore(inp: RiskInputs): number {
	const anomaly = clamp(inp.anomalyScore, 0, 1)
	const volatility = clamp(inp.volatilityC / VOLATILITY_REF_C, 0, 1)
	const severity = SEVERITY_WEIGHT[severityFromAnomaly(anomaly)]
	const hazard = clamp(
		0.85 * anomaly + 0.1 * volatility + 0.05 * severity,
		0,
		1,
	)

	const amplifier =
		1 +
		0.18 * CRITICALITY_WEIGHT[inp.criticality] +
		0.12 * clamp(inp.exposureEur / EXPOSURE_REF_EUR, 0, 1) +
		0.08 * TYPE_FACTORS[inp.assetType].risk

	return clamp(round(100 * clamp(hazard * amplifier, 0, 1)), 0, 100)
}

/** 100 − normalized penalty. A Critical asset lands in the low-to-mid 20s. */
export function calculateHealthScore(
	riskScore: number,
	anomalyScore: number,
): number {
	const penalty = riskScore * 0.62 + anomalyScore * 100 * 0.16
	return clamp(round(100 - penalty), 0, 100)
}

export function classifyStatus(riskScore: number): Status {
	if (riskScore >= STATUS_THRESHOLDS.critical) return 'Critical'
	if (riskScore >= STATUS_THRESHOLDS.warning) return 'Warning'
	if (riskScore >= STATUS_THRESHOLDS.watch) return 'Watch'
	return 'Normal'
}

export interface IndexInputs {
	anomalyScore: number
	volatilityC: number
	criticality: Criticality
	exposureEur: number
	assetType: AssetType
	deltaC: number
}

export function calculateFireRiskIndex(inp: IndexInputs): number {
	const anomaly = clamp(inp.anomalyScore, 0, 1)
	const fire = TYPE_FACTORS[inp.assetType].fire
	const heat = clamp(inp.deltaC / MAGNITUDE_REF_C, 0, 1)
	const volatility = clamp(inp.volatilityC / VOLATILITY_REF_C, 0, 1)
	return clamp(
		round(100 * (0.4 * anomaly + 0.3 * fire + 0.2 * heat + 0.1 * volatility)),
		0,
		100,
	)
}

export function calculateBusinessInterruptionRisk(inp: IndexInputs): number {
	const anomaly = clamp(inp.anomalyScore, 0, 1)
	const bi = TYPE_FACTORS[inp.assetType].bi
	const criticality = CRITICALITY_WEIGHT[inp.criticality]
	const exposure = clamp(inp.exposureEur / EXPOSURE_REF_EUR, 0, 1)
	return clamp(
		round(
			100 * (0.4 * anomaly + 0.3 * bi + 0.2 * criticality + 0.1 * exposure),
		),
		0,
		100,
	)
}

export function calculateCatastropheExposure(inp: IndexInputs): number {
	const exposure = clamp(inp.exposureEur / EXPOSURE_REF_EUR, 0, 1)
	const criticality = CRITICALITY_WEIGHT[inp.criticality]
	const anomaly = clamp(inp.anomalyScore, 0, 1)
	return clamp(
		round(100 * (0.5 * exposure + 0.3 * criticality + 0.2 * anomaly)),
		0,
		100,
	)
}

export function calculateInspectionPriority(
	riskScore: number,
	anomalyScore: number,
	criticality: Criticality,
): number {
	return clamp(
		round(
			0.5 * riskScore +
				0.3 * anomalyScore * 100 +
				0.2 * CRITICALITY_WEIGHT[criticality] * 100,
		),
		0,
		100,
	)
}

/* --- explanation & recommendations ------------------------------------ */

const fmtEur = (eur: number): string => {
	if (eur >= 1e9) return `€${round(eur / 1e9, 1)}B`
	if (eur >= 1e6) return `€${round(eur / 1e6, 0)}M`
	return `€${round(eur / 1e3, 0)}k`
}

const fmtSigned = (n: number): string => `${n >= 0 ? '+' : ''}${round(n, 1)}`

export interface ExplanationInputs {
	asset: Pick<
		Asset,
		| 'asset_type'
		| 'criticality'
		| 'insurance_exposure_eur'
		| 'risk_score'
		| 'status'
	>
	deltaC: number
	persistenceObs: number
	confidence: number
	cloudyOfLast14: number
}

/** Build the generated risk explanation that cites the asset's real numbers. */
export function buildExplanation(inp: ExplanationInputs): string {
	const { asset } = inp
	const direction = inp.deltaC >= 0 ? 'above' : 'below'
	const persistence =
		inp.persistenceObs > 0
			? ` and has persisted for ${inp.persistenceObs} consecutive observation${inp.persistenceObs === 1 ? '' : 's'}`
			: ''
	const typeRisk =
		TYPE_FACTORS[asset.asset_type].risk >= 0.8 ? 'high' : 'moderate'
	return (
		`Risk score ${asset.risk_score} (${asset.status}): land-surface temperature is ` +
		`${fmtSigned(inp.deltaC)} °C ${direction} the 90-day baseline${persistence}; ` +
		`asset is ${asset.criticality} criticality with ${fmtEur(asset.insurance_exposure_eur)} insured exposure ` +
		`and a ${typeRisk} ${asset.asset_type.toLowerCase()} type-risk factor. ` +
		`Confidence ${round(inp.confidence, 2)} — ${inp.cloudyOfLast14} of the last 14 passes were cloud-affected.`
	)
}

/** Per-status, per-type recommended actions (the operator's next step). */
export function generateAssetRecommendations(
	assetType: AssetType,
	status: Status,
): string[] {
	if (status === 'Normal') {
		return ['No action required — thermal signature within baseline tolerance.']
	}

	const byType: Partial<Record<AssetType, string>> = {
		'Oil Refinery':
			'Dispatch thermal inspection of crude/vacuum units; verify cooling-loop performance.',
		'LNG Terminal':
			'Inspect process trains and re-gasification heat exchangers; confirm boil-off handling.',
		'Gas Flare Site':
			'Verify flare metering and check for unplanned venting or routing changes.',
		'Power Plant':
			'Check condenser and cooling-stack performance; review load against thermal trend.',
		'Electrical Substation':
			'Thermographic survey of transformers and busbars; check load balancing.',
		'Power Line Corridor':
			'Inspect conductors and joints along the corridor; reassess dynamic line rating.',
		'Data Center':
			'Audit CRAH/CRAC capacity and hot-aisle containment; review IT load ramp.',
		'Port / Logistics Hub':
			'Review off-hours activity and cold-chain assets; confirm no unplanned operations.',
		'Warehouse / Industrial':
			'Inspect for process hotspots or stored-goods self-heating; verify ventilation.',
		'Desalination Plant':
			'Sample intake/outfall temperatures; verify discharge plume within permit limits.',
		'Urban District':
			'Issue heat-stress advisory; pre-position cooling centres for vulnerable population.',
		'Wildfire Risk Zone':
			'Escalate to fire authority; pre-position suppression assets and monitor fuel moisture.',
		'Solar Farm':
			'Inspect for module hotspots / underperformance; verify inverter cooling.',
		'Pipeline Segment':
			'Walk the segment for leaks or ground disturbance; check pressure differentials.',
	}

	const recs: string[] = []
	const primary = byType[assetType]
	if (primary) recs.push(primary)
	if (status === 'Critical') {
		recs.push('Notify on-call duty manager and open an incident.')
		recs.push(
			'Acquire a tasked high-resolution pass to confirm and localize the anomaly.',
		)
	} else if (status === 'Warning') {
		recs.push('Increase observation cadence and brief the asset operator.')
	} else {
		recs.push(
			'Continue monitoring; re-evaluate if the trend persists past 7 days.',
		)
	}
	return recs
}
