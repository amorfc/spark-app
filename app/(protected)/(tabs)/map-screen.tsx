import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { defaultTo } from "lodash";
import Map from "@/components/map/map";
import {
	FeatureSelect,
	FeatureSelectRef,
} from "@/components/select/feature-select";
import { useSearch, SelectedFeature } from "@/context/search-provider";
import { calculateZoomLevel, getCameraConfig } from "@/lib/mapbox";
import {
	FeatureInfoBottomSheet,
	BottomSheetRef,
} from "@/components/bottom-sheet";

// Import the GeoJSON data
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";

// Type the imported data
const neighborhoodsData = neighborhoodsDataRaw as GeoJSON.FeatureCollection;

export default function MapScreen() {
	const mapRef = useRef<{
		centerOnCoordinates: (
			coordinates: [number, number],
			zoomLevel?: number,
		) => void;
	}>(null);

	const featureSheetRef = useRef<BottomSheetRef>(null);
	const featureSelectRef = useRef<FeatureSelectRef>(null);
	const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

	// Use the search context for global state management
	const { selectedFeature, setSelectedFeatureId, clearSelection } = useSearch();

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

	const handleExpandFeatureSheet = useCallback(() => {
		if (selectedFeature) {
			centerTo(selectedFeature);
		}
	}, [selectedFeature, centerTo]);

	const handleBottomSheetChange = useCallback((index: number) => {
		setIsBottomSheetExpanded(index > 0);
	}, []);

	const handleAnimate = useCallback(() => {
		if (selectedFeature) {
			centerTo(selectedFeature);
		}
		// Close dropdown immediately when dragging starts
		featureSelectRef.current?.closeDropdown();
	}, [centerTo, selectedFeature]);

	const handleCloseFeatureSheet = useCallback(() => {
		featureSheetRef.current?.snapToIndex(-1);
		setIsBottomSheetExpanded(false);
		// Delay clearing selection to allow animation to start
		setTimeout(() => {
			clearSelection();
		}, 100);
	}, [clearSelection]);

	// Center map when feature changes
	useEffect(() => {
		if (selectedFeature && !isBottomSheetExpanded) {
			featureSheetRef.current?.collapse();
		}
		centerTo(selectedFeature);
	}, [centerTo, selectedFeature, isBottomSheetExpanded]);

	return (
		<View className="flex-1">
			{/* Conditionally render FeatureSelect based on bottom sheet state */}
			{!isBottomSheetExpanded && (
				<View className="absolute top-20 left-2 right-2 z-[1]">
					<FeatureSelect
						ref={featureSelectRef}
						placeholder="Search neighborhoods in Istanbul..."
					/>
				</View>
			)}

			<Map
				ref={mapRef}
				location="istanbul"
				geoJsonData={neighborhoodsData}
				selectedFeature={selectedFeature}
				onFeaturePress={handleFeaturePress}
				variant="moderate"
			/>

			{/* Feature Info Bottom Sheet */}
			<FeatureInfoBottomSheet
				ref={featureSheetRef}
				onClose={handleCloseFeatureSheet}
				onExpand={handleExpandFeatureSheet}
				onChange={handleBottomSheetChange}
				onAnimate={handleAnimate}
			/>
		</View>
	);
}
