import React, { useState, useMemo } from "react";
import { View, StyleSheet, ListRenderItem } from "react-native";
import { useRouter } from "expo-router";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogPostCard } from "@/components/ui/card/blog-post-card";
import { GenericFlatList } from "@/components/ui/list/generic-flatlist";
import { CategorySelect } from "@/components/select/category-select";
import { getBlogPostsByCategory } from "@/utils/blog";
import { routes } from "@/lib/routes";

import { colors } from "@/constants/colors";
import { SafeAreaView } from "@/components/safe-area-view";
import { useTranslation } from "@/lib/i18n/hooks";

import { useBlogPosts } from "@/hooks/useBlogPosts";

export default function BlogScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	// State for selected category - default to SelfDefense as requested
	const [selectedCategory, setSelectedCategory] = useState<BlogCategory>(
		BlogCategory.MovieRecommendations,
	);
	const [refreshing, setRefreshing] = useState(false);
	const { data: blogPosts } = useBlogPosts();

	// Filter posts by selected category
	const filteredPosts = useMemo(() => {
		return getBlogPostsByCategory(blogPosts?.data || [], selectedCategory);
	}, [blogPosts, selectedCategory]);

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

	// Handle blog post press
	const handleBlogPostPress = (item: BlogPost) => {
		router.push(routes.blogPreview(item.id));
	};

	// Render item for FlatList
	const renderBlogPost: ListRenderItem<BlogPost> = ({ item }) => (
		<BlogPostCard item={item} onPress={handleBlogPostPress} />
	);

	return (
		<SafeAreaView
			edges={["top"]}
			style={[
				styles.container,
				{
					backgroundColor: colors.light.background,
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
