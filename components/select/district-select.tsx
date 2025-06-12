import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import { ItemType } from "react-native-dropdown-picker";
import { Select, SelectProps, SelectRef } from "@/components/select/select";
import { useDistricts } from "@/hooks/useDistricts";
import { mapFeatureCollectionToDropdownItems } from "@/lib/dropdown";
import { useMapSearch } from "@/hooks/useMapSearch";

type ValueType = number;

interface DistrictSelectItem extends ItemType<ValueType> {
	label: string;
	value: ValueType;
	name: string;
}

interface DistrictSelectProps
	extends Omit<SelectProps<ValueType>, "value" | "originalItems" | "setValue"> {
	useModal?: boolean;
}

export const DistrictSelect = forwardRef<SelectRef, DistrictSelectProps>(
	({ useModal = false, ...props }, ref) => {
		const [value, setValue] = useState<ValueType | null>(null);
		const selectRef = useRef<SelectRef>(null);

		const { data } = useDistricts();

		const { resetMap, updateDistrict } = useMapSearch();
		const dropdownItems = useMemo(() => {
			if (!data) return [];
			return mapFeatureCollectionToDropdownItems<ValueType>(data);
		}, [data]);

		const [items, setItems] = useState<ItemType<ValueType>[]>(dropdownItems);

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

		// Local state for dropdown items

		// Handle location selection
		const handleSelectItem = useCallback(
			(selectedItem: DistrictSelectItem) => {
				const selectedFeature = data?.features.find(
					(feature) => feature.properties?.id === selectedItem.value,
				);

				if (selectedFeature) {
					updateDistrict(selectedFeature);
				}
			},
			[data, updateDistrict],
		);

		const handleSelectClear = useCallback(() => {
			resetMap();
			setValue(null);
		}, [resetMap]);

		// Update items when dropdownItems changes
		useEffect(() => {
			setItems(dropdownItems);
		}, [dropdownItems]);

		return (
			<Select
				ref={selectRef}
				value={value}
				originalItems={items}
				setValue={setValue}
				onSelectItem={handleSelectItem}
				onClear={handleSelectClear}
				searchPlaceholder="Type to search..."
				searchable={true}
				listMode={useModal ? "MODAL" : "FLATLIST"}
				debounceOnSearch={false}
				{...props}
			/>
		);
	},
);

DistrictSelect.displayName = "DistrictSelect";

export default DistrictSelect;
