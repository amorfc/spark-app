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
import { getCameraBounds } from "@/lib/mapbox";

import { BoundingBox } from "@/types/osm";
import MapPolygon from "@/components/map/map-polygon";
import { MapPois } from "@/components/map/map-pois";

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
	onMapLoad?: () => void;
	variant?: "subtle" | "moderate" | "vibrant";
	onShapePress?: (payload: GeoJSON.Feature) => void;
	onPointPress: (payload: GeoJSON.Feature) => void;
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
			onShapePress,
			onPointPress,
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
							animationDuration: 400,
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
						400,
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

					{/* Filling Layer Shape if presented */}
					{shape && <MapPolygon shape={shape} variant={variant} />}

					{/* POI Pins for transport mode */}
					{pois && <MapPois pois={pois.features} onPointPress={onPointPress} />}
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
