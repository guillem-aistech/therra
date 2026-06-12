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

	// Keep the popup inside the viewport-ish by offsetting up-left of cursor.
	const style: React.CSSProperties = {
		left: x,
		top: y,
		transform: 'translate(-50%, calc(-100% - 14px))',
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
