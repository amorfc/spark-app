import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { BlogPost, BlogCategory } from "@/types/blog";
import blogData from "@/assets/data/blog_posts.json";

interface BlogPostsResponse {
	data: BlogPost[];
}

const fetchBlogPosts = async (): Promise<BlogPostsResponse> => {
	const allBlogPosts: BlogPost[] = blogData.data.map((post) => ({
		...post,
		category: post.category as BlogCategory,
	}));

	return new Promise<BlogPostsResponse>((resolve) => {
		setTimeout(() => {
			resolve({
				data: allBlogPosts,
			});
		}, 1000);
	});
};

export const useBlogPosts = () => {
	return useQuery({
		queryKey: queryKeys.blogPosts(),
		queryFn: fetchBlogPosts,
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 2, // 2 hours
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};
