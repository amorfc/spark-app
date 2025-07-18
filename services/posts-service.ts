import { supabase } from "@/config/supabase";
import type {
	Post,
	PostWithProfile,
	PostDetails,
	PostReviewWithProfile,
	CreatePostRequest,
	UpdatePostRequest,
	CreatePostReviewRequest,
	PostFeedParams,
	PostReviewsParams,
	PostFeedResponse,
	PostReviewsResponse,
	CursorPaginationParams,
} from "@/types/posts";

export class PostsService {
	// Posts CRUD operations
	static async createPost(data: CreatePostRequest): Promise<Post> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const { data: post, error } = await supabase
			.from("posts")
			.insert({
				content: data.content,
				user_id: user?.id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return post;
	}

	static async updatePost(
		postId: string,
		data: UpdatePostRequest,
	): Promise<Post> {
		const { data: post, error } = await supabase
			.from("posts")
			.update(data)
			.eq("id", postId)
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return post;
	}

	static async deletePost(postId: string): Promise<void> {
		const { error } = await supabase.from("posts").delete().eq("id", postId);

		if (error) {
			throw new Error(error.message);
		}
	}

	// Get post with profile and total review count using RPC function
	static async getPost(postId: string): Promise<PostDetails> {
		const { data, error } = await supabase.rpc("get_post_details", {
			post_uuid: postId,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data || data.length === 0) {
			throw new Error("Post not found");
		}

		return data[0];
	}

	// Cursor-based pagination for posts feed
	static async getPostsFeedCursor(
		params: CursorPaginationParams = {},
	): Promise<PostFeedResponse> {
		const { limit = 10, cursor } = params;

		const { data, error } = await supabase.rpc("get_posts_feed_cursor", {
			page_limit: limit,
			cursor_timestamp: cursor || null,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data || data.length === 0) {
			return {
				posts: [],
				has_more: false,
			};
		}

		const result = data[0];
		return {
			posts: result.posts || [],
			next_cursor: result.next_cursor,
			has_more: result.has_more,
		};
	}

	// Post Reviews operations
	static async createPostReview(
		postId: string,
		data: Omit<CreatePostReviewRequest, "post_id">,
	): Promise<PostReviewWithProfile> {
		const { data: review, error } = await supabase.rpc("create_post_review", {
			post_uuid: postId,
			review_text: data.text,
		});

		if (error) {
			throw new Error(error.message);
		}

		return review;
	}

	static async updatePostReview(
		reviewId: string,
		data: { text: string },
	): Promise<PostReviewWithProfile> {
		const { data: review, error } = await supabase.rpc("update_post_review", {
			review_uuid: reviewId,
			review_text: data.text,
		});

		if (error) {
			throw new Error(error.message);
		}

		return review;
	}

	static async deletePostReview(reviewId: string): Promise<void> {
		const { error } = await supabase
			.from("post_reviews")
			.delete()
			.eq("id", reviewId);

		if (error) {
			throw new Error(error.message);
		}
	}

	static async getUserPostReview(
		postId: string,
	): Promise<PostReviewWithProfile | null> {
		const { data, error } = await supabase.rpc("get_user_latest_post_review", {
			post_uuid: postId,
		});

		if (error) {
			throw new Error(error.message);
		}

		return data;
	}

	static async getUserPostReviews(
		postId: string,
	): Promise<PostReviewWithProfile[]> {
		const { data, error } = await supabase.rpc("get_user_post_reviews", {
			post_uuid: postId,
		});

		if (error) {
			throw new Error(error.message);
		}

		return data || [];
	}

	static async getPostReviews(
		params: PostReviewsParams,
	): Promise<PostReviewsResponse> {
		const { post_id, limit = 10 } = params;

		// Get total count
		const { count, error: countError } = await supabase
			.from("post_reviews")
			.select("*", { count: "exact", head: true })
			.eq("post_id", post_id);

		if (countError) {
			throw new Error(countError.message);
		}

		// Get reviews with profiles using cursor pagination
		const { data, error } = await supabase
			.from("post_reviews")
			.select(
				`
        *,
        reviewer_profile:profiles!user_id (*)
      `,
			)
			.eq("post_id", post_id)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			throw new Error(error.message);
		}

		const totalCount = count || 0;
		const hasMore = (data?.length || 0) >= limit;

		return {
			reviews: data || [],
			total_count: totalCount,
			has_more: hasMore,
		};
	}

	// Cursor-based pagination for post reviews
	static async getPostReviewsCursor(
		postId: string,
		params: CursorPaginationParams = {},
	): Promise<PostReviewsResponse> {
		const { limit = 10, cursor } = params;

		const { data, error } = await supabase.rpc("get_post_reviews_cursor", {
			post_uuid: postId,
			page_limit: limit,
			cursor_timestamp: cursor || null,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data || data.length === 0) {
			return {
				reviews: [],
				has_more: false,
				total_count: 0,
			};
		}

		const result = data[0];
		return {
			reviews: result.reviews || [],
			next_cursor: result.next_cursor,
			has_more: result.has_more,
			total_count: result.total_count,
		};
	}

	// Utility methods
	static async getUserPosts(
		userId: string,
		params: PostFeedParams = {},
	): Promise<Post[]> {
		const { limit = 10 } = params;

		const { data, error } = await supabase
			.from("posts")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			throw new Error(error.message);
		}

		return data || [];
	}

	static async getPostReviewsCount(postId: string): Promise<number> {
		const { count, error } = await supabase
			.from("post_reviews")
			.select("*", { count: "exact", head: true })
			.eq("post_id", postId);

		if (error) {
			throw new Error(error.message);
		}

		return count || 0;
	}

	// Advanced queries
	static async getPopularPosts(
		params: PostFeedParams = {},
	): Promise<PostWithProfile[]> {
		const { limit = 10 } = params;

		// Get posts ordered by review count
		const { data, error } = await supabase
			.from("posts")
			.select(
				`
        *,
        author_profile:profiles!user_id (*),
        post_reviews (
          id,
          created_at
        )
      `,
			)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			throw new Error(error.message);
		}

		// Transform and sort by popularity (review count)
		const postsWithStats = (data || []).map((post: any) => {
			const reviews = post.post_reviews || [];
			const totalReviews = reviews.length;

			return {
				...post,
				total_reviews_count: totalReviews,
				popularity_score: totalReviews, // Based on review count
			};
		});

		// Sort by popularity score
		postsWithStats.sort(
			(a: any, b: any) => b.popularity_score - a.popularity_score,
		);

		return postsWithStats;
	}
}
