import React, { useState, useMemo } from "react";
import { View, StyleSheet, ListRenderItem } from "react-native";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogPostCard } from "@/components/ui/card/blog-post-card";
import { GenericFlatList } from "@/components/ui/list/generic-flatlist";
import { CategorySelect } from "@/components/select/category-select";
import { getBlogPostsByCategory } from "@/utils/blog";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "@/components/safe-area-view";
import { useTranslation } from "@/lib/i18n/hooks";

// Import blog data
import blogData from "@/assets/data/blog-posts.json";

export default function BlogScreen() {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const isDark = colorScheme === "dark";

	// State for selected category - default to SelfDefense as requested
	const [selectedCategory, setSelectedCategory] = useState<BlogCategory>(
		BlogCategory.MovieRecommendations,
	);
	const [refreshing, setRefreshing] = useState(false);

	// Convert JSON data to BlogPost objects
	const allBlogPosts: BlogPost[] = useMemo(() => {
		return blogData.data.map((post) => ({
			...post,
			category: post.category as BlogCategory,
		}));
	}, []);

	// Filter posts by selected category
	const filteredPosts = useMemo(() => {
		return getBlogPostsByCategory(allBlogPosts, selectedCategory);
	}, [allBlogPosts, selectedCategory]);

	// Handle category change
	const handleCategoryChange = (category: BlogCategory) => {
		setSelectedCategory(category);
	};

	// Handle refresh
	const handleRefresh = () => {
		setRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	};

	// Render item for FlatList
	const renderBlogPost: ListRenderItem<BlogPost> = ({ item }) => (
		<BlogPostCard item={item} />
	);

	return (
		<SafeAreaView
			edges={["top"]}
			style={[
				styles.container,
				{
					backgroundColor: isDark
						? colors.dark.background
						: colors.light.background,
				},
			]}
		>
			{/* Category Filter */}
			<View style={styles.filterContainer}>
				<CategorySelect
					value={selectedCategory}
					onValueChange={handleCategoryChange}
					placeholder={t("select.placeholder")}
				/>
			</View>

			{/* Blog Posts List */}
			<GenericFlatList
				data={filteredPosts}
				renderItem={renderBlogPost}
				onRefresh={handleRefresh}
				refreshing={refreshing}
				emptyStateMessage={t("empty_states.no_data")}
				emptyStateSubtitle="Try selecting a different category"
				contentContainerStyle={styles.listContainer}
				enableLayoutAnimation={true}
				enableFadeAnimation={true}
				animationDuration={300}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	filterContainer: {
		paddingHorizontal: 16,
		paddingTop: 16,
		zIndex: 1000,
		elevation: 1000,
	},
	listContainer: {
		paddingBottom: 20,
		paddingTop: 8,
	},
});
