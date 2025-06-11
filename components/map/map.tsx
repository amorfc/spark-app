import {
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
} from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import Mapbox, {
	MapView,
	Camera,
	ShapeSource,
	FillLayer,
	PointAnnotation,
	Callout,
} from "@rnmapbox/maps";
import type { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { getCameraConfig } from "@/lib/mapbox";
import { SelectedFeatureId, useSearch } from "@/context/search-provider";
import { usePolygonStyle } from "@/hooks/usePolygonStyle";
import { CameraBounds } from "@/services/poi-service";
import { useOSMMapData } from "@/hooks/useOsmData";
import { useSelectedFeature } from "@/hooks/useSelectedFeature";
import { SearchType } from "@/components/select/filter-search-type-select";
import { FeatureType } from "@/types/osm";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapProps {
	onFeaturePress: (id: SelectedFeatureId) => void;
	onMapLoad?: () => void;
	variant?: "subtle" | "moderate" | "vibrant";
	onCameraChanged?: (bounds: CameraBounds, zoomLevel: number) => void;
}

export enum MapMode {
	FREE = "free",
	POI = "poi",
}

const Map = forwardRef<MapRef, MapProps>(
	({ onFeaturePress, onMapLoad, variant = "subtle" }, ref) => {
		const mapRef = useRef<MapView>(null);
		const cameraRef = useRef<Camera>(null);

		const { selectedCity, searchType } = useSearch();
		const searchOSMFeatureTypes: FeatureType[] = useMemo(() => {
			switch (searchType) {
				case SearchType.DISTRICT:
					return ["district"];
				case SearchType.NEIGHBORHOOD:
					return ["neighborhood"];
				case SearchType.PUBLIC_TRANSPORT:
					return [
						"bus_stop",
						"tram_station",
						"ferry_terminal",
						"metro_station",
						"other_transport",
					];
			}
		}, [searchType]);

		const { data: geoJsonData, isLoading } = useOSMMapData(
			searchOSMFeatureTypes,
		);

		const { feature: selectedFeature } = useSelectedFeature();

		// Get camera configuration for the specified location
		const cameraConfig = getCameraConfig(selectedCity);
		const polygonStyle = usePolygonStyle({
			selectedFeature: selectedFeature || null,
			variant,
		});

		const mapMode = useMemo<MapMode>(() => {
			return searchType === SearchType.PUBLIC_TRANSPORT
				? MapMode.POI
				: MapMode.FREE;
		}, [searchType]);
		const isFreeMode = useMemo(() => {
			return mapMode === MapMode.FREE;
		}, [mapMode]);

		const handleMapLoad = useCallback(() => {
			onMapLoad?.();
		}, [onMapLoad]);

		const onShapePress = useCallback(
			(event: OnPressEvent) => {
				const feature = event.features[0];
				const featureId = feature?.properties?.ref_id || -1;
				onFeaturePress(featureId);
			},
			[onFeaturePress],
		);

		// Public method to center camera on coordinates
		const centerOnCoordinates = useCallback(
			(coordinates: [number, number], zoomLevel: number = 14) => {
				// Enforce maximum zoom level
				const clampedZoomLevel = isFreeMode ? Math.min(zoomLevel, 14) : 22;

				if (cameraRef.current) {
					try {
						cameraRef.current.setCamera({
							centerCoordinate: coordinates,
							zoomLevel: clampedZoomLevel,
							animationDuration: 1000,
						});
					} catch (error) {
						console.error("Error setting camera:", error);
					}
				}
			},
			[isFreeMode],
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
			geoJsonData &&
			geoJsonData?.type === "FeatureCollection" &&
			Array.isArray(geoJsonData?.features);

		// Get pin styling from POI_CATEGORY_CONFIG
		const getPinIcon = useCallback((poi: any) => {
			switch (poi?.properties?.feature_type) {
				case "bus_stop":
					return "🚌";
				case "tram_station":
					return "🚊";
				case "ferry_terminal":
					return "🚢";
				case "metro_station":
					return "🚇";
				case "other_transport":
					return "🚌";
				default:
					return "📍";
			}
		}, []);

		if (isLoading) {
			return (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#3B82F6" />
				</View>
			);
		}

		return (
			<View style={styles.container}>
				<MapView
					ref={mapRef}
					style={styles.map}
					styleURL={Mapbox.StyleURL.Street}
					onDidFinishLoadingMap={handleMapLoad}
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

					{isFreeMode && isValidGeoJSON && (
						<ShapeSource
							key={`feature-source-${selectedFeature?.ref_id || "none"}`}
							id="feature-source"
							shape={geoJsonData}
							onPress={onShapePress}
						>
							<FillLayer id="feature-fill" style={polygonStyle} />
						</ShapeSource>
					)}

					{/* POI Pins */}
					{
						mapMode === MapMode.POI &&
							geoJsonData?.features
								.map((poi: any, index: number) => {
									return (
										<PointAnnotation
											key={index.toString()}
											id={index.toString()}
											coordinate={poi.geometry.coordinates as Position}
											onSelected={() => onFeaturePress(poi.properties.ref_id)}
										>
											<View style={[styles.pinContainer]}>
												<Text style={styles.pinText}>{getPinIcon(poi)}</Text>
											</View>
											<Callout title={poi.name || ""} />
										</PointAnnotation>
									);
								})
								.filter(Boolean) // Remove null entries
					}
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
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
	},
	pinText: {
		fontSize: 14,
	},
});

Map.displayName = "Map";

export default Map;
