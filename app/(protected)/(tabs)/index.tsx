import { useCallback, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SearchableSelect } from "@/components/searchable-select";
import Map from "@/components/map/map";

// Import the GeoJSON data
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";

// Type the imported data
const neighborhoodsData = neighborhoodsDataRaw as GeoJSON.FeatureCollection;

interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
	polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

type NeigborhoodFeature = NeighborhoodResult & {
	type: "neighborhood";
	properties: any;
};

export type SelectedFeature = NeigborhoodFeature | null;

export default function MapScreen() {
	const mapRef = useRef<{
		centerOnCoordinates: (
			coordinates: [number, number],
			zoomLevel?: number,
		) => void;
	}>(null);
	const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

	const centerToFeature = useCallback((feature: SelectedFeature) => {
		if (feature && mapRef.current?.centerOnCoordinates) {
			mapRef.current?.centerOnCoordinates(feature.center, 14);
		}
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
		// Center map on selected item
		if (mapRef.current?.centerOnCoordinates) {
			mapRef.current.centerOnCoordinates(item.center, 14);
		}

		// Set selected feature for highlighting
		setSelectedFeature({
			id: item.id,
			name: item.name,
			type: "neighborhood",
			properties: {},
			place_name: item.place_name,
			center: item.center,
		});
	}, []);

	const handleFeaturePress = useCallback((feature: SelectedFeature) => {
		setSelectedFeature(feature);
	}, []);

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

			<Map
				ref={mapRef}
				location="istanbul"
				geoJsonData={neighborhoodsData}
				selectedFeature={selectedFeature}
				onFeaturePress={handleFeaturePress}
			/>

			{/* Selected Feature Info */}
			{selectedFeature && (
				<TouchableOpacity
					style={styles.infoContainer}
					onPress={() => centerToFeature(selectedFeature)}
				>
					<Text style={styles.infoTitle}>Neighborhood</Text>
					<Text style={styles.infoName}>{selectedFeature.name}</Text>
				</TouchableOpacity>
			)}
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
