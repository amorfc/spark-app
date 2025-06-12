import React, { useCallback, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { POICategoryGroup, POICategoryGroupType } from "@/services/poi-service";

export interface POICategorySelectRef {
	clearSelection: () => void;
}

interface POICategorySelectProps {
	selectedCategories: POICategoryGroupType[];
	onCategoriesChange: (categories: POICategoryGroupType[]) => void;
	containerStyle?: any;
}

export const POICategorySelect = forwardRef<
	POICategorySelectRef,
	POICategorySelectProps
>(({ selectedCategories, onCategoriesChange, containerStyle }, ref) => {
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

	const toggleCategoryGroup = useCallback(
		(categoryGroup: POICategoryGroupType) => {
			if (selectedCategories.includes(categoryGroup)) {
				// Only allow removal if there are other categories selected
				if (selectedCategories.length > 1) {
					onCategoriesChange(
						selectedCategories.filter((c) => c !== categoryGroup),
					);
				}
				// If length is 1, don't call onCategoriesChange (keep the current selection)
			} else {
				onCategoriesChange([...selectedCategories, categoryGroup]);
			}
		},
		[selectedCategories, onCategoriesChange],
	);

	const isGroupSelected = useCallback(
		(categoryGroup: POICategoryGroupType) => {
			return selectedCategories.includes(categoryGroup);
		},
		[selectedCategories],
	);

	const canDeselectGroup = useCallback(
		(categoryGroup: POICategoryGroupType) => {
			// Can only deselect if there are more than 1 categories selected
			return selectedCategories.length > 1;
		},
		[selectedCategories],
	);

	return (
		<View
			style={containerStyle}
			className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
		>
			{/* Category groups */}
			<View className="space-y-4">
				{Object.entries(POICategoryGroup).map(([key, category]) => {
					const selected = isGroupSelected(category);
					const canDeselect = canDeselectGroup(category);
					const isDisabled = selected && !canDeselect;

					return (
						<TouchableOpacity
							key={category.key}
							onPress={() => toggleCategoryGroup(category)}
							disabled={isDisabled}
							className={`
									mt-3 flex-row items-center px-4 py-3 rounded-lg border
									${selected ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300"}
								`}
						>
							<Text className="mr-3" style={{ fontSize: 20 }}>
								{category.icon}
							</Text>
							<Text
								className={`text-sm font-medium flex-1 ${
									selected ? "text-blue-700" : "text-gray-700"
								}`}
							>
								{category.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
});

POICategorySelect.displayName = "POICategorySelect";
