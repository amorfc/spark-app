import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostForm } from "@/components/post/post-form";
import { colors } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/hooks";

export default function CreatePostScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	const handleClose = () => {
		router.back();
	};

	const handleFormSuccess = () => {
		Alert.alert(t("common.success"), t("posts.post_created"), [
			{
				text: t("common.ok"),
				onPress: () => router.back(),
			},
		]);
	};

	const handleFormCancel = () => {
		handleClose();
	};

	const iconColor = colors.light.mutedForeground;

	return (
		<SafeAreaView className="flex-1 bg-background px-4">
			{/* Header */}
			<View className="flex-row justify-between items-center py-3 border-b border-border">
				<Text className="text-xl font-semibold">{t("posts.create_post")}</Text>
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
					onSuccess={handleFormSuccess}
					onCancel={handleFormCancel}
					className="flex-1"
				/>
			</View>
		</SafeAreaView>
	);
}
