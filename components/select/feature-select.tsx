import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import { View } from "react-native";
import { ItemType } from "react-native-dropdown-picker";
import { Select, SelectRef } from "@/components/select/select";
import { SelectedFeature, useSearch } from "@/context/search-provider";
import { useSafeGeoData } from "@/hooks/useSafeGeoData";

interface FeatureSelectProps {
	placeholder?: string;
	containerStyle?: any;
	useModal?: boolean;
	onSelect?: (feature: SelectedFeature) => void;
}

export interface FeatureSelectRef {
	closeDropdown: () => void;
}

export const FeatureSelect = forwardRef<FeatureSelectRef, FeatureSelectProps>(
	(
		{
			placeholder = "Search neighborhoods...",
			containerStyle,
			useModal = false,
			onSelect,
		},
		ref,
	) => {
		// Dropdown picker state
		const { selectedFeatureId, clearSelection, setSelectedFeatureId } =
			useSearch();
		const { findProcessedFeature, processedFeature } = useSafeGeoData();
		const [value, setValue] = useState<string | null>(null);
		const selectRef = useRef<SelectRef>(null);

		// Sync dropdown value with context selectedFeatureId
		useEffect(() => {
			setValue(selectedFeatureId);
		}, [selectedFeatureId]);

		// Expose methods to parent
		useImperativeHandle(
			ref,
			() => ({
				closeDropdown: () => {
					selectRef.current?.closeDropdown();
				},
			}),
			[],
		);

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
					onSelect?.(selectedFeature);
					setSelectedFeatureId(selectedFeature.id);
				}
			},
			[findProcessedFeature, setSelectedFeatureId, onSelect],
		);

		const handleSelectClear = useCallback(() => {
			clearSelection();
			setValue(null);
		}, [clearSelection]);

		// Update items when dropdownItems changes
		useEffect(() => {
			setItems(dropdownItems);
		}, [dropdownItems]);

		return (
			<View style={containerStyle}>
				<Select
					ref={selectRef}
					value={value}
					originalItems={items}
					setValue={setValue}
					onSelectItem={handleSelectItem}
					onClear={handleSelectClear}
					placeholder={placeholder}
					searchPlaceholder="Type to search..."
					searchable={true}
					listMode={useModal ? "MODAL" : "FLATLIST"}
					modalTitle="Search Neighborhoods"
				/>
			</View>
		);
	},
);

FeatureSelect.displayName = "FeatureSelect";

export default FeatureSelect;
