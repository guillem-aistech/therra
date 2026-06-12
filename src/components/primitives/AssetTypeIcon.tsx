import type { LucideIcon } from 'lucide-react'
import {
	Anchor,
	Building2,
	Cable,
	Container,
	Droplets,
	Factory,
	Flame,
	PlugZap,
	Route,
	Server,
	Sun,
	TreePine,
	Warehouse,
	Zap,
} from 'lucide-react'

import type { AssetType } from '~/lib/types'

const ICON: Record<AssetType, LucideIcon> = {
	'Oil Refinery': Factory,
	'LNG Terminal': Container,
	'Gas Flare Site': Flame,
	'Power Plant': Zap,
	'Electrical Substation': PlugZap,
	'Power Line Corridor': Cable,
	'Data Center': Server,
	'Port / Logistics Hub': Anchor,
	'Warehouse / Industrial': Warehouse,
	'Desalination Plant': Droplets,
	'Urban District': Building2,
	'Wildfire Risk Zone': TreePine,
	'Solar Farm': Sun,
	'Pipeline Segment': Route,
}

interface AssetTypeIconProps {
	type: AssetType
	size?: number
	className?: string
}

/** Maps each of the 14 asset classes to a sensible lucide glyph. */
export function AssetTypeIcon({
	type,
	size = 18,
	className,
}: AssetTypeIconProps) {
	const Icon = ICON[type]
	return (
		<Icon size={size} strokeWidth={2} className={className} aria-label={type} />
	)
}
