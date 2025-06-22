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
		const { resetMap, updateDistrict, district } = useMapSearch();

		// Sync value with current district
		useEffect(() => {
			if (district?.properties?.id) {
				setValue(district.properties.id);
			} else {
				setValue(null);
			}
		}, [district]);

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

		const dropdownItems: ItemType<ValueType>[] = useMemo(() => {
			if (!data) return [];
			const items = mapFeatureCollectionToDropdownItems<ValueType>(data);
			const sortedItems = items.sort((a, b) => {
				const nameA = a.label?.toLowerCase() || "";
				const nameB = b.label?.toLowerCase() || "";
				return nameA.localeCompare(nameB);
			});

			return sortedItems;
		}, [data]);

		return (
			<Select
				ref={selectRef}
				value={value}
				originalItems={dropdownItems}
				setValue={setValue}
				onSelectItem={handleSelectItem}
				onClear={handleSelectClear}
				searchable={true}
				{...props}
			/>
		);
	},
);

DistrictSelect.displayName = "DistrictSelect";

export default DistrictSelect;
