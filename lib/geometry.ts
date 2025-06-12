import { bbox } from "@turf/bbox";
import { BoundingBox } from "@/types/osm";

/**
 * Calculate bounding box from any GeoJSON geometry using Turf.js
 * @param geometry - GeoJSON geometry object
 * @returns BoundingBox object or null if calculation fails
 */
export function calculateBoundsFromGeometry(
	geometry: GeoJSON.Geometry,
): BoundingBox | null {
	try {
		// Use Turf's bbox function to calculate bounding box
		// bbox returns [west, south, east, north]
		const [west, south, east, north] = bbox(geometry);

		return { west, south, east, north };
	} catch (error) {
		console.error("Error calculating bounds from geometry:", error);
		return null;
	}
}

/**
 * Calculate bounding box from GeoJSON Feature using Turf.js
 * @param feature - GeoJSON Feature object
 * @returns BoundingBox object or null if calculation fails
 */
export function calculateBoundsFromFeature(
	feature: GeoJSON.Feature,
): BoundingBox | null {
	try {
		// Use Turf's bbox function to calculate bounding box from feature
		// bbox returns [west, south, east, north]
		const [west, south, east, north] = bbox(feature);

		return { west, south, east, north };
	} catch (error) {
		console.error("Error calculating bounds from feature:", error);
		return null;
	}
}
