import React from "react";
import { ActivityIndicator, ListRenderItem } from "react-native";
import { GenericFlatList } from "@/components/ui/list/generic-flatlist";
import { colors } from "@/constants/colors";

interface PaginatedFlatListProps<T> {
	// Data and rendering
	data: T[];
	renderItem: ListRenderItem<T>;
	keyExtractor?: (item: T, index: number) => string;

	// Pagination props
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	fetchNextPage?: () => void;
	onEndReachedThreshold?: number;

	// Refresh props
	isRefetching?: boolean;
	isLoading?: boolean;
	onRefresh?: () => void;

	// Styling props
	contentContainerStyle?: object;
	showsVerticalScrollIndicator?: boolean;

	// State messages
	emptyStateMessage?: string;
	emptyStateSubtitle?: string;

	// Animation props
	enableLayoutAnimation?: boolean;
	enableFadeAnimation?: boolean;
	animationDuration?: number;
}

export const PaginatedFlatList = <T,>({
	data,
	renderItem,
	keyExtractor,
	hasNextPage = false,
	isFetchingNextPage = false,
	fetchNextPage,
	onEndReachedThreshold = 0.5,
	isRefetching = false,
	isLoading = false,
	onRefresh,
	contentContainerStyle = {},
	showsVerticalScrollIndicator = false,
	emptyStateMessage = "No items found",
	emptyStateSubtitle = "Pull to refresh",
	enableLayoutAnimation = false,
	enableFadeAnimation = false,
	animationDuration = 500,
}: PaginatedFlatListProps<T>) => {
	// Handle end reached for pagination
	const handleEndReached = () => {
		if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
			fetchNextPage();
		}
	};

	// Footer component for loading indicator
	const ListFooterComponent = () => {
		if (!isFetchingNextPage) return null;

		return (
			<ActivityIndicator
				className="self-center py-4"
				color={colors.light.primary}
			/>
		);
	};

	return (
		<GenericFlatList
			data={data}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onEndReachedThreshold={onEndReachedThreshold}
			refreshing={isRefetching || isLoading}
			onRefresh={onRefresh}
			contentContainerStyle={contentContainerStyle}
			onEndReached={handleEndReached}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			ListFooterComponent={ListFooterComponent}
			emptyStateMessage={emptyStateMessage}
			emptyStateSubtitle={emptyStateSubtitle}
			loading={isLoading}
			enableLayoutAnimation={enableLayoutAnimation}
			enableFadeAnimation={enableFadeAnimation}
			animationDuration={animationDuration}
		/>
	);
};
