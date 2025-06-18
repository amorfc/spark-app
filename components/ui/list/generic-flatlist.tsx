import React, { useEffect, useRef } from "react";
import {
	FlatList,
	FlatListProps,
	RefreshControl,
	View,
	Text,
	StyleSheet,
	ListRenderItem,
	LayoutAnimation,
	UIManager,
	Platform,
	Animated,
	ActivityIndicator,
} from "react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

// Enable LayoutAnimation on Android
if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GenericFlatListProps<T> extends Omit<FlatListProps<T>, "renderItem"> {
	data: T[];
	renderItem: ListRenderItem<T>;
	onRefresh?: () => void;
	refreshing?: boolean;
	emptyStateMessage?: string;
	emptyStateSubtitle?: string;
	loading?: boolean;
	error?: string;
	loadingComponent?: React.ReactNode;
	errorComponent?: React.ReactNode;
	emptyStateComponent?: React.ReactNode;
	// Animation props
	enableLayoutAnimation?: boolean;
	enableFadeAnimation?: boolean;
	animationDuration?: number;
}

export const GenericFlatList = <T,>({
	data,
	renderItem,
	onRefresh,
	refreshing = false,
	emptyStateMessage = "No items found",
	emptyStateSubtitle = "Refresh to try again",
	loading = false,
	error,
	loadingComponent,
	errorComponent,
	emptyStateComponent,
	enableLayoutAnimation = false,
	enableFadeAnimation = false,
	animationDuration = 500,
	...flatListProps
}: GenericFlatListProps<T>) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const prevDataLength = useRef(data.length);

	// Handle layout animations when data changes
	useEffect(() => {
		if (enableLayoutAnimation && prevDataLength.current !== data.length) {
			LayoutAnimation.configureNext({
				duration: animationDuration,
				create: {
					type: LayoutAnimation.Types.easeInEaseOut,
					property: LayoutAnimation.Properties.opacity,
				},
				update: {
					type: LayoutAnimation.Types.easeInEaseOut,
				},
				delete: {
					type: LayoutAnimation.Types.easeInEaseOut,
					property: LayoutAnimation.Properties.opacity,
				},
			});
		}
		prevDataLength.current = data.length;
	}, [data.length, enableLayoutAnimation, animationDuration]);

	// Handle fade animations when data changes
	useEffect(() => {
		if (enableFadeAnimation) {
			fadeAnim.setValue(0);
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: animationDuration,
				useNativeDriver: true,
			}).start();
		}
	}, [data, enableFadeAnimation, animationDuration, fadeAnim]);

	// Default loading component
	const defaultLoadingComponent = (
		<View style={styles.centerContainer}>
			<Text
				style={[
					styles.message,
					{ color: isDark ? colors.dark.foreground : colors.light.foreground },
				]}
			>
				<ActivityIndicator size="small" color={colors.light.primary} />
			</Text>
		</View>
	);

	// Default error component
	const defaultErrorComponent = (
		<View style={styles.centerContainer}>
			<Text style={[styles.errorText, { color: colors.light.destructive }]}>
				Error: {error}
			</Text>
		</View>
	);

	// Default empty state component
	const defaultEmptyComponent = (
		<View style={styles.centerContainer}>
			<Text
				style={[
					styles.emptyTitle,
					{ color: isDark ? colors.dark.foreground : colors.light.foreground },
				]}
			>
				{emptyStateMessage}
			</Text>
			<Text
				style={[
					styles.emptySubtitle,
					{
						color: isDark
							? colors.dark.mutedForeground
							: colors.light.mutedForeground,
					},
				]}
			>
				{emptyStateSubtitle}
			</Text>
		</View>
	);

	// Handle different states
	if (loading) {
		return loadingComponent || defaultLoadingComponent;
	}

	if (error) {
		return errorComponent || defaultErrorComponent;
	}

	if (data.length === 0) {
		return emptyStateComponent || defaultEmptyComponent;
	}

	return (
		<Animated.View
			style={[{ flex: 1 }, enableFadeAnimation && { opacity: fadeAnim }]}
		>
			<FlatList
				data={data}
				renderItem={renderItem}
				keyExtractor={(item, index) => {
					// Try to extract id from item, fallback to index
					if (item && typeof item === "object" && "id" in item) {
						return String((item as any).id);
					}
					return index.toString();
				}}
				refreshControl={
					onRefresh ? (
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor={isDark ? colors.dark.primary : colors.light.primary}
							colors={[isDark ? colors.dark.primary : colors.light.primary]}
						/>
					) : undefined
				}
				showsVerticalScrollIndicator={false}
				ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
				contentContainerStyle={[
					data.length === 0 && styles.emptyContainer,
					{
						backgroundColor: isDark
							? colors.dark.background
							: colors.light.background,
					},
				]}
				{...flatListProps}
			/>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
		paddingVertical: 8,
		minHeight: 100,
	},
	emptyContainer: {
		flexGrow: 1,
		justifyContent: "center",
	},
	message: {
		fontSize: 16,
		textAlign: "center",
	},
	errorText: {
		fontSize: 16,
		textAlign: "center",
		fontWeight: "500",
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
});
