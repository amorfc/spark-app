import { bbox } from "@turf/bbox";
import { BoundingBox } from "@/types/osm";
import * as turf from "@turf/turf";

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
	if (feature == null) {
		return null;
	}

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

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export async function findPolygonAsync(
	features: GeoJSON.Feature[],
	longitude: number,
	latitude: number,
): Promise<GeoJSON.Feature | null> {
	if (!features?.length) return null;

	const targetPoint = turf.point([longitude, latitude]);

	let closestFeature: GeoJSON.Feature | null = null;
	let minDistance = Infinity;

	for (const feature of features) {
		if (
			feature.geometry?.type !== "Polygon" &&
			feature.geometry?.type !== "MultiPolygon"
		) {
			continue;
		}

		const polygon =
			feature.geometry.type === "Polygon"
				? turf.polygon(feature.geometry.coordinates)
				: turf.multiPolygon(feature.geometry.coordinates);

		const center = turf.centerOfMass(polygon);
		const distance = turf.distance(targetPoint, center, {
			units: "kilometers",
		});

		if (distance < minDistance) {
			minDistance = distance;
			closestFeature = feature;
		}
	}

	return closestFeature;
}
