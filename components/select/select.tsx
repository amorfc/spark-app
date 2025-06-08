import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface SelectProps {
	open: boolean;
	value: string | null;
	items: ItemType<string>[];
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setValue: React.Dispatch<React.SetStateAction<string | null>>;
	setItems: React.Dispatch<React.SetStateAction<ItemType<string>[]>>;
	onSelectItem?: (item: ItemType<string>) => void;
	placeholder?: string;
	searchable?: boolean;
	searchPlaceholder?: string;
	listMode?: "FLATLIST" | "SCROLLVIEW" | "MODAL";
	modalTitle?: string;
	disabled?: boolean;
	multiple?: false;
	style?: ViewStyle;
	dropDownContainerStyle?: ViewStyle;
	textStyle?: TextStyle;
	placeholderStyle?: TextStyle;
	searchContainerStyle?: ViewStyle;
	searchTextInputStyle?: TextStyle;
	modalContentContainerStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
	open,
	value,
	items,
	setOpen,
	setValue,
	setItems,
	onSelectItem,
	placeholder = "Select an option...",
	searchable = false,
	searchPlaceholder = "Type to search...",
	listMode = "SCROLLVIEW",
	modalTitle,
	disabled = false,
	multiple = false,
	style,
	dropDownContainerStyle,
	textStyle,
	placeholderStyle,
	searchContainerStyle,
	searchTextInputStyle,
	modalContentContainerStyle,
}) => {
	const { colorScheme } = useColorScheme();

	const isDark = colorScheme === "dark";
	const backgroundColor = isDark
		? colors.dark.background
		: colors.light.background;
	const textColor = isDark ? colors.dark.foreground : colors.light.foreground;
	const borderColor = isDark ? colors.dark.border : colors.light.border;

	const defaultStyle: ViewStyle = {
		backgroundColor,
		borderColor,
		borderWidth: 1,
		borderRadius: 8,
		...style,
	};

	const defaultDropDownStyle: ViewStyle = {
		backgroundColor,
		borderColor,
		borderWidth: 1,
		borderRadius: 8,
		...dropDownContainerStyle,
	};

	const defaultTextStyle: TextStyle = {
		color: textColor,
		fontSize: 16,
		...textStyle,
	};

	const defaultPlaceholderStyle: TextStyle = {
		color: isDark ? colors.dark.mutedForeground : colors.light.mutedForeground,
		...placeholderStyle,
	};

	const defaultSearchContainerStyle: ViewStyle = {
		backgroundColor,
		borderBottomColor: borderColor,
		borderBottomWidth: 1,
		...searchContainerStyle,
	};

	const defaultSearchInputStyle: TextStyle = {
		color: textColor,
		fontSize: 16,
		...searchTextInputStyle,
	};

	const defaultModalContentStyle: ViewStyle = {
		backgroundColor,
		...modalContentContainerStyle,
	};

	return (
		<DropDownPicker
			open={open}
			value={value}
			items={items}
			setOpen={setOpen}
			setValue={setValue}
			setItems={setItems}
			onSelectItem={onSelectItem}
			placeholder={placeholder}
			searchable={searchable}
			searchPlaceholder={searchPlaceholder}
			listMode={listMode}
			modalTitle={modalTitle}
			modalAnimationType="slide"
			disabled={disabled}
			multiple={multiple}
			style={defaultStyle}
			dropDownContainerStyle={defaultDropDownStyle}
			textStyle={defaultTextStyle}
			placeholderStyle={defaultPlaceholderStyle}
			searchContainerStyle={defaultSearchContainerStyle}
			searchTextInputStyle={defaultSearchInputStyle}
			modalContentContainerStyle={defaultModalContentStyle}
		/>
	);
};

const styles = StyleSheet.create({
	// Add any additional styles here if needed
});

export default Select;
