import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { BlogPost, BlogCategory } from "@/types/blog";
import { SafeAreaView } from "@/components/safe-area-view";
import { colors } from "@/constants/colors";
import { blogColors } from "@/utils/blog";
import { useTranslation } from "@/lib/i18n/hooks";
import { Button } from "@/components/ui/button";
import { H1, H2, P } from "@/components/ui/typography";

// Import blog data to find the specific post
import blogData from "@/assets/data/blog_posts.json";

export default function BlogPreviewScreen() {
	const { t } = useTranslation();
	const { id } = useLocalSearchParams<{ id: string }>();

	// Find the blog post by ID
	const blogPost = useMemo(() => {
		const allBlogPosts: BlogPost[] = blogData.data.map((post) => ({
			...post,
			category: post.category as BlogCategory,
		}));
		return allBlogPosts.find((post) => post.id === id);
	}, [id]);

	if (!blogPost) {
		return (
			<SafeAreaView style={styles.container}>
				<Stack.Screen options={{ title: t("blog.preview.not_found_title") }} />
				<View style={styles.errorContainer}>
					<H2>{t("blog.preview.not_found_heading")}</H2>
					<P>{t("blog.preview.not_found_message")}</P>
				</View>
			</SafeAreaView>
		);
	}

	// Determine button text based on category
	const getActionButtonText = (category: BlogCategory) => {
		const videoCategories = [
			BlogCategory.TedTalks,
			BlogCategory.SelfDefense,
			BlogCategory.VideoEssays,
			BlogCategory.Podcasts,
		];
		return videoCategories.includes(category)
			? t("blog.preview.watch_more")
			: t("blog.preview.read_more");
	};

	// Handle opening the link
	const handleActionPress = () => {
		if (blogPost.link) {
			Linking.openURL(blogPost.link);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					title: t("blog.preview.title"),
					presentation: "modal",
					headerShown: true,
				}}
			/>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Image */}
				<View style={styles.imageContainer}>
					<Image
						source={{ uri: blogPost.image }}
						style={styles.image}
						contentFit="cover"
					/>
				</View>

				{/* Content */}
				<View style={styles.content}>
					{/* Title */}
					<H1 style={[styles.title, { color: blogColors.text }]}>
						{blogPost.title}
					</H1>

					{/* Category Badge */}
					<View style={styles.categoryBadge}>
						<P style={styles.categoryText}>{blogPost.category.toUpperCase()}</P>
					</View>

					{/* Action Button */}
					<View style={styles.buttonContainer}>
						<Button
							onPress={handleActionPress}
							style={[
								styles.actionButton,
								{ backgroundColor: blogColors.primary },
							]}
						>
							<P style={styles.buttonText}>
								{getActionButtonText(blogPost.category)}
							</P>
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.light.background,
	},
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		paddingBottom: 40,
	},
	imageContainer: {
		height: 250,
		width: "100%",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	content: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		lineHeight: 30,
		marginBottom: 16,
	},
	categoryBadge: {
		alignSelf: "flex-start",
		backgroundColor: blogColors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		marginBottom: 24,
	},
	categoryText: {
		color: colors.light.background,
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
	buttonContainer: {
		marginTop: 20,
	},
	actionButton: {
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: colors.light.background,
		fontSize: 16,
		fontWeight: "600",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
});
