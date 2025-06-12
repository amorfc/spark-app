// services/review-service-paginated.ts
import { supabase } from "@/config/supabase";
import { Review, ReviewStats } from "@/types/reviews";

interface PaginationMeta {
	total_count: number;
	filtered_count?: number;
	page_size: number;
	current_offset: number;
	has_more: boolean;
	has_previous: boolean;
	next_cursor?: {
		id: string;
		created_at: string;
	};
	total_pages: number;
}

interface PaginatedResponse<T> {
	data: T;
	pagination: PaginationMeta;
	filters?: Record<string, any>;
}

interface FeatureReviewsCompleteData {
	reviews: Review[];
	user_review: Review | null;
	stats: ReviewStats | null;
}

export class ReviewService {
	/**
	 * Get complete review data with advanced pagination
	 */
	static async getFeatureReviewsComplete(
		featureRefId: string,
		options?: {
			limit?: number;
			offset?: number;
			cursor?: { id: string; created_at: string };
		},
	): Promise<PaginatedResponse<FeatureReviewsCompleteData>> {
		const { data, error } = await supabase.rpc("get_feature_reviews_complete", {
			p_feature_ref_id: featureRefId,
			p_limit: options?.limit || 20,
			p_offset: options?.offset || 0,
			p_cursor_id: options?.cursor?.id || null,
			p_cursor_created_at: options?.cursor?.created_at || null,
		});

		if (error) {
			console.error("Error fetching complete review data:", error);
			throw new Error(error.message);
		}

		return data as PaginatedResponse<FeatureReviewsCompleteData>;
	}

	/**
	 * Get recent reviews with cursor-based pagination
	 */
	static async getRecentReviewsPaginated(options?: {
		limit?: number;
		offset?: number;
		cursor?: { id: string; created_at: string };
	}): Promise<PaginatedResponse<Review[]>> {
		const { data, error } = await supabase.rpc("get_recent_reviews_paginated", {
			p_limit: options?.limit || 10,
			p_offset: options?.offset || 0,
			p_cursor_id: options?.cursor?.id || null,
			p_cursor_created_at: options?.cursor?.created_at || null,
		});

		if (error) {
			console.error("Error fetching recent reviews:", error);
			throw new Error(error.message);
		}

		return data as PaginatedResponse<Review[]>;
	}

	/**
	 * Search reviews with advanced pagination and filters
	 */
	static async searchReviewsPaginated(filters: {
		featureRefId?: string;
		minRating?: number;
		maxRating?: number;
		searchText?: string;
		limit?: number;
		offset?: number;
		cursor?: { id: string; created_at: string };
	}): Promise<PaginatedResponse<Review[]>> {
		const { data, error } = await supabase.rpc("search_reviews_paginated", {
			p_feature_ref_id: filters.featureRefId || null,
			p_min_rating: filters.minRating || null,
			p_max_rating: filters.maxRating || null,
			p_search_text: filters.searchText || null,
			p_limit: filters.limit || 20,
			p_offset: filters.offset || 0,
			p_cursor_id: filters.cursor?.id || null,
			p_cursor_created_at: filters.cursor?.created_at || null,
		});

		if (error) {
			console.error("Error searching reviews:", error);
			throw new Error(error.message);
		}

		return data as PaginatedResponse<Review[]>;
	}

	//add upsert method
	static async upsertReview(
		featureRefId: string,
		safetyRating: number,
		qualityRating: number,
		comment?: string,
	) {
		const { data, error } = await supabase.rpc("upsert_review", {
			p_feature_ref_id: featureRefId,
			p_safety_rating: safetyRating,
			p_quality_rating: qualityRating,
			p_comment: comment,
		});

		if (error) {
			console.error("Error upserting review:", error);
			throw new Error(error.message);
		}

		return data;
	}

	static async deleteUserReview(featureRefId: string) {
		const { data, error } = await supabase.rpc("delete_user_review", {
			p_feature_ref_id: featureRefId,
		});

		if (error) {
			console.error("Error deleting user review:", error);
			throw new Error(error.message);
		}

		return data;
	}

	static async getReviewByFeatureId(featureRefId: string) {
		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("feature_ref_id", featureRefId)
			.single();

		if (error) {
			console.error("Error getting review by feature id:", error);
			throw new Error(error.message);
		}

		return data;
	}
}
