import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import Mapbox, {
	MapView,
	ShapeSource,
	FillLayer,
	Camera,
	UserLocation,
} from "@rnmapbox/maps";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
	initializeMapbox,
	ISTANBUL_BOUNDS,
	DEFAULT_CAMERA,
	LAYER_IDS,
	NEIGHBORHOOD_STYLE,
} from "@/lib/mapbox";

// Types for our neighborhood data
interface NeighborhoodFeature
	extends Feature<
		Geometry,
		{
			mahalle_adi: string;
			ilce_adi: string;
			selected?: boolean;
		}
	> {}

interface NeighborhoodCollection
	extends FeatureCollection<
		Geometry,
		{
			mahalle_adi: string;
			ilce_adi: string;
			selected?: boolean;
		}
	> {}

// Cache key for neighborhoods
const NEIGHBORHOOD_CACHE_KEY = "@neighborhoods_cache";

export default function MapScreen() {
	const mapRef = useRef<MapView>(null);
	const [neighborhoods, setNeighborhoods] =
		useState<NeighborhoodCollection | null>(null);
	const [selectedNeighborhood, setSelectedNeighborhood] = useState<
		string | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize Mapbox
	useEffect(() => {
		const initMap = async () => {
			try {
				await initializeMapbox();
				await loadNeighborhoods();
			} catch (err) {
				console.error("Failed to initialize map:", err);
				setError(
					err instanceof Error ? err.message : "Failed to initialize map",
				);
			}
		};

		initMap();
	}, []);

	// Load neighborhoods from cache or fetch them
	const loadNeighborhoods = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Try to load from cache first
			const cached = await AsyncStorage.getItem(NEIGHBORHOOD_CACHE_KEY);
			if (cached) {
				setNeighborhoods(JSON.parse(cached));
				return;
			}

			// If not in cache, fetch from your API or static file
			// TODO: Replace with your actual data source
			const response = await fetch("YOUR_NEIGHBORHOOD_GEOJSON_URL");
			if (!response.ok) {
				throw new Error(
					`Failed to fetch neighborhoods: ${response.statusText}`,
				);
			}

			const data: NeighborhoodCollection = await response.json();

			// Cache the data
			await AsyncStorage.setItem(NEIGHBORHOOD_CACHE_KEY, JSON.stringify(data));
			setNeighborhoods(data);
		} catch (err) {
			console.error("Error loading neighborhoods:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load neighborhoods",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onPress = useCallback(
		async (event: any) => {
			if (!mapRef.current || !neighborhoods) return;

			try {
				const features = await mapRef.current.queryRenderedFeaturesAtPoint(
					[event.properties.screenPointX, event.properties.screenPointY],
					[LAYER_IDS.NEIGHBORHOODS],
				);

				if (features && features.features && features.features.length > 0) {
					const feature = features.features[0] as NeighborhoodFeature;
					const mahalleAdi = feature.properties.mahalle_adi;

					// Reset previous selection
					if (selectedNeighborhood && mapRef.current) {
						try {
							await mapRef.current.setFeatureState(
								{ source: LAYER_IDS.NEIGHBORHOODS, id: selectedNeighborhood },
								{ selected: false },
							);
						} catch (err) {
							console.error("Error resetting feature state:", err);
						}
					}

					// Update selection
					setSelectedNeighborhood((prev) => {
						const newSelection = prev === mahalleAdi ? null : mahalleAdi;
						if (newSelection && mapRef.current) {
							try {
								mapRef.current.setFeatureState(
									{ source: LAYER_IDS.NEIGHBORHOODS, id: newSelection },
									{ selected: true },
								);
							} catch (err) {
								console.error("Error setting feature state:", err);
							}
						}
						return newSelection;
					});
				}
			} catch (err) {
				console.error("Error handling map press:", err);
			}
		},
		[neighborhoods, selectedNeighborhood],
	);

	const onMapLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

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
				onPress={onPress}
				onDidFinishLoadingMap={onMapLoad}
				compassEnabled={true}
				compassViewPosition={2}
				logoEnabled={false}
				attributionEnabled={true}
			>
				<Camera
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

				{neighborhoods && (
					<ShapeSource id={LAYER_IDS.NEIGHBORHOODS} shape={neighborhoods}>
						<FillLayer
							id={LAYER_IDS.NEIGHBORHOODS_FILL}
							style={NEIGHBORHOOD_STYLE}
						/>
					</ShapeSource>
				)}
			</MapView>
		</View>
	);
}

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
