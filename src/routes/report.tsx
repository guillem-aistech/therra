import { createFileRoute, Link } from '@tanstack/react-router'

import { getAsset, getAssetsBySeverity } from '~/lib/data'
import { buildAssetReport } from '~/lib/data/reports'

import './report.css'

interface ReportSearch {
	asset?: string
}

export const Route = createFileRoute('/report')({
	validateSearch: (search: Record<string, unknown>): ReportSearch => ({
		asset: typeof search.asset === 'string' ? search.asset : undefined,
	}),
	component: ReportPage,
})

function formatDate(iso: string): string {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return iso
	return d.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	})
}

function ReportPage() {
	const { asset } = Route.useSearch()

	// Default to the highest-severity asset when no asset is provided, or when
	// the requested id doesn't resolve.
	const assetId = (asset && getAsset(asset)?.id) ?? getAssetsBySeverity()[0]?.id
	const resolved = assetId ? getAsset(assetId) : undefined
	const report = assetId ? buildAssetReport(assetId) : undefined

	if (!resolved || !report) {
		return (
			<main className='report'>
				<div className='report__toolbar'>
					<Link to='/' className='report__back'>
						← Back to workspace
					</Link>
				</div>
				<h1 className='report__title'>Asset not found</h1>
				<p>No report could be generated for the requested asset.</p>
			</main>
		)
	}

	const { meta, sections } = report

	return (
		<main className='report'>
			<div className='report__toolbar'>
				<Link to='/' className='report__back'>
					← Back to workspace
				</Link>
				<button
					type='button'
					className='report__print'
					onClick={() => window.print()}
				>
					Print / Save as PDF
				</button>
			</div>

			<header className='report__header'>
				<div className='report__eyebrow'>
					<span>Therra Intelligence Platform</span>
					<span>{meta.report_type}</span>
					<span className='report__badge'>Phase 0 mock</span>
				</div>
				<h1 className='report__title'>{meta.title}</h1>

				<dl className='report__meta'>
					<div className='report__metaItem'>
						<dt className='report__metaLabel'>Asset</dt>
						<dd className='report__metaValue'>{resolved.name}</dd>
					</div>
					<div className='report__metaItem'>
						<dt className='report__metaLabel'>Type</dt>
						<dd className='report__metaValue'>{resolved.asset_type}</dd>
					</div>
					<div className='report__metaItem'>
						<dt className='report__metaLabel'>Region</dt>
						<dd className='report__metaValue'>
							{resolved.region}, {resolved.country}
						</dd>
					</div>
					<div className='report__metaItem'>
						<dt className='report__metaLabel'>Generated</dt>
						<dd className='report__metaValue'>{formatDate(meta.created_at)}</dd>
					</div>
				</dl>
			</header>

			{sections.map(section => (
				<section key={section.heading} className='report__section'>
					<h2 className='report__sectionHeading'>{section.heading}</h2>
					<ul className='report__body'>
						{section.body.map(line => (
							<li key={`${section.heading}-${line}`}>{line}</li>
						))}
					</ul>
				</section>
			))}

			<footer className='report__footer'>
				Phase 0 mock report — figures are synthesized from public
				Earth-observation data for demonstration. Not for underwriting or
				operational use. Report ID {meta.id}.
			</footer>
		</main>
	)
}
