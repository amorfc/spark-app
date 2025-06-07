import { useCallback, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SearchableSelect } from "@/components/searchable-select";
import Map from "@/components/map/map";
import {
	filter,
	map,
	take,
	deburr,
	toLower,
	includes,
	memoize,
	orderBy,
} from "lodash";

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

	// Pre-process and memoize neighborhood data for better search performance
	const processedNeighborhoods = useMemo(() => {
		return map(neighborhoodsData.features, (feature: any) => {
			const displayName = feature.properties.display_name || "";
			const cityName = feature.properties.address?.city || "";

			return {
				id: feature.properties.place_id?.toString() || "",
				name: cityName || displayName.split(",")[0] || "Unknown",
				place_name: displayName,
				center: [
					(feature.bbox[0] + feature.bbox[2]) / 2,
					(feature.bbox[1] + feature.bbox[3]) / 2,
				] as [number, number],
				polygon: feature.geometry,
				// Pre-processed search fields (normalized for better search)
				searchText: toLower(deburr(`${displayName} ${cityName}`)),
				originalFeature: feature,
			};
		});
	}, []);

	// Memoized search function for better performance
	const searchNeighborhoods = useMemo(
		() =>
			memoize((query: string) => {
				if (!query || query.length < 2) return [];

				// Normalize search query
				const normalizedQuery = toLower(deburr(query));

				// Filter and score results
				const results = filter(processedNeighborhoods, (neighborhood) =>
					includes(neighborhood.searchText, normalizedQuery),
				);

				// Sort by relevance (exact matches first, then by length)
				const sortedResults = orderBy(
					results,
					[
						// Exact match in name gets highest priority
						(item) => (toLower(item.name) === normalizedQuery ? 0 : 1),
						// Then by how early the match appears
						(item) => item.searchText.indexOf(normalizedQuery),
						// Then by length (shorter names are more relevant)
						(item) => item.name.length,
					],
					["asc", "asc", "asc"],
				);

				// Return top 5 results
				return take(sortedResults, 5);
			}),
		[processedNeighborhoods],
	);

	const centerToFeature = useCallback((feature: SelectedFeature) => {
		if (feature && mapRef.current?.centerOnCoordinates) {
			mapRef.current?.centerOnCoordinates(feature.center, 14);
		}
	}, []);

	const handleSearch = useCallback(
		async (query: string): Promise<NeighborhoodResult[]> => {
			try {
				return searchNeighborhoods(query);
			} catch (err) {
				console.error("Error searching location:", err);
				return [];
			}
		},
		[searchNeighborhoods],
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
