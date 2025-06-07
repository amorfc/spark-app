import Mapbox from "@rnmapbox/maps";

let isInitialized = false;

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
