import { useMemo } from 'react'
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import type { Status, ThermalObservation } from '~/lib/types'

import './primitives.css'
import { readCssVar, statusColor } from './status'

interface ThermalHeartbeatChartProps {
	observations: ThermalObservation[]
	status?: Status
	height?: number
}

interface Point {
	dateLabel: string
	fullDate: string
	lst: number
	baseline: number
	delta: number
}

const fmtShort = (iso: string): string => {
	const d = new Date(iso)
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const fmtFull = (iso: string): string => {
	const d = new Date(iso)
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

const fmtTemp = (n: number): string => `${n.toFixed(1)}°C`
const fmtSigned = (n: number): string => `${n >= 0 ? '+' : ''}${n.toFixed(1)}°C`

/**
 * The signature Thermal Heartbeat: a thin status-colored land-surface-temp
 * line over a muted baseline reference, with light gridlines and a tabular
 * tooltip (date · LST · baseline · delta). No gradient fills.
 */
export function ThermalHeartbeatChart({
	observations,
	status,
	height = 200,
}: ThermalHeartbeatChartProps) {
	const lineColor = statusColor(status)
	const baselineColor = readCssVar('--color-outline')
	const gridColor = readCssVar('--color-outline-variant')
	const axisColor = readCssVar('--color-on-surface-variant')

	const data = useMemo<Point[]>(
		() =>
			observations.map(o => ({
				dateLabel: fmtShort(o.timestamp),
				fullDate: fmtFull(o.timestamp),
				lst: o.land_surface_temperature_c,
				baseline: o.baseline_temperature_c,
				delta: o.thermal_delta_c,
			})),
		[observations],
	)

	return (
		<div className='thr-heartbeat'>
			<ResponsiveContainer width='100%' height={height}>
				<LineChart
					data={data}
					margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
				>
					<CartesianGrid
						stroke={gridColor}
						strokeOpacity={0.5}
						vertical={false}
					/>
					<XAxis
						dataKey='dateLabel'
						tick={{ fill: axisColor, fontSize: 11 }}
						tickLine={false}
						axisLine={{ stroke: gridColor }}
						minTickGap={28}
						interval='preserveStartEnd'
					/>
					<YAxis
						width={44}
						tick={{ fill: axisColor, fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(v: number) => `${Math.round(v)}°`}
						domain={['dataMin - 1', 'dataMax + 1']}
					/>
					<Tooltip
						content={<HeartbeatTooltip lineColor={lineColor} />}
						cursor={{ stroke: gridColor, strokeWidth: 1 }}
					/>
					<Line
						type='monotone'
						dataKey='baseline'
						name='Baseline'
						stroke={baselineColor}
						strokeWidth={1}
						strokeDasharray='3 3'
						dot={false}
						isAnimationActive={false}
					/>
					<Line
						type='monotone'
						dataKey='lst'
						name='LST'
						stroke={lineColor}
						strokeWidth={1.5}
						dot={false}
						activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}

interface TooltipPayloadEntry {
	payload?: Point
}

interface HeartbeatTooltipProps {
	active?: boolean
	payload?: TooltipPayloadEntry[]
	lineColor: string
}

function HeartbeatTooltip({
	active,
	payload,
	lineColor,
}: HeartbeatTooltipProps) {
	const p = payload?.[0]?.payload
	if (!active || !p) return null
	return (
		<div className='thr-heartbeat__tooltip'>
			<div className='thr-heartbeat__tooltip-date'>{p.fullDate}</div>
			<dl className='thr-heartbeat__tooltip-rows'>
				<div className='thr-heartbeat__tooltip-row'>
					<dt>
						<span
							className='thr-heartbeat__swatch'
							style={{ background: lineColor }}
						/>
						LST
					</dt>
					<dd>{fmtTemp(p.lst)}</dd>
				</div>
				<div className='thr-heartbeat__tooltip-row'>
					<dt>
						<span className='thr-heartbeat__swatch thr-heartbeat__swatch--baseline' />
						Baseline
					</dt>
					<dd>{fmtTemp(p.baseline)}</dd>
				</div>
				<div className='thr-heartbeat__tooltip-row thr-heartbeat__tooltip-row--delta'>
					<dt>Δ</dt>
					<dd>{fmtSigned(p.delta)}</dd>
				</div>
			</dl>
		</div>
	)
}
