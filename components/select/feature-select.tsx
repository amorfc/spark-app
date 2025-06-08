import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ItemType } from "react-native-dropdown-picker";
import { Select } from "@/components/select/select";
import { useGeoData } from "@/hooks/useGeoData";
import { useSearch } from "@/context/search-provider";

interface FeatureSelectProps {
	city: string;
	geoJsonData: GeoJSON.FeatureCollection;
	placeholder?: string;
	containerStyle?: any;
}

export const FeatureSelect: React.FC<FeatureSelectProps> = ({
	city,
	geoJsonData,
	placeholder = "Search neighborhoods...",
	containerStyle,
}) => {
	// Dropdown picker state
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<string | null>(null);
	const { setSelectedFeatureId } = useSearch();

	// Use the custom hook for geo data
	const { dropdownItems, findProcessedFeature } = useGeoData({
		city,
		geoJsonData,
	});

	// Local state for dropdown items
	const [items, setItems] = useState<ItemType<string>[]>(dropdownItems);

	// Update items when dropdownItems changes
	useEffect(() => {
		setItems(dropdownItems);
	}, [dropdownItems]);

	// Handle location selection
	const handleSelectItem = useCallback(
		(selectedItem: ItemType<string>) => {
			// Find the selected neighborhood from processed data
			const selectedNeighborhood = findProcessedFeature(
				selectedItem.value || "",
			);

			if (selectedNeighborhood) {
				setSelectedFeatureId(selectedNeighborhood.id);
			}
		},
		[findProcessedFeature, setSelectedFeatureId],
	);

	return (
		<View style={[styles.container, containerStyle]}>
			<Select
				open={open}
				value={value}
				items={items}
				setOpen={setOpen}
				setValue={setValue}
				setItems={setItems}
				onSelectItem={handleSelectItem}
				placeholder={placeholder}
				searchable={true}
				searchPlaceholder="Type to search..."
				listMode="MODAL"
				modalTitle={`Select ${city.charAt(0).toUpperCase() + city.slice(1)} Location`}
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
