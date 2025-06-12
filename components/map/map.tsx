import {
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
	useEffect,
} from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { getCameraBounds, CameraBounds } from "@/lib/mapbox";

import { BoundingBox } from "@/types/osm";
import MapPolygon from "@/components/map/map-polygon";
import MapPointAnnotation from "./map-point-annotation";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapProps {
	isLoading: boolean;
	currentBounds: BoundingBox;
	shape: GeoJSON.Feature | null | undefined;
	pois: GeoJSON.FeatureCollection | null | undefined;
	onFeaturePress: (id: string) => void;
	onMapLoad?: () => void;
	variant?: "subtle" | "moderate" | "vibrant";
	onCameraChanged?: (bounds: CameraBounds, zoomLevel: number) => void;
}

export enum MapMode {
	FREE = "free",
	POI = "poi",
}

const Map = forwardRef<MapRef, MapProps>(
	(
		{
			isLoading,
			currentBounds,
			shape,
			pois,
			onFeaturePress,
			onMapLoad,
			variant = "subtle",
		},
		ref,
	) => {
		const mapRef = useRef<MapView>(null);
		const cameraRef = useRef<Camera>(null);
		const cameraBounds = useMemo(() => {
			return getCameraBounds(currentBounds);
		}, [currentBounds]);

		const handleMapLoad = useCallback(() => {
			onMapLoad?.();
		}, [onMapLoad]);

		// const onShapePress = useCallback(
		// 	async (event: OnPressEvent) => {
		// 		const feature = event.features[0];
		// 		const featureId = feature?.properties?.ref_id || -1;
		// 		onFeaturePress(featureId);
		// 	},
		// 	[onFeaturePress],
		// );

		// Public method to center camera on coordinates
		const centerOnCoordinates = useCallback(
			(coordinates: [number, number], zoomLevel: number = 14) => {
				// Enforce maximum zoom level
				const clampedZoomLevel = Math.min(zoomLevel, 14);

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

		useEffect(() => {
			if (cameraRef.current) {
				requestAnimationFrame(() => {
					cameraRef.current?.fitBounds(
						cameraBounds.ne,
						cameraBounds.sw,
						10,
						500,
					);
				});
			}
		}, [cameraBounds]);

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
						animationDuration={1000}
						bounds={cameraBounds}
					/>

					{shape && <MapPolygon shape={shape} />}

					{/* POI Pins for transport mode */}

					{pois?.features
						?.filter(Boolean)
						?.filter((poi: GeoJSON.Feature) => {
							// Only show Point geometries with coordinates
							return poi.geometry?.type === "Point" && poi.geometry.coordinates;
						})
						?.map((poi: GeoJSON.Feature, index: number) => {
							return (
								<MapPointAnnotation
									key={`transport-${poi.properties?.ref_id}-${index}`}
									poi={poi}
									index={index}
									onFeaturePress={onFeaturePress}
									isLast={index === pois.features.length - 1}
								/>
							);
						})}
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
