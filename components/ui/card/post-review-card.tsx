import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { useAuth } from "@/context/supabase-provider";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useDeletePostReview } from "@/hooks/usePosts";
import { useTranslation } from "@/lib/i18n/hooks";
import { PostReviewWithProfile } from "@/types/posts";
import { Text, TouchableOpacity, View, Alert } from "react-native";

interface PostReviewCardProps {
	item: PostReviewWithProfile;
	onPress: () => void;
	canDelete?: boolean;
}

export const PostReviewCard = ({
	item,
	onPress,
	canDelete = true,
}: PostReviewCardProps) => {
	const { t } = useTranslation();
	const createdAt = new Date(item.created_at);
	const timeAgo = useTimeAgo(createdAt);
	const { session } = useAuth();
	const deleteReviewMutation = useDeletePostReview();

	// Check if current user is the review author
	const isOwnReview = session?.user?.id === item.user_id;

	const handleDeletePress = () => {
		Alert.alert(
			t("posts.reviews.delete_review"),
			t("posts.reviews.delete_confirmation"),
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("common.delete"),
					style: "destructive",
					onPress: async () => {
						try {
							await deleteReviewMutation.mutateAsync({
								reviewId: item.id,
								postId: item.post_id,
							});
							Alert.alert(
								t("common.success"),
								t("posts.reviews.review_deleted"),
							);
						} catch (error) {
							Alert.alert(
								t("common.error"),
								error instanceof Error
									? error.message
									: t("posts.reviews.delete_error"),
							);
						}
					},
				},
			],
		);
	};

	return (
		<TouchableOpacity
			className="bg-card border border-border rounded-lg p-4 mb-3"
			onPress={onPress}
		>
			{/* Review Header */}
			<View className="flex-row items-center mb-2">
				<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
					<Text className="font-semibold text-sm">
						{item.reviewer_profile?.first_name?.charAt(0).toUpperCase() || "?"}
					</Text>
				</View>
				<View className="ml-3 flex-1">
					<Text className="font-medium text-foreground">
						{item.reviewer_profile?.first_name}{" "}
						{item.reviewer_profile?.last_name}
					</Text>
					<View className="flex-row items-center">
						<Text className="text-xs text-muted-foreground">{timeAgo}</Text>
						{isOwnReview && (
							<>
								<Text className="text-xs text-muted-foreground"> • </Text>
								<Text className="text-xs text-muted-foreground">
									{t("posts.reviews.your_review")}
								</Text>
							</>
						)}
					</View>
				</View>

				{/* Delete Button for Own Reviews */}
				{isOwnReview && canDelete && (
					<DeleteIconButton onPress={handleDeletePress} />
				)}
			</View>

			{/* Review Content */}
			<Text className="text-foreground leading-5">{item.text}</Text>
		</TouchableOpacity>
	);
};
