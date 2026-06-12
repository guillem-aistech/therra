import { createFileRoute, Link } from '@tanstack/react-router'

import {
	EO_SOURCES,
	PHASE0_LIMITATIONS,
	THERRA_IMPROVEMENTS,
} from '~/lib/data/provenance'

import './why-satellites.css'

export const Route = createFileRoute('/why-satellites')({
	component: WhySatellitesPage,
})

interface CompareRow {
	dimension: string
	today: string
	therra: string
}

// Hand-written rows for clarity; the lists below are also surfaced verbatim so
// nothing is hidden from the pitch. Each row contrasts public EO today with the
// dedicated thermal constellation.
const COMPARISON: CompareRow[] = [
	{
		dimension: 'Revisit',
		today: 'Limited & irregular — clear-sky passes days apart',
		therra: 'Daily / sub-daily, tasking on demand',
	},
	{
		dimension: 'Resolution',
		today: 'Coarse (~1 km typical, ~70 m best) — mixed pixels',
		therra: '10–30 m thermal — individual assets, not blends',
	},
	{
		dimension: 'Night imaging',
		today: 'Opportunistic; gaps in 24/7 coverage',
		therra: 'Native night thermal for round-the-clock signatures',
	},
	{
		dimension: 'Latency',
		today: 'Multi-day delivery on key thermal products',
		therra: 'Near-real-time downlink & processing',
	},
	{
		dimension: 'Tasking',
		today: 'None — you take whatever public missions capture',
		therra: 'Point-and-shoot tasking over priority assets',
	},
	{
		dimension: 'Calibration',
		today: 'Cross-sensor thermal calibration varies by mission',
		therra: 'Single radiometrically-stable instrument family',
	},
	{
		dimension: 'Cloud cover',
		today: 'Data gaps and lower-confidence passes',
		therra: 'Dense revisit recovers fast after cloud clears',
	},
]

function WhySatellitesPage() {
	return (
		<main className='pitch container'>
			<Link to='/' className='pitch__back'>
				← Back to workspace
			</Link>

			<header className='pitch__hero'>
				<p className='pitch__eyebrow'>
					<span>Therra Intelligence Platform</span>
					<span className='pitch__badge'>Phase 0 mock</span>
				</p>
				<h1 className='pitch__title'>
					Why we need dedicated thermal satellites.
				</h1>
				<p className='pitch__intro'>
					Therra’s mission is to{' '}
					<span className='pitch__tagline'>
						measure the pulse of civilization
					</span>{' '}
					— every refinery, terminal, data center, and city district has a
					thermal heartbeat. Today we read that heartbeat from public
					Earth-observation missions never designed for it. A dedicated thermal
					constellation turns a coarse, intermittent signal into a sharp,
					continuous one.
				</p>
			</header>

			<section className='pitch__section'>
				<div className='pitch__sectionHead'>
					<h2 className='pitch__sectionTitle'>
						Public EO today vs a Therra constellation
					</h2>
					<p className='pitch__sectionLede'>
						The same risk question, answered with two very different
						instruments.
					</p>
				</div>
				<div className='pitch__tableWrap'>
					<table className='pitch__table pitch__table--compare'>
						<caption>Capability comparison — Phase 0 mock</caption>
						<thead>
							<tr>
								<th scope='col'>Dimension</th>
								<th scope='col' className='pitch__colToday'>
									Public EO today (Phase 0)
								</th>
								<th scope='col' className='pitch__colTherra'>
									Therra dedicated thermal constellation
								</th>
							</tr>
						</thead>
						<tbody>
							{COMPARISON.map(row => (
								<tr key={row.dimension}>
									<th scope='row'>{row.dimension}</th>
									<td className='pitch__colToday'>{row.today}</td>
									<td className='pitch__colTherra'>{row.therra}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className='pitch__section'>
				<div className='pitch__sectionHead'>
					<h2 className='pitch__sectionTitle'>
						The public missions we read today
					</h2>
					<p className='pitch__sectionLede'>
						Phase 0 synthesizes a near-daily composite from these real public
						thermal / EO missions — which is exactly why its limits are honest.
					</p>
				</div>
				<div className='pitch__tableWrap'>
					<table className='pitch__table pitch__table--specs'>
						<caption>Public EO sources — Phase 0 mock</caption>
						<thead>
							<tr>
								<th scope='col'>Mission</th>
								<th scope='col'>Thermal resolution</th>
								<th scope='col'>Revisit</th>
								<th scope='col'>Notes</th>
							</tr>
						</thead>
						<tbody>
							{EO_SOURCES.map(source => (
								<tr key={source.id}>
									<th scope='row'>{source.name}</th>
									<td>{source.thermal_resolution}</td>
									<td>{source.revisit}</td>
									<td>{source.notes}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className='pitch__section'>
				<div className='pitch__callout'>
					<div className='pitch__calloutHead'>
						<h2 className='pitch__calloutTitle'>Honest Phase 0 limitations</h2>
						<span className='pitch__badge'>Phase 0 mock</span>
					</div>
					<ul className='pitch__list'>
						{PHASE0_LIMITATIONS.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>

				<div
					className='pitch__callout'
					style={{
						borderInlineStartColor: 'var(--status-normal)',
					}}
				>
					<div className='pitch__calloutHead'>
						<h2 className='pitch__calloutTitle'>
							What a dedicated constellation unlocks
						</h2>
					</div>
					<ul className='pitch__list'>
						{THERRA_IMPROVEMENTS.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
			</section>
		</main>
	)
}
