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
	zoomLevel: 10,
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
		"#ff0000", // Selected color
		"#0080ff", // Default color
	],
	fillOpacity: [
		"case",
		["boolean", ["feature-state", "selected"], false],
		0.8,
		0.5,
	],
	fillOutlineColor: "#000000",
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
