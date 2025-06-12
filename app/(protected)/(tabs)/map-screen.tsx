import { useCallback, useMemo, useRef } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import Map, { MapRef } from "@/components/map/map";
import {
	MapFilterBottomSheet,
	MapFilterBottomSheetRef,
} from "@/components/bottom-sheet/map-filter-bottom-sheet";
import { useMapboxInit } from "@/hooks/useMapboxInit";
import AntDesign from "@expo/vector-icons/AntDesign";
import { MaterialIcons } from "@expo/vector-icons";
import { useMapSearch } from "@/hooks/useMapSearch";
import { calculateBoundsFromFeature } from "@/lib/geometry";
import { POICategoryDefinition } from "@/services/poi-service";
import { useAmenities } from "@/hooks/useAmenities";
import { FeatureInfoBottomSheet } from "@/components/bottom-sheet/feature-info-bottom-sheet";
import { BottomSheetRef } from "@/components/bottom-sheet/bottom-sheet";
import { useDistricts } from "@/hooks/useDistricts";

export default function MapScreen() {
	// Initialize Mapbox with React Query
	const {
		isLoading: isMapboxLoading,
		isError: isMapboxError,
		error: mapboxError,
	} = useMapboxInit();

	const {
		mapReady,
		currentBounds,
		district,
		categoryGroups,
		updateCategoryGroups,
		updateMapLoading,
		selectedFeature,
		clearSelectedFeature,
		updateSelectedFeature,
	} = useMapSearch();

	const mapRef = useRef<MapRef>(null);

	const featureSheetRef = useRef<BottomSheetRef>(null);
	const filterSheetRef = useRef<MapFilterBottomSheetRef>(null);
	const { data: pois, isLoading: isAmenitiesLoading } = useAmenities();

	const handleCloseFeatureSheet = useCallback(() => {
		featureSheetRef.current?.close();
		clearSelectedFeature();
	}, [clearSelectedFeature]);

	// const handleCloseFilterSheet = useCallback(() => {
	// 	filterSheetRef.current?.close();
	// }, []);

	const openFilterSheet = useCallback(() => {
		filterSheetRef.current?.expand();
		// featureSheetRef.current?.collapse();
	}, []);

	// Center map when feature changes
	// useEffect(() => {
	// 	if (feature) {
	// 		centerTo(feature);
	// 		featureSheetRef.current?.snapToIndex(0);
	// 	} else {
	// 		featureSheetRef.current?.close();
	// 	}
	// }, [feature, centerTo]);

	const currentCameraBounds = useMemo(() => {
		return (
			calculateBoundsFromFeature(district as GeoJSON.Feature) ?? currentBounds
		);
	}, [currentBounds, district]);

	const handleMapLoad = useCallback(() => {
		updateMapLoading(false);
	}, [updateMapLoading]);

	const handlePointPress = useCallback(
		(payload: GeoJSON.Feature) => {
			if (payload.geometry?.type === "Point" && payload.geometry?.coordinates) {
				const coordinates = payload.geometry?.coordinates as [number, number];
				mapRef.current?.centerOnCoordinates(coordinates, 15);
				updateSelectedFeature(payload);
				filterSheetRef.current?.close();
				featureSheetRef.current?.expand();
			}
		},
		[updateSelectedFeature],
	);

	const handlePOICategoriesChange = useCallback(
		(categories: POICategoryDefinition[]) => {
			console.log({
				categories,
			});

			updateCategoryGroups(categories);
		},
		[updateCategoryGroups],
	);

	// Show loading indicator while Mapbox is initializing
	if (isMapboxLoading || !mapReady) {
		return (
			<View className="flex-1 justify-center items-center bg-gray-50">
				<ActivityIndicator size="large" color="#3B82F6" />
				<Text className="mt-4 text-lg text-gray-600">Initializing Map...</Text>
				<Text className="mt-2 text-sm text-gray-500 text-center px-8">
					Setting up map services and loading geographic data
				</Text>
			</View>
		);
	}

	// Show error state if Mapbox initialization fails
	if (isMapboxError) {
		return (
			<View className="flex-1 justify-center items-center bg-red-50 px-8">
				<Text className="text-6xl mb-4">🗺️</Text>
				<Text className="text-xl font-semibold text-red-800 mb-2 text-center">
					Map Initialization Failed
				</Text>
				<Text className="text-sm text-red-600 text-center mb-4">
					{mapboxError instanceof Error
						? mapboxError.message
						: "Unable to initialize map services. Please check your connection and try again."}
				</Text>
				<Text className="text-xs text-red-500 text-center">
					If this problem persists, please contact support.
				</Text>
			</View>
		);
	}

	// Only render the map once Mapbox is successfully initialized
	return (
		<View className="flex-1">
			{/* Filter Button - Top Right */}
			<Pressable
				onPress={openFilterSheet}
				className="absolute top-20 right-4 z-10 bg-white rounded-full p-3 shadow-lg"
				style={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
					elevation: 5,
				}}
			>
				<AntDesign name="filter" size={24} color="#374151" />
			</Pressable>

			<Map
				ref={mapRef}
				variant="subtle"
				isLoading={isMapboxLoading || isAmenitiesLoading}
				shape={district}
				pois={pois}
				onMapLoad={handleMapLoad}
				onPointPress={handlePointPress}
				currentBounds={currentCameraBounds}
			/>

			{/* Feature Info Bottom Sheet */}
			{selectedFeature && (
				<FeatureInfoBottomSheet
					ref={featureSheetRef}
					onClose={handleCloseFeatureSheet}
					feature={selectedFeature}
				/>
			)}

			{/* Map Filter Bottom Sheet */}
			<MapFilterBottomSheet
				ref={filterSheetRef}
				// onClose={handleCloseFilterSheet}
				selectedPOICategories={categoryGroups}
				onPOICategoriesChange={handlePOICategoriesChange}
			/>
		</View>
	);
}
