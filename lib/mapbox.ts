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
	ne: [29.5, 41.3], // Northeast coordinates
	sw: [28.5, 40.8], // Southwest coordinates
} as const;

// Default camera position for Istanbul
export const DEFAULT_CAMERA = {
	centerCoordinate: [28.9784, 41.0082], // Istanbul center
	zoomLevel: 11,
	animationDuration: 0,
} as const;

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
