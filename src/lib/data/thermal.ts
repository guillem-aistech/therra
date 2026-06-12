/* =========================================================================
   Therra — Thermal time-series generator
   -------------------------------------------------------------------------
   Produces the 90 ThermalObservation[] that every score for an asset derives
   from (docs/MOCK_DATA.md §6). Deterministic: the asset id seeds its own RNG
   stream, so adding/removing an asset never reshuffles the rest.
   ========================================================================= */

import { clamp, mean } from '../analytics'
import type { EOSourceId, ThermalObservation } from '../types'
import type { AssetSeed } from './catalog'
import { operational, seasonal, TYPE_CLIMATE } from './climate'
import {
	isoDaysAgo,
	OBSERVATION_DAYS,
	SEED,
	timestampDaysAgo,
} from './constants'
import { makeRng, type Rng } from './rng'
import { scenarioContribution } from './scenarios'

const BASELINE_WINDOW = 14 // trailing days that define the "normal" line

/** Source pools weighted to the near-daily composite the demo presents. */
const BASE_SOURCES: EOSourceId[] = [
	'sentinel-3',
	'sentinel-3',
	'modis',
	'modis',
	'modis',
	'viirs',
	'landsat',
	'ecostress',
]
const HOTSPOT_SOURCES: EOSourceId[] = [
	'viirs',
	'viirs',
	'viirs',
	'modis',
	'sentinel-3',
	'landsat',
]

function pickSource(seed: AssetSeed, rng: Rng): EOSourceId {
	const pool =
		seed.asset_type === 'Gas Flare Site' ||
		seed.asset_type === 'Wildfire Risk Zone'
			? HOTSPOT_SOURCES
			: BASE_SOURCES
	return rng.pick(pool)
}

export interface GeneratedSeries {
	observations: ThermalObservation[]
	/** Derived current values, computed once here for the asset record. */
	current_temperature_c: number
	baseline_temperature_c: number
	thermal_delta_c: number
	last_observation_at: string
	/** Recent deltas (most recent last) for the analytics layer. */
	deltas: number[]
	/** Cloud-affected passes within the last 14 observations. */
	cloudyOfLast14: number
}

export function generateSeries(seed: AssetSeed): GeneratedSeries {
	const rng = makeRng(`${SEED}:${seed.id}`)
	const tc = TYPE_CLIMATE[seed.asset_type]
	const spec = {
		scenario: seed.scenario,
		peak: seed.scenarioPeak,
		windowDays: seed.scenarioWindow,
	}

	// 1) Clean expected base per day (no scenario, no noise).
	const isoByDay: string[] = []
	const base: number[] = []
	for (let d = 0; d < OBSERVATION_DAYS; d++) {
		const iso = isoDaysAgo(OBSERVATION_DAYS - 1 - d)
		isoByDay.push(iso)
		base.push(
			tc.baseline +
				seed.regionOffset +
				seasonal(iso, seed.seasonalAmp) +
				operational(iso, tc.weekdayAmp),
		)
	}

	// 2) Trailing baseline (the "normal" line on the chart).
	const baselineByDay = base.map((_, d) => {
		const from = Math.max(0, d - BASELINE_WINDOW + 1)
		return mean(base.slice(from, d + 1))
	})

	// 3) Observations with scenario + noise + cloud texture.
	const observations: ThermalObservation[] = []
	const deltas: number[] = []
	let lastValidIdx = 0

	for (let d = 0; d < OBSERVATION_DAYS; d++) {
		const sc = scenarioContribution(spec, d, OBSERVATION_DAYS, rng)
		const noise = rng.gaussian(0, tc.noiseSd)
		const lst = (base[d] ?? 0) + sc.lst + noise
		const brightness = lst + tc.brightnessOffset + sc.brightness
		const baseline = baselineByDay[d] ?? lst
		const delta = lst - baseline

		const cloudy = rng.next() < seed.cloudProb
		const cloud = cloudy ? rng.int(55, 95) : rng.int(0, 35)
		const confidence = clamp(0.95 - cloud / 200, 0.4, 0.98)
		if (!cloudy) lastValidIdx = d

		observations.push({
			id: `${seed.id}-OBS-${String(d).padStart(2, '0')}`,
			asset_id: seed.id,
			timestamp: timestampDaysAgo(OBSERVATION_DAYS - 1 - d),
			source: pickSource(seed, rng),
			land_surface_temperature_c: round1(lst),
			brightness_temperature_c: round1(brightness),
			baseline_temperature_c: round1(baseline),
			thermal_delta_c: round1(delta),
			anomaly_score: clamp(Math.abs(delta) / 12, 0, 1),
			confidence: Math.round(confidence * 100) / 100,
			cloud_cover_percent: cloud,
			notes: cloudy
				? 'Cloud-affected pass — value gap-filled, lower confidence.'
				: undefined,
		})
		deltas.push(delta)
	}

	const last =
		observations[lastValidIdx] ?? observations[observations.length - 1]
	if (!last) throw new Error(`no observations generated for ${seed.id}`)
	const cloudyOfLast14 = observations
		.slice(-14)
		.filter(o => o.cloud_cover_percent >= 55).length

	return {
		observations,
		current_temperature_c: last.land_surface_temperature_c,
		baseline_temperature_c: last.baseline_temperature_c,
		thermal_delta_c: round1(
			last.land_surface_temperature_c - last.baseline_temperature_c,
		),
		last_observation_at: last.timestamp,
		deltas,
		cloudyOfLast14,
	}
}

const round1 = (n: number): number => Math.round(n * 10) / 10
