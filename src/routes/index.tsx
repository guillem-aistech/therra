import { createFileRoute } from '@tanstack/react-router'

import { Logo } from '~/components/Logo'
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
				<h1 style={{ margin: 0 }}>
					<Logo
						className='logo'
						style={{ ['--logo-height' as string]: '2.5rem' }}
					/>
				</h1>
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
