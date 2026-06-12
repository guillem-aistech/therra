import type { LucideIcon } from 'lucide-react'
import { CircleCheck, Eye, OctagonAlert, TriangleAlert } from 'lucide-react'

import type { Status } from '~/lib/types'

import './primitives.css'
import { statusKey } from './status'

const GLYPH: Record<Status, LucideIcon> = {
	Normal: CircleCheck,
	Watch: Eye,
	Warning: TriangleAlert,
	Critical: OctagonAlert,
}

interface StatusBadgeProps {
	status: Status
	size?: 'sm' | 'md'
}

/**
 * Status chip — a lucide glyph plus the status label, never color alone.
 * Colored from the matching `--status-*-container` / `--status-on-*-container`
 * token pair (AA on the chip), flat and bordered.
 */
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
	const Glyph = GLYPH[status]
	const key = statusKey(status)
	const iconSize = size === 'sm' ? 13 : 15
	return (
		<span
			className={`thr-status-badge thr-status-badge--${size}`}
			data-status={key}
		>
			<Glyph size={iconSize} strokeWidth={2.25} aria-hidden='true' />
			<span className='thr-status-badge__label'>{status}</span>
		</span>
	)
}
