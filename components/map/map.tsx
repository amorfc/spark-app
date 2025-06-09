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
import { getCameraConfig } from "@/lib/mapbox";
import {
	FeatureType,
	SelectedFeature,
	useSearch,
} from "@/context/search-provider";
import { usePolygonStyle } from "@/hooks/usePolygonStyle";
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";
import districtsDataRaw from "@/assets/geo/istanbul/districts.json";
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
	location: string;
	geoJsonData: GeoJSON.FeatureCollection;
	selectedFeature: SelectedFeature | null;
	onFeaturePress: (id: string) => void;
	onMapLoad?: () => void;
	variant?: "subtle" | "moderate" | "vibrant";
}

const Map = forwardRef<MapRef, MapProps>(
	({ selectedFeature, onFeaturePress, onMapLoad, variant = "subtle" }, ref) => {
		const mapRef = useRef<MapView>(null);
		const cameraRef = useRef<Camera>(null);

		const { rawGeoJsonData } = useSafeGeoData();
		const { selectedCity } = useSearch();

		// Get camera configuration for the specified location
		const cameraConfig = getCameraConfig(selectedCity);

		// Get polygon styling with variant support
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

		// Validate GeoJSON data
		const isValidGeoJSON =
			rawGeoJsonData &&
			rawGeoJsonData.type === "FeatureCollection" &&
			Array.isArray(rawGeoJsonData.features);

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
