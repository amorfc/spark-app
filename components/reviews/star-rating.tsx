import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface StarRatingProps {
	rating: number;
	onRatingChange?: (rating: number) => void;
	readonly?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
	rating,
	onRatingChange,
	readonly = false,
	size = "md",
	className,
}) => {
	const stars = [1, 2, 3, 4, 5];

	const sizeClasses = {
		sm: "text-sm",
		md: "text-xl",
		lg: "text-2xl",
	};

	const renderStar = (starNumber: number) => {
		const isFilled = starNumber <= rating;
		const isHalfFilled = starNumber - 0.5 === rating;

		return (
			<Pressable
				key={starNumber}
				onPress={() => !readonly && onRatingChange?.(starNumber)}
				disabled={readonly}
				className={cn("px-0.5", !readonly && "active:opacity-70")}
			>
				<Text
					className={cn(
						sizeClasses[size],
						isFilled || isHalfFilled ? "text-yellow-400" : "text-gray-300",
					)}
				>
					{isFilled ? "★" : isHalfFilled ? "☆" : "☆"}
				</Text>
			</Pressable>
		);
	};

	return (
		<View className={cn("flex-row items-center", className)}>
			{stars.map(renderStar)}
		</View>
	);
};

export { StarRating };
