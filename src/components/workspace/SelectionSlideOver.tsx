/* =========================================================================
   Therra — SelectionSlideOver
   -------------------------------------------------------------------------
   One detail component over the map with facet tabs (Thermal · Risk ·
   Insurance · Operations · Data). The Thermal Heartbeat always leads the
   Thermal tab. Facets adapt to the asset; vocabulary follows the lens.
   ========================================================================= */

import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import {
	AssetTypeIcon,
	RiskScoreCard,
	StatusBadge,
	ThermalHeartbeatChart,
} from '~/components/primitives'
import {
	getAlertForAsset,
	getObservations,
	getRiskAssessment,
} from '~/lib/data'
import { PHASE0_LIMITATIONS } from '~/lib/data/provenance'
import type { Asset, EOSourceId, Facet, Lens } from '~/lib/types'
import { degC, eur, pct, signedC } from './format'

const FACETS: Facet[] = ['thermal', 'risk', 'insurance', 'operations', 'data']
const FACET_LABEL: Record<Facet, string> = {
	thermal: 'Thermal',
	risk: 'Risk',
	insurance: 'Insurance',
	operations: 'Operations',
	data: 'Data',
}

export interface SelectionSlideOverProps {
	asset: Asset
	facet: Facet
	lens: Lens
	onFacet: (facet: Facet) => void
	onClose: () => void
}

export function SelectionSlideOver({
	asset,
	facet,
	onFacet,
	onClose,
}: SelectionSlideOverProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const closeRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		closeRef.current?.focus()
	}, [])

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation()
			onClose()
			return
		}
		if (e.key !== 'Tab') return
		const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
			'button, a[href], [tabindex]:not([tabindex="-1"])',
		)
		if (!focusables || focusables.length === 0) return
		const first = focusables[0]
		const last = focusables[focusables.length - 1]
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault()
			last?.focus()
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault()
			first?.focus()
		}
	}

	return (
		<div
			className='slideover'
			role='dialog'
			aria-modal='false'
			aria-label={`${asset.name} details`}
			ref={panelRef}
			onKeyDown={onKeyDown}
		>
			<header className='slideover__head'>
				<div className='slideover__title'>
					<span className='slideover__icon'>
						<AssetTypeIcon type={asset.asset_type} size={20} />
					</span>
					<div>
						<h2 className='text-title-medium'>{asset.name}</h2>
						<p className='slideover__sub text-label-small'>
							{asset.asset_type} · {asset.region}, {asset.country}
						</p>
					</div>
				</div>
				<div className='slideover__head-right'>
					<StatusBadge status={asset.status} />
					<button
						type='button'
						className='slideover__close'
						aria-label='Close details'
						onClick={onClose}
						ref={closeRef}
					>
						<X size={18} />
					</button>
				</div>
			</header>

			<div className='slideover__operator text-label-small'>
				Operated by {asset.operator} · <span className='tag'>Phase 0 mock</span>
			</div>

			<div className='facetstrip' role='tablist' aria-label='Detail facet'>
				{FACETS.map(f => (
					<button
						key={f}
						type='button'
						role='tab'
						aria-selected={f === facet}
						className='facetstrip__tab text-label-medium'
						onClick={() => onFacet(f)}
					>
						{FACET_LABEL[f]}
					</button>
				))}
			</div>

			<div className='slideover__body'>
				{facet === 'thermal' && <ThermalFacet asset={asset} />}
				{facet === 'risk' && <RiskFacet asset={asset} />}
				{facet === 'insurance' && <InsuranceFacet asset={asset} />}
				{facet === 'operations' && <OperationsFacet asset={asset} />}
				{facet === 'data' && <DataFacet asset={asset} />}
			</div>
		</div>
	)
}

/* --- facets ------------------------------------------------------------ */

function ThermalFacet({ asset }: { asset: Asset }) {
	const obs = getObservations(asset.id)
	const alert = getAlertForAsset(asset.id)
	return (
		<div className='facet stack'>
			<div className='facet__chart'>
				<h3 className='facet__h text-label-medium'>90-day Thermal Heartbeat</h3>
				<ThermalHeartbeatChart
					observations={[...obs]}
					status={asset.status}
					height={200}
				/>
			</div>
			<div className='tilegrid'>
				<RiskScoreCard
					label='Current'
					value={degC(asset.current_temperature_c)}
				/>
				<RiskScoreCard
					label='Baseline'
					value={degC(asset.baseline_temperature_c)}
				/>
				<RiskScoreCard
					label='Δ vs baseline'
					value={signedC(asset.thermal_delta_c)}
					status={asset.status}
				/>
				<RiskScoreCard
					label='Health'
					value={asset.health_score}
					max={100}
					status={asset.status}
				/>
			</div>
			{alert && (
				<div className='alertcard' data-severity={alert.severity}>
					<div className='alertcard__head'>
						<StatusBadge status={asset.status} size='sm' />
						<span className='text-label-large'>{alert.title}</span>
					</div>
					<p className='text-body-small'>{alert.description}</p>
					<p className='alertcard__action text-label-small'>
						Suggested: {alert.suggested_action}
					</p>
				</div>
			)}
		</div>
	)
}

function RiskFacet({ asset }: { asset: Asset }) {
	const ra = getRiskAssessment(asset.id)
	return (
		<div className='facet stack'>
			<div className='tilegrid'>
				<RiskScoreCard
					label='Risk score'
					value={asset.risk_score}
					max={100}
					status={asset.status}
				/>
				<RiskScoreCard
					label='Fire-risk index'
					value={ra?.fire_risk_index ?? '—'}
					max={100}
				/>
				<RiskScoreCard
					label='Business interruption'
					value={ra?.business_interruption_risk ?? '—'}
					max={100}
				/>
				<RiskScoreCard
					label='Catastrophe exposure'
					value={ra?.catastrophe_exposure_score ?? '—'}
					max={100}
				/>
				<RiskScoreCard
					label='Thermal volatility'
					value={ra?.thermal_volatility_score ?? '—'}
					max={100}
				/>
				<RiskScoreCard
					label='Inspection priority'
					value={ra?.inspection_priority_score ?? '—'}
					max={100}
				/>
			</div>
			{ra && (
				<>
					<p className='facet__explain text-body-small'>{ra.explanation}</p>
					<div>
						<h3 className='facet__h text-label-medium'>Recommended actions</h3>
						<ul className='facet__recs text-body-small'>
							{ra.recommendations.map(r => (
								<li key={r}>{r}</li>
							))}
						</ul>
					</div>
				</>
			)}
		</div>
	)
}

function InsuranceFacet({ asset }: { asset: Asset }) {
	const ra = getRiskAssessment(asset.id)
	const elevated = asset.status === 'Critical' || asset.status === 'Warning'
	return (
		<div className='facet stack'>
			<div className='tilegrid'>
				<RiskScoreCard
					label='Insured exposure'
					value={eur(asset.insurance_exposure_eur)}
				/>
				<RiskScoreCard label='Criticality' value={asset.criticality} />
				<RiskScoreCard
					label='Catastrophe exposure'
					value={ra?.catastrophe_exposure_score ?? '—'}
					max={100}
					status={asset.status}
				/>
				<RiskScoreCard
					label='Inspection priority'
					value={ra?.inspection_priority_score ?? '—'}
					max={100}
				/>
			</div>
			<p className='facet__explain text-body-small'>
				{elevated
					? 'The elevated thermal signature materially raises near-term loss probability for this asset class; recommend re-pricing review and a tasked confirmation pass.'
					: 'No material change to the underwriting profile at this time; exposure tracked for portfolio aggregation.'}
			</p>
			<Link className='facet__link' to='/report' search={{ asset: asset.id }}>
				Open full insurance report →
			</Link>
		</div>
	)
}

function OperationsFacet({ asset }: { asset: Asset }) {
	const ra = getRiskAssessment(asset.id)
	return (
		<div className='facet stack'>
			<div className='tilegrid'>
				<RiskScoreCard
					label='Operational load'
					value={pct(asset.operational_load_pct)}
					status={asset.status}
				/>
				<RiskScoreCard
					label='Capacity utilization'
					value={pct(asset.capacity_utilization_pct)}
				/>
				<RiskScoreCard
					label='Health'
					value={asset.health_score}
					max={100}
					status={asset.status}
				/>
				{asset.flare_intensity_mw !== undefined && (
					<RiskScoreCard
						label='Flare intensity'
						value={`${Math.round(asset.flare_intensity_mw)} MW`}
					/>
				)}
			</div>
			{ra && (
				<div>
					<h3 className='facet__h text-label-medium'>Recommended actions</h3>
					<ul className='facet__recs text-body-small'>
						{ra.recommendations.map(r => (
							<li key={r}>{r}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

function DataFacet({ asset }: { asset: Asset }) {
	const obs = getObservations(asset.id)
	const counts = obs.reduce<Record<string, number>>((acc, o) => {
		acc[o.source] = (acc[o.source] ?? 0) + 1
		return acc
	}, {})
	const avgConfidence =
		obs.reduce((s, o) => s + o.confidence, 0) / Math.max(1, obs.length)
	const cloudy = obs.filter(o => o.cloud_cover_percent >= 55).length

	const SOURCE_NAME: Record<EOSourceId, string> = {
		landsat: 'Landsat 8/9',
		'sentinel-3': 'Sentinel-3',
		modis: 'MODIS',
		viirs: 'VIIRS',
		ecostress: 'ECOSTRESS',
	}

	return (
		<div className='facet stack'>
			<div className='tilegrid'>
				<RiskScoreCard label='Observations' value={obs.length} />
				<RiskScoreCard
					label='Avg confidence'
					value={avgConfidence.toFixed(2)}
				/>
				<RiskScoreCard
					label='Cloud-affected'
					value={cloudy}
					unit={`/ ${obs.length}`}
				/>
				<RiskScoreCard
					label='Last pass'
					value={asset.last_observation_at.slice(0, 10)}
				/>
			</div>
			<div>
				<h3 className='facet__h text-label-medium'>Source composite</h3>
				<table className='datatable text-label-small'>
					<thead>
						<tr>
							<th>Mission</th>
							<th>Passes</th>
						</tr>
					</thead>
					<tbody>
						{Object.entries(counts).map(([id, n]) => (
							<tr key={id}>
								<td>{SOURCE_NAME[id as EOSourceId] ?? id}</td>
								<td className='datatable__num'>{n}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div>
				<h3 className='facet__h text-label-medium'>Phase 0 limitations</h3>
				<ul className='facet__recs text-body-small'>
					{PHASE0_LIMITATIONS.map(l => (
						<li key={l}>{l}</li>
					))}
				</ul>
			</div>
			<Link className='facet__link' to='/why-satellites'>
				Why dedicated satellites →
			</Link>
		</div>
	)
}
