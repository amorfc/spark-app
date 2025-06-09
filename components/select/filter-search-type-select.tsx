import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import { View } from "react-native";
import { ItemType } from "react-native-dropdown-picker";
import { Select, SelectRef } from "@/components/select/select";

export enum SearchType {
	NEIGHBORHOOD = "neighborhood",
	PLACE = "place",
}

export const SEARCH_TYPE_OPTIONS: ItemType<string>[] = [
	{
		label: "🏘️ Neighborhoods",
		value: SearchType.NEIGHBORHOOD,
	},
	{
		label: "📍 Places (POIs)",
		value: SearchType.PLACE,
	},
];

export interface FilterSearchTypeSelectRef {
	closeDropdown: () => void;
}

interface FilterSearchTypeSelectProps {
	value?: SearchType;
	onValueChange: (searchType: SearchType) => void;
	placeholder?: string;
	containerStyle?: any;
}

export const FilterSearchTypeSelect = forwardRef<
	FilterSearchTypeSelectRef,
	FilterSearchTypeSelectProps
>(
	(
		{
			value,
			onValueChange,
			placeholder = "Select search type...",
			containerStyle,
		},
		ref,
	) => {
		const [selectedValue, setSelectedValue] = useState<string | null>(
			value || null,
		);
		const selectRef = useRef<SelectRef>(null);

		// Sync with external value prop
		useEffect(() => {
			setSelectedValue(value || null);
		}, [value]);

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

		const handleSelectItem = useCallback(
			(selectedItem: ItemType<string>) => {
				const searchType = selectedItem.value as SearchType;
				setSelectedValue(searchType);
				onValueChange(searchType);
			},
			[onValueChange],
		);

		const handleClear = useCallback(() => {
			setSelectedValue(null);
			// Don't call onValueChange with null to prevent clearing the search type
		}, []);

		return (
			<View style={containerStyle}>
				<Select
					ref={selectRef}
					value={selectedValue}
					originalItems={SEARCH_TYPE_OPTIONS}
					setValue={setSelectedValue}
					onSelectItem={handleSelectItem}
					onClear={handleClear}
					placeholder={placeholder}
					searchable={false}
					clearable={false} // Don't allow clearing search type
				/>
			</View>
		);
	},
);

FilterSearchTypeSelect.displayName = "FilterSearchTypeSelect";
