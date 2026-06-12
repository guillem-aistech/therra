/* =========================================================================
   Therra — LensSwitcher
   -------------------------------------------------------------------------
   Switches the customer lens. A lens change is a pure paint/filter re-ramp
   with the camera held still — the demo's signature moment. Rendered as an
   accessible segmented control that scrolls horizontally on narrow screens.
   ========================================================================= */

import { LENS_LIST } from '~/lib/lenses'
import type { LensId } from '~/lib/types'

export interface LensSwitcherProps {
	lensId: LensId
	onChange: (id: LensId) => void
}

export function LensSwitcher({ lensId, onChange }: LensSwitcherProps) {
	return (
		<div className='lens-switcher' role='tablist' aria-label='Customer lens'>
			{LENS_LIST.map(lens => (
				<button
					key={lens.id}
					type='button'
					role='tab'
					aria-selected={lens.id === lensId}
					className='lens-switcher__btn text-label-medium'
					onClick={() => onChange(lens.id)}
					title={lens.tagline}
				>
					{lens.label}
				</button>
			))}
		</div>
	)
}
