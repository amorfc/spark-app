import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useTranslation } from "@/lib/i18n/hooks";
import { useInfinitePostsData, useInfinitePostsFeed } from "@/hooks/usePosts";
import { routes } from "@/lib/routes";
import { PaginatedFlatList } from "@/components/ui/list/paginated-flatlist";
import { PostCard } from "@/components/ui/card/post-card";
import { Button } from "@/components/ui/button";

export default function FeedScreen() {
	const { t } = useTranslation();

	const infinitePostsData = useInfinitePostsFeed({
		limit: 4,
	});

	const {
		posts,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		refetch,
	} = useInfinitePostsData(infinitePostsData);

	const renderHeader = () => (
		<View className="px-4 py-3 border-b border-border bg-background">
			<View className="flex-row items-center justify-between">
				<Text className="text-2xl font-bold text-foreground">
					{t("navigation.feed")}
				</Text>
				<Button
					variant="default"
					size="sm"
					onPress={() => router.push(routes.postCreate())}
				>
					<Text>{t("navigation.create_post")}</Text>
				</Button>
			</View>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			{renderHeader()}
			<PaginatedFlatList
				data={posts}
				renderItem={({ item }) => <PostCard item={item} />}
				keyExtractor={(item) => item.id}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				fetchNextPage={fetchNextPage}
				isRefetching={isRefetching}
				isLoading={isLoading}
				onRefresh={refetch}
				emptyStateMessage={t("empty_states.no_posts")}
				emptyStateSubtitle={t("empty_states.be_first_poster")}
			/>
		</SafeAreaView>
	);
}
