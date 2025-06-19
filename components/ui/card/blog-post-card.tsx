import React from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Linking,
	StyleSheet,
} from "react-native";
import { BlogPost } from "@/types/blog";
import { blogColors } from "@/utils/blog";

interface BlogPostCardProps {
	item: BlogPost;
	onPress?: (item: BlogPost) => void;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({
	item,
	onPress,
}) => {
	const handlePress = () => {
		if (onPress) {
			onPress(item);
		} else {
			// Default behavior: open link
			Linking.openURL(item.link);
		}
	};

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					backgroundColor: blogColors.background,
				},
			]}
			onPress={handlePress}
			activeOpacity={0.9}
		>
			{/* Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: item.image }}
					style={styles.image}
					resizeMode="cover"
				/>
			</View>

			{/* Content */}
			<View style={styles.content}>
				<Text
					style={[styles.title, { color: blogColors.text }]}
					numberOfLines={3}
				>
					{item.title}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		marginVertical: 8,
		marginHorizontal: 16,
		overflow: "hidden",
	},
	imageContainer: {
		height: 180,
		width: "100%",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	content: {
		padding: 16,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		lineHeight: 22,
	},
	date: {
		fontSize: 12,
		fontWeight: "400",
	},
});
