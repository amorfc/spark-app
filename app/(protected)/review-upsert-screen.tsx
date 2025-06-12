// app/review-upsert.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";
import { StarRating } from "@/components/reviews/star-rating";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useUserReview, useDeleteReview } from "@/hooks/useReviews";
import { useMapSearch } from "@/hooks/useMapSearch";

export default function ReviewUpsertScreen() {
	const router = useRouter();
	const { selectedFeature } = useMapSearch();
	const featureRefId = selectedFeature?.id as string;
	console.log({ selectedFeature });

	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch user's existing review and stats
	const { data: userReview, isLoading: userReviewLoading } =
		useUserReview(featureRefId);

	const deleteReviewMutation = useDeleteReview();

	const iconColor = isDark
		? colors.dark.mutedForeground
		: colors.light.mutedForeground;

	const handleClose = () => {
		if (isSubmitting) return;
		router.back();
	};

	const handleFormSuccess = () => {
		setIsSubmitting(false);

		// Show success message and navigate back
		Alert.alert(
			"Success!",
			userReview
				? "Your review has been updated."
				: "Thank you for your review!",
			[
				{
					text: "OK",
					onPress: () => router.back(),
				},
			],
		);
	};

	const handleFormCancel = () => {
		if (isSubmitting) return;
		handleClose();
	};

	const handleDeleteReview = () => {
		Alert.alert(
			"Delete Review",
			"Are you sure you want to delete your review? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteReviewMutation.mutateAsync({ featureRefId });
							Alert.alert("Success", "Your review has been deleted.", [
								{ text: "OK", onPress: () => router.back() },
							]);
						} catch (error) {
							Alert.alert(
								"Error",
								"Failed to delete review. Please try again.",
							);
						}
					},
				},
			],
		);
	};

	const isEditing = !!userReview;
	const headerTitle = isEditing ? "Edit Your Review" : "Write a Review";
	const isLoading = userReviewLoading;

	const featureName = selectedFeature?.properties?.name;

	// Validate feature_id
	console.log({ featureRefId });

	if (!featureRefId) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center">
				<Text className="text-center text-destructive text-lg">
					Invalid feature ID
				</Text>
				<Button onPress={() => router.back()} className="mt-4">
					Go Back
				</Button>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
				<View className="flex-1 pr-4">
					<Text className="text-xl font-semibold">{headerTitle}</Text>
					{featureName && (
						<Text className="text-lg text-foreground mt-1" numberOfLines={1}>
							{featureName}
						</Text>
					)}
					<Text className="text-sm text-muted-foreground mt-1">
						{isEditing
							? "Update your rating and feedback"
							: "Share your experience with the community"}
					</Text>
				</View>
				<TouchableOpacity
					className="px-2 py-2"
					onPress={handleClose}
					disabled={isSubmitting}
					accessibilityLabel="Close review form"
					accessibilityRole="button"
				>
					<MaterialIcons
						name="close"
						size={24}
						color={isSubmitting ? colors.light.muted : iconColor}
					/>
				</TouchableOpacity>
			</View>

			{/* Current Stats Section */}
			{userReview && !isLoading && (
				<View className="mx-4 mt-4 p-4 bg-muted rounded-lg">
					<Text className="text-sm font-medium mb-3">Current Ratings</Text>
					<View className="flex-row justify-between items-center">
						<View className="flex-row items-center space-x-2">
							<StarRating
								rating={Math.round(
									(userReview.safety_rating + userReview.quality_rating) / 2,
								)}
								readonly
								size="md"
							/>
							<Text className="text-base font-medium">
								{(
									(userReview.safety_rating + userReview.quality_rating) /
									2
								).toFixed(1)}
								/5
							</Text>
						</View>
						<Text className="text-sm text-muted-foreground">
							Average Rating
						</Text>
					</View>
					<View className="flex-row justify-between mt-2">
						<Text className="text-sm text-muted-foreground">
							Safety: {userReview.safety_rating}/5
						</Text>
						<Text className="text-sm text-muted-foreground">
							Quality: {userReview.quality_rating}/5
						</Text>
					</View>
				</View>
			)}

			{/* Main Content */}
			<View className="flex-1">
				{isLoading ? (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" />
						<Text className="mt-2 text-muted-foreground">Loading...</Text>
					</View>
				) : (
					<ReviewForm
						featureRefId={featureRefId}
						existingReview={userReview}
						onSuccess={handleFormSuccess}
						onCancel={handleFormCancel}
						className="flex-1"
					/>
				)}
			</View>
		</SafeAreaView>
	);
}
