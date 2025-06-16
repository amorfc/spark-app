import React, {
	useCallback,
	forwardRef,
	useImperativeHandle,
	useState,
	useMemo,
	useRef,
} from "react";
import {
	getPOICategoriesWithTranslations,
	POICategoryDefinition,
} from "@/services/poi-service";
import { Select, SelectProps, SelectRef } from "@/components/select/select";
import { useTranslation } from "@/lib/i18n/hooks";

export interface POICategorySelectRef {
	clearSelection: () => void;
}

interface POICategorySelectProps
	extends Omit<SelectProps<string>, "value" | "originalItems" | "setValue"> {
	selectedCategories: POICategoryDefinition[];
	onCategoriesChange: (categories: POICategoryDefinition[]) => void;
	containerStyle?: any;
}

export const POICategorySelect = forwardRef<
	POICategorySelectRef,
	POICategorySelectProps
>(({ selectedCategories, onCategoriesChange, ...props }, ref) => {
	const [selectedDropdownValue, setSelectedDropdownValue] = useState<
		string | null
	>(null);
	const selectRef = useRef<SelectRef>(null);
	const { t } = useTranslation();

	// Expose methods to parent
	useImperativeHandle(
		ref,
		() => ({
			clearSelection: () => {
				onCategoriesChange([]);
				setSelectedDropdownValue(null);
			},
		}),
		[onCategoriesChange],
	);

	const handleSelectCategory = useCallback(
		(item: POICategoryDefinition) => {
			onCategoriesChange([item]);

			selectRef.current?.closeDropdown();
		},
		[onCategoriesChange],
	);

	const dropdownItems = useMemo(() => {
		return getPOICategoriesWithTranslations(t);
	}, [t]);

	return (
		<Select
			ref={selectRef}
			value={selectedDropdownValue}
			originalItems={dropdownItems}
			setValue={setSelectedDropdownValue}
			onSelectItem={handleSelectCategory}
			{...props}
		/>
	);
});

POICategorySelect.displayName = "POICategorySelect";
