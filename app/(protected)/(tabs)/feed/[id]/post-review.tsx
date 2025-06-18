import React from "react";
import {
	View,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { useUserPostReview } from "@/hooks/usePosts";
import { PostReviewWithProfile } from "@/types/posts";
import { PostReviewForm } from "@/components/post/post-review-form";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useTimeAgo } from "@/hooks/useTimeAgo";

export default function PostDetailScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const {
		data: postDetails,
		isLoading: postLoading,
		isRefetching: postRefetching,
		refetch: refetchPost,
	} = usePostDetails(id!, { limit: 20, offset: 0 });

	const { data: userReview, isLoading: userReviewLoading } = useUserPostReview(
		id!,
	);

	const post = postDetails?.post_data;
	const reviews = postDetails?.reviews_data || [];

	const handleClose = () => {
		router.back();
	};

	const handleReviewFormSuccess = () => {
		refetchPost();
	};

	const ReviewItem = ({ item }: { item: PostReviewWithProfile }) => {
		const createdAt = new Date(item.created_at);
		const timeAgo = useTimeAgo(createdAt);

		return (
			<View className="bg-card border border-border rounded-lg p-4 mb-3">
				{/* Review Header */}
				<View className="flex-row items-center mb-2">
					<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
						<Text className="text-white font-semibold text-sm">
							{item.reviewer_profile?.first_name?.charAt(0).toUpperCase() ||
								"?"}
						</Text>
					</View>
					<View className="ml-3 flex-1">
						<Text className="font-medium text-foreground">
							{item.reviewer_profile?.first_name}{" "}
							{item.reviewer_profile?.last_name}
						</Text>
						<Text className="text-xs text-muted-foreground">{timeAgo}</Text>
					</View>
				</View>

				{/* Review Content */}
				<Text className="text-foreground leading-5">{item.text}</Text>
			</View>
		);
	};

	const PostHeader = () => {
		const createdAt = post ? new Date(post.created_at) : new Date();
		const timeAgo = useTimeAgo(createdAt);

		if (!post) return null;

		return (
			<View className="bg-card border border-border rounded-lg p-4 mb-4">
				{/* Post Header */}
				<View className="flex-row items-center mb-3">
					<View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
						<Text className="text-white font-semibold text-lg">
							{post.author_profile?.first_name?.charAt(0).toUpperCase() || "?"}
						</Text>
					</View>
					<View className="ml-3 flex-1">
						<Text className="font-semibold text-foreground text-lg">
							{post.author_profile?.first_name} {post.author_profile?.last_name}
						</Text>
						<Text className="text-sm text-muted-foreground">{timeAgo}</Text>
					</View>
				</View>

				{/* Post Content */}
				<Text className="text-foreground leading-6 text-base mb-4">
					{post.content}
				</Text>

				{/* Post Stats */}
				<View className="flex-row items-center pt-3 border-t border-border">
					<MaterialIcons
						name="chat-bubble-outline"
						size={18}
						color={
							isDark
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
					<Text className="text-muted-foreground ml-2">
						{post.total_reviews_count || 0}{" "}
						{post.total_reviews_count === 1
							? t("posts.reviews.count_singular")
							: t("posts.reviews.count_plural")}
					</Text>
				</View>
			</View>
		);
	};

	const renderReviewForm = () => (
		<View className="bg-card border border-border rounded-lg p-4 mb-4">
			<PostReviewForm
				postId={id!}
				existingReview={userReview}
				onSuccess={handleReviewFormSuccess}
				className=""
			/>
		</View>
	);

	if (postLoading) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background">
				<ActivityIndicator size="large" />
				<Text className="mt-2 text-muted-foreground">
					{t("posts.loading_post")}
				</Text>
			</SafeAreaView>
		);
	}

	if (!post) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background">
				<Text className="text-xl font-semibold mb-2">
					{t("posts.post_not_found")}
				</Text>
				<Button onPress={handleClose}>{t("posts.go_back")}</Button>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
				<Text className="text-xl font-semibold">{t("posts.post_details")}</Text>
				<TouchableOpacity onPress={handleClose}>
					<MaterialIcons
						name="close"
						size={24}
						color={
							isDark
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
				</TouchableOpacity>
			</View>

			<FlatList
				data={reviews}
				renderItem={({ item }) => <ReviewItem item={item} />}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={
					<View className="p-4">
						<PostHeader />
						{renderReviewForm()}
						{reviews.length > 0 && (
							<Text className="font-semibold text-foreground mb-3">
								{t("posts.reviews.title")} ({reviews.length})
							</Text>
						)}
					</View>
				}
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={postRefetching}
						onRefresh={refetchPost}
						tintColor={isDark ? colors.dark.primary : colors.light.primary}
					/>
				}
				ListEmptyComponent={
					!postLoading ? (
						<View className="items-center justify-center py-8">
							<Text className="text-muted-foreground">
								{t("posts.reviews.empty_state")}
							</Text>
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
