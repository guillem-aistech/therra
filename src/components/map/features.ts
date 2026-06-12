/* =========================================================================
   Therra — Map feature builder
   -------------------------------------------------------------------------
   Turns the asset dataset into a single GeoJSON FeatureCollection. Point
   assets carry their lat/lon Point; corridors/pipelines carry a LineString
   and zones/districts a Polygon (from each asset's geometry_geojson). All
   feature-driving values live in `properties` so the lens re-ramp can switch
   paint expressions without ever calling setData (AGENTS.md → Map impl).
   ========================================================================= */

import type { Asset } from '~/lib/types'

export interface AssetFeatureProps {
	assetId: string
	name: string
	type: string
	status: string
	risk: number
	current: number
	delta: number
	operational_load_pct: number
	capacity_utilization_pct: number
	flare_intensity_mw: number
	hazard_proximity_score: number
	insurance_exposure_eur: number
}

export type AssetFeature = GeoJSON.Feature<GeoJSON.Geometry, AssetFeatureProps>

function geometryFor(asset: Asset): GeoJSON.Geometry {
	if (asset.geometry_geojson) return asset.geometry_geojson
	return { type: 'Point', coordinates: [asset.longitude, asset.latitude] }
}

export function assetToFeature(asset: Asset): AssetFeature {
	return {
		type: 'Feature',
		geometry: geometryFor(asset),
		properties: {
			assetId: asset.id,
			name: asset.name,
			type: asset.asset_type,
			status: asset.status,
			risk: asset.risk_score,
			current: asset.current_temperature_c,
			delta: asset.thermal_delta_c,
			operational_load_pct: asset.operational_load_pct,
			capacity_utilization_pct: asset.capacity_utilization_pct,
			flare_intensity_mw: asset.flare_intensity_mw ?? 0,
			hazard_proximity_score: asset.hazard_proximity_score,
			insurance_exposure_eur: asset.insurance_exposure_eur,
		},
	}
}

export function buildFeatureCollection(
	assets: readonly Asset[],
): GeoJSON.FeatureCollection<GeoJSON.Geometry, AssetFeatureProps> {
	return { type: 'FeatureCollection', features: assets.map(assetToFeature) }
}
