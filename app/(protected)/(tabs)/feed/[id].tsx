import React, { useRef } from "react";
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
	ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { usePost } from "@/hooks/usePosts";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { PostCard } from "@/components/ui/card/post-card";
import {
	PostReviewBottomSheet,
	PostReviewBottomSheetRef,
} from "@/components/bottom-sheet/post-review-bottom-sheet";

export default function PostDetailScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const postReviewBottomSheetRef = useRef<PostReviewBottomSheetRef>(null);
	const {
		data: post,
		isLoading: postLoading,
		isRefetching: postRefetching,
		refetch: refetchPost,
	} = usePost(id);

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

	const handleMakeReview = () => {
		postReviewBottomSheetRef.current?.openForCreate();
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
				<Text className="text-xl font-semibold">{t("posts.post_details")}</Text>
				<View className="flex-row items-center gap-2">
					<Button variant="default" size="sm" onPress={handleMakeReview}>
						<Text className="text-white">{t("posts.make_review")}</Text>
					</Button>
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
			</View>

			{/* Post Details and Review Form */}
			<ScrollView
				className="flex-1 pt-6"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={postRefetching}
						onRefresh={refetchPost}
						tintColor={isDark ? colors.dark.primary : colors.light.primary}
					/>
				}
			>
				<PostCard item={post} clickable={false} canDelete={true} />
			</ScrollView>
			<PostReviewBottomSheet
				ref={postReviewBottomSheetRef}
				postId={id}
				existingReview={null}
				onSuccess={() => {}}
			/>
		</SafeAreaView>
	);
}
