import React, { useState, useEffect, useRef } from "react";
import {
	ViewStyle,
	TextStyle,
	View,
	TouchableOpacity,
	Animated,
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
	maxResults = 10,
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
			setItems(originalItems.slice(0, initialItemsCount));
		} else {
			setItems(originalItems);
		}
	}, [originalItems, searchable, initialItemsCount]);

	const performSearch = (text: string) => {
		if (!searchable) return;

		if (text.length >= minSearchLength) {
			setIsLoading(true);

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

				if (!open) {
					setOpen(true);
				}
			}, 50); // Small delay to simulate search processing
		} else {
			setItems(originalItems.slice(0, initialItemsCount));
			setIsLoading(false);
		}
	};

	const handleSearch = (text: string) => {
		const currentDisplayValue = getDisplayValue();
		if (text === currentDisplayValue && value) {
			return;
		}

		setSearchText(text);

		if (text === "" && value) {
			setItems(originalItems.slice(0, initialItemsCount));
			setIsLoading(false);
			return;
		}

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		if (text.length >= minSearchLength) {
			setIsLoading(true);
		}

		debounceRef.current = setTimeout(() => {
			performSearch(text);
		}, debounceMs);
	};

	const getDisplayValue = () => {
		if (value && originalItems.length > 0) {
			const selectedItem = originalItems.find((item) => item.value === value);
			return selectedItem?.label || "";
		}

		return "";
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (clearable && value) {
			Animated.parallel([
				Animated.spring(clearButtonAnimation, {
					toValue: 1,
					useNativeDriver: true,
					tension: 120,
					friction: 8,
				}),
				Animated.spring(dropdownWidthAnimation, {
					toValue: 1,
					useNativeDriver: false,
					tension: 120,
					friction: 8,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.spring(clearButtonAnimation, {
					toValue: 0,
					useNativeDriver: true,
					tension: 120,
					friction: 8,
				}),
				Animated.spring(dropdownWidthAnimation, {
					toValue: 0,
					useNativeDriver: false,
					tension: 120,
					friction: 8,
				}),
			]).start();
		}
	}, [value, clearable, clearButtonAnimation, dropdownWidthAnimation]);

	const handleClear = () => {
		setValue(null);
		setSearchText("");
		setItems(originalItems.slice(0, initialItemsCount));
		setOpen(false);
		setTimeout(() => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		}, 0);
	};

	const shouldShowDropdown = true;

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
						<MaterialIcons name="delete" size={16} color="white" />
					</TouchableOpacity>
				</Animated.View>
			)}
		</View>
	);
};

export default Select;
