import { PostWithProfile } from "@/types/posts";

import { Text, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { routes } from "@/lib/routes";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useTranslation } from "@/lib/i18n/hooks";
import { useAuth } from "@/context/supabase-provider";
import { useDeletePost } from "@/hooks/usePosts";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { ModerationMenu } from "@/components/moderation";
import { FilteredText } from "@/components/moderation/filtered-content";
import { useProfile } from "@/hooks/useProfile";

interface PostCardProps {
	item: PostWithProfile;
	canDelete?: boolean;
	clickable?: boolean;
	onSuccessDelete?: () => void;
}

export const PostCard = ({
	item,
	clickable = true,
	canDelete = false,
	onSuccessDelete,
}: PostCardProps) => {
	const { t } = useTranslation();
	const { session } = useAuth();
	const createdAt = new Date(item.created_at);
	const timeAgo = useTimeAgo(createdAt);
	const deletePostMutation = useDeletePost();
	const { canCRUD } = useProfile();

	// Check if current user is the post author
	const isOwnPost = session?.user?.id === item.user_id;

	const handleDeletePress = () => {
		Alert.alert(t("posts.delete_post"), t("posts.delete_confirmation"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.delete"),
				style: "destructive",
				onPress: async () => {
					try {
						await deletePostMutation.mutateAsync(item.id);
						Alert.alert(t("common.success"), t("posts.post_deleted"));
						onSuccessDelete?.();
					} catch (error) {
						Alert.alert(
							t("common.error"),
							error instanceof Error
								? error.message
								: t("errors.delete_failed"),
						);
					}
				},
			},
		]);
	};

	return (
		<TouchableOpacity
			disabled={!clickable}
			className="bg-card border border-border rounded-lg p-4 mb-3 mx-4"
			onPress={() => clickable && router.push(routes.postDetail(item.id))}
		>
			{/* Post Header */}
			<View className="flex-row items-center mb-3">
				<View className="w-10 h-10 bg-muted rounded-full items-center justify-center">
					<Text className="font-semibold text-lg">
						{item.author_profile?.first_name?.charAt(0).toUpperCase() || "?"}
						{item.author_profile?.last_name?.charAt(0).toUpperCase() || "?"}
					</Text>
				</View>
				<View className="ml-3 flex-1">
					<Text className="font-semibold text-foreground">
						{item.author_profile?.first_name} {item.author_profile?.last_name}
					</Text>
					<View className="flex-row items-center">
						<Text className="text-sm text-muted-foreground">{timeAgo}</Text>
						{isOwnPost && (
							<>
								<Text className="text-sm text-muted-foreground"> • </Text>
								<Text className="text-sm text-muted-foreground">
									{t("posts.your_post")}
								</Text>
							</>
						)}
					</View>
				</View>

				{/* Action Buttons */}
				<View className="flex-row items-center">
					{/* Delete Button for Own Posts */}
					{isOwnPost && canDelete && canCRUD && (
						<DeleteIconButton onPress={handleDeletePress} />
					)}

					{/* Moderation Menu for Others' Posts */}
					{!isOwnPost && canCRUD && (
						<ModerationMenu
							contentType="post"
							contentId={item.id}
							authorId={item.user_id}
							authorName={`${item.author_profile?.first_name || ""} ${item.author_profile?.last_name || ""}`.trim()}
						/>
					)}
				</View>
			</View>

			{/* Post Content */}
			<FilteredText
				text={item.content}
				className="text-foreground leading-5 mb-3"
				numberOfLines={4}
			/>

			{/* Post Stats */}
			<View className="flex-row items-center justify-between pt-2 border-t border-border">
				<View className="flex-row items-center">
					<MaterialIcons
						name="chat-bubble-outline"
						size={16}
						color={colors.light.mutedForeground}
					/>
					<Text className="text-sm text-muted-foreground ml-1">
						{item.total_reviews_count || 0}{" "}
						{item.total_reviews_count === 1
							? t("posts.reviews.count_singular")
							: t("posts.reviews.count_plural")}
					</Text>
				</View>
				{clickable && (
					<MaterialIcons
						name="chevron-right"
						size={20}
						color={colors.light.mutedForeground}
					/>
				)}
			</View>
		</TouchableOpacity>
	);
};
