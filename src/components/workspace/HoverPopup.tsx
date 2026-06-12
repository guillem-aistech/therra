/* =========================================================================
   Therra — HoverPopup
   -------------------------------------------------------------------------
   A themed, no-shadow popup that follows the cursor over the map. Sparkline +
   text only; the full Recharts heartbeat lives in the slide-over.
   ========================================================================= */

import { Sparkline, StatusBadge } from '~/components/primitives'
import { getAsset, getObservations } from '~/lib/data'

export interface HoverPopupProps {
	assetId: string
	x: number
	y: number
}

export function HoverPopup({ assetId, x, y }: HoverPopupProps) {
	const asset = getAsset(assetId)
	if (!asset) return null
	const values = getObservations(assetId)
		.slice(-30)
		.map(o => o.land_surface_temperature_c)

	// Clamp horizontally and flip below the cursor near the top edge so the
	// popup never spills off-screen.
	const W = 200
	const H = 96
	const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
	const clampedX = Math.min(Math.max(x, W / 2 + 8), vw - W / 2 - 8)
	const below = y < H + 24
	const style: React.CSSProperties = {
		left: clampedX,
		top: y,
		transform: below
			? 'translate(-50%, 16px)'
			: 'translate(-50%, calc(-100% - 14px))',
	}

	return (
		<div className='hover-popup' style={style} role='tooltip'>
			<div className='hover-popup__head'>
				<span className='hover-popup__name text-label-large'>{asset.name}</span>
				<StatusBadge status={asset.status} size='sm' />
			</div>
			<div className='hover-popup__row text-label-small'>
				<span>{asset.asset_type}</span>
				<span className='hover-popup__temp'>
					{asset.current_temperature_c.toFixed(1)}°C
				</span>
			</div>
			<Sparkline
				values={values}
				status={asset.status}
				width={172}
				height={28}
			/>
		</div>
	)
}
