import React, {
	forwardRef,
	useRef,
	useImperativeHandle,
	useCallback,
} from "react";
import { View } from "react-native";

import {
	BottomSheet,
	BottomSheetRef,
} from "@/components/bottom-sheet/bottom-sheet";
import { Text } from "@/components/ui/text";
import { PostReviewForm } from "@/components/post/post-review-form";
import { PostReviewWithProfile } from "@/types/posts";
import { useTranslation } from "@/lib/i18n/hooks";

export interface PostReviewBottomSheetRef extends BottomSheetRef {
	openForCreate: () => void;
	openForEdit: (review: PostReviewWithProfile) => void;
}

interface PostReviewBottomSheetProps {
	postId: string;
	existingReview?: PostReviewWithProfile | null;
	onSuccess?: () => void;
	snapPoints?: string[];
}

export const PostReviewBottomSheet = forwardRef<
	PostReviewBottomSheetRef,
	PostReviewBottomSheetProps
>(({ postId, existingReview, onSuccess }, ref) => {
	const { t } = useTranslation();
	const bottomSheetRef = useRef<BottomSheetRef>(null);

	const isUpdateMode = !!existingReview;

	const openForCreate = useCallback(() => {
		bottomSheetRef.current?.snapToIndex(0);
	}, []);

	const openForEdit = useCallback((review: PostReviewWithProfile) => {
		bottomSheetRef.current?.snapToIndex(0);
	}, []);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
	}, []);

	const handleFormSuccess = useCallback(() => {
		onSuccess?.();
		handleClose();
	}, [onSuccess, handleClose]);

	// Expose methods to parent via ref
	useImperativeHandle(
		ref,
		() => ({
			...bottomSheetRef.current!,
			openForCreate,
			openForEdit,
		}),
		[openForCreate, openForEdit],
	);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			enablePanDownToClose={true}
			enableDynamicSizing={true}
			scrollable={false}
		>
			<View className="py-6">
				{/* Header */}
				<View className="mb-6">
					<Text className="text-xl font-semibold text-foreground mb-2">
						{isUpdateMode
							? t("posts.reviews.edit_review")
							: t("posts.reviews.write_review")}
					</Text>
					<Text className="text-sm text-muted-foreground">
						{isUpdateMode
							? t("posts.reviews.update_your_review")
							: t("reviews.share_with_community")}
					</Text>
				</View>

				{/* Use existing PostReviewForm component */}
				<PostReviewForm
					postId={postId}
					existingReview={existingReview}
					onSuccess={handleFormSuccess}
					onCancel={handleClose}
				/>
			</View>
		</BottomSheet>
	);
});

PostReviewBottomSheet.displayName = "PostReviewBottomSheet";
