import React, {
	forwardRef,
	useRef,
	useImperativeHandle,
	useCallback,
	useState,
	useEffect,
} from "react";
import { View, Keyboard } from "react-native";

import {
	BottomSheet,
	BottomSheetRef,
} from "@/components/bottom-sheet/bottom-sheet";
import { PostReviewForm } from "@/components/post/post-review-form";
import { PostReviewWithProfile } from "@/types/posts";

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
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

	// Keyboard listeners
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => setIsKeyboardOpen(true),
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => setIsKeyboardOpen(false),
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

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
			keyboardBehavior="interactive"
		>
			<View className={`py-6 ${isKeyboardOpen ? "pb-20" : "pb-6"}`}>
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
