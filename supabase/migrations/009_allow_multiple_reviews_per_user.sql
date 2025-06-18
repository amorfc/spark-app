-- Migration: Allow multiple reviews per user per post
-- Created: $(date)
-- This removes the unique constraint and creates separate create/update functions

-- 1. Drop the unique constraint that prevents multiple reviews per user per post
ALTER TABLE post_reviews DROP CONSTRAINT IF EXISTS unique_user_post_review;

-- 2. Drop the composite index that was created for the unique constraint
DROP INDEX IF EXISTS idx_post_reviews_post_user;

-- 3. Create a new composite index for efficient post-user lookups (without uniqueness)
CREATE INDEX IF NOT EXISTS idx_post_reviews_post_user_multiple ON post_reviews(post_id, user_id, created_at DESC);

-- 4. Replace the upsert function with separate create and update functions

-- Drop the existing upsert function
DROP FUNCTION IF EXISTS upsert_post_review(UUID, TEXT);

-- Create function to create a new post review
CREATE OR REPLACE FUNCTION create_post_review(
    post_uuid UUID,
    review_text TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_review post_reviews%ROWTYPE;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Validate text
    IF review_text IS NULL OR trim(review_text) = '' THEN
        RAISE EXCEPTION 'Review text cannot be empty';
    END IF;
    
    -- Insert the new review
    INSERT INTO post_reviews (post_id, user_id, text)
    VALUES (post_uuid, current_user_id, review_text)
    RETURNING * INTO result_review;
    
    -- Return the review as JSON with reviewer profile
    RETURN (
        SELECT json_build_object(
            'id', result_review.id,
            'post_id', result_review.post_id,
            'user_id', result_review.user_id,
            'text', result_review.text,
            'created_at', result_review.created_at,
            'updated_at', result_review.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'full_name', prof.full_name
                    )
                    FROM profiles prof 
                    WHERE prof.id = result_review.user_id
                ),
                json_build_object(
                    'id', result_review.user_id,
                    'first_name', null,
                    'last_name', null,
                    'full_name', null
                )
            )
        )
    );
END;
$$;

-- Create function to update an existing post review
CREATE OR REPLACE FUNCTION update_post_review(
    review_uuid UUID,
    review_text TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_review post_reviews%ROWTYPE;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Validate text
    IF review_text IS NULL OR trim(review_text) = '' THEN
        RAISE EXCEPTION 'Review text cannot be empty';
    END IF;
    
    -- Update the review (only if user owns it)
    UPDATE post_reviews 
    SET text = review_text, updated_at = now()
    WHERE id = review_uuid AND user_id = current_user_id
    RETURNING * INTO result_review;
    
    -- Check if review was found and updated
    IF result_review.id IS NULL THEN
        RAISE EXCEPTION 'Review not found or you do not have permission to update it';
    END IF;
    
    -- Return the updated review as JSON with reviewer profile
    RETURN (
        SELECT json_build_object(
            'id', result_review.id,
            'post_id', result_review.post_id,
            'user_id', result_review.user_id,
            'text', result_review.text,
            'created_at', result_review.created_at,
            'updated_at', result_review.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'full_name', prof.full_name
                    )
                    FROM profiles prof 
                    WHERE prof.id = result_review.user_id
                ),
                json_build_object(
                    'id', result_review.user_id,
                    'first_name', null,
                    'last_name', null,
                    'full_name', null
                )
            )
        )
    );
END;
$$;

-- 5. Update the get_user_post_review function to get the latest review by the user for a post
-- (since users can now have multiple reviews per post)
CREATE OR REPLACE FUNCTION get_user_latest_post_review(post_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_review post_reviews%ROWTYPE;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    -- Get the latest review by the current user for this post
    SELECT * INTO user_review
    FROM post_reviews 
    WHERE post_id = post_uuid AND user_id = current_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF user_review.id IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN (
        SELECT json_build_object(
            'id', user_review.id,
            'post_id', user_review.post_id,
            'user_id', user_review.user_id,
            'text', user_review.text,
            'created_at', user_review.created_at,
            'updated_at', user_review.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'full_name', prof.full_name
                    )
                    FROM profiles prof 
                    WHERE prof.id = user_review.user_id
                ),
                json_build_object(
                    'id', user_review.user_id,
                    'first_name', null,
                    'last_name', null,
                    'full_name', null
                )
            )
        )
    );
END;
$$;

-- 6. Create function to get all reviews by current user for a specific post
CREATE OR REPLACE FUNCTION get_user_post_reviews(post_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    RETURN (
        SELECT COALESCE(json_agg(
            json_build_object(
                'id', pr.id,
                'post_id', pr.post_id,
                'user_id', pr.user_id,
                'text', pr.text,
                'created_at', pr.created_at,
                'updated_at', pr.updated_at,
                'reviewer_profile', COALESCE(
                    (
                        SELECT json_build_object(
                            'id', prof.id,
                            'first_name', prof.first_name,
                            'last_name', prof.last_name,
                            'full_name', prof.full_name
                        )
                        FROM profiles prof 
                        WHERE prof.id = pr.user_id
                    ),
                    json_build_object(
                        'id', pr.user_id,
                        'first_name', null,
                        'last_name', null,
                        'full_name', null
                    )
                )
            ) ORDER BY pr.created_at DESC
        ), '[]'::json)
        FROM post_reviews pr
        WHERE pr.post_id = post_uuid AND pr.user_id = current_user_id
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_post_review TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_review TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_latest_post_review TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_post_reviews TO authenticated;
