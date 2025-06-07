import {
	useCallback,
	useEffect,
	useRef,
	useState,
	forwardRef,
	useImperativeHandle,
} from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import Mapbox, {
	MapView,
	Camera,
	UserLocation,
	ShapeSource,
	FillLayer,
} from "@rnmapbox/maps";
import type { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { initializeMapbox, getCameraConfig } from "@/lib/mapbox";
import { SelectedFeature } from "@/app/(protected)/(tabs)/index";

interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapProps {
	location: string;
	geoJsonData: GeoJSON.FeatureCollection;
	selectedFeature: SelectedFeature | null;
	onFeaturePress: (feature: SelectedFeature) => void;
	onMapLoad?: () => void;
}

const Map = forwardRef<MapRef, MapProps>(
	(
		{ location, geoJsonData, selectedFeature, onFeaturePress, onMapLoad },
		ref,
	) => {
		const mapRef = useRef<MapView>(null);
		const cameraRef = useRef<Camera>(null);
		const [isLoading, setIsLoading] = useState(true);
		const [error, setError] = useState<string | null>(null);

		// Get camera configuration for the specified location
		const cameraConfig = getCameraConfig(location);

		// Initialize Mapbox
		useEffect(() => {
			const initMap = async () => {
				try {
					await initializeMapbox();
				} catch (err) {
					console.error("Failed to initialize map:", err);
					setError("Failed to initialize map");
				}
			};

			initMap();
		}, []);

		const handleMapLoad = useCallback(() => {
			setIsLoading(false);
			onMapLoad?.();
		}, [onMapLoad]);

		// Handle neighborhood click
		const onNeighborhoodPress = useCallback(
			(event: OnPressEvent) => {
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
						place_name: feature.properties.place_name,
						center: feature.properties.center,
					};

					onFeaturePress(selectedNeighborhood);

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
			},
			[onFeaturePress],
		);

		// Public method to center camera on coordinates
		const centerOnCoordinates = useCallback(
			(coordinates: [number, number], zoomLevel: number = 14) => {
				if (cameraRef.current) {
					cameraRef.current.setCamera({
						centerCoordinate: coordinates,
						zoomLevel,
						animationDuration: 1000,
					});
				}
			},
			[],
		);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				centerOnCoordinates,
			}),
			[centerOnCoordinates],
		);

		if (error) {
			return (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			);
		}

		// Validate GeoJSON data
		const isValidGeoJSON =
			geoJsonData &&
			geoJsonData.type === "FeatureCollection" &&
			Array.isArray(geoJsonData.features);

		return (
			<View style={styles.container}>
				{isLoading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#0080ff" />
					</View>
				)}
				<MapView
					ref={mapRef}
					style={styles.map}
					styleURL={Mapbox.StyleURL.Street}
					onDidFinishLoadingMap={handleMapLoad}
					compassEnabled={true}
					compassViewPosition={2}
					logoEnabled={false}
					attributionEnabled={true}
				>
					<Camera
						ref={cameraRef}
						centerCoordinate={cameraConfig.centerCoordinate}
						zoomLevel={cameraConfig.zoomLevel}
						animationDuration={cameraConfig.animationDuration}
						bounds={cameraConfig.bounds}
					/>

					<UserLocation
						visible={true}
						animated={true}
						showsUserHeadingIndicator={true}
					/>

					{/* Neighborhoods Layer */}
					{isValidGeoJSON && (
						<ShapeSource
							key={`neighborhoods-source-${selectedFeature?.id || "none"}`}
							id="neighborhoods-source"
							shape={geoJsonData}
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
											selectedFeature ? parseInt(selectedFeature.id) : -1,
										],
										"#FFB6C1", // Light pink for selected neighborhood
										"#F0F8FF", // Alice blue for unselected neighborhoods
									],
									fillOpacity: [
										"case",
										[
											"==",
											["get", "place_id"],
											selectedFeature ? parseInt(selectedFeature.id) : -1,
										],
										0.7,
										0.2,
									],
									fillOutlineColor: "#FF1493",
								}}
							/>
						</ShapeSource>
					)}
				</MapView>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
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

Map.displayName = "Map";

export default Map;
