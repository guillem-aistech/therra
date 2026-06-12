import { useEffect, useRef } from 'react'
// Mapbox GL stylesheet is required for the map to render correctly.
// Importing it here is SSR-safe — Vite extracts it into a CSS asset.
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

export interface MapViewProps {
  /** [longitude, latitude] — defaults to Barcelona. */
  center?: [number, number]
  zoom?: number
  /** Mapbox style URL. */
  styleUrl?: string
}

export function MapView({
  center = [2.1734, 41.3851],
  zoom = 11,
  styleUrl = 'mapbox://styles/mapbox/streets-v12',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !MAPBOX_TOKEN) return

    // mapbox-gl touches `window`/WebGL at import time, so load it lazily on the
    // client only. This keeps it out of the SSR bundle entirely.
    let map: import('mapbox-gl').Map | undefined
    let cancelled = false

    void (async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      if (cancelled || !containerRef.current) return

      mapboxgl.accessToken = MAPBOX_TOKEN
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleUrl,
        center,
        zoom,
      })
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
    })()

    return () => {
      cancelled = true
      map?.remove()
    }
    // Initialize once on mount; prop changes after mount are intentionally
    // ignored for this simple starter component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="map" data-testid="map-missing-token">
        <div className="map__placeholder">
          <p>
            <strong>Map unavailable.</strong> Set{' '}
            <code>VITE_MAPBOX_ACCESS_TOKEN</code> in your <code>.env</code> file
            (see <code>.env.example</code>) and restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="map"
      role="application"
      aria-label="Map view"
      data-testid="map"
    />
  )
}
