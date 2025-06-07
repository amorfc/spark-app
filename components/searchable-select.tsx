import {
	View,
	TextInput,
	StyleSheet,
	FlatList,
	Pressable,
	Text,
	ActivityIndicator,
	ListRenderItem,
} from "react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface SearchableSelectProps<T = any> {
	onSelect: (item: T) => void;
	onSearch: (query: string) => Promise<T[]>;
	placeholder?: string;
	minSearchLength?: number;
	debounceMs?: number;
	renderItem?: ListRenderItem<T>;
	getItemLabel?: (item: T) => string;
}

export const SearchableSelect = <T extends { id?: string }>({
	onSelect,
	onSearch,
	placeholder = "Search...",
	minSearchLength = 4,
	debounceMs = 300,
	renderItem,
	getItemLabel = (item: any) => item.text || item.label || item.name,
}: SearchableSelectProps<T>) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
	const inputRef = useRef<TextInput>(null);

	const backgroundColor =
		colorScheme === "dark" ? colors.dark.background : colors.light.background;
	const textColor =
		colorScheme === "dark" ? colors.dark.foreground : colors.light.foreground;

	const handleSearch = useCallback(
		async (query: string) => {
			if (query.length < minSearchLength) {
				setResults([]);
				return;
			}

			setIsLoading(true);
			try {
				const searchResults = await onSearch(query);
				setResults(searchResults);
			} catch (error) {
				console.error("Search error:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[minSearchLength, onSearch],
	);

	const debouncedSearch = useCallback(
		(query: string) => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}

			debounceTimer.current = setTimeout(() => {
				handleSearch(query);
			}, debounceMs);
		},
		[debounceMs, handleSearch],
	);

	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, []);

	const handleSelect = useCallback(
		(item: T) => {
			onSelect(item);
			setSearchQuery(getItemLabel(item));
			setIsOpen(false);
			inputRef.current?.blur();
		},
		[onSelect, getItemLabel],
	);

	const defaultRenderItem: ListRenderItem<T> = useCallback(
		({ item }) => (
			<Pressable
				style={({ pressed }) => [
					styles.item,
					{
						backgroundColor: pressed
							? colors.light.primary + "20"
							: backgroundColor,
					},
				]}
				onPress={() => handleSelect(item)}
			>
				<Text style={[styles.itemText, { color: textColor }]}>
					{getItemLabel(item)}
				</Text>
			</Pressable>
		),
		[backgroundColor, textColor, handleSelect, getItemLabel],
	);

	return (
		<View style={[styles.container, { top: insets.top + 20 }]}>
			<TextInput
				ref={inputRef}
				style={[styles.input, { backgroundColor, color: textColor }]}
				placeholder={placeholder}
				placeholderTextColor={colors.light.mutedForeground}
				value={searchQuery}
				onChangeText={(text) => {
					setSearchQuery(text);
					setIsOpen(true);
					debouncedSearch(text);
				}}
				onFocus={() => setIsOpen(true)}
			/>
			{isOpen && searchQuery.length >= minSearchLength && (
				<View style={[styles.resultsContainer, { backgroundColor }]}>
					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator color={colors.light.primary} />
						</View>
					) : results.length > 0 ? (
						<FlatList
							data={results}
							renderItem={renderItem || defaultRenderItem}
							keyExtractor={(item, index) => item.id || index.toString()}
							style={styles.resultsList}
							keyboardShouldPersistTaps="handled"
						/>
					) : (
						<Text style={[styles.noResults, { color: textColor }]}>
							No results found
						</Text>
					)}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		left: 20,
		right: 20,
		zIndex: 1,
	},
	input: {
		padding: 12,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	resultsContainer: {
		marginTop: 4,
		borderRadius: 8,
		maxHeight: 300,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	resultsList: {
		borderRadius: 8,
	},
	item: {
		padding: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.light.border,
	},
	itemText: {
		fontSize: 16,
	},
	loadingContainer: {
		padding: 20,
		alignItems: "center",
	},
	noResults: {
		padding: 20,
		textAlign: "center",
	},
});
