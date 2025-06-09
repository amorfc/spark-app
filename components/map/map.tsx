import { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet } from "react-native";
import Mapbox, {
	MapView,
	Camera,
	ShapeSource,
	FillLayer,
} from "@rnmapbox/maps";
import type { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { getCameraConfig } from "@/lib/mapbox";
import {
	FeatureType,
	SelectedFeature,
	useSearch,
} from "@/context/search-provider";
import { usePolygonStyle } from "@/hooks/usePolygonStyle";
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";
import districtsDataRaw from "@/assets/geo/istanbul/districts.json";
import {
	POIItem,
	CameraBounds,
	POI_CATEGORY_CONFIG,
} from "@/services/poi-service";
import { useSafeGeoData } from "@/hooks/useSafeGeoData";

export enum CityNames {
	Istanbul = "istanbul",
}

export const CityGeoJson: Record<
	CityNames,
	{
		[FeatureType.Neighborhood]: GeoJSON.FeatureCollection;
		[FeatureType.District]: GeoJSON.FeatureCollection;
	}
> = {
	[CityNames.Istanbul]: {
		[FeatureType.Neighborhood]:
			neighborhoodsDataRaw as unknown as GeoJSON.FeatureCollection,
		[FeatureType.District]:
			districtsDataRaw as unknown as GeoJSON.FeatureCollection,
	},
};

interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapProps {
	selectedFeature: SelectedFeature | null;
	onFeaturePress: (id: string) => void;
	onMapLoad?: () => void;
	variant?: "subtle" | "moderate" | "vibrant";
	pois?: POIItem[];
	onPOIPress?: (poi: POIItem) => void;
	onCameraChanged?: (bounds: CameraBounds, zoomLevel: number) => void;
}

const Map = forwardRef<MapRef, MapProps>(
	(
		{
			onFeaturePress,
			onMapLoad,
			variant = "subtle",
			pois = [],
			onPOIPress,
			onCameraChanged,
			selectedFeature,
		},
		ref,
	) => {
		const mapRef = useRef<MapView>(null);
		const cameraRef = useRef<Camera>(null);

		const { rawGeoJsonData } = useSafeGeoData();
		const { selectedCity } = useSearch();

		// Get camera configuration for the specified location
		const cameraConfig = getCameraConfig(selectedCity);
		const polygonStyle = usePolygonStyle({ selectedFeature, variant });

		const handleMapLoad = useCallback(() => {
			onMapLoad?.();
		}, [onMapLoad]);

		const onShapePress = useCallback(
			(event: OnPressEvent) => {
				const feature = event.features[0];
				onFeaturePress(feature.properties?.place_id?.toString() || "unknown");
			},
			[onFeaturePress],
		);

		// Handle camera movement to get current bounds and zoom level
		const handleCameraChanged = useCallback(async () => {
			if (!mapRef.current || !onCameraChanged) return;

			try {
				const visibleBounds = await mapRef.current.getVisibleBounds();
				const zoom = await mapRef.current.getZoom();

				if (visibleBounds && visibleBounds.length === 2) {
					const bounds: CameraBounds = {
						sw: [visibleBounds[0][0], visibleBounds[0][1]], // [lng, lat]
						ne: [visibleBounds[1][0], visibleBounds[1][1]], // [lng, lat]
					};

					onCameraChanged(bounds, zoom);
				}
			} catch (error) {
				console.error("Error getting camera bounds:", error);
			}
		}, [onCameraChanged]);

		// Public method to center camera on coordinates
		const centerOnCoordinates = useCallback(
			(coordinates: [number, number], zoomLevel: number = 14) => {
				// Enforce maximum zoom level
				const clampedZoomLevel = Math.min(zoomLevel, 14);

				if (cameraRef.current) {
					console.log("setting camerat", coordinates, clampedZoomLevel);
					console.log("ref", cameraRef.current);

					cameraRef.current.setCamera({
						centerCoordinate: coordinates,
						zoomLevel: clampedZoomLevel,
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

		// Validate GeoJSON data
		const isValidGeoJSON =
			rawGeoJsonData &&
			rawGeoJsonData.type === "FeatureCollection" &&
			Array.isArray(rawGeoJsonData.features);

		const handlePOIPress = useCallback(
			(poi: POIItem) => {
				onPOIPress?.(poi);
			},
			[onPOIPress],
		);

		// Get pin styling from POI_CATEGORY_CONFIG
		const getPinIcon = useCallback((poi: POIItem) => {
			return POI_CATEGORY_CONFIG[poi.type]?.icon || "📍";
		}, []);

		const getPinColor = useCallback((poi: POIItem) => {
			return POI_CATEGORY_CONFIG[poi.type]?.color || "#DDA0DD";
		}, []);

		return (
			<View style={styles.container}>
				<MapView
					ref={mapRef}
					style={styles.map}
					styleURL={Mapbox.StyleURL.Street}
					onDidFinishLoadingMap={handleMapLoad}
					onCameraChanged={handleCameraChanged}
					compassEnabled={true}
					compassViewPosition={2}
					logoEnabled={false}
					attributionEnabled={false}
				>
					<Camera
						ref={cameraRef}
						centerCoordinate={cameraConfig.centerCoordinate}
						zoomLevel={Math.min(cameraConfig.zoomLevel, 14)} // Enforce max zoom
						maxZoomLevel={14} // Set maximum zoom level
						animationDuration={cameraConfig.animationDuration}
						bounds={cameraConfig.bounds}
					/>

					{isValidGeoJSON && (
						<ShapeSource
							key={`feature-source-${selectedFeature?.id || "none"}`}
							id="feature-source"
							shape={rawGeoJsonData}
							onPress={onShapePress}
						>
							<FillLayer id="feature-fill" style={polygonStyle} />
						</ShapeSource>
					)}

					{/* POI Pins */}
					{/* {pois.map((poi) => (
						<PointAnnotation
							key={poi.id}
							id={poi.id}
							coordinate={poi.coordinates}
							onSelected={() => handlePOIPress(poi)}
						>
							<View
								style={[
									styles.pinContainer,
									{ backgroundColor: getPinColor(poi) },
								]}
							>
								<Text style={styles.pinText}>{getPinIcon(poi)}</Text>
							</View>
							<Callout title={poi.name} />
						</PointAnnotation>
					))} */}
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
	pinContainer: {
		width: 30,
		height: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "white",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	pinText: {
		fontSize: 14,
	},
});

Map.displayName = "Map";

export default Map;
