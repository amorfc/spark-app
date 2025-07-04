import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { BlogPost } from "@/types/blog";

interface BlogPostsResponse {
	data: BlogPost[];
}

const fetchBlogPosts = async (): Promise<BlogPostsResponse> => {
	const url = "https://amorfc.github.io/spark-app/blog_posts.json";
	const response = await fetch(url);
	const data = await response.json();

	return { data: data?.data || [] };
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
