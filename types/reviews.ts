export interface Review {
	id: string;
	user_id: string;
	feature_ref_id: number;
	safety_rating: number;
	quality_rating: number;
	comment?: string | null;
	created_at: string;
	updated_at: string;
}

export interface ReviewStats {
	feature_ref_id: number;
	total_reviews: number;
	avg_safety_rating: number;
	avg_quality_rating: number;
	avg_overall_rating: number;
}

export interface UpsertReviewData {
	feature_ref_id: string;
	safety_rating: number;
	quality_rating: number;
	comment?: string;
}

export interface ReviewFilters {
	feature_ref_id?: string;
	user_id?: string;
	min_rating?: number;
	max_rating?: number;
	limit?: number;
	offset?: number;
}
