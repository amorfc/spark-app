import Mapbox from "@rnmapbox/maps";

let isInitialized = false;

// Initialize Mapbox with your access token
export const initializeMapbox = async () => {
	if (isInitialized) {
		return;
	}

	const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

	if (!token) {
		throw new Error(
			"Mapbox access token is not set. Please set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file.",
		);
	}

	try {
		Mapbox.setAccessToken(token);
		Mapbox.setTelemetryEnabled(false);
		isInitialized = true;
	} catch (error) {
		console.error("Failed to initialize Mapbox:", error);
		throw new Error(
			"Failed to initialize Mapbox. Please check your access token and try again.",
		);
	}
};

// Istanbul bounds for map restriction
export const ISTANBUL_BOUNDS = {
	ne: [29.5, 41.3] as [number, number], // Northeast coordinates
	sw: [28.5, 40.8] as [number, number], // Southwest coordinates
};

// Default camera position for Istanbul
export const DEFAULT_CAMERA = {
	centerCoordinate: [28.9784, 41.0082] as [number, number], // Istanbul center
	zoomLevel: 11,
	animationDuration: 0,
};

// Layer IDs for our map
export const LAYER_IDS = {
	NEIGHBORHOODS: "neighborhoods",
	NEIGHBORHOODS_FILL: "neighborhoods-fill",
} as const;

// Style for neighborhood layers
export const NEIGHBORHOOD_STYLE = {
	fillColor: [
		"case",
		["boolean", ["feature-state", "selected"], false],
		"#FF69B4", // Hot pink for selected
		"#FFB6C1", // Light pink for default
	],
	fillOpacity: [
		"case",
		["boolean", ["feature-state", "selected"], false],
		0.8,
		0.5,
	],
	fillOutlineColor: "#FF1493", // Deep pink for outline
} as const;

// utils/mapboxApi.ts

export enum MapboxGeocodingType {
	PLACE = "place", // Cities, towns
	LOCALITY = "locality", // Urban localities
	NEIGHBORHOOD = "neighborhood", // Mahalle
	ADDRESS = "address", // Full addresses
	POI = "poi", // Points of Interest
}

export type BoundingBox = [
	minLng: number,
	minLat: number,
	maxLng: number,
	maxLat: number,
];

interface GeocodingOptions {
	query: string;
	types?: MapboxGeocodingType[];
	bbox?: BoundingBox;
	country?: string;
	limit?: number;
}

export async function searchMapboxGeocoding({
	query,
	types = [MapboxGeocodingType.LOCALITY],
	bbox = [
		ISTANBUL_BOUNDS.sw[0],
		ISTANBUL_BOUNDS.sw[1],
		ISTANBUL_BOUNDS.ne[0],
		ISTANBUL_BOUNDS.ne[1],
	],
	country = "tr",
	limit = 5,
}: GeocodingOptions) {
	const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Mapbox access token is missing. Check your .env file.");
	}

	const params = new URLSearchParams({
		bbox: bbox.join(","),
		access_token: token,
		country,
		types: types.join(","),
		limit: String(limit),
	});

	const baseUrl = process.env.EXPO_PUBLIC_MAPBOX_BASE_URL;
	const fullUrl = `${baseUrl}${query}.json?${params.toString()}`;
	console.log({ fullUrl });

	const response = await fetch(fullUrl, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
	});
	if (!response.ok) {
		const errText = await response.text();
		throw new Error(
			`Mapbox Geocoding API error: ${response.status} – ${errText}`,
		);
	}

	return await response.json();
}

// Update the interface to include polygon data
interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
	polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

// Add new search function that includes polygon data
export async function searchNeighborhoods(
	query: string,
): Promise<NeighborhoodResult[]> {
	const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Mapbox access token is missing. Check your .env file.");
	}

	// First, search for the neighborhood
	const searchParams = new URLSearchParams({
		access_token: token,
		country: "tr",
		types: MapboxGeocodingType.NEIGHBORHOOD,
		limit: "5",
		bbox: [
			ISTANBUL_BOUNDS.sw[0],
			ISTANBUL_BOUNDS.sw[1],
			ISTANBUL_BOUNDS.ne[0],
			ISTANBUL_BOUNDS.ne[1],
		].join(","),
	});

	const baseUrl = process.env.EXPO_PUBLIC_MAPBOX_BASE_URL;
	const searchUrl = `${baseUrl}${encodeURIComponent(query)}.json?${searchParams.toString()}`;

	const searchResponse = await fetch(searchUrl);
	if (!searchResponse.ok) {
		throw new Error(`Search failed: ${searchResponse.statusText}`);
	}

	const searchData = await searchResponse.json();

	// For each result, fetch the polygon data
	const results = await Promise.all(
		searchData.features.map(async (feature: any) => {
			// Get the polygon data using the Mapbox Tilequery API
			const tilequeryParams = new URLSearchParams({
				access_token: token,
				radius: "0",
				limit: "1",
				dedupe: "true",
				geometry: "polygon",
			});

			const [lng, lat] = feature.center;
			const tilequeryUrl = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?${tilequeryParams.toString()}`;

			try {
				const tilequeryResponse = await fetch(tilequeryUrl);
				if (!tilequeryResponse.ok) {
					throw new Error(`Tilequery failed: ${tilequeryResponse.statusText}`);
				}

				const tilequeryData = await tilequeryResponse.json();
				const polygon = tilequeryData.features[0]?.geometry;

				return {
					id: feature.id,
					name: feature.text,
					place_name: feature.place_name,
					center: feature.center,
					polygon: polygon,
				};
			} catch (error) {
				console.error("Failed to fetch polygon data:", error);
				return {
					id: feature.id,
					name: feature.text,
					place_name: feature.place_name,
					center: feature.center,
				};
			}
		}),
	);

	return results;
}
