import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import '~/components/workspace/workspace.css'
import { Logo } from '~/components/Logo'
import type { HoverInfo } from '~/components/map/MapCanvas'
import { MapCanvas } from '~/components/map/MapCanvas'
import {
	HoverPopup,
	InstrumentRail,
	LensSwitcher,
	SelectionSlideOver,
	SignalRibbon,
	useMediaQuery,
} from '~/components/workspace'
import { getAssetsBySeverity } from '~/lib/data'
import { DEFAULT_LENS_ID, getLens, isLensId } from '~/lib/lenses'
import type { Facet, LensId, Status } from '~/lib/types'

const FACETS: Facet[] = ['thermal', 'risk', 'insurance', 'operations', 'data']

interface WorkspaceSearch {
	lens?: LensId
	asset?: string
	facet?: Facet
}

export const Route = createFileRoute('/')({
	validateSearch: (search: Record<string, unknown>): WorkspaceSearch => {
		const lens =
			typeof search.lens === 'string' && isLensId(search.lens)
				? search.lens
				: undefined
		const facet =
			typeof search.facet === 'string' && FACETS.includes(search.facet as Facet)
				? (search.facet as Facet)
				: undefined
		const asset = typeof search.asset === 'string' ? search.asset : undefined
		return { lens, asset, facet }
	},
	component: Workspace,
})

function Workspace() {
	const search = Route.useSearch()
	const lensId = search.lens ?? DEFAULT_LENS_ID
	const selectedId = search.asset
	const facet = search.facet ?? 'thermal'
	const navigate = useNavigate({ from: Route.fullPath })
	const lens = getLens(lensId)

	const [statusFilter, setStatusFilter] = useState<Status | null>(null)
	const [hover, setHover] = useState<HoverInfo | null>(null)
	const [detent, setDetent] = useState<'peek' | 'half' | 'full'>('half')
	const [fitSignal, setFitSignal] = useState(0)

	const isMobile = useMediaQuery('(max-width: 860px)')
	const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

	// Assets in this lens, severity sorted; the ribbon counts ignore the chip.
	const lensAssets = useMemo(
		() =>
			getAssetsBySeverity().filter(a => lens.assetTypes.includes(a.asset_type)),
		[lens],
	)
	const rosterAssets = useMemo(
		() =>
			statusFilter
				? lensAssets.filter(a => a.status === statusFilter)
				: lensAssets,
		[lensAssets, statusFilter],
	)
	const counts = useMemo(() => {
		const c: Record<Status, number> = {
			Normal: 0,
			Watch: 0,
			Warning: 0,
			Critical: 0,
		}
		for (const a of lensAssets) c[a.status]++
		return c
	}, [lensAssets])

	const selected = selectedId
		? lensAssets.find(a => a.id === selectedId)
		: undefined

	function setSearch(next: Partial<WorkspaceSearch>) {
		void navigate({ search: prev => ({ ...prev, ...next }) })
	}

	function onLens(id: LensId) {
		const nextLens = getLens(id)
		const keep =
			selected && nextLens.assetTypes.includes(selected.asset_type)
				? selectedId
				: undefined
		setSearch({ lens: id, asset: keep })
	}

	function onSelect(id: string | null) {
		// The slide-over is its own overlay; never move the roster sheet's
		// detent out from under the user when a selection changes.
		setSearch({ asset: id ?? undefined })
	}

	// Lock body scroll when the mobile sheet is fully open.
	useEffect(() => {
		if (!isMobile) return
		const lock = detent === 'full'
		document.body.style.overflow = lock ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [isMobile, detent])

	const vh = typeof window !== 'undefined' ? window.innerHeight : 800
	const padding = isMobile
		? {
				top: 72,
				bottom: selected ? Math.round(vh * 0.55) : Math.round(vh * 0.32),
			}
		: { top: 96, bottom: 32, left: 380, right: selected ? 452 : 32 }

	const hasSelection = Boolean(selected)

	return (
		<div className='workspace' data-has-selection={hasSelection}>
			<header className='workspace__top'>
				<Link to='/' className='workspace__brand' aria-label='Therra home'>
					<Logo
						className='logo'
						style={{ ['--logo-height' as string]: '1.5rem' }}
					/>
				</Link>
				<LensSwitcher lensId={lensId} onChange={onLens} />
				<nav className='workspace__nav text-label-medium'>
					<Link to='/why-satellites'>Why satellites</Link>
					<Link to='/report' search={{ asset: selectedId }}>
						Report
					</Link>
				</nav>
			</header>

			<div className='workspace__ribbon'>
				<div className='workspace__ribbon-top'>
					<span className='workspace__lenstag text-label-small'>
						{lens.tagline}
					</span>
					<button
						type='button'
						className='fit-btn text-label-small'
						onClick={() => setFitSignal(n => n + 1)}
						title='Fit the map to the assets in this lens'
					>
						<Maximize2 size={13} aria-hidden='true' />
						Fit
					</button>
				</div>
				<SignalRibbon
					counts={counts}
					active={statusFilter}
					onToggle={setStatusFilter}
				/>
			</div>

			<main className='workspace__map'>
				<MapCanvas
					lensId={lensId}
					selectedId={selectedId ?? null}
					statusFilter={statusFilter}
					onSelect={onSelect}
					onHover={setHover}
					padding={padding}
					reducedMotion={reducedMotion}
					fitSignal={fitSignal}
				/>
				{hover && !isMobile && (
					<HoverPopup assetId={hover.id} x={hover.x} y={hover.y} />
				)}
			</main>

			<aside
				className='workspace__rail'
				data-detent={isMobile ? detent : undefined}
			>
				{isMobile && (
					<button
						type='button'
						className='sheet-handle'
						aria-label={
							detent === 'full'
								? 'Collapse roster sheet'
								: 'Expand roster sheet'
						}
						aria-expanded={detent !== 'peek'}
						onClick={() =>
							setDetent(d =>
								d === 'peek' ? 'half' : d === 'half' ? 'full' : 'peek',
							)
						}
					>
						<span className='sheet-handle__grip' />
						<span className='sheet-handle__chevron' aria-hidden='true'>
							{detent === 'full' ? (
								<ChevronDown size={14} />
							) : (
								<ChevronUp size={14} />
							)}
						</span>
					</button>
				)}
				<InstrumentRail
					assets={rosterAssets}
					lens={lens}
					selectedId={selectedId ?? null}
					onSelect={onSelect}
					onHover={id => setHover(id ? { id, x: -9999, y: -9999 } : null)}
				/>
			</aside>

			{selected && (
				<section className='workspace__detail'>
					<SelectionSlideOver
						asset={selected}
						facet={facet}
						lens={lens}
						onFacet={f => setSearch({ facet: f })}
						onClose={() => onSelect(null)}
					/>
				</section>
			)}
		</div>
	)
}
