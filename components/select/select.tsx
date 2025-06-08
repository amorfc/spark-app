import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	ViewStyle,
	TextStyle,
	View,
	TouchableOpacity,
	Text,
	Animated,
	TextInput,
} from "react-native";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface SelectProps {
	open?: boolean;
	value: string | null;
	originalItems: ItemType<string>[];
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setValue: React.Dispatch<React.SetStateAction<string | null>>;
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
	minSearchLength?: number;
	maxResults?: number;
	debounceMs?: number;
	initialItemsCount?: number;
	clearable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
	value,
	originalItems,
	setValue,
	onSelectItem,
	placeholder = "Select an option...",
	searchable = false,
	searchPlaceholder = "Type to search...",
	listMode = "FLATLIST",
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
	minSearchLength = 3,
	maxResults = 5,
	debounceMs = 300,
	initialItemsCount = 50,
	clearable = true,
}) => {
	const { colorScheme } = useColorScheme();
	const [items, setItems] = useState<ItemType<string>[]>([]);
	const [searchText, setSearchText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const debounceRef = useRef<any>(null);
	const clearButtonAnimation = useRef(new Animated.Value(0)).current;
	const dropdownWidthAnimation = useRef(new Animated.Value(0)).current;

	const [open, setOpen] = useState(false);
	const isDark = colorScheme === "dark";
	const backgroundColor = isDark
		? colors.dark.background
		: colors.light.background;
	const textColor = isDark ? colors.dark.foreground : colors.light.foreground;
	const borderColor = isDark ? colors.dark.border : colors.light.border;

	// Initialize items state - start with limited items for searchable, full for non-searchable
	useEffect(() => {
		if (searchable) {
			setItems(originalItems.slice(0, initialItemsCount)); // Start with first 50 items
		} else {
			setItems(originalItems); // Show all items for non-searchable
		}
	}, [originalItems, searchable, initialItemsCount]);

	// Debounced search function
	const performSearch = (text: string) => {
		if (!searchable) return;

		if (text.length >= minSearchLength) {
			setIsLoading(true);

			// Simulate async search (you can replace with actual async call)
			setTimeout(() => {
				const filtered = originalItems
					.filter(
						(item: ItemType<string>) =>
							item.label?.toLowerCase().includes(text.toLowerCase()) ||
							item.value?.toLowerCase().includes(text.toLowerCase()),
					)
					.slice(0, maxResults); // Limit results

				setItems(filtered);
				setIsLoading(false);

				// Auto-open dropdown when user starts searching
				if (!open) {
					setOpen(true);
				}
			}, 50); // Small delay to simulate search processing
		} else {
			// Show initial limited items when search is too short
			setItems(originalItems.slice(0, initialItemsCount));
			setIsLoading(false);
			// Don't auto-close - let user keep dropdown open
		}
	};

	// Handle search text change with debouncing
	const handleSearch = (text: string) => {
		// Don't update searchText if the text matches the current selected value
		// This prevents the selected value from being treated as search text
		const currentDisplayValue = getDisplayValue();
		if (text === currentDisplayValue && value) {
			return; // Don't treat selected value display as search
		}

		setSearchText(text);

		// If user clears the search completely, reset to show selected value
		if (text === "" && value) {
			setItems(originalItems.slice(0, initialItemsCount));
			setIsLoading(false);
			return;
		}

		// Clear previous debounce timer
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Show loading immediately if search is long enough
		if (text.length >= minSearchLength) {
			setIsLoading(true);
		}

		// Set new debounce timer
		debounceRef.current = setTimeout(() => {
			performSearch(text);
		}, debounceMs);
	};

	// Always show the selected value in the input, regardless of search state
	const getDisplayValue = () => {
		// If has selected value, always show it
		if (value && originalItems.length > 0) {
			const selectedItem = originalItems.find((item) => item.value === value);
			return selectedItem?.label || "";
		}

		// No selection - show empty for placeholder
		return "";
	};

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	// Animation effect for both clear button and dropdown width
	useEffect(() => {
		if (clearable && value) {
			// Animate clear button in and dropdown width adjustment
			Animated.parallel([
				Animated.spring(clearButtonAnimation, {
					toValue: 1,
					useNativeDriver: true,
					tension: 120,
					friction: 8,
				}),
				Animated.spring(dropdownWidthAnimation, {
					toValue: 1,
					useNativeDriver: false, // marginRight requires layout animation
					tension: 120,
					friction: 8,
				}),
			]).start();
		} else {
			// Animate clear button out and dropdown width back to full
			Animated.parallel([
				Animated.spring(clearButtonAnimation, {
					toValue: 0,
					useNativeDriver: true,
					tension: 120,
					friction: 8,
				}),
				Animated.spring(dropdownWidthAnimation, {
					toValue: 0,
					useNativeDriver: false, // marginRight requires layout animation
					tension: 120,
					friction: 8,
				}),
			]).start();
		}
	}, [value, clearable, clearButtonAnimation, dropdownWidthAnimation]);

	// Clear selection function
	const handleClear = () => {
		setValue(null);
		setSearchText("");
		setItems(originalItems.slice(0, initialItemsCount));
		setOpen(false);
		// Force the dropdown to reset its internal search state
		setTimeout(() => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		}, 0);
	};

	// Allow dropdown to stay open regardless of search length
	const shouldShowDropdown = true;

	// Create loading item for display
	const displayItems =
		isLoading && searchable && searchText.length >= minSearchLength
			? [{ label: "Searching...", value: "loading", disabled: true }]
			: items;

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
		<View className="w-full flex flex-row items-center">
			<Animated.View
				className="flex-1 w-full"
				style={{
					marginRight: dropdownWidthAnimation.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 6], // 32px button + 8px margin
					}),
				}}
			>
				<DropDownPicker
					open={open && shouldShowDropdown}
					value={value}
					items={displayItems}
					setOpen={setOpen}
					setValue={setValue}
					setItems={setItems}
					onSelectItem={onSelectItem}
					placeholder={placeholder}
					searchable={searchable}
					searchPlaceholder={`${searchPlaceholder} (min ${minSearchLength} chars)`}
					onChangeSearchText={handleSearch}
					listMode={listMode}
					modalTitle={modalTitle}
					modalAnimationType="slide"
					disabled={disabled}
					multiple={multiple}
					dropDownDirection="BOTTOM"
					closeAfterSelecting={true}
					showTickIcon={false}
					showArrowIcon={true}
					showBadgeDot={false}
					closeOnBackPressed={true}
					style={defaultStyle}
					dropDownContainerStyle={defaultDropDownStyle}
					textStyle={defaultTextStyle}
					placeholderStyle={defaultPlaceholderStyle}
					searchContainerStyle={defaultSearchContainerStyle}
					searchTextInputStyle={defaultSearchInputStyle}
					modalContentContainerStyle={defaultModalContentStyle}
				/>
			</Animated.View>

			{clearable && value && (
				<Animated.View
					className="ml-2 justify-center"
					style={{
						opacity: clearButtonAnimation,
						transform: [
							{
								scale: clearButtonAnimation.interpolate({
									inputRange: [0, 1],
									outputRange: [0.3, 1],
								}),
							},
							{
								translateX: clearButtonAnimation.interpolate({
									inputRange: [0, 1],
									outputRange: [20, 0],
								}),
							},
						],
					}}
				>
					<TouchableOpacity
						onPress={handleClear}
						className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-sm"
						activeOpacity={0.7}
					>
						<MaterialIcons name="clear" size={16} color="white" />
					</TouchableOpacity>
				</Animated.View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	// Add any additional styles here if needed
});

export default Select;
