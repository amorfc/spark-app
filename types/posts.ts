import type { Profile } from "@/types/profile";

export interface Post {
	id: string;
	user_id: string;
	content: string;
	created_at: string;
	updated_at: string;
}

export interface PostReview {
	id: string;
	post_id: string;
	user_id: string;
	text: string;
	created_at: string;
	updated_at: string;
}

export interface PostWithProfile extends Post {
	author_profile: Profile;
	total_reviews_count: number;
}

export interface PostReviewWithProfile extends PostReview {
	reviewer_profile: Profile;
}

// Simple post details response from RPC function
export interface PostDetails {
	id: string;
	user_id: string;
	content: string;
	created_at: string;
	updated_at: string;
	author_profile: Profile;
	total_reviews_count: number;
}

export interface CreatePostRequest {
	content: string;
}

export interface UpdatePostRequest {
	content: string;
}

export interface CreatePostReviewRequest {
	post_id: string;
	text: string;
}

export interface UpdatePostReviewRequest {
	text: string;
}

export interface PostFeedParams {
	limit?: number;
	cursor?: string; // ISO timestamp for cursor pagination
}

export interface PostReviewsParams {
	post_id: string;
	limit?: number;
	cursor?: string; // ISO timestamp for cursor pagination
}

export interface PostSearchParams extends PostFeedParams {
	query: string;
}

// API Response types with cursor pagination
export interface PostFeedResponse {
	posts: PostWithProfile[];
	next_cursor?: string;
	has_more: boolean;
	total_count?: number;
}

export interface PostReviewsResponse {
	reviews: PostReviewWithProfile[];
	next_cursor?: string;
	has_more: boolean;
	total_count: number;
}

// Cursor pagination specific types
export interface CursorPaginationParams {
	limit?: number;
	cursor?: string;
}

export interface CursorPaginationResponse<T> {
	data: T[];
	next_cursor?: string;
	has_more: boolean;
}

// Form types for UI components
export interface PostFormData {
	content: string;
}

export interface PostReviewFormData {
	text: string;
}
