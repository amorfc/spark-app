import React, { useState } from "react";
import { View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { StarRating } from "@/components/reviews/star-rating";
import { cn } from "@/lib/utils";
import { Review } from "@/types/reviews";
import { useDeleteReview } from "@/hooks/useReviews";
import { useAuth } from "@/context/supabase-provider";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { useTranslation } from "react-i18next";
import { ModerationMenu } from "@/components/moderation";
import { FilteredText } from "@/components/moderation/filtered-content";
import { useProfile } from "@/hooks/useProfile";

interface ReviewItemProps {
	review: Review;
	className?: string;
	onDeleted?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
	review,
	className,
	onDeleted,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
	const { session } = useAuth();
	const { t, i18n } = useTranslation();
	const { canCRUD } = useProfile();
	const canDelete = review.user_id === session?.user?.id;

	const handleDelete = async () => {
		await deleteReview({
			featureRefId: review.feature_ref_id.toString(),
		});
		onDeleted?.();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString(i18n.language, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const averageRating = (review.safety_rating + review.quality_rating) / 2;

	// Check if comment is long (more than 100 characters)
	const isLongComment = review.comment && review.comment.length > 100;
	const displayComment =
		isLongComment && !isExpanded
			? review.comment?.substring(0, 100) + "..."
			: review.comment;

	const handleDeletePress = () => {
		//Alert and if ok, delete the review
		Alert.alert(t("reviews.delete_review"), t("reviews.delete_confirmation"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.delete"),
				onPress: handleDelete,
			},
		]);
	};

	return (
		<View
			className={cn(
				"bg-card rounded-lg p-4 border border-border relative",
				className,
			)}
			style={{ position: "relative" }}
		>
			{/* Header with average rating and date */}
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center gap-x-2">
					<Text className="text-sm font-medium">
						{t("reviews.average_rating")}
					</Text>
					<StarRating rating={averageRating} readonly size="sm" />
					<Text className="text-sm text-muted-foreground">
						{averageRating.toFixed(1)}
					</Text>
				</View>

				{/* Action Buttons */}
				<View className="flex-row items-center">
					{canDelete && canCRUD && (
						<DeleteIconButton onPress={handleDeletePress} />
					)}

					{/* Moderation Menu for Others' Reviews */}
					{!canDelete && canCRUD && (
						<ModerationMenu
							contentType="review"
							contentId={review.id}
							authorId={review.user_id}
							authorName="Anonymous" // Feature reviews don't have profile info
						/>
					)}
				</View>
			</View>

			{/* Individual ratings */}
			<View className="flex-row justify-between items-center space-y-2 mb-3">
				<View>
					<View className="flex-row items-center gap-x-2">
						<Text className="text-sm font-medium">
							{t("reviews.safety_rating")}
						</Text>
						<View className="flex-row items-center space-x-1">
							<StarRating rating={review.safety_rating} readonly size="sm" />
							<Text className="text-xs text-muted-foreground">
								{review.safety_rating}/5
							</Text>
						</View>
					</View>

					<View className="flex-row items-center gap-x-2">
						<Text className="text-sm font-medium">
							{t("reviews.quality_rating")}
						</Text>
						<View className="flex-row items-center space-x-1">
							<StarRating rating={review.quality_rating} readonly size="sm" />
							<Text className="text-xs text-muted-foreground">
								{review.quality_rating}/5
							</Text>
						</View>
					</View>
				</View>
				<Text className="text-xs text-muted-foreground">
					{formatDate(review.created_at)}
				</Text>
			</View>

			{/* Comment with expandable functionality */}
			{review.comment && (
				<View className="pt-2 border-t border-border">
					<FilteredText
						text={displayComment || ""}
						className="text-sm text-foreground leading-relaxed"
					/>
					{isLongComment && (
						<Pressable onPress={() => setIsExpanded(!isExpanded)}>
							<Text className="text-xs text-primary mt-1 font-medium">
								{isExpanded ? t("reviews.show_less") : t("reviews.show_more")}
							</Text>
						</Pressable>
					)}
				</View>
			)}

			{/* Updated indicator */}
			{review.updated_at !== review.created_at && (
				<Text className="text-xs text-muted-foreground mt-2 italic">
					{t("reviews.updated")} {formatDate(review.updated_at)}
				</Text>
			)}

			{/* Loading Overlay */}
			{isDeleting && (
				<View className="absolute inset-0 bg-gray-200/50 rounded-lg justify-center items-center z-10">
					<View className="bg-white/90 rounded-lg p-4 shadow-md">
						<ActivityIndicator size="small" color="#9CA3AF" />
					</View>
				</View>
			)}
		</View>
	);
};

export { ReviewItem };
