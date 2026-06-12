/* =========================================================================
   Therra — Demo constants & fixed time anchor
   -------------------------------------------------------------------------
   The whole dataset counts back from a fixed DEMO_NOW so it is reproducible
   and never produces a future timestamp. We construct Date objects from fixed
   ISO strings (allowed) — never Date.now() / new Date() with no args.
   ========================================================================= */

/** Anchor date for the demo — the day the series "ends". */
export const DEMO_NOW = '2026-06-12'

/** Observations per asset (one near-daily composite per day). */
export const OBSERVATION_DAYS = 90

/** Global seed for the deterministic dataset. */
export const SEED = 'therra-phase0-2026-06-12'

const DEMO_NOW_MS = new Date(`${DEMO_NOW}T00:00:00Z`).getTime()
const DAY_MS = 86_400_000

/** ISO date (YYYY-MM-DD) for `daysAgo` days before DEMO_NOW. */
export function isoDaysAgo(daysAgo: number): string {
	return new Date(DEMO_NOW_MS - daysAgo * DAY_MS).toISOString().slice(0, 10)
}

/** Full ISO timestamp for `daysAgo` days before DEMO_NOW. */
export function timestampDaysAgo(daysAgo: number): string {
	return new Date(DEMO_NOW_MS - daysAgo * DAY_MS).toISOString()
}

/** 1-based day of year for an ISO date string. */
export function dayOfYear(iso: string): number {
	const d = new Date(`${iso}T00:00:00Z`)
	const start = Date.UTC(d.getUTCFullYear(), 0, 0)
	return Math.floor((d.getTime() - start) / DAY_MS)
}

/** 0 = Sunday … 6 = Saturday for an ISO date string. */
export function weekday(iso: string): number {
	return new Date(`${iso}T00:00:00Z`).getUTCDay()
}
