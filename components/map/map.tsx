import {
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";
import {
	View,
	StyleSheet,
	ActivityIndicator,
	Text,
	TouchableOpacity,
} from "react-native";
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
import { useSelectedFeature } from "@/hooks/useSelectedFeature";
import { SearchType } from "@/components/select/filter-search-type-select";
import { BoundingBox, FeatureType } from "@/types/osm";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { useOSMBoundingBoxSearch } from "@/hooks/useOsmData";

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

		// Use ref for bounds to avoid re-renders
		const boundsRef = useRef<BoundingBox | null>(null);

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

		const mapMode = useMemo<MapMode>(() => {
			return searchType === SearchType.PUBLIC_TRANSPORT
				? MapMode.POI
				: MapMode.FREE;
		}, [searchType]);

		const isFreeMode = useMemo(() => {
			return mapMode === MapMode.FREE;
		}, [mapMode]);

		const bounds = useMemo(() => {
			if (isFreeMode) {
				const istanbulBounds = {
					east: 29.113325840965217,
					north: 41.20712871580946,
					south: 40.808668899963436,
					west: 28.84347415903514,
				};
				return istanbulBounds;
			} else {
				return boundsRef.current;
			}
		}, [isFreeMode]);

		const {
			data: geoJsonData,
			isLoading,
			refetch,
		} = useOSMBoundingBoxSearch(bounds as BoundingBox, {
			feature_types: searchOSMFeatureTypes,
		});

		const { feature: selectedFeature } = useSelectedFeature();

		// Get camera configuration for the specified location
		const cameraConfig = getCameraConfig(selectedCity);
		const polygonStyle = usePolygonStyle({
			selectedFeature: selectedFeature || null,
			variant,
		});

		const handleMapLoad = useCallback(() => {
			onMapLoad?.();
		}, [onMapLoad]);

		const onShapePress = useCallback(
			async (event: OnPressEvent) => {
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
				const clampedZoomLevel = isFreeMode ? Math.min(zoomLevel, 14) : 16;

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

		// Manual refresh function for transport data
		const handleRefreshTransport = useCallback(async () => {
			console.log("handleRefreshTransport");
			if (mapRef.current && !isFreeMode) {
				const visibleBounds = await mapRef.current.getVisibleBounds();
				const newBounds: BoundingBox = {
					north: visibleBounds[0][1], // northeast lat
					east: visibleBounds[0][0], // northeast lng
					south: visibleBounds[1][1], // southwest lat
					west: visibleBounds[1][0], // southwest lng
				};

				// Update bounds ref and refetch
				boundsRef.current = newBounds;
				console.log({ newBounds });

				refetch();
			}
		}, [isFreeMode, refetch]);

		// Update bounds ref when camera changes (without triggering re-render)
		const handleCameraChanged = useCallback(async (event: any) => {
			const bounds = event.properties.bounds;
			boundsRef.current = {
				north: bounds.ne[1],
				east: bounds.ne[0],
				south: bounds.sw[1],
				west: bounds.sw[0],
			};
		}, []);

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
				{/* Refresh button for non-free mode */}
				{!isFreeMode && (
					<TouchableOpacity
						style={styles.refreshButton}
						onPress={handleRefreshTransport}
						activeOpacity={0.7}
					>
						<Text style={styles.refreshButtonText}>🔄</Text>
					</TouchableOpacity>
				)}

				<MapView
					ref={mapRef}
					style={styles.map}
					styleURL={Mapbox.StyleURL.Street}
					onDidFinishLoadingMap={handleMapLoad}
					compassEnabled={true}
					compassViewPosition={2}
					logoEnabled={false}
					attributionEnabled={false}
					onCameraChanged={handleCameraChanged}
				>
					<Camera
						ref={cameraRef}
						centerCoordinate={cameraConfig.centerCoordinate}
						zoomLevel={
							isFreeMode
								? Math.min(cameraConfig.zoomLevel, 14)
								: cameraConfig.zoomLevel
						}
						maxZoomLevel={isFreeMode ? 14 : 22} // Allow zoom to 22 for transport mode
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

					{/* POI Pins for transport mode */}
					{mapMode === MapMode.POI &&
						geoJsonData?.features
							?.map((poi: any, index: number) => {
								return (
									<PointAnnotation
										key={`transport-${poi.properties.ref_id}-${index}`}
										id={`transport-${poi.properties.ref_id}-${index}`}
										coordinate={poi.geometry.coordinates as Position}
										onSelected={() => onFeaturePress(poi.properties.ref_id)}
									>
										<View style={[styles.pinContainer]}>
											<Text style={styles.pinText}>{getPinIcon(poi)}</Text>
										</View>
										<Callout title={poi.properties.name || "Transport Stop"} />
									</PointAnnotation>
								);
							})
							?.filter(Boolean)}
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
	refreshButton: {
		position: "absolute",
		top: 60,
		left: 20,
		backgroundColor: "#3B82F6",
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		zIndex: 10,
	},
	refreshButtonText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "600",
	},
});

Map.displayName = "Map";

export default Map;
