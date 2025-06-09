import { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { defaultTo } from "lodash";
import Map from "@/components/map/map";
import { FeatureSelect } from "@/components/select/feature-select";
import { useSearch, SelectedFeature } from "@/context/search-provider";
import { calculateZoomLevel, getCameraConfig } from "@/lib/mapbox";

// Import the GeoJSON data
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";

// Type the imported data
const neighborhoodsData = neighborhoodsDataRaw as GeoJSON.FeatureCollection;

export default function MapScreen() {
	const mapRef = useRef<{
		centerOnCoordinates: (
			coordinates: [number, number],
			zoomLevel?: number,
		) => void;
	}>(null);

	// Use the search context for global state management
	const { selectedFeature, setSelectedFeatureId } = useSearch();

	// Get the original camera configuration for Istanbul
	const originalCameraConfig = getCameraConfig("istanbul");

	const centerTo = useCallback(
		(feature: SelectedFeature) => {
			if (mapRef.current?.centerOnCoordinates) {
				const target = defaultTo(
					feature?.center,
					originalCameraConfig.centerCoordinate,
				);

				mapRef.current.centerOnCoordinates(target, calculateZoomLevel(feature));
			}
		},
		[originalCameraConfig],
	);

	const handleFeaturePress = useCallback(
		(id: string) => {
			id && setSelectedFeatureId(id);
		},
		[setSelectedFeatureId],
	);

	useEffect(() => {
		centerTo(selectedFeature);
	}, [centerTo, selectedFeature]);

	return (
		<View className="flex-1 pt-5">
			<FeatureSelect placeholder="Search neighborhoods in Istanbul..." />

			<Map
				ref={mapRef}
				location="istanbul"
				geoJsonData={neighborhoodsData}
				selectedFeature={selectedFeature}
				onFeaturePress={handleFeaturePress}
				variant="moderate"
			/>

			{/* Selected Feature Info */}
			{selectedFeature && (
				<TouchableOpacity
					style={styles.infoContainer}
					onPress={() => centerTo(selectedFeature)}
				>
					<Text style={styles.infoTitle}>Neighborhood</Text>
					<Text style={styles.infoName}>{selectedFeature.name}</Text>
				</TouchableOpacity>
			)}

			{/* Debug: Clear selection button */}
			<TouchableOpacity
				style={[styles.infoContainer, { bottom: 200, backgroundColor: "red" }]}
				onPress={() => centerTo(null)}
			>
				<Text style={[styles.infoTitle, { color: "white" }]}>
					Clear Selection
				</Text>
				<Text style={[styles.infoName, { color: "white" }]}>
					Back to Original
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
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
