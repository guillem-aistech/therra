/* =========================================================================
   Therra — InstrumentRail
   -------------------------------------------------------------------------
   The severity-sorted roster of named asset rows. It is the workspace's
   first-frame "real ops tool" signal, the reliable tap target on phones, and
   the keyboard / screen-reader path to the data (the non-map data path).
   ========================================================================= */

import { useRef } from 'react'

import { AssetTypeIcon, StatusBadge } from '~/components/primitives'
import type { Asset, Lens } from '~/lib/types'
import { lensMetricValue, signedC } from './format'

export interface InstrumentRailProps {
	assets: Asset[]
	lens: Lens
	selectedId: string | null
	onSelect: (id: string) => void
	onHover?: (id: string | null) => void
}

export function InstrumentRail({
	assets,
	lens,
	selectedId,
	onSelect,
	onHover,
}: InstrumentRailProps) {
	const listRef = useRef<HTMLUListElement>(null)

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
		e.preventDefault()
		const buttons = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>(
				'button[data-row]',
			) ?? [],
		)
		const idx = buttons.findIndex(b => b === document.activeElement)
		const next =
			e.key === 'ArrowDown'
				? Math.min(buttons.length - 1, idx + 1)
				: Math.max(0, idx - 1)
		buttons[next]?.focus()
	}

	return (
		<div className='rail'>
			<div className='rail__head'>
				<h2 className='rail__title text-title-small'>
					{lens.vocabulary.roster}
				</h2>
				<span className='rail__count text-label-small'>{assets.length}</span>
			</div>
			<ul
				className='rail__list'
				ref={listRef}
				onKeyDown={onKeyDown}
				aria-label={`${lens.vocabulary.roster} roster, severity sorted`}
			>
				{assets.map(a => {
					const metric = a[lens.metric]
					return (
						<li key={a.id}>
							<button
								type='button'
								data-row
								className='rail__row'
								aria-current={a.id === selectedId}
								onClick={() => onSelect(a.id)}
								onMouseEnter={() => onHover?.(a.id)}
								onMouseLeave={() => onHover?.(null)}
								onFocus={() => onHover?.(a.id)}
								onBlur={() => onHover?.(null)}
							>
								<span className='rail__icon'>
									<AssetTypeIcon type={a.asset_type} size={16} />
								</span>
								<span className='rail__name'>
									<span className='rail__name-main text-body-medium'>
										{a.name}
									</span>
									<span className='rail__name-sub text-label-small'>
										{a.region} ·{' '}
										{lensMetricValue(
											typeof metric === 'number' ? metric : 0,
											lens.metricUnit,
										)}
									</span>
								</span>
								<span className='rail__metrics'>
									<span className='rail__temp text-label-medium'>
										{a.current_temperature_c.toFixed(1)}°
									</span>
									<span
										className='rail__delta text-label-small'
										data-sign={a.thermal_delta_c >= 0 ? 'pos' : 'neg'}
									>
										{signedC(a.thermal_delta_c)}
									</span>
								</span>
								<StatusBadge status={a.status} size='sm' />
							</button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
