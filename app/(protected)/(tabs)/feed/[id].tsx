import React, { useRef } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { usePost } from "@/hooks/usePosts";

import { colors } from "@/constants/colors";
import { PostCard } from "@/components/ui/card/post-card";
import {
	PostReviewBottomSheet,
	PostReviewBottomSheetRef,
} from "@/components/bottom-sheet/post-review-bottom-sheet";
import { PostReviewList } from "@/components/post/post-review-list";
import { PostReviewWithProfile } from "@/types/posts";
import { useProfile } from "@/hooks/useProfile";

export default function PostDetailScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { canCRUD } = useProfile();

	// Decode the URL-encoded ID
	const postId = id ? decodeURIComponent(id) : id;

	const postReviewBottomSheetRef = useRef<PostReviewBottomSheetRef>(null);
	const { data: post, isLoading: postLoading } = usePost(postId);

	const handleClose = () => {
		router.back();
	};

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

	const openReviewCreateSheet = () => {
		postReviewBottomSheetRef.current?.openForCreate();
	};

	const openReviewUpdateSheet = (review: PostReviewWithProfile) => {
		postReviewBottomSheetRef.current?.openForEdit(review);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-2 border-b border-border">
				<Text className="text-xl font-semibold">{t("posts.post_details")}</Text>
				<View className="flex-row items-center gap-2">
					{canCRUD && (
						<Button variant="default" size="sm" onPress={openReviewCreateSheet}>
							<Text>{t("posts.make_review")}</Text>
						</Button>
					)}
					<TouchableOpacity onPress={handleClose}>
						<MaterialIcons
							name="close"
							size={24}
							color={colors.light.mutedForeground}
						/>
					</TouchableOpacity>
				</View>
			</View>

			<View className="pt-4">
				<PostCard
					item={post}
					clickable={false}
					canDelete={true}
					onSuccessDelete={handleClose}
				/>
			</View>

			<View className="flex-1 gap-y-2 px-4">
				<Text className="self-center text-lg font-semibold">
					{t("posts.reviews.all_reviews")}
				</Text>
				<PostReviewList postId={postId} onReviewPress={openReviewUpdateSheet} />
			</View>
			<PostReviewBottomSheet ref={postReviewBottomSheetRef} postId={postId} />
		</SafeAreaView>
	);
}
