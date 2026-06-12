import type { Status } from '~/lib/types'

import './primitives.css'
import { statusKey } from './status'

interface RiskScoreCardProps {
	label: string
	value: number | string
	max?: number
	status?: Status
	unit?: string
}

/**
 * Status-tile KPI: a big tabular number with a small label, optional `/max`
 * and unit, and an optional left status edge colored by `--status-*`. Flat,
 * bordered, no shadow.
 */
export function RiskScoreCard({
	label,
	value,
	max,
	status,
	unit,
}: RiskScoreCardProps) {
	return (
		<div
			className='thr-risk-card'
			data-status={status ? statusKey(status) : undefined}
		>
			<span className='thr-risk-card__label'>{label}</span>
			<span className='thr-risk-card__value'>
				<span className='thr-risk-card__number'>{value}</span>
				{unit ? <span className='thr-risk-card__unit'>{unit}</span> : null}
				{max !== undefined ? (
					<span className='thr-risk-card__max'>/{max}</span>
				) : null}
			</span>
		</div>
	)
}
