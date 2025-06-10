import Mapbox from "@rnmapbox/maps";
import {
	LocationConfig,
	MapCameraConfig,
	IstanbulLocationConfig,
} from "@/constants/geo";
import { SelectedFeature } from "@/hooks/useSelectedFeature";
import { SearchType } from "@/components/select/filter-search-type-select";

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

// Utility function to get camera configuration for different locations
export const getCameraConfig = (locationName: string): MapCameraConfig => {
	let config: LocationConfig;

	switch (locationName.toLowerCase()) {
		case "istanbul":
			config = IstanbulLocationConfig;
			break;
		default:
			// Default to Istanbul if location not found
			config = IstanbulLocationConfig;
			break;
	}

	return {
		centerCoordinate: [config.center1, config.center2],
		zoomLevel: 10,
		animationDuration: 0,
		bounds: {
			ne: [config.ne1, config.ne2],
			sw: [config.sw1, config.sw2],
		},
	};
};

const calculateBoundingBoxArea = (bbox: number[]) => {
	if (!bbox || bbox.length < 4) return 0;
	// bbox format: [minLon, minLat, maxLon, maxLat]
	const width = Math.abs(bbox[2] - bbox[0]); // longitude difference
	const height = Math.abs(bbox[3] - bbox[1]); // latitude difference
	return width * height; // approximate area
};

export const calculateZoomLevel = (
	feature: SelectedFeature,
	searchType: SearchType,
	areaThreshold: number = 0.01,
) => {
	if (searchType === SearchType.DISTRICT) {
		return 10;
	}

	let zoomLevel = 12; // default zoom

	if (feature?.center_coordinate?.coordinates) {
		const area = calculateBoundingBoxArea(
			feature.center_coordinate.coordinates,
		);

		if (area > areaThreshold) {
			zoomLevel = 10; // zoom out for larger areas
		} else {
			zoomLevel = 12; // zoom in for smaller areas
		}
	}
	return zoomLevel;
};
