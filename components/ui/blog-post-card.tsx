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
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface BlogPostCardProps {
	item: BlogPost;
	onPress?: (item: BlogPost) => void;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({
	item,
	onPress,
}) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

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
					backgroundColor: isDark ? colors.dark.card : blogColors.background,
					borderColor: isDark ? colors.dark.border : blogColors.accent,
				},
			]}
			onPress={handlePress}
			activeOpacity={0.8}
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
					style={[
						styles.title,
						{ color: isDark ? colors.dark.foreground : blogColors.text },
					]}
					numberOfLines={3}
				>
					{item.title}
				</Text>
			</View>

			{/* Accent bar */}
			<View
				style={[
					styles.accentBar,
					{
						backgroundColor: isDark ? colors.dark.primary : blogColors.primary,
					},
				]}
			/>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		marginVertical: 8,
		marginHorizontal: 16,
		borderWidth: 1,
		overflow: "hidden",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
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
		marginBottom: 8,
	},
	date: {
		fontSize: 12,
		fontWeight: "400",
	},
	accentBar: {
		height: 4,
		width: "100%",
	},
});
