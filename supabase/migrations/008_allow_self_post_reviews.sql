-- Migration: Allow users to review their own posts
-- Created: $(date)
-- This removes the constraint that prevented self-reviews

-- 1. Update the RLS policy for post_reviews INSERT
-- Drop the existing policy that prevents self-reviews
DROP POLICY IF EXISTS "Users can insert reviews for others' posts" ON post_reviews;

-- Create new policy that allows users to review any post (including their own)
CREATE POLICY "Users can insert reviews for any posts" ON post_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Update the upsert_post_review function to remove the self-review check
CREATE OR REPLACE FUNCTION upsert_post_review(
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
    
    -- Validate text (removed the self-review check)
    IF review_text IS NULL OR trim(review_text) = '' THEN
        RAISE EXCEPTION 'Review text cannot be empty';
    END IF;
    
    -- Upsert the review
    INSERT INTO post_reviews (post_id, user_id, text)
    VALUES (post_uuid, current_user_id, review_text)
    ON CONFLICT (post_id, user_id)
    DO UPDATE SET 
        text = EXCLUDED.text,
        updated_at = now()
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION upsert_post_review TO authenticated; 