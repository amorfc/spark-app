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
import { useOSMFeatures } from "@/hooks/useOsmData";
import { FeatureType } from "@/types/osm";

interface FeatureSelectItem extends ItemType<number> {
	label: string;
	value: number;
}

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
		const {
			searchType,
			selectedFeatureId,
			clearSelection,
			setSelectedFeatureId,
		} = useSearch();

		const [value, setValue] = useState<number | null>(null);
		const selectRef = useRef<SelectRef>(null);

		const { data: features } = useOSMFeatures({
			featureType: searchType as FeatureType,
		});

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
			if (!features) return [];
			return features.map((feature) => ({
				label: feature?.name || feature?.name_tr || feature?.name_en || "Label",
				value: feature?.ref_id,
			}));
		}, [features]);

		// Local state for dropdown items
		const [items, setItems] = useState<FeatureSelectItem[]>(dropdownItems);

		// Handle location selection
		const handleSelectItem = useCallback(
			(selectedItem: FeatureSelectItem) => {
				const feature = features?.find(
					(feature) => feature.ref_id === selectedItem.value,
				);
				if (feature) {
					onSelect?.(feature as unknown as SelectedFeature);
					setSelectedFeatureId(feature.ref_id);
				}
			},
			[features, onSelect, setSelectedFeatureId],
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
