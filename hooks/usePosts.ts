import {
	useMutation,
	useQuery,
	useQueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { PostsService } from "@/services/posts-service";
import type {
	Post,
	PostReviewWithProfile,
	PostDetailsResponse,
	CreatePostRequest,
	UpdatePostRequest,
	CreatePostReviewRequest,
	PostFeedParams,
	PostReviewsParams,
	PostSearchParams,
	PostReviewsResponse,
	PostFeedResponse,
	CursorPaginationParams,
} from "@/types/posts";

// Query keys
export const postsKeys = {
	all: ["posts"] as const,
	feeds: () => [...postsKeys.all, "feeds"] as const,
	feed: (params: PostFeedParams) => [...postsKeys.feeds(), params] as const,
	popular: (params: PostFeedParams) =>
		[...postsKeys.feeds(), "popular", params] as const,
	trending: (params: PostFeedParams) =>
		[...postsKeys.feeds(), "trending", params] as const,
	details: () => [...postsKeys.all, "details"] as const,
	detail: (id: string) => [...postsKeys.details(), id] as const,
	reviews: () => [...postsKeys.all, "reviews"] as const,
	postReviews: (postId: string, params?: PostReviewsParams) =>
		[...postsKeys.reviews(), postId, params] as const,
	userReview: (postId: string) =>
		[...postsKeys.reviews(), "user", postId] as const,
	userPosts: (userId: string, params?: PostFeedParams) =>
		[...postsKeys.all, "user", userId, params] as const,
	search: (params: PostSearchParams) =>
		[...postsKeys.all, "search", params] as const,
};

// Posts hooks
export function usePostsFeed(params: PostFeedParams = {}) {
	return useQuery({
		queryKey: postsKeys.feed(params),
		queryFn: () => PostsService.getPostsFeed(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function usePopularPosts(params: PostFeedParams = {}) {
	return useQuery({
		queryKey: postsKeys.popular(params),
		queryFn: () => PostsService.getPopularPosts(params),
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function usePostDetails(
	postId: string,
	reviewsParams?: { limit?: number; offset?: number },
) {
	return useQuery({
		queryKey: postsKeys.detail(postId),
		queryFn: () => PostsService.getPostDetails(postId, reviewsParams),
		enabled: !!postId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function usePost(postId: string) {
	return useQuery({
		queryKey: postsKeys.detail(postId),
		queryFn: () => PostsService.getPost(postId),
		enabled: !!postId,
	});
}

export function useUserPosts(userId: string, params: PostFeedParams = {}) {
	return useQuery({
		queryKey: postsKeys.userPosts(userId, params),
		queryFn: () => PostsService.getUserPosts(userId, params),
		enabled: !!userId,
	});
}

// Post mutations
export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePostRequest) => PostsService.createPost(data),
		onSuccess: () => {
			// Invalidate and refetch posts feeds
			queryClient.invalidateQueries({ queryKey: postsKeys.feeds() });
		},
	});
}

export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: UpdatePostRequest;
		}) => PostsService.updatePost(postId, data),
		onSuccess: (updatedPost) => {
			// Update the specific post in the cache
			queryClient.setQueryData(postsKeys.detail(updatedPost.id), updatedPost);
			// Invalidate feeds to show updated content
			queryClient.invalidateQueries({ queryKey: postsKeys.feeds() });
		},
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postId: string) => PostsService.deletePost(postId),
		onSuccess: (_, postId) => {
			// Remove the post from cache
			queryClient.removeQueries({ queryKey: postsKeys.detail(postId) });
			// Invalidate feeds
			queryClient.invalidateQueries({ queryKey: postsKeys.feeds() });
		},
	});
}

// Post reviews hooks
export function usePostReviews(params: PostReviewsParams) {
	return useQuery({
		queryKey: postsKeys.postReviews(params.post_id, params),
		queryFn: () => PostsService.getPostReviews(params),
		enabled: !!params.post_id,
	});
}

export function useUserPostReview(postId: string) {
	return useQuery({
		queryKey: postsKeys.userReview(postId),
		queryFn: () => PostsService.getUserPostReview(postId),
		enabled: !!postId,
	});
}

// Post review mutations
export function useCreateOrUpdatePostReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: Omit<CreatePostReviewRequest, "post_id">;
		}) => PostsService.createOrUpdatePostReview(postId, data),
		onSuccess: (_, { postId }) => {
			// Invalidate user's review for this post
			queryClient.invalidateQueries({ queryKey: postsKeys.userReview(postId) });
			// Invalidate post reviews with predicate to match all variations
			queryClient.invalidateQueries({
				queryKey: postsKeys.reviews(),
				predicate: (query) => {
					const key = query.queryKey;
					return key.includes(postId) && key.includes("reviews");
				},
			});
			// Invalidate post details to update review counts and averages
			queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
			// Invalidate feeds to show updated review counts
			queryClient.invalidateQueries({ queryKey: postsKeys.feeds() });
		},
	});
}

export function useDeletePostReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ reviewId, postId }: { reviewId: string; postId: string }) =>
			PostsService.deletePostReview(reviewId),
		onSuccess: (_, { postId }) => {
			// Invalidate user's review for this post
			queryClient.invalidateQueries({ queryKey: postsKeys.userReview(postId) });
			// Invalidate post reviews with predicate
			queryClient.invalidateQueries({
				queryKey: postsKeys.reviews(),
				predicate: (query) => {
					const key = query.queryKey;
					return key.includes(postId) && key.includes("reviews");
				},
			});
			// Invalidate post details
			queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
			// Invalidate feeds
			queryClient.invalidateQueries({ queryKey: postsKeys.feeds() });
		},
	});
}

// Utility hooks
export function usePostReviewsCount(postId: string) {
	return useQuery({
		queryKey: [...postsKeys.reviews(), "count", postId],
		queryFn: () => PostsService.getPostReviewsCount(postId),
		enabled: !!postId,
	});
}

// Infinite query hooks for cursor-based pagination
export function useInfinitePostsFeed(
	initialParams: CursorPaginationParams = {},
) {
	const limit = initialParams.limit || 10;

	return useInfiniteQuery({
		queryKey: [...postsKeys.feeds(), "infinite", { limit }],
		queryFn: async ({ pageParam }) => {
			return PostsService.getPostsFeedCursor({
				limit,
				cursor: pageParam,
			});
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage: PostFeedResponse) => {
			return lastPage.has_more ? lastPage.next_cursor : undefined;
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useInfinitePostReviews(
	postId: string,
	initialParams: CursorPaginationParams = {},
) {
	const limit = initialParams.limit || 10;

	return useInfiniteQuery({
		queryKey: [...postsKeys.reviews(), "infinite", postId, { limit }],
		queryFn: async ({ pageParam }) => {
			return PostsService.getPostReviewsCursor(postId, {
				limit,
				cursor: pageParam,
			});
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage: PostReviewsResponse) => {
			return lastPage.has_more ? lastPage.next_cursor : undefined;
		},
		enabled: !!postId,
		staleTime: 2 * 60 * 1000,
	});
}

// Legacy: Custom hook for offset-based infinite scroll feed (for backward compatibility)
export function useInfinitePostsFeedOffset(initialParams: PostFeedParams = {}) {
	const limit = initialParams.limit || 10;

	return useQuery({
		queryKey: postsKeys.feed({ ...initialParams, limit }),
		queryFn: async ({ queryKey }) => {
			const [, , params] = queryKey as [string, string, PostFeedParams];
			return PostsService.getPostsFeed(params);
		},
		staleTime: 5 * 60 * 1000,
	});
}

// Helper functions for infinite queries
export function usePrefetchNextPostsPage() {
	const queryClient = useQueryClient();

	return (currentParams: PostFeedParams) => {
		const limit = currentParams.limit || 10;
		const offset = (currentParams.offset || 0) + limit;

		queryClient.prefetchQuery({
			queryKey: postsKeys.feed({ ...currentParams, offset }),
			queryFn: () => PostsService.getPostsFeed({ ...currentParams, offset }),
			staleTime: 5 * 60 * 1000,
		});
	};
}

// Helper hook to get flattened posts from infinite query
export function useInfinitePostsData(infiniteQueryResult: any) {
	return {
		posts:
			infiniteQueryResult.data?.pages?.flatMap(
				(page: PostFeedResponse) => page.posts,
			) || [],
		hasNextPage: infiniteQueryResult.hasNextPage,
		fetchNextPage: infiniteQueryResult.fetchNextPage,
		isFetchingNextPage: infiniteQueryResult.isFetchingNextPage,
		isLoading: infiniteQueryResult.isLoading,
		error: infiniteQueryResult.error,
	};
}

// Helper hook to get flattened reviews from infinite query
export function useInfiniteReviewsData(infiniteQueryResult: any) {
	return {
		reviews:
			infiniteQueryResult.data?.pages?.flatMap(
				(page: PostReviewsResponse) => page.reviews,
			) || [],
		totalCount: infiniteQueryResult.data?.pages?.[0]?.total_count || 0,
		hasNextPage: infiniteQueryResult.hasNextPage,
		fetchNextPage: infiniteQueryResult.fetchNextPage,
		isFetchingNextPage: infiniteQueryResult.isFetchingNextPage,
		isLoading: infiniteQueryResult.isLoading,
		error: infiniteQueryResult.error,
	};
}

// Convenience hooks that combine infinite query with data flattening
export function usePostsFeedInfinite(params: CursorPaginationParams = {}) {
	const infiniteQuery = useInfinitePostsFeed(params);
	return useInfinitePostsData(infiniteQuery);
}

export function usePostReviewsInfinite(
	postId: string,
	params: CursorPaginationParams = {},
) {
	const infiniteQuery = useInfinitePostReviews(postId, params);
	return useInfiniteReviewsData(infiniteQuery);
}

// Helper hook for optimistic updates
export function useOptimisticPostUpdate() {
	const queryClient = useQueryClient();

	return {
		updatePostContent: (postId: string, newContent: string) => {
			queryClient.setQueryData(
				postsKeys.detail(postId),
				(oldData: Post | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						content: newContent,
						updated_at: new Date().toISOString(),
					};
				},
			);
		},

		addOptimisticReview: (
			postId: string,
			review: Partial<PostReviewWithProfile>,
		) => {
			queryClient.setQueryData(
				postsKeys.detail(postId),
				(oldData: PostDetailsResponse | undefined) => {
					if (!oldData) return oldData;
					const newReview = {
						id: "temp-" + Date.now(),
						post_id: postId,
						user_id: review.user_id || "",
						text: review.text || "",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						reviewer_profile: review.reviewer_profile || {
							id: review.user_id || "",
							first_name: null,
							last_name: null,
							username: null,
							avatar_url: null,
						},
					} as PostReviewWithProfile;

					return {
						...oldData,
						reviews_data: [newReview, ...oldData.reviews_data],
						total_reviews_count: oldData.total_reviews_count + 1,
					};
				},
			);
		},
	};
}
