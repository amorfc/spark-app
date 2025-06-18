-- Simplify get_post_details function to only return post data with profile and total review count
-- Remove pagination logic for reviews since that should be handled separately

-- Drop the existing function first to avoid overloading conflicts
DROP FUNCTION IF EXISTS get_post_details(UUID, INTEGER, INTEGER);

-- Create the new simplified function
CREATE OR REPLACE FUNCTION get_post_details(post_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    author_profile JSON,
    total_reviews_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        p.updated_at,
        COALESCE(
            (
                SELECT json_build_object(
                    'id', prof.id,
                    'first_name', prof.first_name,
                    'last_name', prof.last_name,
                    'full_name', prof.full_name
                )
                FROM profiles prof 
                WHERE prof.id = p.user_id
            ),
            json_build_object(
                'id', p.user_id,
                'first_name', null,
                'last_name', null,
                'full_name', null
            )
        ) as author_profile,
        COALESCE(
            (SELECT COUNT(*) FROM post_reviews WHERE post_id = p.id),
            0
        ) as total_reviews_count
    FROM posts p 
    WHERE p.id = post_uuid;
END;
$$; 