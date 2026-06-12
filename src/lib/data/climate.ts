/* =========================================================================
   Therra — Climate & seasonal model
   -------------------------------------------------------------------------
   base(d) = typeBaseline + regionOffset + seasonal(d) + operational(d)
   (docs/MOCK_DATA.md §6/§7). Per-type calibration lives here; per-asset
   regionOffset / seasonalAmp / cloudProb are authored in the catalog.
   ========================================================================= */

import type { AssetType } from '../types'
import { dayOfYear, weekday } from './constants'

export interface TypeClimate {
	/** Pre-climate daytime LST anchor (°C). */
	baseline: number
	/** Added to LST to form brightness temperature (large for flares/fire). */
	brightnessOffset: number
	/** Day-to-day measurement noise (°C). */
	noiseSd: number
	/** Amplitude of the weekday/weekend operational cycle (°C; 0 = static). */
	weekdayAmp: number
}

/** Per-type calibration (midpoints of the docs/MOCK_DATA.md §7 ranges). */
export const TYPE_CLIMATE: Record<AssetType, TypeClimate> = {
	'Oil Refinery': {
		baseline: 47,
		brightnessOffset: 6,
		noiseSd: 1.2,
		weekdayAmp: 0.6,
	},
	'LNG Terminal': {
		baseline: 27,
		brightnessOffset: 5,
		noiseSd: 1.3,
		weekdayAmp: 0.8,
	},
	'Gas Flare Site': {
		baseline: 38,
		brightnessOffset: 360,
		noiseSd: 1.6,
		weekdayAmp: 0,
	},
	'Power Plant': {
		baseline: 40,
		brightnessOffset: 5,
		noiseSd: 1.2,
		weekdayAmp: 1,
	},
	'Electrical Substation': {
		baseline: 34,
		brightnessOffset: 4,
		noiseSd: 1.1,
		weekdayAmp: 1.2,
	},
	'Power Line Corridor': {
		baseline: 30,
		brightnessOffset: 3,
		noiseSd: 1.3,
		weekdayAmp: 1.4,
	},
	'Data Center': {
		baseline: 33,
		brightnessOffset: 4,
		noiseSd: 0.9,
		weekdayAmp: 0.4,
	},
	'Port / Logistics Hub': {
		baseline: 31,
		brightnessOffset: 3,
		noiseSd: 1.2,
		weekdayAmp: 2.2,
	},
	'Warehouse / Industrial': {
		baseline: 31,
		brightnessOffset: 3,
		noiseSd: 1.2,
		weekdayAmp: 2,
	},
	'Desalination Plant': {
		baseline: 24,
		brightnessOffset: 2,
		noiseSd: 1,
		weekdayAmp: 0.4,
	},
	'Urban District': {
		baseline: 34,
		brightnessOffset: 3,
		noiseSd: 1.1,
		weekdayAmp: 1.5,
	},
	'Wildfire Risk Zone': {
		baseline: 38,
		brightnessOffset: 110,
		noiseSd: 1.8,
		weekdayAmp: 0,
	},
	'Solar Farm': {
		baseline: 52,
		brightnessOffset: 4,
		noiseSd: 1.4,
		weekdayAmp: 0,
	},
	'Pipeline Segment': {
		baseline: 29,
		brightnessOffset: 3,
		noiseSd: 1.3,
		weekdayAmp: 0.3,
	},
}

/** Gentle seasonal warming toward mid-summer (°C). */
export function seasonal(iso: string, amp: number): number {
	// Peak near day 200 (mid-July); June already near the crest.
	return amp * Math.sin((2 * Math.PI * (dayOfYear(iso) - 110)) / 365)
}

/** Weekday/weekend operational swing (°C); weekends run cooler. */
export function operational(iso: string, amp: number): number {
	if (amp === 0) return 0
	const wd = weekday(iso)
	const weekend = wd === 0 || wd === 6
	return amp * (weekend ? -1 : 0.35)
}
