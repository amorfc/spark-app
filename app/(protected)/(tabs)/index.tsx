import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import { SearchableSelect } from "@/components/searchable-select";

import {
	initializeMapbox,
	ISTANBUL_BOUNDS,
	DEFAULT_CAMERA,
	searchMapboxGeocoding,
} from "@/lib/mapbox";

interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
}

export default function MapScreen() {
	const mapRef = useRef<MapView>(null);
	const cameraRef = useRef<Camera>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize Mapbox
	useEffect(() => {
		const initMap = async () => {
			try {
				await initializeMapbox();
				// await loadNeighborhoods();
			} catch (err) {
				console.error("Failed to initialize map:", err);
				setError(
					err instanceof Error ? err.message : "Failed to initialize map",
				);
			}
		};

		initMap();
	}, []);

	const handleSearch = useCallback(
		async (query: string): Promise<NeighborhoodResult[]> => {
			try {
				const data = await searchMapboxGeocoding({ query });
				console.log({ data });
				// Filter results to ensure they're within Istanbul
				const istanbulResults = data.features;
				return istanbulResults.map((feature: any) => ({
					id: feature.id,
					name: feature.text,
					place_name: feature.place_name,
					center: feature.center,
				}));
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
	}, []);

	const onMapLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			// mapRef.current.setBounds(
			// 	[28.5, 40.8], // SW (minLng, minLat)
			// 	[29.5, 41.3], // NE (maxLng, maxLat)
			// 	50, // padding in pixels
			// );
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
				minSearchLength={4}
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

				{/* Comment out ShapeSource for now */}
				{/* {neighborhoods && (
					<ShapeSource id={LAYER_IDS.NEIGHBORHOODS} shape={neighborhoods}>
						<FillLayer
							id={LAYER_IDS.NEIGHBORHOODS_FILL}
							style={NEIGHBORHOOD_STYLE}
						/>
					</ShapeSource>
				)} */}
			</MapView>
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
});
