import { useTimeAgo } from "@/hooks/useTimeAgo";
import { PostReviewWithProfile } from "@/types/posts";
import { Text, View } from "react-native";

export const PostReviewCard = ({ item }: { item: PostReviewWithProfile }) => {
	const createdAt = new Date(item.created_at);
	const timeAgo = useTimeAgo(createdAt);

	return (
		<View className="bg-card border border-border rounded-lg p-4 mb-3">
			{/* Review Header */}
			<View className="flex-row items-center mb-2">
				<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
					<Text className="text-white font-semibold text-sm">
						{item.reviewer_profile?.first_name?.charAt(0).toUpperCase() || "?"}
					</Text>
				</View>
				<View className="ml-3 flex-1">
					<Text className="font-medium text-foreground">
						{item.reviewer_profile?.first_name}{" "}
						{item.reviewer_profile?.last_name}
					</Text>
					<Text className="text-xs text-muted-foreground">{timeAgo}</Text>
				</View>
			</View>

			{/* Review Content */}
			<Text className="text-foreground leading-5">{item.text}</Text>
		</View>
	);
};
