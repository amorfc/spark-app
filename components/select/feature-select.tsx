import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ItemType } from "react-native-dropdown-picker";
import { Select } from "@/components/select/select";
import { useSearch } from "@/context/search-provider";
import { useSafeGeoData } from "@/hooks/useSafeGeoData";

interface FeatureSelectProps {
	placeholder?: string;
	containerStyle?: any;
}

export const FeatureSelect: React.FC<FeatureSelectProps> = ({
	placeholder = "Search neighborhoods...",
	containerStyle,
}) => {
	// Dropdown picker state
	const { selectedFeatureId, setSelectedFeatureId } = useSearch();
	const { findProcessedFeature, processedFeature } = useSafeGeoData();
	const [value, setValue] = useState<string | null>(null);

	// Sync dropdown value with context selectedFeatureId
	useEffect(() => {
		setValue(selectedFeatureId);
	}, [selectedFeatureId]);

	const dropdownItems = useMemo(() => {
		if (!processedFeature) return [];
		return processedFeature.map((feature) => ({
			label: feature?.place_name,
			value: feature?.id,
			...feature, // Include all neighborhood data for easy access
		}));
	}, [processedFeature]);

	// Local state for dropdown items
	const [items, setItems] = useState<ItemType<string>[]>(dropdownItems);

	// Handle location selection
	const handleSelectItem = useCallback(
		(selectedItem: ItemType<string>) => {
			const selectedFeature = findProcessedFeature(selectedItem.value || "");

			if (selectedFeature) {
				setSelectedFeatureId(selectedFeature.id);
			}
		},
		[findProcessedFeature, setSelectedFeatureId],
	);

	const handleSelectClear = useCallback(() => {
		setValue(null);
		setSelectedFeatureId(null);
	}, [setSelectedFeatureId]);

	// Update items when dropdownItems changes
	useEffect(() => {
		setItems(dropdownItems);
	}, [dropdownItems]);

	return (
		<View style={[styles.container, containerStyle]}>
			<Select
				value={value}
				originalItems={items}
				setValue={setValue}
				onSelectItem={handleSelectItem}
				onClear={handleSelectClear}
				placeholder={placeholder}
				searchPlaceholder="Type to search..."
				searchable={true}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 60,
		left: 20,
		right: 20,
		zIndex: 1000,
	},
});

export default FeatureSelect;
