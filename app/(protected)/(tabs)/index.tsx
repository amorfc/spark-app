import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import Mapbox, {
	MapView,
	Camera,
	UserLocation,
	ShapeSource,
	FillLayer,
} from "@rnmapbox/maps";
import type { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { SearchableSelect } from "@/components/searchable-select";

import {
	initializeMapbox,
	ISTANBUL_BOUNDS,
	DEFAULT_CAMERA,
} from "@/lib/mapbox";

// Import the GeoJSON data
import districtsDataRaw from "@/assets/geo/istanbul/districts.json";
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";

// Type the imported data as any for now to avoid strict type checking issues
const districtsData = districtsDataRaw as any;
const neighborhoodsData = neighborhoodsDataRaw as any;

interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
	polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

interface SelectedFeature {
	id: string;
	name: string;
	type: "district" | "neighborhood";
	properties: any;
}

export default function MapScreen() {
	const mapRef = useRef<MapView>(null);
	const cameraRef = useRef<Camera>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedFeature, setSelectedFeature] =
		useState<SelectedFeature | null>(null);

	// Initialize Mapbox
	useEffect(() => {
		const initMap = async () => {
			try {
				await initializeMapbox();
			} catch (err) {
				console.error("Failed to initialize map:", err);
				setError(
					err instanceof Error ? err.message : "Failed to initialize map",
				);
				setError("Failed to initialize map");
			}
		};

		initMap();
	}, []);

	const handleSearch = useCallback(
		async (query: string): Promise<NeighborhoodResult[]> => {
			try {
				// Search through local neighborhood data
				const filteredNeighborhoods = neighborhoodsData.features
					.filter(
						(feature: any) =>
							feature.properties.display_name
								.toLowerCase()
								.includes(query.toLowerCase()) ||
							feature.properties.address?.city
								?.toLowerCase()
								.includes(query.toLowerCase()),
					)
					.slice(0, 5)
					.map((feature: any) => ({
						id: feature.properties.place_id.toString(),
						name:
							feature.properties.address?.city ||
							feature.properties.display_name.split(",")[0],
						place_name: feature.properties.display_name,
						center: [
							(feature.bbox[0] + feature.bbox[2]) / 2, // longitude center
							(feature.bbox[1] + feature.bbox[3]) / 2, // latitude center
						] as [number, number],
						polygon: feature.geometry,
					}));

				return filteredNeighborhoods;
			} catch (err) {
				console.error("Error searching location:", err);
				return [];
			}
		},
		[],
	);

	const handleSelect = useCallback((item: NeighborhoodResult) => {
		if (cameraRef.current && item.center) {
			const [lng, lat] = item.center;
			cameraRef.current.setCamera({
				centerCoordinate: [lng, lat],
				zoomLevel: 14,
				animationDuration: 1000,
			});
		}

		// Set selected feature for highlighting
		setSelectedFeature({
			id: item.id,
			name: item.name,
			type: "neighborhood",
			properties: {},
		});
	}, []);

	const onMapLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	// Handle district click
	const onDistrictPress = useCallback((event: OnPressEvent) => {
		const feature = event.features[0];
		if (feature && feature.properties) {
			const selectedDistrict: SelectedFeature = {
				id: feature.properties.place_id?.toString() || "unknown",
				name:
					feature.properties.address?.archipelago ||
					feature.properties.display_name?.split(",")[0] ||
					"Unknown District",
				type: "district",
				properties: feature.properties,
			};

			setSelectedFeature(selectedDistrict);

			// Center map on clicked district
			if (cameraRef.current && feature.properties.bbox) {
				const bbox = feature.properties.bbox;
				const centerLng = (bbox[0] + bbox[2]) / 2;
				const centerLat = (bbox[1] + bbox[3]) / 2;

				cameraRef.current.setCamera({
					centerCoordinate: [centerLng, centerLat],
					zoomLevel: 12,
					animationDuration: 1000,
				});
			}
		}
	}, []);

	// Handle neighborhood click
	const onNeighborhoodPress = useCallback((event: OnPressEvent) => {
		const feature = event.features[0];
		if (feature && feature.properties) {
			const selectedNeighborhood: SelectedFeature = {
				id: feature.properties.place_id?.toString() || "unknown",
				name:
					feature.properties.address?.city ||
					feature.properties.display_name?.split(",")[0] ||
					"Unknown Neighborhood",
				type: "neighborhood",
				properties: feature.properties,
			};

			setSelectedFeature(selectedNeighborhood);

			// Center map on clicked neighborhood
			if (cameraRef.current && feature.properties.bbox) {
				const bbox = feature.properties.bbox;
				const centerLng = (bbox[0] + bbox[2]) / 2;
				const centerLat = (bbox[1] + bbox[3]) / 2;

				cameraRef.current.setCamera({
					centerCoordinate: [centerLng, centerLat],
					zoomLevel: 14,
					animationDuration: 1000,
				});
			}
		}
	}, []);

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<SearchableSelect<NeighborhoodResult>
				onSearch={handleSearch}
				onSelect={handleSelect}
				placeholder="Search neighborhoods in Istanbul..."
				minSearchLength={2}
				debounceMs={300}
				getItemLabel={(item) => item.place_name}
			/>
			{isLoading && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#0080ff" />
				</View>
			)}
			<MapView
				ref={mapRef}
				style={styles.map}
				styleURL={Mapbox.StyleURL.Street}
				onDidFinishLoadingMap={onMapLoad}
				compassEnabled={true}
				compassViewPosition={2}
				logoEnabled={false}
				attributionEnabled={true}
			>
				<Camera
					ref={cameraRef}
					centerCoordinate={DEFAULT_CAMERA.centerCoordinate}
					zoomLevel={DEFAULT_CAMERA.zoomLevel}
					animationDuration={DEFAULT_CAMERA.animationDuration}
					bounds={ISTANBUL_BOUNDS}
				/>

				<UserLocation
					visible={true}
					animated={true}
					showsUserHeadingIndicator={true}
				/>

				{/* Districts Layer */}
				<ShapeSource
					id="districts-source"
					shape={districtsData}
					onPress={onDistrictPress}
				>
					<FillLayer
						id="districts-fill"
						style={{
							fillColor: [
								"case",
								[
									"==",
									["get", "place_id"],
									selectedFeature?.type === "district"
										? parseInt(selectedFeature.id)
										: -1,
								],
								"#FF69B4", // Hot pink for selected district
								"#E6F3FF", // Light blue for unselected districts
							],
							fillOpacity: [
								"case",
								[
									"==",
									["get", "place_id"],
									selectedFeature?.type === "district"
										? parseInt(selectedFeature.id)
										: -1,
								],
								0.8,
								0.3,
							],
							fillOutlineColor: "#0080ff",
						}}
					/>
				</ShapeSource>

				{/* Neighborhoods Layer */}
				<ShapeSource
					id="neighborhoods-source"
					shape={neighborhoodsData}
					onPress={onNeighborhoodPress}
				>
					<FillLayer
						id="neighborhoods-fill"
						style={{
							fillColor: [
								"case",
								[
									"==",
									["get", "place_id"],
									selectedFeature?.type === "neighborhood"
										? parseInt(selectedFeature.id)
										: -1,
								],
								"#FFB6C1", // Light pink for selected neighborhood
								"#F0F8FF", // Alice blue for unselected neighborhoods
							],
							fillOpacity: [
								"case",
								[
									"==",
									["get", "place_id"],
									selectedFeature?.type === "neighborhood"
										? parseInt(selectedFeature.id)
										: -1,
								],
								0.7,
								0.2,
							],
							fillOutlineColor: "#FF1493",
						}}
					/>
				</ShapeSource>
			</MapView>

			{/* Selected Feature Info */}
			{selectedFeature && (
				<View style={styles.infoContainer}>
					<Text style={styles.infoTitle}>
						{selectedFeature.type === "district" ? "District" : "Neighborhood"}
					</Text>
					<Text style={styles.infoName}>{selectedFeature.name}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		flex: 1,
	},
	loadingContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#fff",
	},
	errorText: {
		color: "red",
		fontSize: 16,
		textAlign: "center",
	},
	infoContainer: {
		position: "absolute",
		bottom: 100,
		left: 20,
		right: 20,
		backgroundColor: "white",
		padding: 16,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	infoTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
		textTransform: "uppercase",
	},
	infoName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginTop: 4,
	},
});
