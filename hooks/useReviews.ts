import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { ReviewService } from "@/services/review-service";
import { UpsertReviewData, ReviewFilters } from "@/types/reviews";

// Query Keys
export const reviewKeys = {
	all: ["reviews"] as const,
	featureInfinite: (
		featureRefId: string,
		options?: {
			limit?: number;
			offset?: number;
			cursor?: { id: string; created_at: string };
		},
	) => [...reviewKeys.all, "featureInfinite", featureRefId, options] as const,
	feature: (featureRefId: string) =>
		[...reviewKeys.all, "feature", featureRefId] as const,
	userReview: (featureRefId: string) =>
		[...reviewKeys.all, "user", featureRefId] as const,
	stats: (featureRefId: string) =>
		[...reviewKeys.all, "stats", featureRefId] as const,
	filtered: (filters: ReviewFilters) =>
		[...reviewKeys.all, "filtered", filters] as const,
};

/**
 * Hook to get reviews for a specific feature
 */
export const useFeatureReviews = (
	featureRefId: string,
	options?: { limit?: number; offset?: number },
) => {
	return useQuery({
		queryKey: reviewKeys.feature(featureRefId),
		queryFn: () =>
			ReviewService.searchReviewsPaginated({
				featureRefId,
				limit: options?.limit,
				offset: options?.offset,
			}),
		enabled: !!featureRefId,
	});
};

/**
 * Hook to get review statistics for a feature
//  */
// export const useFeatureReviewStats = (featureRefId: number) => {
// 	return useQuery({
// 		queryKey: reviewKeys.stats(featureRefId),
// 		queryFn: () => ReviewService.getFeatureReviewStats(featureRefId),
// 		enabled: !!featureRefId,
// 	});
// };

/**
 * Hook to get reviews with filters
 */
export const useFeatureReviewsInfinite = (
	featureRefId: string,
	options?: {
		limit?: number;
		initialCursor?: { id: string; created_at: string };
	},
) => {
	return useInfiniteQuery({
		queryKey: reviewKeys.featureInfinite(featureRefId, options),
		queryFn: ({ pageParam }) =>
			ReviewService.getFeatureReviewsComplete(featureRefId, {
				limit: options?.limit || 10,
				cursor: pageParam || options?.initialCursor,
			}),
		enabled: !!featureRefId,
		initialPageParam: undefined as
			| { id: string; created_at: string }
			| undefined,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.has_more
				? lastPage.pagination.next_cursor
				: undefined;
		},
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});
};

export const useUserReview = (featureRefId: string) => {
	return useQuery({
		queryKey: reviewKeys.userReview(featureRefId),
		queryFn: () => ReviewService.getReviewByFeatureId(featureRefId),
		enabled: !!featureRefId,
	});
};

/**
 * Hook to create a new review
 */
export const useUpsertReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (reviewData: UpsertReviewData) =>
			ReviewService.upsertReview(
				reviewData.feature_ref_id,
				reviewData.safety_rating,
				reviewData.quality_rating,
				reviewData.comment,
			),
		onSuccess: (newReview) => {
			// Invalidate and refetch feature reviews
			queryClient.invalidateQueries({
				queryKey: reviewKeys.feature(newReview.feature_ref_id),
			});

			// Invalidate user review
			queryClient.invalidateQueries({
				queryKey: reviewKeys.userReview(newReview.feature_ref_id),
			});

			// Invalidate stats
			queryClient.invalidateQueries({
				queryKey: reviewKeys.stats(newReview.feature_ref_id),
			});

			// Invalidate all reviews
			queryClient.invalidateQueries({
				queryKey: reviewKeys.all,
			});
		},
	});
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ featureRefId }: { featureRefId: string }) => {
			return ReviewService.deleteUserReview(featureRefId);
		},
		onSuccess: (featureRefId) => {
			// Invalidate and refetch related queries
			queryClient.invalidateQueries({
				queryKey: reviewKeys.feature(featureRefId),
			});

			queryClient.invalidateQueries({
				queryKey: reviewKeys.userReview(featureRefId),
			});

			queryClient.invalidateQueries({
				queryKey: reviewKeys.stats(featureRefId),
			});

			queryClient.invalidateQueries({
				queryKey: reviewKeys.all,
			});
		},
	});
};
