import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { POICategory, POI_CATEGORY_CONFIG } from "@/services/poi-service";

export interface POICategorySelectRef {
	clearSelection: () => void;
}

interface POICategorySelectProps {
	selectedCategories: POICategory[];
	onCategoriesChange: (categories: POICategory[]) => void;
	maxSelections?: number;
	placeholder?: string;
	containerStyle?: any;
}

// Group categories by type for better organization
const CATEGORY_GROUPS = {
	"Food & Drink": [
		POICategory.RESTAURANT,
		POICategory.CAFE,
		POICategory.BAR,
		POICategory.FAST_FOOD,
	],
	Transportation: [
		POICategory.BUS_STATION,
		POICategory.SUBWAY_ENTRANCE,
		POICategory.TAXI,
	],
	Tourism: [POICategory.ATTRACTION, POICategory.HOTEL, POICategory.MUSEUM],
	Shopping: [POICategory.SHOP, POICategory.MALL, POICategory.MARKET],
	Healthcare: [POICategory.HOSPITAL, POICategory.PHARMACY, POICategory.CLINIC],
	Education: [POICategory.SCHOOL, POICategory.UNIVERSITY, POICategory.LIBRARY],
	Finance: [POICategory.BANK, POICategory.ATM],
	Entertainment: [POICategory.CINEMA, POICategory.THEATRE],
	Services: [
		POICategory.POST_OFFICE,
		POICategory.POLICE,
		POICategory.FIRE_STATION,
	],
};

export const POICategorySelect = forwardRef<
	POICategorySelectRef,
	POICategorySelectProps
>(
	(
		{
			selectedCategories,
			onCategoriesChange,
			maxSelections = 5,
			placeholder = "Select POI categories...",
			containerStyle,
		},
		ref,
	) => {
		// Expose methods to parent
		useImperativeHandle(
			ref,
			() => ({
				clearSelection: () => {
					onCategoriesChange([]);
				},
			}),
			[onCategoriesChange],
		);

		const toggleCategory = useCallback(
			(category: POICategory) => {
				const isSelected = selectedCategories.includes(category);

				if (isSelected) {
					// Remove category
					onCategoriesChange(selectedCategories.filter((c) => c !== category));
				} else {
					// Add category (check max limit)
					if (selectedCategories.length < maxSelections) {
						onCategoriesChange([...selectedCategories, category]);
					}
				}
			},
			[selectedCategories, onCategoriesChange, maxSelections],
		);

		const isSelected = useCallback(
			(category: POICategory) => {
				return selectedCategories.includes(category);
			},
			[selectedCategories],
		);

		const canSelectMore = selectedCategories.length < maxSelections;

		return (
			<View
				style={containerStyle}
				className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
			>
				{/* Header */}
				<View className="flex-row justify-between items-center mb-3">
					<Text className="text-lg font-semibold text-gray-800">
						{placeholder}
					</Text>
					<Text className="text-sm text-gray-500">
						{selectedCategories.length}/{maxSelections}
					</Text>
				</View>

				{/* Selected categories preview */}
				{selectedCategories.length > 0 && (
					<View className="mb-4">
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View className="flex-row gap-2">
								{selectedCategories.map((category) => {
									const config = POI_CATEGORY_CONFIG[category];
									return (
										<TouchableOpacity
											key={category}
											onPress={() => toggleCategory(category)}
											className="bg-blue-500 rounded-full px-3 py-1 flex-row items-center"
										>
											<Text className="text-white text-xs mr-1">
												{config.icon}
											</Text>
											<Text className="text-white text-xs font-medium">
												{config.label}
											</Text>
											<Text className="text-white text-xs ml-1">×</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</ScrollView>
					</View>
				)}

				{/* Category groups */}
				<ScrollView showsVerticalScrollIndicator={false} className="max-h-64">
					{Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
						<View key={groupName} className="mb-4">
							<Text className="text-sm font-semibold text-gray-600 mb-2">
								{groupName}
							</Text>
							<View className="flex-row flex-wrap gap-2">
								{categories.map((category) => {
									const config = POI_CATEGORY_CONFIG[category];
									const selected = isSelected(category);
									const disabled = !selected && !canSelectMore;

									return (
										<TouchableOpacity
											key={category}
											onPress={() => !disabled && toggleCategory(category)}
											disabled={disabled}
											className={`
                        flex-row items-center px-3 py-2 rounded-lg border
                        ${
													selected
														? "bg-blue-50 border-blue-500"
														: disabled
															? "bg-gray-100 border-gray-300"
															: "bg-white border-gray-300"
												}
                      `}
											style={{
												opacity: disabled ? 0.6 : 1,
											}}
										>
											<Text className="mr-2" style={{ fontSize: 16 }}>
												{config.icon}
											</Text>
											<Text
												className={`text-sm font-medium ${
													selected
														? "text-blue-700"
														: disabled
															? "text-gray-400"
															: "text-gray-700"
												}`}
											>
												{config.label}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					))}
				</ScrollView>

				{/* Info text */}
				{!canSelectMore && (
					<Text className="text-xs text-gray-500 mt-2 text-center">
						Maximum {maxSelections} categories can be selected
					</Text>
				)}
			</View>
		);
	},
);

POICategorySelect.displayName = "POICategorySelect";
