import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createReport,
	getMyReports,
	blockUser,
	unblockUser,
	getBlockedUsers,
	isUserBlocked,
	getBannedKeywords,
} from "@/services/moderation-service";
import { CreateReportData } from "@/types/moderation";

// Report hooks
export const useCreateReport = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createReport,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};

export const useMyReports = (limit = 10, offset = 0) => {
	return useQuery({
		queryKey: ["reports", "my", limit, offset],
		queryFn: () => getMyReports(limit, offset),
	});
};

// Blocking hooks
export const useBlockUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: blockUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["reviews"] });
		},
	});
};

export const useUnblockUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unblockUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["reviews"] });
		},
	});
};

export const useBlockedUsers = (limit = 10, offset = 0) => {
	return useQuery({
		queryKey: ["blocked-users", limit, offset],
		queryFn: () => getBlockedUsers(limit, offset),
	});
};

export const useIsUserBlocked = (user_id: string) => {
	return useQuery({
		queryKey: ["user-blocked", user_id],
		queryFn: () => isUserBlocked(user_id),
		enabled: !!user_id,
	});
};

// Keyword filtering hooks
export const useBannedKeywords = () => {
	return useQuery({
		queryKey: ["banned-keywords"],
		queryFn: getBannedKeywords,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Helper hook for reporting different content types
export const useReportContent = () => {
	const createReportMutation = useCreateReport();

	const reportPost = (
		postId: string,
		reportData: Omit<CreateReportData, "reported_post_id">,
	) => {
		return createReportMutation.mutateAsync({
			...reportData,
			reported_post_id: postId,
		});
	};

	const reportReview = (
		reviewId: string,
		reportData: Omit<CreateReportData, "reported_review_id">,
	) => {
		return createReportMutation.mutateAsync({
			...reportData,
			reported_review_id: reviewId,
		});
	};

	const reportPostReview = (
		postReviewId: string,
		reportData: Omit<CreateReportData, "reported_post_review_id">,
	) => {
		return createReportMutation.mutateAsync({
			...reportData,
			reported_post_review_id: postReviewId,
		});
	};

	const reportUser = (
		userId: string,
		reportData: Omit<CreateReportData, "reported_user_id">,
	) => {
		return createReportMutation.mutateAsync({
			...reportData,
			reported_user_id: userId,
		});
	};

	return {
		reportPost,
		reportReview,
		reportPostReview,
		reportUser,
		isLoading: createReportMutation.isPending,
	};
};
