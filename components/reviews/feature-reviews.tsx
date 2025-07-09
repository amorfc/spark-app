import React, { useState } from "react";
import { View, FlatList, Alert, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2, H3 } from "@/components/ui/typography";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewItem } from "@/components/reviews/review-item";
import { ReviewForm } from "@/components/reviews/review-form";
import { cn } from "@/lib/utils";

import {
	useFeatureReviews,
	useUserReview,
	useFeatureReviewStats,
	useDeleteReview,
} from "@/hooks/useReviews";
import { useAuth } from "@/context/supabase-provider";
import { Review } from "@/types/reviews";
import { useTranslation } from "@/lib/i18n/hooks";
import { useProfile } from "@/hooks/useProfile";

interface FeatureReviewsProps {
	featureRefId: string;
	featureName?: string;
	className?: string;
}

const FeatureReviews: React.FC<FeatureReviewsProps> = ({
	featureRefId,
	featureName,
	className,
}) => {
	const { canCRUD } = useProfile();

	const [showReviewForm, setShowReviewForm] = useState(false);
	const [editingReview, setEditingReview] = useState<Review | null>(null);
	const { t } = useTranslation();

	const { session } = useAuth();
	const {
		data: reviews,
		isLoading: reviewsLoading,
		error: reviewsError,
	} = useFeatureReviews(featureRefId);
	const { data: userReview, isLoading: userReviewLoading } =
		useUserReview(featureRefId);
	const { data: stats, isLoading: statsLoading } =
		useFeatureReviewStats(featureRefId);
	const deleteReviewMutation = useDeleteReview();

	const handleEditReview = () => {
		if (userReview) {
			setEditingReview(userReview);
			setShowReviewForm(true);
		}
	};

	const handleDeleteReview = () => {
		if (!userReview) return;

		Alert.alert(t("reviews.delete_review"), t("reviews.delete_confirmation"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.delete"),
				style: "destructive",
				onPress: () => {
					deleteReviewMutation.mutate({
						featureRefId,
					});
				},
			},
		]);
	};

	const handleFormSuccess = () => {
		setShowReviewForm(false);
		setEditingReview(null);
	};

	const handleFormCancel = () => {
		setShowReviewForm(false);
		setEditingReview(null);
	};

	if (reviewsError) {
		return (
			<View className={cn("p-4", className)}>
				<Text className="text-center text-destructive">
					{t("reviews.error_loading")}
				</Text>
			</View>
		);
	}

	return (
		<View className={cn("flex-1", className)}>
			{/* Header */}
			<View className="p-4 border-b border-border">
				<H2 className="text-center mb-2">
					{featureName
						? `${t("reviews.reviews_for")} ${featureName}`
						: t("reviews.reviews")}
				</H2>

				{/* Stats */}
				{statsLoading ? (
					<ActivityIndicator size="small" />
				) : stats ? (
					<View className="items-center space-y-2">
						<View className="flex-row items-center space-x-2">
							<StarRating
								rating={stats.avg_overall_rating}
								readonly
								size="lg"
							/>
							<Text className="text-lg font-semibold">
								{stats.avg_overall_rating.toFixed(1)}
							</Text>
						</View>
						<Text className="text-sm text-muted-foreground">
							Based on {stats.total_reviews} review
							{stats.total_reviews !== 1 ? "s" : ""}
						</Text>
						<View className="flex-row space-x-4">
							<Text className="text-xs text-muted-foreground">
								Safety: {stats.avg_safety_rating.toFixed(1)}
							</Text>
							<Text className="text-xs text-muted-foreground">
								Quality: {stats.avg_quality_rating.toFixed(1)}
							</Text>
						</View>
					</View>
				) : (
					<Text className="text-center text-muted-foreground">
						{t("reviews.no_reviews")}
					</Text>
				)}
			</View>

			{/* User Review Actions */}
			{session && canCRUD && (
				<View className="p-4 border-b border-border">
					{userReviewLoading ? (
						<ActivityIndicator size="small" />
					) : userReview ? (
						<View className="space-y-3">
							<H3>{t("reviews.your_review")}</H3>
							<ReviewItem review={userReview} />
							<View className="flex-row space-x-2">
								<Button
									variant="outline"
									onPress={handleEditReview}
									className="flex-1"
								>
									{t("reviews.edit_review")}
								</Button>
								<Button
									variant="destructive"
									onPress={handleDeleteReview}
									disabled={deleteReviewMutation.isPending}
									className="flex-1"
								>
									{deleteReviewMutation.isPending
										? t("reviews.deleting")
										: t("reviews.delete_review")}
								</Button>
							</View>
						</View>
					) : (
						<Button onPress={() => setShowReviewForm(true)} className="w-full">
							{t("reviews.write_review")}
						</Button>
					)}
				</View>
			)}

			{/* Review Form */}
			{showReviewForm && (
				<View className="border-b border-border">
					<ReviewForm
						featureRefId={featureRefId}
						existingReview={editingReview}
						onSuccess={handleFormSuccess}
						onCancel={handleFormCancel}
					/>
				</View>
			)}

			{/* Reviews List */}
			<View className="flex-1">
				{reviewsLoading ? (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" />
						<Text className="mt-2 text-muted-foreground">
							{t("reviews.loading")}
						</Text>
					</View>
				) : reviews && reviews.data.length > 0 ? (
					<FlatList
						data={reviews.data.filter((review) => review.id !== userReview?.id)} // Don't show user's review in the list
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<ReviewItem review={item} className="mx-4 mb-3" />
						)}
						contentContainerStyle={{ paddingVertical: 16 }}
						showsVerticalScrollIndicator={false}
					/>
				) : (
					<View className="flex-1 justify-center items-center p-8">
						<Text className="text-center text-muted-foreground text-lg">
							{t("reviews.no_reviews")}
						</Text>
						<Text className="text-center text-muted-foreground mt-2">
							{t("reviews.be_first")}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

export { FeatureReviews };
