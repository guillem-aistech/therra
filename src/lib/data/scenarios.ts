/* =========================================================================
   Therra — Scenario anomaly shapes
   -------------------------------------------------------------------------
   Each non-Normal asset has one event injected into the recent end of its
   90-day series so the heartbeat visibly bends (docs/MOCK_DATA.md §6). The
   shape returns an additive contribution to LST and/or brightness at a given
   day index; magnitude + window are authored per asset in the catalog so the
   derived status matches the intended scenario.
   ========================================================================= */

import type { Scenario } from '../types'
import type { Rng } from './rng'

export interface ScenarioSpec {
	scenario: Scenario
	/** Peak magnitude — °C delta for most shapes, brightness °C for `flare`. */
	peak: number
	/** Length (days) of the injected event, ending at the most recent day. */
	windowDays: number
}

export interface ScenarioContribution {
	lst: number
	brightness: number
}

const ZERO: ScenarioContribution = { lst: 0, brightness: 0 }

const smoothstep = (t: number): number => {
	const x = Math.min(1, Math.max(0, t))
	return x * x * (3 - 2 * x)
}

/**
 * Additive contribution at day index `d` (0…total-1; total-1 is the most
 * recent observation). Deterministic given the asset's RNG.
 */
export function scenarioContribution(
	spec: ScenarioSpec,
	d: number,
	total: number,
	rng: Rng,
): ScenarioContribution {
	if (spec.scenario === 'normal') return ZERO

	const lastIdx = total - 1
	const start = total - spec.windowDays
	if (d < start) return ZERO
	// Position within the event window, 0 at start → 1 at most recent.
	const t = spec.windowDays <= 1 ? 1 : (d - start) / (spec.windowDays - 1)

	switch (spec.scenario) {
		case 'ramp': {
			// Ramp up over the first ~60% of the window, then hold the peak.
			const rise = smoothstep(t / 0.6)
			const jitter = rng.gaussian(0, spec.peak * 0.03)
			return { lst: spec.peak * rise + jitter, brightness: 0 }
		}
		case 'spike': {
			// Sharp bump centred ~2 days before the most recent observation.
			const center = lastIdx - 2
			const sigma = Math.max(1.1, spec.windowDays / 6)
			const bump = Math.exp(-((d - center) ** 2) / (2 * sigma * sigma))
			return { lst: spec.peak * bump, brightness: 0 }
		}
		case 'drop': {
			// Step down (negative contribution), e.g. a shutdown.
			const fall = smoothstep(t / 0.5)
			return { lst: -spec.peak * fall, brightness: 0 }
		}
		case 'plume': {
			// Sustained moderate discharge plume vs the SST baseline.
			const rise = 0.5 + 0.5 * smoothstep(t)
			const jitter = rng.gaussian(0, spec.peak * 0.08)
			return { lst: spec.peak * rise + jitter, brightness: 0 }
		}
		case 'flare': {
			// Brightness burst concentrated in the last few days; small LST bump.
			const burst = smoothstep(t / 0.7)
			const flicker = 1 + rng.gaussian(0, 0.12)
			return { lst: spec.peak * 0.02, brightness: spec.peak * burst * flicker }
		}
		case 'volatility': {
			// Small step plus extra erratic noise (a Watch-grade signal).
			const step = spec.peak * smoothstep(t)
			return { lst: step + rng.gaussian(0, spec.peak * 0.6), brightness: 0 }
		}
		default:
			return ZERO
	}
}
