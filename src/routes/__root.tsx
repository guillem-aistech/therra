import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

// Self-hosted brand/body fonts (IBM Plex Sans for UI, IBM Plex Mono for
// metrics). Side-effect imports so Vite bundles the woff2 + @font-face CSS.
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import appCss from '../styles/global.css?url'

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'theme-color', content: '#16130e' },
			{ title: 'Therra' },
		],
		links: [
			{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
			{ rel: 'stylesheet', href: appCss },
		],
	}),
	component: RootComponent,
})

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	)
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang='en'>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
