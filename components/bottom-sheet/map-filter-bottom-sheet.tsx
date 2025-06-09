import React, {
	forwardRef,
	useMemo,
	useCallback,
	useRef,
	useImperativeHandle,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheet, BottomSheetRef } from "@/components/bottom-sheet";
import {
	FilterSearchTypeSelect,
	FilterSearchTypeSelectRef,
	SearchType,
} from "@/components/select/filter-search-type-select";
import {
	FeatureSelect,
	FeatureSelectRef,
} from "@/components/select/feature-select";
import {
	POICategorySelect,
	POICategorySelectRef,
} from "@/components/select/poi-category-select";
import { POICategory } from "@/services/poi-service";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { BottomSheetProps } from "@/components/bottom-sheet/bottom-sheet";

export interface MapFilterBottomSheetRef extends BottomSheetRef {
	clearFilters: () => void;
}

interface MapFilterBottomSheetProps extends Omit<BottomSheetProps, "children"> {
	// Filter state
	searchType: SearchType;
	onSearchTypeChange: (type: SearchType) => void;
	selectedPOICategories: POICategory[];
	onPOICategoriesChange: (categories: POICategory[]) => void;
}

export const MapFilterBottomSheet = forwardRef<
	MapFilterBottomSheetRef,
	MapFilterBottomSheetProps
>(
	(
		{
			searchType,
			onSearchTypeChange,
			selectedPOICategories,
			onPOICategoriesChange,
			...bottomSheetProps
		},
		ref,
	) => {
		const { colorScheme } = useColorScheme();
		const isDark = colorScheme === "dark";

		// Refs for child components
		const filterTypeSelectRef = useRef<FilterSearchTypeSelectRef>(null);
		const featureSelectRef = useRef<FeatureSelectRef>(null);
		const poiCategorySelectRef = useRef<POICategorySelectRef>(null);
		const bottomSheetRef = useRef<BottomSheetRef>(null);

		// Dynamic snap points based on search type
		const snapPoints = useMemo(() => {
			return ["35%", "80%"];
		}, []);

		const clearFilters = useCallback(() => {
			onPOICategoriesChange([]);
			poiCategorySelectRef.current?.clearSelection();
			featureSelectRef.current?.closeDropdown();
		}, [onPOICategoriesChange]);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				...bottomSheetRef.current!,
				clearFilters,
			}),
			[clearFilters],
		);

		const iconColor = isDark
			? colors.dark.mutedForeground
			: colors.light.mutedForeground;

		const closeBottomSheet = () => {
			bottomSheetRef.current?.close();
		};

		return (
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={snapPoints}
				initialSnapIndex={0}
				containerStyle={{ zIndex: 1500 }}
				{...bottomSheetProps}
			>
				<View className="flex-1">
					{/* Header */}
					<View className="flex-row justify-between items-center pb-4 border-b border-gray-200 mb-4">
						<View className="flex-1">
							<Text className="text-xl font-bold text-gray-800">
								Map Filters
							</Text>
							<Text className="text-sm text-gray-500">
								Choose what to search for
							</Text>
						</View>
						<View className="flex-row gap-2">
							{/* Clear button */}
							<TouchableOpacity
								onPress={clearFilters}
								className="p-2 rounded-lg bg-gray-100"
							>
								<MaterialIcons name="clear-all" size={20} color={iconColor} />
							</TouchableOpacity>
							{/* Close button */}
							<TouchableOpacity
								onPress={closeBottomSheet}
								className="p-2 rounded-lg bg-gray-100"
							>
								<MaterialIcons name="close" size={20} color={iconColor} />
							</TouchableOpacity>
						</View>
					</View>

					{/* Search Type Selection */}
					<View className="mb-4">
						<Text className="text-sm font-semibold text-gray-700 mb-2">
							Search Type
						</Text>
						<FilterSearchTypeSelect
							ref={filterTypeSelectRef}
							value={searchType}
							onValueChange={onSearchTypeChange}
							placeholder="Select search type..."
							useModal={true}
						/>
					</View>

					{/* Conditional Content Based on Search Type */}
					{searchType === SearchType.NEIGHBORHOOD && (
						<View className="mb-4">
							<Text className="text-sm font-semibold text-gray-700 mb-2">
								Search Neighborhoods
							</Text>
							<FeatureSelect
								ref={featureSelectRef}
								onSelect={closeBottomSheet}
								placeholder="Search neighborhoods in Istanbul..."
								useModal={true}
							/>
						</View>
					)}

					{searchType === SearchType.PLACE && (
						<View className="mb-4">
							<Text className="text-sm font-semibold text-gray-700 mb-2">
								POI Categories
							</Text>
							<Text className="text-xs text-gray-500 mb-3">
								Select up to 5 categories to show on the map
							</Text>
							<POICategorySelect
								ref={poiCategorySelectRef}
								selectedCategories={selectedPOICategories}
								onCategoriesChange={onPOICategoriesChange}
								maxSelections={5}
								placeholder="Select POI categories"
							/>
						</View>
					)}

					{/* Info Section */}
					<View className="mt-auto pt-4 border-t border-gray-200">
						<View className="flex-row items-start gap-3">
							<MaterialIcons name="info" size={16} color={iconColor} />
							<Text className="text-xs text-gray-500 flex-1">
								{searchType === SearchType.NEIGHBORHOOD
									? "Search and select neighborhoods to explore. The map will center on your selection."
									: "Select POI categories to display on the map. POIs will appear when you zoom in (level 12+)."}
							</Text>
						</View>
					</View>
				</View>
			</BottomSheet>
		);
	},
);

MapFilterBottomSheet.displayName = "MapFilterBottomSheet";
