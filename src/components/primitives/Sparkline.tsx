import type { Status } from '~/lib/types'

import './primitives.css'
import { statusColor } from './status'

interface SparklineProps {
	values: number[]
	status?: Status
	width?: number
	height?: number
}

/**
 * A tiny inline SVG sparkline (no axes/labels) for the last ~30 deltas/temps,
 * used in hover popups. Status-colored stroke, flat, no fill.
 */
export function Sparkline({
	values,
	status,
	width = 96,
	height = 24,
}: SparklineProps) {
	const stroke = statusColor(status)
	const pad = 1.5

	if (values.length === 0) {
		return (
			<svg
				className='thr-sparkline'
				width={width}
				height={height}
				aria-hidden='true'
			/>
		)
	}

	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	const innerW = width - pad * 2
	const innerH = height - pad * 2
	const step = values.length > 1 ? innerW / (values.length - 1) : 0

	const points: ReadonlyArray<readonly [number, number]> = values.map(
		(v, i) => [pad + i * step, pad + innerH - ((v - min) / span) * innerH],
	)

	const d = points
		.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
		.join(' ')

	const [lastX, lastY] = points[points.length - 1] ?? [pad, pad]
	const latest = values[values.length - 1] ?? 0

	return (
		<svg
			className='thr-sparkline'
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			role='img'
			aria-label={`Trend, latest ${latest.toFixed(1)}`}
		>
			<title>{`Trend, ${values.length} points`}</title>
			<path
				d={d}
				fill='none'
				stroke={stroke}
				strokeWidth={1.5}
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<circle cx={lastX} cy={lastY} r={1.75} fill={stroke} />
		</svg>
	)
}
