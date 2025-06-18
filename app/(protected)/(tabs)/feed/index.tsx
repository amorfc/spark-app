import React from "react";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useTranslation } from "@/lib/i18n/hooks";
import { usePostsFeed } from "@/hooks/usePosts";
import { PostWithProfile } from "@/types/posts";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { routes } from "@/lib/routes";

export default function FeedScreen() {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const {
		data: postsData,
		isLoading,
		isRefetching,
		refetch,
	} = usePostsFeed({
		limit: 10,
		offset: 0,
	});

	const posts = postsData || [];

	const renderPostItem = ({ item }: { item: PostWithProfile }) => {
		const createdAt = new Date(item.created_at);
		const timeAgo = getTimeAgo(createdAt);

		return (
			<TouchableOpacity
				className="bg-card border border-border rounded-lg p-4 mb-3 mx-4"
				onPress={() => router.push(routes.postDetail(item.id))}
			>
				{/* Post Header */}
				<View className="flex-row items-center mb-3">
					<View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
						<Text className="text-white font-semibold text-lg">
							{item.author_profile?.first_name?.charAt(0).toUpperCase() || "?"}
						</Text>
					</View>
					<View className="ml-3 flex-1">
						<Text className="font-semibold text-foreground">
							{item.author_profile?.first_name} {item.author_profile?.last_name}
						</Text>
						<Text className="text-sm text-muted-foreground">{timeAgo}</Text>
					</View>
				</View>

				{/* Post Content */}
				<Text className="text-foreground leading-5 mb-3" numberOfLines={4}>
					{item.content}
				</Text>

				{/* Post Stats */}
				<View className="flex-row items-center justify-between pt-2 border-t border-border">
					<View className="flex-row items-center">
						<MaterialIcons
							name="chat-bubble-outline"
							size={16}
							color={
								isDark
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
						/>
						<Text className="text-sm text-muted-foreground ml-1">
							{item.total_reviews_count || 0}{" "}
							{item.total_reviews_count === 1 ? "review" : "reviews"}
						</Text>
					</View>
					<MaterialIcons
						name="chevron-right"
						size={20}
						color={
							isDark
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
				</View>
			</TouchableOpacity>
		);
	};

	const getTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds}s`;
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes}m`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours}h`;
		} else {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days}d`;
		}
	};

	const renderEmptyState = () => (
		<View className="flex-1 items-center justify-center px-8">
			<MaterialIcons
				name="dynamic-feed"
				size={64}
				color={
					isDark ? colors.dark.mutedForeground : colors.light.mutedForeground
				}
			/>
			<Text className="text-xl font-semibold mt-4 text-center">
				No posts yet
			</Text>
			<Text className="text-muted-foreground text-center mt-2 leading-5">
				Be the first to share something with the community!
			</Text>
		</View>
	);

	const renderHeader = () => (
		<View className="px-4 py-3 border-b border-border bg-background">
			<View className="flex-row items-center justify-between">
				<Text className="text-2xl font-bold text-foreground">
					{t("navigation.feed")}
				</Text>
				<TouchableOpacity
					className="p-2 rounded-full bg-primary"
					onPress={() => {
						// TODO: Navigate to create post screen
						console.log("Create post");
					}}
				>
					<MaterialIcons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{renderHeader()}
			<FlatList
				data={posts}
				renderItem={renderPostItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{
					paddingVertical: 16,
					flexGrow: 1,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching || isLoading}
						onRefresh={refetch}
						tintColor={isDark ? colors.dark.primary : colors.light.primary}
					/>
				}
				ListEmptyComponent={renderEmptyState}
			/>
		</SafeAreaView>
	);
}
