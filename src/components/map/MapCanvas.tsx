/* =========================================================================
   Therra — MapCanvas (the instrument surface)
   -------------------------------------------------------------------------
   One dark Mapbox map, one GeoJSON source (promoteId 'assetId'), three
   status-coloured layers (fill / line / circle). The lens re-ramp swaps paint
   + filter with the camera held still; selection/hover ride on feature-state
   so they survive the swap. mapbox-gl is dynamically imported on the client
   only (SSR-safe). See AGENTS.md → Map implementation.
   ========================================================================= */

import { useEffect, useRef } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

import { getAsset, getAssets } from '~/lib/data'
import { getLens } from '~/lib/lenses'
import type { LensId, Status } from '~/lib/types'
import {
	colorExpression,
	layerFilter,
	lensTypeFilter,
	lineWidthExpression,
	radiusExpression,
	type StatusColors,
	strokeColorExpression,
	strokeWidthExpression,
} from './expressions'
import { buildFeatureCollection } from './features'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const SOURCE = 'assets'
const FILL = 'asset-fill'
const LINE = 'asset-line'
const CIRCLE = 'asset-circle'
const STYLE = 'mapbox://styles/mapbox/dark-v11'

export interface HoverInfo {
	id: string
	x: number
	y: number
}

export interface MapCanvasProps {
	lensId: LensId
	selectedId: string | null
	statusFilter: Status | null
	onSelect: (id: string | null) => void
	onHover?: (info: HoverInfo | null) => void
	/** Padding (px) to keep the selected asset clear of panels. */
	padding?: { top?: number; bottom?: number; left?: number; right?: number }
	reducedMotion?: boolean
}

function readStatusColors(): StatusColors {
	const fallback: StatusColors = {
		Normal: '#5cd99a',
		Watch: '#7fc0ff',
		Warning: '#ff9d5c',
		Critical: '#ff7d82',
	}
	if (typeof window === 'undefined') return fallback
	const s = getComputedStyle(document.documentElement)
	const read = (name: string, fb: string) =>
		s.getPropertyValue(name).trim() || fb
	return {
		Normal: read('--status-normal', fallback.Normal),
		Watch: read('--status-watch', fallback.Watch),
		Warning: read('--status-warning', fallback.Warning),
		Critical: read('--status-critical', fallback.Critical),
	}
}

export function MapCanvas(props: MapCanvasProps) {
	const { lensId, selectedId, statusFilter, onSelect, onHover } = props
	const containerRef = useRef<HTMLDivElement>(null)
	const mapRef = useRef<import('mapbox-gl').Map | null>(null)
	const readyRef = useRef(false)
	const hoverRef = useRef<string | null>(null)
	const accentRef = useRef('#ffba38')

	// Keep the latest callbacks without re-running the mount effect.
	const onSelectRef = useRef(onSelect)
	const onHoverRef = useRef(onHover)
	onSelectRef.current = onSelect
	onHoverRef.current = onHover

	/* --- create the map once -------------------------------------------- */
	// biome-ignore lint/correctness/useExhaustiveDependencies: the map is built once on mount; prop-driven updates live in the effects below.
	useEffect(() => {
		const container = containerRef.current
		if (!container || !MAPBOX_TOKEN) return
		let cancelled = false

		void (async () => {
			const mapboxgl = (await import('mapbox-gl')).default
			if (cancelled || !containerRef.current) return
			mapboxgl.accessToken = MAPBOX_TOKEN

			const map = new mapboxgl.Map({
				container: containerRef.current,
				style: STYLE,
				center: [9, 41],
				zoom: 3.4,
				attributionControl: false,
				cooperativeGestures: true,
				pitchWithRotate: false,
				dragRotate: false,
			})
			mapRef.current = map
			map.touchZoomRotate.disableRotation()
			map.addControl(
				new mapboxgl.NavigationControl({ showCompass: false }),
				'top-right',
			)
			map.addControl(
				new mapboxgl.ScaleControl({ unit: 'metric' }),
				'bottom-left',
			)

			map.on('load', () => {
				if (cancelled) return
				const colors = readStatusColors()
				accentRef.current =
					getComputedStyle(document.documentElement)
						.getPropertyValue('--color-primary')
						.trim() || '#ffba38'
				const lens = getLens(lensId)
				const typeFilter = lensTypeFilter(lens)

				map.addSource(SOURCE, {
					type: 'geojson',
					data: buildFeatureCollection(getAssets()),
					promoteId: 'assetId',
				})

				map.addLayer({
					id: FILL,
					type: 'fill',
					source: SOURCE,
					filter: layerFilter('Polygon', typeFilter),
					paint: {
						'fill-color': colorExpression(colors),
						'fill-opacity': 0.18,
						'fill-outline-color': colorExpression(colors),
					},
				})
				map.addLayer({
					id: LINE,
					type: 'line',
					source: SOURCE,
					filter: layerFilter('LineString', typeFilter),
					layout: { 'line-cap': 'round', 'line-join': 'round' },
					paint: {
						'line-color': colorExpression(colors),
						'line-width': lineWidthExpression(lens),
						'line-opacity': 0.9,
					},
				})
				map.addLayer({
					id: CIRCLE,
					type: 'circle',
					source: SOURCE,
					filter: layerFilter('Point', typeFilter),
					paint: {
						'circle-color': colorExpression(colors),
						'circle-radius': radiusExpression(lens),
						'circle-opacity': 0.92,
						'circle-stroke-color': strokeColorExpression(accentRef.current),
						'circle-stroke-width': strokeWidthExpression(),
					},
				})

				readyRef.current = true
				applyLens(map, lensId, statusFilter)
				applySelection(map, selectedId, props.padding, true)

				/* interactions */
				const interactive = [CIRCLE, LINE, FILL]
				for (const layer of interactive) {
					map.on('mousemove', layer, e => {
						map.getCanvas().style.cursor = 'pointer'
						const f = e.features?.[0]
						const id = f?.properties?.assetId as string | undefined
						if (!id) return
						if (hoverRef.current !== id) {
							setHover(map, hoverRef.current, false)
							setHover(map, id, true)
							hoverRef.current = id
						}
						onHoverRef.current?.({ id, x: e.point.x, y: e.point.y })
					})
					map.on('mouseleave', layer, () => {
						map.getCanvas().style.cursor = ''
						setHover(map, hoverRef.current, false)
						hoverRef.current = null
						onHoverRef.current?.(null)
					})
					map.on('click', layer, e => {
						const id = e.features?.[0]?.properties?.assetId as
							| string
							| undefined
						if (id) onSelectRef.current(id)
					})
				}
				map.on('click', e => {
					const hits = map.queryRenderedFeatures(e.point, {
						layers: [CIRCLE, LINE, FILL],
					})
					if (hits.length === 0) onSelectRef.current(null)
				})
			})
		})()

		const ro = new ResizeObserver(() => mapRef.current?.resize())
		if (container) ro.observe(container)

		return () => {
			cancelled = true
			ro.disconnect()
			readyRef.current = false
			mapRef.current?.remove()
			mapRef.current = null
		}
	}, [])

	/* --- lens re-ramp (paint + filter, camera still) -------------------- */
	useEffect(() => {
		const map = mapRef.current
		if (map && readyRef.current) applyLens(map, lensId, statusFilter)
	}, [lensId, statusFilter])

	/* --- selection (camera + feature-state) ----------------------------- */
	useEffect(() => {
		const map = mapRef.current
		if (map && readyRef.current)
			applySelection(map, selectedId, props.padding, props.reducedMotion)
	}, [selectedId, props.padding, props.reducedMotion])

	if (!MAPBOX_TOKEN) {
		return (
			<div
				className='map-canvas map-canvas--placeholder'
				data-testid='map-missing-token'
			>
				<p>
					<strong>Map unavailable.</strong> Set{' '}
					<code>VITE_MAPBOX_ACCESS_TOKEN</code> in <code>.env</code> and restart
					the dev server.
				</p>
			</div>
		)
	}

	return (
		<div
			ref={containerRef}
			className='map-canvas'
			role='application'
			aria-label='Therra thermal map — interactive workspace. Use the asset roster for keyboard access.'
		/>
	)
}

/* --- module helpers ---------------------------------------------------- */

let selectedKey: string | null = null

function setHover(
	map: import('mapbox-gl').Map,
	id: string | null,
	on: boolean,
) {
	if (!id) return
	map.setFeatureState({ source: SOURCE, id }, { hover: on })
}

function applyLens(
	map: import('mapbox-gl').Map,
	lensId: LensId,
	statusFilter: Status | null,
) {
	const lens = getLens(lensId)
	const typeFilter = lensTypeFilter(lens)
	// Fold the status chip into the filter so it composes with the lens.
	const compose = (geom: 'Point' | 'LineString' | 'Polygon') => {
		const base = layerFilter(geom, typeFilter)
		if (!statusFilter) return base
		return [
			'all',
			base,
			['==', ['get', 'status'], statusFilter],
		] as unknown as import('mapbox-gl').ExpressionSpecification
	}
	map.setFilter(FILL, compose('Polygon'))
	map.setFilter(LINE, compose('LineString'))
	map.setFilter(CIRCLE, compose('Point'))
	map.setPaintProperty(CIRCLE, 'circle-radius', radiusExpression(lens))
	map.setPaintProperty(LINE, 'line-width', lineWidthExpression(lens))
}

function applySelection(
	map: import('mapbox-gl').Map,
	selectedId: string | null,
	padding: MapCanvasProps['padding'],
	reducedMotion?: boolean,
) {
	if (selectedKey && selectedKey !== selectedId)
		map.setFeatureState(
			{ source: SOURCE, id: selectedKey },
			{ selected: false },
		)
	selectedKey = selectedId
	if (!selectedId) return
	map.setFeatureState({ source: SOURCE, id: selectedId }, { selected: true })

	const asset = getAsset(selectedId)
	if (!asset) return
	map.easeTo({
		center: [asset.longitude, asset.latitude],
		zoom: Math.max(map.getZoom(), 6.5),
		padding: {
			top: padding?.top ?? 0,
			bottom: padding?.bottom ?? 0,
			left: padding?.left ?? 0,
			right: padding?.right ?? 0,
		},
		duration: reducedMotion ? 0 : 800,
	})
}
