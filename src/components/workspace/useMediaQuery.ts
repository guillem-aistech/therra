import { useEffect, useState } from 'react'

/** SSR-safe media-query hook (defaults to `false` on the server). */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false)
	useEffect(() => {
		const mql = window.matchMedia(query)
		const update = () => setMatches(mql.matches)
		update()
		mql.addEventListener('change', update)
		return () => mql.removeEventListener('change', update)
	}, [query])
	return matches
}
