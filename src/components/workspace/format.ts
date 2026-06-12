/* Small display formatters shared by the workspace panels. */

export const degC = (n: number): string => `${n.toFixed(1)}°C`

export const signedC = (n: number): string =>
	`${n >= 0 ? '+' : ''}${n.toFixed(1)}°C`

export const pct = (n: number): string => `${Math.round(n)}%`

export function eur(n: number): string {
	if (n >= 1e9) return `€${(n / 1e9).toFixed(1)}B`
	if (n >= 1e6) return `€${Math.round(n / 1e6)}M`
	if (n >= 1e3) return `€${Math.round(n / 1e3)}k`
	return `€${n}`
}

export function lensMetricValue(value: number, unit: string): string {
	if (unit === '€') return eur(value)
	if (unit === '%') return pct(value)
	if (unit === 'MW') return `${Math.round(value)} MW`
	return String(Math.round(value))
}
