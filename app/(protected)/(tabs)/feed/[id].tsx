import React, { useState } from "react";
import {
	View,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/hooks";
import {
	usePostDetails,
	useUserPostReview,
	useCreateOrUpdatePostReview,
	useDeletePostReview,
} from "@/hooks/usePosts";
import { PostReviewWithProfile } from "@/types/posts";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function PostDetailScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const [reviewText, setReviewText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		data: postDetails,
		isLoading: postLoading,
		isRefetching: postRefetching,
		refetch: refetchPost,
	} = usePostDetails(id!, { limit: 20, offset: 0 });

	const { data: userReview, isLoading: userReviewLoading } = useUserPostReview(
		id!,
	);

	const createOrUpdateReviewMutation = useCreateOrUpdatePostReview();
	const deleteReviewMutation = useDeletePostReview();

	const post = postDetails?.post_data;
	const reviews = postDetails?.reviews_data || [];

	const handleClose = () => {
		router.back();
	};

	const handleSubmitReview = async () => {
		if (!reviewText.trim()) return;

		setIsSubmitting(true);
		try {
			await createOrUpdateReviewMutation.mutateAsync({
				postId: id!,
				data: { text: reviewText.trim() },
			});

			setReviewText("");
			Alert.alert(
				t("common.success"),
				userReview ? "Review updated!" : "Review submitted!",
			);
			refetchPost();
		} catch (error) {
			Alert.alert(t("common.error"), "Failed to submit review");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteReview = async () => {
		if (!userReview) return;

		Alert.alert(
			"Delete Review",
			"Are you sure you want to delete your review?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteReviewMutation.mutateAsync({
								reviewId: userReview.id,
								postId: id!,
							});
							setReviewText("");
							refetchPost();
						} catch (error) {
							Alert.alert(t("common.error"), "Failed to delete review");
						}
					},
				},
			],
		);
	};

	const getTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds}s ago`;
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes}m ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours}h ago`;
		} else {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days}d ago`;
		}
	};

	const renderReviewItem = ({ item }: { item: PostReviewWithProfile }) => {
		const createdAt = new Date(item.created_at);
		const timeAgo = getTimeAgo(createdAt);

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

	const renderPostHeader = () => {
		if (!post) return null;

		const createdAt = new Date(post.created_at);
		const timeAgo = getTimeAgo(createdAt);

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
						{post.total_reviews_count === 1 ? "review" : "reviews"}
					</Text>
				</View>
			</View>
		);
	};

	const renderReviewForm = () => (
		<View className="bg-card border border-border rounded-lg p-4 mb-4">
			<Text className="font-semibold text-foreground mb-3">
				{userReview ? "Update your review" : "Add a review"}
			</Text>
			<Input
				value={reviewText}
				onChangeText={setReviewText}
				placeholder="Share your thoughts..."
				multiline
				numberOfLines={3}
				className="mb-3"
			/>
			<View className="flex-row justify-between">
				<View className="flex-row gap-2">
					<Button
						onPress={handleSubmitReview}
						disabled={!reviewText.trim() || isSubmitting}
						className="flex-1"
					>
						{isSubmitting ? (
							<ActivityIndicator size="small" color="white" />
						) : userReview ? (
							"Update"
						) : (
							"Submit"
						)}
					</Button>
					{userReview && (
						<Button
							variant="outline"
							onPress={handleDeleteReview}
							disabled={deleteReviewMutation.isPending}
						>
							Delete
						</Button>
					)}
				</View>
			</View>
		</View>
	);

	if (postLoading) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background">
				<ActivityIndicator size="large" />
				<Text className="mt-2 text-muted-foreground">Loading post...</Text>
			</SafeAreaView>
		);
	}

	if (!post) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background">
				<Text className="text-xl font-semibold mb-2">Post not found</Text>
				<Button onPress={handleClose}>Go Back</Button>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
				<Text className="text-xl font-semibold">Post Details</Text>
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
				renderItem={renderReviewItem}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={
					<View className="p-4">
						{renderPostHeader()}
						{renderReviewForm()}
						{reviews.length > 0 && (
							<Text className="font-semibold text-foreground mb-3">
								Reviews ({reviews.length})
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
								No reviews yet. Be the first to review!
							</Text>
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
