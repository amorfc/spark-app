import React from "react";
import { ItemType } from "react-native-dropdown-picker";
import { Select } from "@/components/select/select";
import { BlogCategory } from "@/types/blog";
import { getCategoryDisplayName } from "@/utils/blog";

interface CategorySelectProps {
	value: BlogCategory | null;
	onValueChange: (category: BlogCategory) => void;
	placeholder?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
	value,
	onValueChange,
	placeholder = "Select a category...",
}) => {
	// Create category options for the dropdown
	const categoryOptions: ItemType<string>[] = Object.values(BlogCategory).map(
		(category) => ({
			label: getCategoryDisplayName(category),
			value: category,
		}),
	);

	// Create a proper setValue function that matches the expected type
	const setValue = (value: React.SetStateAction<string | null>) => {
		let newValue: string | null;

		if (typeof value === "function") {
			// Handle function case (not typical for our use case, but needed for type compatibility)
			newValue = value(null); // We don't track previous state here
		} else {
			newValue = value;
		}

		if (
			newValue &&
			Object.values(BlogCategory).includes(newValue as BlogCategory)
		) {
			onValueChange(newValue as BlogCategory);
		}
	};

	return (
		<Select
			value={value}
			originalItems={categoryOptions}
			setValue={setValue}
			placeholder={placeholder}
			searchable={false} // Not searchable as requested
			clearable={false} // Don't allow clearing category selection
		/>
	);
};
