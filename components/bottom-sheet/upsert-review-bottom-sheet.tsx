// components/bottom-sheet/upsert-review-bottom-sheet-enhanced.tsx
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
	useState,
} from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { BottomSheet, BottomSheetProps, BottomSheetRef } from "./bottom-sheet";
import { ReviewForm } from "@/components/reviews/review-form";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Review } from "@/types/reviews";
import { useUserReview } from "@/hooks/useReviews";

interface UpsertReviewBottomSheetEnhancedProps
	extends Omit<BottomSheetProps, "children"> {
	featureRefId: number;
	featureName?: string;
	onSuccess?: (review: Review) => void;
	onClose?: () => void;
}

export const UpsertReviewBottomSheet = forwardRef<
	BottomSheetRef,
	UpsertReviewBottomSheetEnhancedProps
>(
	(
		{ featureRefId, featureName, onSuccess, onClose, ...bottomSheetProps },
		ref,
	) => {
		const { colorScheme } = useColorScheme();
		const isDark = colorScheme === "dark";
		const bottomSheetRef = useRef<BottomSheetRef>(null);
		const [isSubmitting, setIsSubmitting] = useState(false);

		// Fetch user's existing review and stats
		const { data: userReview, isLoading: userReviewLoading } =
			useUserReview(featureRefId);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				...bottomSheetRef.current!,
			}),
			[],
		);

		const iconColor = isDark
			? colors.dark.mutedForeground
			: colors.light.mutedForeground;

		const handleClose = () => {
			if (isSubmitting) return; // Prevent closing while submitting
			bottomSheetRef.current?.close();
			onClose?.();
		};

		const handleFormSuccess = () => {
			setIsSubmitting(false);
			bottomSheetRef.current?.close();

			setTimeout(() => {
				onSuccess?.(userReview as Review);
			}, 300);
		};

		const handleFormCancel = () => {
			if (isSubmitting) return; // Prevent canceling while submitting
			handleClose();
		};

		// Auto-close when featureRefId changes
		useEffect(() => {
			if (!featureRefId) {
				bottomSheetRef.current?.close();
			}
		}, [featureRefId]);

		const isEditing = !!userReview;
		const headerTitle = isEditing ? `Edit Your Review` : `Review This Location`;

		const isLoading = userReviewLoading;

		return (
			<BottomSheet
				ref={bottomSheetRef}
				scrollable={true}
				enablePanDownToClose={!isSubmitting} // Disable pan down while submitting
				index={-1}
				style={{ zIndex: 2200 }}
				showBackdrop={true}
				onClose={handleClose}
				{...bottomSheetProps}
			>
				<View className="flex-1">
					{/* Header */}
					<View className="flex-row justify-between items-center pb-3 border-b border-gray-200 mb-4">
						<View className="flex-1 pr-4">
							<Text className="text-xl font-semibold">{headerTitle}</Text>
							{featureName && (
								<Text
									className="text-lg text-foreground mt-1"
									numberOfLines={1}
								>
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
							className="px-1"
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

					{/* Loading State */}
					{isLoading ? (
						<View className="flex-1 justify-center items-center">
							<ActivityIndicator size="large" />
							<Text className="mt-2 text-muted-foreground">Loading...</Text>
						</View>
					) : (
						/* Review Form */
						<ReviewForm
							featureRefId={featureRefId}
							existingReview={userReview}
							onSuccess={handleFormSuccess}
							onCancel={handleFormCancel}
							className="flex-1"
						/>
					)}

					{/* Quick Action Buttons for Existing Review */}
					{userReview && !isLoading && (
						<View className="mt-4 pt-4 border-t border-gray-200">
							<Text className="text-sm text-muted-foreground mb-3 text-center">
								You reviewed this location on{" "}
								{new Date(userReview.created_at).toLocaleDateString()}
							</Text>
							<View className="flex-row space-x-2">
								<Button
									variant="outline"
									onPress={() => {
										// Quick update to current ratings (could trigger a quick form pre-fill)
									}}
									className="flex-1"
									disabled={isSubmitting}
								>
									Quick Update
								</Button>
								<Button
									variant="ghost"
									onPress={() => {
										// Could show delete confirmation
									}}
									className="flex-1"
									disabled={isSubmitting}
								>
									Remove Review
								</Button>
							</View>
						</View>
					)}
				</View>
			</BottomSheet>
		);
	},
);

UpsertReviewBottomSheet.displayName = "UpsertReviewBottomSheetEnhanced";

export default UpsertReviewBottomSheet;
