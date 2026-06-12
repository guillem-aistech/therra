/* =========================================================================
   Therra — SignalRibbon
   -------------------------------------------------------------------------
   The lens KPI counts as click-to-filter chips ("3 Critical / 6 Warning …").
   Toggling a chip sets the map + roster status filter. Status is shown with a
   glyph + label, never colour alone.
   ========================================================================= */

import { CircleCheck, Eye, OctagonAlert, TriangleAlert } from 'lucide-react'

import type { Status } from '~/lib/types'

const ORDER: Status[] = ['Critical', 'Warning', 'Watch', 'Normal']
const GLYPH: Record<Status, typeof Eye> = {
	Normal: CircleCheck,
	Watch: Eye,
	Warning: TriangleAlert,
	Critical: OctagonAlert,
}

export interface SignalRibbonProps {
	counts: Record<Status, number>
	active: Status | null
	onToggle: (status: Status | null) => void
}

export function SignalRibbon({ counts, active, onToggle }: SignalRibbonProps) {
	return (
		<div className='ribbon' role='group' aria-label='Filter assets by status'>
			{ORDER.map(status => {
				const Glyph = GLYPH[status]
				const on = active === status
				return (
					<button
						key={status}
						type='button'
						className='ribbon__chip'
						data-status={status}
						aria-pressed={on}
						onClick={() => onToggle(on ? null : status)}
					>
						<Glyph size={14} aria-hidden='true' />
						<span className='ribbon__count text-label-medium'>
							{counts[status]}
						</span>
						<span className='ribbon__label text-label-small'>{status}</span>
					</button>
				)
			})}
		</div>
	)
}
