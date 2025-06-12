import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { StarRating } from "@/components/reviews/star-rating";
import { cn } from "@/lib/utils";
import { Review } from "@/types/reviews";

interface ReviewItemProps {
	review: Review;
	className?: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, className }) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const averageRating = (review.safety_rating + review.quality_rating) / 2;

	return (
		<View
			className={cn("bg-card rounded-lg p-4 border border-border", className)}
		>
			{/* Header with average rating and date */}
			<View className="flex-row justify-between items-center mb-3">
				<View className="flex-row items-center space-x-2">
					<StarRating rating={averageRating} readonly size="sm" />
					<Text className="text-sm text-muted-foreground">
						{averageRating.toFixed(1)}
					</Text>
				</View>
				<Text className="text-xs text-muted-foreground">
					{formatDate(review.created_at)}
				</Text>
			</View>

			{/* Individual ratings */}
			<View className="space-y-2 mb-3">
				<View className="flex-row justify-between items-center">
					<Text className="text-sm font-medium">Safety</Text>
					<View className="flex-row items-center space-x-1">
						<StarRating rating={review.safety_rating} readonly size="sm" />
						<Text className="text-xs text-muted-foreground">
							{review.safety_rating}/5
						</Text>
					</View>
				</View>

				<View className="flex-row justify-between items-center">
					<Text className="text-sm font-medium">Quality</Text>
					<View className="flex-row items-center space-x-1">
						<StarRating rating={review.quality_rating} readonly size="sm" />
						<Text className="text-xs text-muted-foreground">
							{review.quality_rating}/5
						</Text>
					</View>
				</View>
			</View>

			{/* Comment */}
			{review.comment && (
				<View className="pt-2 border-t border-border">
					<Text className="text-sm text-foreground leading-relaxed">
						{review.comment}
					</Text>
				</View>
			)}

			{/* Updated indicator */}
			{review.updated_at !== review.created_at && (
				<Text className="text-xs text-muted-foreground mt-2 italic">
					Updated {formatDate(review.updated_at)}
				</Text>
			)}
		</View>
	);
};

export { ReviewItem };
