import { createFileRoute } from '@tanstack/react-router'

import { MapView } from '~/components/MapView'

export const Route = createFileRoute('/')({
	component: Home,
})

function Home() {
	return (
		<main
			className='container stack'
			style={{ paddingBlock: 'var(--space-2xl)' }}
		>
			<header
				className='stack'
				style={{ ['--stack-gap' as string]: 'var(--space-2xs)' }}
			>
				<h1>Therra</h1>
				<p
					style={{
						color: 'var(--color-fg-muted)',
						fontSize: 'var(--font-size-lg)',
					}}
				>
					A TanStack Start MVP with a fluid, token-driven design system.
				</p>
			</header>

			<MapView />
		</main>
	)
}
