/* =========================================================================
   Therra — Risk assessment builder
   -------------------------------------------------------------------------
   Composes the secondary risk indices and the generated, number-citing
   explanation for an asset (docs/MOCK_DATA.md §4/§10).
   ========================================================================= */

import {
	buildExplanation,
	calculateBusinessInterruptionRisk,
	calculateCatastropheExposure,
	calculateFireRiskIndex,
	calculateInspectionPriority,
	generateAssetRecommendations,
} from '../analytics'
import type { Asset, RiskAssessment } from '../types'
import type { AssetSeed } from './catalog'
import type { GeneratedSeries } from './thermal'

const ANOMALY_THRESHOLD_C = 2.5

export function buildRiskAssessment(
	seed: AssetSeed,
	asset: Asset,
	series: GeneratedSeries,
	volatilityC: number,
): RiskAssessment {
	const indexInputs = {
		anomalyScore: asset.anomaly_score,
		volatilityC,
		criticality: asset.criticality,
		exposureEur: asset.insurance_exposure_eur,
		assetType: asset.asset_type,
		deltaC: asset.thermal_delta_c,
	}

	// Count trailing observations sustained over the anomaly threshold.
	let persistence = 0
	for (let i = series.deltas.length - 1; i >= 0; i--) {
		const v = series.deltas[i]
		if (v !== undefined && Math.abs(v) > ANOMALY_THRESHOLD_C) persistence++
		else break
	}

	const lastObs = series.observations[series.observations.length - 1]
	const explanation = buildExplanation({
		asset,
		deltaC: asset.thermal_delta_c,
		persistenceObs: persistence,
		confidence: lastObs?.confidence ?? 0.8,
		cloudyOfLast14: series.cloudyOfLast14,
	})

	return {
		id: `${seed.id}-RISK-01`,
		asset_id: seed.id,
		timestamp: asset.last_observation_at,
		dynamic_risk_score: asset.risk_score,
		fire_risk_index: calculateFireRiskIndex(indexInputs),
		business_interruption_risk: calculateBusinessInterruptionRisk(indexInputs),
		catastrophe_exposure_score: calculateCatastropheExposure(indexInputs),
		thermal_volatility_score: Math.min(
			100,
			Math.round((volatilityC / 4) * 100),
		),
		inspection_priority_score: calculateInspectionPriority(
			asset.risk_score,
			asset.anomaly_score,
			asset.criticality,
		),
		explanation,
		recommendations: generateAssetRecommendations(
			asset.asset_type,
			asset.status,
		),
	}
}
