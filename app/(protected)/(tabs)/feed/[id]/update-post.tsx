import React from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/components/post/post-form";
import { usePost } from "@/hooks/usePosts";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/hooks";

export default function UpdatePostScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const { data: post, isLoading: postLoading, error: postError } = usePost(id!);

	const handleClose = () => {
		router.back();
	};

	const handleFormSuccess = () => {
		Alert.alert(t("common.success"), t("posts.post_updated"), [
			{
				text: t("common.ok"),
				onPress: () => router.back(),
			},
		]);
	};

	const handleFormCancel = () => {
		handleClose();
	};

	const iconColor = isDark
		? colors.dark.mutedForeground
		: colors.light.mutedForeground;

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

	if (postError || !post) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background">
				<Text className="text-xl font-semibold mb-2">
					{t("posts.post_not_found")}
				</Text>
				<Button onPress={handleClose}>{t("posts.go_back")}</Button>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
				<Text className="text-xl font-semibold">{t("posts.edit_post")}</Text>
				<TouchableOpacity
					className="px-2 py-2"
					onPress={handleClose}
					accessibilityLabel={t("common.close")}
					accessibilityRole="button"
				>
					<MaterialIcons name="close" size={24} color={iconColor} />
				</TouchableOpacity>
			</View>

			{/* Form */}
			<View className="flex-1">
				<PostForm
					postId={id}
					existingPost={post}
					onSuccess={handleFormSuccess}
					onCancel={handleFormCancel}
					className="flex-1"
				/>
			</View>
		</SafeAreaView>
	);
}
