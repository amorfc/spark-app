import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { defaultTo } from "lodash";
import Map from "@/components/map/map";
import { useSearch, SelectedFeature } from "@/context/search-provider";
import { calculateZoomLevel, getCameraConfig } from "@/lib/mapbox";
import {
	FeatureInfoBottomSheet,
	BottomSheetRef,
} from "@/components/bottom-sheet";
import {
	MapFilterBottomSheet,
	MapFilterBottomSheetRef,
} from "@/components/bottom-sheet/map-filter-bottom-sheet";
import { SearchType } from "@/components/select/filter-search-type-select";
import { usePOIData } from "@/hooks/usePOIData";
import { POIItem, POICategory } from "@/services/poi-service";
import { useMapboxInit } from "@/hooks/useMapboxInit";

// Import the GeoJSON data
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";
import { MaterialIcons } from "@expo/vector-icons";

// Type the imported data
const neighborhoodsData = neighborhoodsDataRaw as GeoJSON.FeatureCollection;

export default function MapScreen() {
	// Initialize Mapbox with React Query
	const {
		data: _mapboxInitialized,
		isLoading: isMapboxLoading,
		isError: isMapboxError,
		error: mapboxError,
	} = useMapboxInit();

	const mapRef = useRef<{
		centerOnCoordinates: (
			coordinates: [number, number],
			zoomLevel?: number,
		) => void;
	}>(null);

	const featureSheetRef = useRef<BottomSheetRef>(null);
	const filterSheetRef = useRef<MapFilterBottomSheetRef>(null);

	// UI state
	const [isFeatureBottomSheetExpanded, setIsFeatureBottomSheetExpanded] =
		useState(false);
	const [isFilterBottomSheetExpanded, setIsFilterBottomSheetExpanded] =
		useState(false);

	// Filter state
	const [searchType, setSearchType] = useState<SearchType>(
		SearchType.NEIGHBORHOOD,
	);
	const [selectedPOICategories, setSelectedPOICategories] = useState<
		POICategory[]
	>([POICategory.RESTAURANT, POICategory.BUS_STATION]);

	// Use the search context for global state management
	const { selectedFeature, setSelectedFeatureId, clearSelection } = useSearch();

	// Fetch POI data for Istanbul with selected categories (no bounds filtering)
	const {
		pois,
		isLoading: poisLoading,
		isError: poisError,
		error: poisErrorMessage,
		isEmpty: poisEmpty,
	} = usePOIData({
		city: "istanbul",
		categories: searchType === SearchType.PLACE ? selectedPOICategories : [], // Only fetch POIs when in Place mode
		enabled: true,
	});

	// Get the original camera configuration for Istanbul
	const originalCameraConfig = getCameraConfig("istanbul");

	const centerTo = useCallback(
		(feature: SelectedFeature) => {
			if (mapRef.current?.centerOnCoordinates) {
				const target = defaultTo(
					feature?.center,
					originalCameraConfig.centerCoordinate,
				);

				mapRef.current.centerOnCoordinates(target, calculateZoomLevel(feature));
			}
		},
		[originalCameraConfig],
	);

	const handleFeaturePress = useCallback(
		(id: string) => {
			id && setSelectedFeatureId(id);
		},
		[setSelectedFeatureId],
	);

	const handlePOIPress = useCallback((poi: POIItem) => {
		console.log("POI selected:", poi.name, poi.type);

		// Center map on POI with maximum zoom
		if (mapRef.current?.centerOnCoordinates) {
			mapRef.current.centerOnCoordinates(poi.coordinates, 14);
		}

		// You can extend this to show POI details in bottom sheet
		// or navigate to a POI detail screen
	}, []);

	// Handle search type change
	const handleSearchTypeChange = useCallback(
		(type: SearchType) => {
			setSearchType(type);
			// Clear feature selection when switching modes
			clearSelection();
			featureSheetRef.current?.close();
		},
		[clearSelection],
	);

	// Handle POI categories change
	const handlePOICategoriesChange = useCallback((categories: POICategory[]) => {
		setSelectedPOICategories(categories);
	}, []);

	const handleFeatureBottomSheetChange = useCallback((index: number) => {
		setIsFeatureBottomSheetExpanded(index > 0);
	}, []);

	const handleFilterBottomSheetChange = useCallback((index: number) => {
		setIsFilterBottomSheetExpanded(index > 0);
	}, []);

	const handleCloseFeatureSheet = useCallback(() => {
		featureSheetRef.current?.snapToIndex(-1);
		setIsFeatureBottomSheetExpanded(false);
		// Delay clearing selection to allow animation to start
		setTimeout(() => {
			clearSelection();
		}, 100);
	}, [clearSelection]);

	const handleCloseFilterSheet = useCallback(() => {
		filterSheetRef.current?.close();
		setIsFilterBottomSheetExpanded(false);
	}, []);

	const openFilterSheet = useCallback(() => {
		filterSheetRef.current?.expand();
		console.log("Opening filter sheet");
		console.log("featureSheetRef.current", featureSheetRef.current);
		featureSheetRef.current?.close();
	}, []);

	// Center map when feature changes
	useEffect(() => {
		console.log("selectedFeature", {
			featureSheetRef: featureSheetRef.current,
		});

		if (selectedFeature && !isFeatureBottomSheetExpanded) {
			featureSheetRef.current?.collapse();
		}
		// Only center if we have a selectedFeature (avoid infinite render)
		if (selectedFeature) {
			centerTo(selectedFeature);
		}
	}, [selectedFeature, isFeatureBottomSheetExpanded, centerTo]); // Remove centerTo from dependencies

	// Log POI loading state and debug info
	useEffect(() => {
		if (searchType === SearchType.PLACE && poisLoading) {
			console.log("Loading POIs...");
		} else if (searchType === SearchType.PLACE && poisError) {
			console.error("Error loading POIs:", poisErrorMessage);
		} else if (searchType === SearchType.PLACE && poisEmpty) {
			console.log("No POIs found");
		} else if (searchType === SearchType.PLACE && pois.length > 0) {
			console.log(`Displaying ${pois.length} POIs`);
		}
	}, [
		searchType,
		poisLoading,
		poisError,
		poisErrorMessage,
		poisEmpty,
		pois.length,
	]);

	// Show loading indicator while Mapbox is initializing
	if (isMapboxLoading) {
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
				<MaterialIcons name="filter-list" size={24} color="#374151" />
			</Pressable>

			<Map
				ref={mapRef}
				location="istanbul"
				geoJsonData={neighborhoodsData}
				selectedFeature={selectedFeature}
				onFeaturePress={handleFeaturePress}
				variant="moderate"
				pois={searchType === SearchType.PLACE ? pois : []} // Only show POIs in Place mode
				onPOIPress={handlePOIPress}
			/>

			{/* Feature Info Bottom Sheet */}
			<FeatureInfoBottomSheet
				ref={featureSheetRef}
				onClose={handleCloseFeatureSheet}
				onChange={handleFeatureBottomSheetChange}
			/>

			{/* Map Filter Bottom Sheet */}
			<MapFilterBottomSheet
				ref={filterSheetRef}
				onClose={handleCloseFilterSheet}
				onChange={handleFilterBottomSheetChange}
				searchType={searchType}
				onSearchTypeChange={handleSearchTypeChange}
				selectedPOICategories={selectedPOICategories}
				onPOICategoriesChange={handlePOICategoriesChange}
			/>
		</View>
	);
}
