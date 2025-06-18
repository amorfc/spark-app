import React, {
	forwardRef,
	useRef,
	useImperativeHandle,
	useCallback,
	useState,
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
	snapPoints?: string[];
}

export const PostReviewBottomSheet = forwardRef<
	PostReviewBottomSheetRef,
	PostReviewBottomSheetProps
>(({ postId }, ref) => {
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const [existingReview, setExistingReview] =
		useState<PostReviewWithProfile | null>(null);

	const openForCreate = useCallback(() => {
		setExistingReview(null);
		bottomSheetRef.current?.snapToIndex(0);
	}, []);

	const openForEdit = useCallback(
		(review: PostReviewWithProfile) => {
			bottomSheetRef.current?.snapToIndex(0);
			setExistingReview(review);
		},
		[setExistingReview],
	);

	const handleClose = useCallback(() => {
		setExistingReview(null);
		bottomSheetRef.current?.close();
	}, [setExistingReview]);

	const handleFormSuccess = useCallback(() => {
		handleClose();
	}, [handleClose]);

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
			backdropPressBehavior="close"
		>
			<View className="py-6">
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
