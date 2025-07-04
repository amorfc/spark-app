import { BlogPost, BlogCategory, CreateBlogPostInput } from "@/types/blog";

/**
 * Get YouTube video thumbnail URL from YouTube video URL
 * @param url - YouTube video URL
 * @returns YouTube thumbnail URL
 */
export const getYoutubeThumbnail = (url: string): string => {
	const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
	return `https://img.youtube.com/vi/${videoId}/0.jpg`;
};

/**
 * Create a new blog post with auto-generated ID and timestamps
 * @param input - Blog post creation input
 * @returns Complete blog post object
 */
export const createBlog = (input: CreateBlogPostInput): BlogPost => {
	// Auto-generate image if it's a YouTube link
	let image = input.image;
	if (!image && input.link.includes("youtube.com")) {
		image = getYoutubeThumbnail(input.link);
	}

	return {
		id: crypto.randomUUID(),
		category: input.category,
		title: input.title,
		link: input.link,
		image: image || "", // Default empty string if no image
	};
};

/**
 * Get blog posts filtered by category
 * @param posts - Array of blog posts
 * @param category - Category to filter by
 * @returns Filtered blog posts
 */
export const getBlogPostsByCategory = (
	posts: BlogPost[],
	category: BlogCategory,
): BlogPost[] => {
	return posts?.filter((post) => post.category === category) || [];
};

/**
 * Get category translation key mapping
 * @param category - Blog category enum
 * @returns Translation key for the category
 */
export const getCategoryTranslationKey = (category: BlogCategory): string => {
	const categoryKeyMap: Record<BlogCategory, string> = {
		[BlogCategory.SelfDefense]: "blog.categories.self_defense",
		[BlogCategory.TedTalks]: "blog.categories.ted_talks",
		[BlogCategory.MovieRecommendations]:
			"blog.categories.movie_recommendations",
		[BlogCategory.BookRecommendations]: "blog.categories.book_recommendations",
		[BlogCategory.InspiringWoman]: "blog.categories.inspiring_women",
		[BlogCategory.WomanMurders]: "blog.categories.woman_murders",
		[BlogCategory.ToxicRelationships]: "blog.categories.toxic_relationships",
		[BlogCategory.VideoEssays]: "blog.categories.video_essays",
		[BlogCategory.WomanAnatomyAndPeriod]:
			"blog.categories.woman_anatomy_period",
		[BlogCategory.Podcasts]: "blog.categories.podcasts",
		[BlogCategory.SelfLove]: "blog.categories.self_love",
		[BlogCategory.FeminismBasics]: "blog.categories.feminism_basics",
	};

	return categoryKeyMap[category] || category;
};

/**
 * Woman-friendly color palette
 */
export const blogColors = {
	primary: "#FF7B9C", // Soft pink
	secondary: "#FFB3C6", // Lighter pink
	background: "#FFF0F3", // Very light pink
	text: "#5A2A27", // Warm dark brown
	accent: "#C78283", // Dusty rose
};
