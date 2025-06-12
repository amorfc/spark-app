import Mapbox from "@rnmapbox/maps";
import { BoundingBox } from "@/types/osm";

let isInitialized = false;

// Initialize Mapbox with your access token
export const initializeMapbox = async () => {
	if (isInitialized) {
		return true;
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
		return true;
	} catch (error) {
		console.error("Failed to initialize Mapbox:", error);
		throw new Error(
			"Failed to initialize Mapbox. Please check your access token and try again.",
		);
	}
};

export const getCameraBounds = (bounds: BoundingBox): CameraBounds => {
	return {
		ne: [bounds.east, bounds.north],
		sw: [bounds.west, bounds.south],
	};
};

export interface CameraBounds {
	ne: [number, number]; // [longitude, latitude]
	sw: [number, number]; // [longitude, latitude]
}
