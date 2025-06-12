import React, {
	forwardRef,
	useMemo,
	useCallback,
	useRef,
	useImperativeHandle,
} from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheet, BottomSheetRef } from "@/components/bottom-sheet";
import {
	POICategorySelect,
	POICategorySelectRef,
} from "@/components/select/poi-category-select";
import { POICategoryDefinition } from "@/services/poi-service";
import { useMapSearch } from "@/hooks/useMapSearch";
import { useColorScheme } from "@/lib/useColorScheme";
import { BottomSheetProps } from "@/components/bottom-sheet/bottom-sheet";
import { colors } from "@/constants/colors";
import { DistrictSelect } from "@/components/select/district-select";
export interface MapFilterBottomSheetRef extends BottomSheetRef {
	clearFilters: () => void;
}

interface MapFilterBottomSheetProps extends Omit<BottomSheetProps, "children"> {
	selectedPOICategories: POICategoryDefinition[];
	onPOICategoriesChange: (categories: POICategoryDefinition[]) => void;
}

export const MapFilterBottomSheet = forwardRef<
	MapFilterBottomSheetRef,
	MapFilterBottomSheetProps
>(
	(
		{ selectedPOICategories, onPOICategoriesChange, ...bottomSheetProps },
		ref,
	) => {
		const { colorScheme } = useColorScheme();
		const isDark = colorScheme === "dark";
		const { district, clearSelectedFeature, updateDistrict } = useMapSearch();
		// Refs for child components
		const poiCategoryGroupSelectRef = useRef<POICategorySelectRef>(null);
		const bottomSheetRef = useRef<BottomSheetRef>(null);

		const clearPOICategories = useCallback(() => {
			poiCategoryGroupSelectRef.current?.clearSelection();
			onPOICategoriesChange([]);
		}, [onPOICategoriesChange]);

		const clearFilters = useCallback(() => {
			clearSelectedFeature();
			updateDistrict(null);
			clearPOICategories();
		}, [clearPOICategories, clearSelectedFeature, updateDistrict]);

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
				index={0}
				containerStyle={{ zIndex: 1500 }}
				scrollable={false}
				showBackdrop={false}
				{...bottomSheetProps}
			>
				<View className="flex-1 pb-4">
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
								<MaterialCommunityIcons name="broom" size={20} color="red" />
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
							Search district
						</Text>
						<DistrictSelect
							placeholder="Select district..."
							searchable={true}
						/>
					</View>

					{district && (
						<POICategorySelect
							ref={poiCategoryGroupSelectRef}
							selectedCategories={selectedPOICategories}
							onCategoriesChange={onPOICategoriesChange}
							onClear={clearPOICategories}
						/>
					)}
				</View>
			</BottomSheet>
		);
	},
);

MapFilterBottomSheet.displayName = "MapFilterBottomSheet";
