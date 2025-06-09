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
	return posts.filter((post) => post.category === category);
};

/**
 * Get category display name with translation
 * @param category - Blog category enum
 * @returns Localized display name
 */
export const getCategoryDisplayName = (category: BlogCategory): string => {
	const categoryMap: Record<BlogCategory, string> = {
		[BlogCategory.SelfDefense]: "Self Defense / Kendini Savunma",
		[BlogCategory.TedTalks]: "TED Talks / TED Konuşmaları",
		[BlogCategory.MovieRecommendations]:
			"Movie Recommendations / Film Önerileri",
		[BlogCategory.BookRecommendations]:
			"Book Recommendations / Kitap Önerileri",
		[BlogCategory.InspiringWoman]: "Inspiring Women / İlham Verici Kadınlar",
		[BlogCategory.WomanMurders]: "Woman Murders / Kadın Cinayetleri",
		[BlogCategory.ToxicRelationships]: "Toxic Relationships / Toksik İlişkiler",
		[BlogCategory.VideoEssays]: "Video Essays",
		[BlogCategory.WomanAnatomyAndPeriod]:
			"Woman Anatomy & Period / Kadın Anatomisi ve Periyot",
		[BlogCategory.Podcasts]: "Podcasts / Podkastlar",
		[BlogCategory.SelfLove]: "Self Love / Kendini Sevmek",
		[BlogCategory.FeminismBasics]: "Feminism 101 / Feminizm 101",
	};

	return categoryMap[category] || category;
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
